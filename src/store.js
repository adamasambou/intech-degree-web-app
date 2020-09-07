/* eslint-disable no-unused-vars */
import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import firebaseConfig from "./firebaseconfig.json";
import pdfmake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import axios from "axios";
import xmlparse from "xml2js";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		firebaseGod: null,
		currentUser: null,
		userProfile: null,
		loadingRequest: false,
		bIsuniversityDashboard: false,
		bIsStudentDashboard: false,
		username: "",
		loggedInAs: "",
		fingerprintString: "",
		bIsFingerprintGenerated: false,
		bIsAPiError: false,
		m2sysBearer: "",
		certqr: "",
		m2sysAccessTokenState: "",
		currentUniversity: {},
		currentStudent: {},
		allCertificates: [],
		allStudents: [],
		studentCertificate: []
	},

	mutations:
	{
		LOGOUT(state, userId)
		{
			state.currentUser = null;
			state.userProfile = null;
			state.bIsStudentDashboard = false;
			state.bIsuniversityDashboard = false;
		},

		SET_UNIVERSITY_DASHBOARD(state, payload)
		{
			state.bIsuniversityDashboard = payload.bUniversityState;
			state.currentUniversity = payload.university;
			state.allCertificates = payload.certificates;
			state.allStudents = payload.students;
		},

		SET_STUDENT_DASHBOARD(state, payload)
		{
			state.bIsStudentDashboard = payload.bStudentState;
			state.currentStudent = payload.student;
			state.allCertificates = payload.certificates;
			state.allStudents = payload.students;
		},

		SET_API_ERROR(state, payload)
		{
			state.bIsAPiError = true;
			state.m2sysAccessTokenError = payload;
			console.log(payload);
		},

		SET_USER_ID(state, payload)
		{
			state.currentUser = payload;
		},

		SET_QR_CODE(state, payload)
		{
			state.certqr = payload;
			state.bIsFingerprintGenerated = true;
		},

		SET_USER(state, payload)
		{
			state.userProfile = payload;
		},

		MUTATE_CERTIFICATE(state, payload)
		{
			let outCertificate = [];
			if(state.currentStudent.certificates.length != 0)
			{
				state.allCertificates.forEach(certificate =>
				{
					if(certificate.id == state.currentStudent.certificates[0])
					{
						outCertificate.push(
						{
							id: certificate.id,
							faculty: certificate.faculty,
							major: certificate.degree,
							status: certificate.status,
						}
						)
					}
				});
				state.studentCertificate = outCertificate;
			}
		},

		MUTATE_UNIVERSITY(state, payload)
		{
			let outFaculties = [];
			let outStudents = [];
			let certificateStatus = "";
			let universityStudents = [];

			//Query the faculties
			state.currentUniversity.faculties.forEach((faculty) =>
			{
				outFaculties.push({
					name: faculty
				});
			});
			state.currentUniversity.faculties = outFaculties;

			//Query The students and transform these students into compatible uikit documents
			state.currentUniversity.students.forEach((student) =>
			{
				state.allStudents.forEach(document =>
				{
					if(document.id == student) universityStudents.push(document);
				});
			});

			universityStudents.forEach(document =>
			{
				if(document.certificates.length != 0 || document.certificates != undefined)
				{
					//Query over the filtered data
					state.allCertificates.forEach(certificate =>
					{
						//We still have the problem of dealing only with one certificate
						if(certificate.id == document.certificates[0])
						{
							certificateStatus = certificate.status;
						}
					});

					let outStatus = document.certificates.length == 0 || document.certificates == undefined? "Certificate Not Generated" : certificateStatus;

						outStudents.push(
						{
							firstName: document.firstName,
							lastName: document.lastName,
							faculty: document.faculty,
							studentId: document.studentid,
							email: document.email,
							status: outStatus
						});
					}
			});
			state.currentUniversity.students = outStudents;
		},

		//Called When Firebase Is Fetching Data From Its API
		LOADING_REQUEST(state, payload)
		{
			state.loadingRequest = payload;
		},

		SET_FIREBASE(state, payload)
		{
			state.firebaseGod = payload;
		},

		SET_M2SYS_BEARER(state, payload)
		{
			state.m2sysBearer = payload;
		},
		SET_LOGGED_IN_AS(state, payload)
		{
			switch(payload)
			{
				case 0:
				state.loggedInAs = "university";
				break;

				case 1:
				state.loggedInAs = "student";
				break;
			}
		},

		//State must be an int to make the appropiate switch
		SET_FINGERPRINT_CAPTURE_STATE(state, payload)
		{
			switch(payload)
			{
				case 0:
				state.m2sysAccessTokenState = "Authenticating With M2SYS";
				break;

				case 1:
				state.m2sysAccessTokenState = "Fingerprint Capture In Progress";
				break;

				case 2:
				state.m2sysAccessTokenState = "Parsing Fingerprint Data";
				break;
			}
		}
	},

	actions:
	{
		//Saves the fingerprint to firebase after the export to firebase
		async createIntechFingerprint({commit, state})
		{
			commit("SET_FINGERPRINT_CAPTURE_STATE", 1);
			await axios.request({
				url: "http://localhost:15896/api/CloudScanr/FPCapture",
				method: "post",
				headers:
				{
					"Content-Type": `application/x-www-form-urlencoded`,
				},
				}).then((res)=>
				{
					if(res.data.CloudScanrStatus.Success)
					{
						return this.dispatch("parseFingerprintData",
						{
							inFingerprintXML: res.data.TemplateData,
							email: state.currentStudent.email
						});
					}
					else
					{
						console.log("There was an error receiving the fingerprint data, the scanner status is:" + res.data.CloudScanrStatus);
						return false;
					}
				}).catch((err)=>{console.log(err)});
		},

		//We parse the xml to get the information of the capture, salt the ID with M2SYS salt and hash with scrypt.
		//The result is then stored on the database, and it's used to compare the QR code in the app

		async parseFingerprintData({commit, state}, { inFingerprintXML, email })
		{
			let outJson = "";
			let inKdf = "";
			let myID = "";

			//Get the firebase document
			await firebase.firestore().collection("user").get().then((documents) =>
			{
				documents.forEach((doc) =>
				{
					if(doc.data().email == email)
					{
						myID = doc.id.toString();
					}
				});
			}).catch(err =>
			{
				console.log(err);
				alert("There Was An Error Generating a Certificate, Please Try Again");
			});

			commit("SET_FINGERPRINT_CAPTURE_STATE", 2);
			await xmlparse.parseString(inFingerprintXML, ((err, res) =>
			{
				let metadata = res.Fingers.$.AccessPointInfo;
				let fp = res.Fingers.Finger[0]._;
				//Add separation of concerns to represent the fingerprint and the metadata together in one string
				//Remember that it's recommended to use only ASCII characters when working with buffers as there's a potential for data loss when using raw strings
				//We have removed the old formula with metadata because it is too long for qr scanners
				// outJson = outJson.concat(metadata, "////", fp);
				outJson = "MW50ZWNoRGVncmVl" + myID + fp;
			}));

			await axios.post("https://intech-express.herokuapp.com/validatecertificate",
			{
				email: email,
				certificateNumber: 1,
				qr: outJson
			}).then(newCert =>
			{
				inKdf = newCert.data.updatedCertificate.qr;
				let result = newCert.data.updatedCertificate.qr.slice(0, -2).trim();
				commit("SET_QR_CODE", result);
			}).catch(err =>
			{
				console.log(err);
				alert("There Was An Error Generating a Certificate, Please Try Again");
			});

			//KDF script
			return axios.post("https://intech-express.herokuapp.com/kdf",
			{
				fingerprint:
				{
					key: inKdf
				},
				student:
				{
					email: state.currentStudent.email
				}
			}).catch(err =>
			{
				alert("There was an error processing the kdf script, please try again");
				alert(err);
			});
		},

		async m2sysauthenticate({commit, state})
		{
			//Set Loading State
			commit("SET_FINGERPRINT_CAPTURE_STATE", 0);

			//Authenticate with M2SYS API
				await axios.request({
					url: "https://demo-fp.cloudabis.com/v1/token",
					method: "post",
					headers:
					{
						"Content-Type": "application/x-www-form-urlencoded",
					},
					data: "grant_type=password&username=83605224637947c7ac5e661d3651fe73&password=VsyLks5FWJ860hwRHooV3Hv0H0A%3D",
				}).then((res)=>
				{
					commit("SET_M2SYS_BEARER", res.data.access_token);
				}).catch((err) =>
				{
					console.log(err);
					return err;
				});
		},

		printCertificate({commit, state}, {pdf})
		{
			pdfmake.vfs = pdfFonts.pdfMake.vfs;

			// var name = "Pablo Enrique";
			// var title = "Test Project";

			// Get todays date in format dd/mm/yyyy
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			// var yyyy = today.getFullYear();
			if (dd < 10) {
				dd = '0' + dd
			}
			if (mm < 10) {
				mm = '0' + mm
			}
			// let date = dd + '/' + mm + '/' + yyyy;

			// Define PDF output - See http://pdfmake.org/#/gettingstarted for information on creating a PDF document with pdfmake.
			var docDefinition = pdf;
		// Function to generate and download the PDF using the document definition object (docDefinition) we defined previously.
		pdfmake.createPdf(docDefinition).open();
	},

		downloadCertificate({commit, state}, { pdf, bDownload })
		{
			pdfmake.vfs = pdfFonts.pdfMake.vfs;

			var title = state.currentStudent.firstName + " " + state.currentStudent.lastName + "Certificate";

			// Get todays date in format dd/mm/yyyy
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			// var yyyy = today.getFullYear();
			if (dd < 10) {
				dd = '0' + dd
			}
			if (mm < 10) {
				mm = '0' + mm
			}
			// let date = dd + '/' + mm + '/' + yyyy;

			// Define PDF output - See http://pdfmake.org/#/gettingstarted for information on creating a PDF document with pdfmake.
			var docDefinition = pdf;

		// Function to generate and download the PDF using the document definition object (docDefinition) we defined previously.
		if(bDownload) pdfmake.createPdf(docDefinition).download(title + '.pdf');
		else if (!bDownload) pdfmake.createPdf(docDefinition).print();

		},

		initializeFirebase({ commit, state })
		{
			let firebaseInstance = firebase.initializeApp(firebaseConfig);
			commit("SET_FIREBASE", firebaseInstance);
			commit("LOGOUT");
		},

		initializeDashboard({ commit, state }, { bUniversityDashboard })
		{
			commit("SET_UNIVERSITY_DASHBOARD", bUniversityDashboard);
		},

		// Dashboard Type =
		// 0: university
		// 1: Student
		async login({ commit, state }, { email, password})
		{
			var theUser = {};
			let theStudents = [];
			let theCertificates = [];

			commit("LOADING_REQUEST", true);
			await firebase.auth().signInWithEmailAndPassword(email, password).catch(err =>
			{
				commit("LOADING_REQUEST", false);
				alert(err);
			});

			//Get the firebase document
			await firebase.firestore().collection("user").get().then((documents) =>
			{
				documents.forEach((doc) =>
				{
					if(doc.data().email == email)
					{
						theUser = doc.data();
					}
				});
			}).catch(err => commit("LOADING_REQUEST", false));

			//Get all certificates
			await firebase.firestore().collection("certificates").get().then((documents) =>
			{
				documents.forEach((doc) =>
				{
					let json = doc.data();
					json.id = doc.id;
					theCertificates.push(json);
				});
			}).catch(err => commit("LOADING_REQUEST", false));

			//Get all users
			await firebase.firestore().collection("user").get().then((documents) =>
			{
				documents.forEach((doc) =>
				{
					let json = doc.data();
					json.id = doc.id;
					theStudents.push(json);
				});
			}).catch(err => commit("LOADING_REQUEST", false));

			await axios.post("https://intech-express.herokuapp.com/getusertype",
			{
				"email": email
			}).then((userType) =>
			{
				switch(userType.data.usertype)
				{
					case 0:
						console.log("uni");
						//true for university, false for student
						commit("SET_UNIVERSITY_DASHBOARD",
						{
							bUniversityState: true,
							university: theUser,
							certificates: theCertificates,
							students: theStudents
						});
					break;

					case 1:
						console.log("student");
						commit("SET_STUDENT_DASHBOARD",
						{
							bStudentState: true,
							student: theUser,
							certificates: theCertificates,
							students: theStudents
						});
					break;
				}
				commit("LOADING_REQUEST", false);
			}).catch(err => commit("LOADING_REQUEST", false));
		},

		async createAccount({ commit }, { username, password, university, bIsUniversityAccount, id })
		{
			commit("LOADING_REQUEST", true);
			if(bIsUniversityAccount)
			{
				await this.state.firebaseGod.auth().createUserWithEmailAndPassword(username, password).catch( err =>
				{
					commit("LOADING_REQUEST", false);
					alert(err);
				});

				await axios.post("https://intech-express.herokuapp.com/createuniversity",
				{
					"university":
					{
						"name": university,
						"email": username
					}
				}).then(response =>
				{
					//adama.sambou@city.ac.uk
					//ChangeThisPassword123
					if(response.status == 200)
					{
						commit("LOADING_REQUEST", false);
						alert("University Registered");
					}
				}).catch(err =>
				{
					commit("LOADING_REQUEST", false);
					alert(err);
				});
			}
			else
			{
				let bUserExists = false;
				await firebase.firestore().collection("user").get().then((document) =>
				{
					document.forEach((user =>
					{
						if(id == user.data().studentid)
						{
							//Certificate is valid
							bUserExists = true;
						}
					}));
					if (!bUserExists)
					{
						commit("LOADING_REQUEST", false);
						alert("The Student ID is not valid");
					}
				}).catch(err =>
				{
					commit("LOADING_REQUEST", false);
					alert(err);

				});

				if(bUserExists)
				{
					await this.state.firebaseGod.auth().createUserWithEmailAndPassword(username, password)
					.then(result =>
					{
						alert("User created! you can now log in with your password.");
					}).catch( err =>
					{
						commit("LOADING_REQUEST", false);
						alert(err);
					});
				}
			}
		},

		logout({ commit, state }) {
			commit("LOADING_REQUEST", true);
			return new Promise((resolve, reject) => {
				state.firebaseGod
					.auth()
					.signOut()
					.then(() => {
						commit("LOADING_REQUEST", false);
						commit("LOGOUT");
						resolve();
					})
					.catch(err => {
						commit("LOADING_REQUEST", false);
						reject(err);
					});
			});
		},
		fetchUserStatus({ commit, state }, {dashboardType})
		{
			commit("LOADING_REQUEST", true);
			return new Promise((resolve, reject) =>
			{
				if (firebase.app())
				{
					firebase.auth().onAuthStateChanged(
						user =>
						{
							if (user != null)
							{
								commit("LOADING_REQUEST", false);
								commit("SET_USER_ID", user.uid);
								commit("SET_USER", user);

								switch(dashboardType)
								{
									case 0:
									commit("SET_LOGGED_IN_AS", 0);
									break;

									case 1:
									commit("SET_LOGGED_IN_AS", 1);
									break;
								}
								resolve(user.uid);
							}
							else
							{
								commit("LOADING_REQUEST", false);
								commit("LOGOUT");
								reject("User is not logged in.");
							}
						},
						error =>
						{
							commit("LOADING_REQUEST", false);
							commit("LOGOUT");
							alert(error);
							reject(error);
						},
					);
				}
				else
				{
					commit("LOADING_REQUEST", false);
					commit("LOGOUT");
					reject("Firebase Is Not Ready");
				}
			});
		},

		async mutateData({commit, state})
		{
			commit("MUTATE_UNIVERSITY");
		},

		async addFaculty({ commit, state }, { facultyName })
		{
			commit("LOADING_REQUEST", true);
			await axios.post("https://intech-express.herokuapp.com/addfaculty",
			{
				"email": state.currentUniversity.email,
				"faculty": facultyName
			}).then(res =>
			{
				let newFacultyTable =
				{
					name: facultyName
				};
				state.currentUniversity.faculties.push(newFacultyTable);
				commit("LOADING_REQUEST", false);
			}).catch(err =>
			{
				alert(err);
				commit("LOADING_REQUEST", false);
			});
		},

		async addStudent({commit, state}, {student})
		{
			commit("LOADING_REQUEST", true);
			await axios.post("https://intech-express.herokuapp.com/createstudent", student).then(result =>
			{
				//This does not make sense, but it can become more pretty if someone decides to rename the verbs
				let newStudent =
				{
					firstName: student.student.firstName,
					lastName: student.student.lastName,
					faculty: student.student.faculty,
					studentid: student.student.studentid,
					email: student.student.email,
					status: "Certificate Not Generated"
				}
				state.currentUniversity.students.push(newStudent);
				commit("LOADING_REQUEST", false);
			}).catch(err =>
			{
				commit("LOADING_REQUEST", false);
			});
		},

		async generateCertificate({commit, state}, {email, major, status, faculty})
		{
			commit("LOADING_REQUEST", true);
			axios.post("https://intech-express.herokuapp.com/createcertificate",
			{
				certificate:
				{
					degree: major,
					faculty: faculty,
					status: status
				},
				email: email
			}).then((result) =>
			{
				commit("LOADING_REQUEST", false);
			}).catch(err =>
			{
				commit("LOADING_REQUEST", false);
				alert(err);
			});
		},

		async mutateCertificate({commit, state})
		{
			commit("MUTATE_CERTIFICATE");
		}

}, //Actions
	getters:
	{
		getCurrentUser(state)
		{
			//Do Something
			return state.currentUser;
		},
		getLoggedInAs(state)
		{
			return state.loggedInAs;
		},
		getUserName(state)
		{
			if(state.userProfile == null) return "";
			return state.userProfile.displayName === null ? state.userProfile.email : state.userProfile.displayName;
		},
		getUserPicture(state)
		{
			if(state.userProfile == null) return "";
			return state.userProfile.photoURL === null ? "" : state.userProfile.photoURL;
		},
		getM2sysRequestText(state)
		{
			return state.m2sysAccessTokenState;
		},
		getIsFingerprintGenerated(state)
		{
			return state.bIsFingerprintGenerated;
		}
	},
});