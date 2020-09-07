<template>
	<v-col>
		<v-card>
			<v-toolbar color="light-blue" dark>
				<v-row align="center" class="toolbar-header">
					<h4
						class="text-left text-capitalize font-weight-medium header-title header-text"
					>
						Student Manager
					</h4>
					<v-row align="center" justify="end">
						<v-dialog v-model="addStudentDialog" max-width="800">
							<template v-slot:activator="{ on }">
								<v-btn
									color="white"
									outlined
									tile
									class="student-button"
									v-on="on"
								>
									<v-icon>mdi-account-multiple-plus</v-icon>
									Add a Student
								</v-btn>
							</template>
							<v-card>
								<v-card-title>
									<span class="headline">Add a Student</span>
								</v-card-title>
								<v-card-text>
									<v-container>
										<v-form>
											<v-row justify="space-around">
												<v-text-field
													v-model.trim="newStudentFirstName"
													name="first name"
													label="First Name"
													prepend-icon="person"
													id="firstName"
												/>
												<v-text-field
													v-model.trim="newStudentLastName"
													name="last name"
													label="Last Name"
													prepend-icon="person"
													id="lastName"
												/>
											</v-row>
											<v-col>
												<v-text-field
													v-model.trim="newStudentID"
													name="student id"
													label="Student ID"
													prepend-icon="card_membership"
													id="studentIDField"
												/>
											<v-text-field
												v-model.trim="newStudentEmail"
												name="student email"
												label="Student Email"
												prepend-icon="email"
												id="studentEmailField"
											/>
												<v-autocomplete
													v-model="newStudentFaculty"
													name="faculty"
													allow-overflow:false
													:items="addFaculty"
													label="Faculty"
													id="addFaculty"
													placeholder="Start typing to Search"
												/>
											</v-col>
										</v-form>
									</v-container>
									<v-btn
										color="blue darken-1"
										text
										@click="addNewStudent"
									>
										Add Student
									</v-btn>
									<v-btn
										color="blue darken-1"
										text
										@click="addStudentDialog = false"
									>
										cancel
									</v-btn>
								</v-card-text>
							</v-card>
						</v-dialog>
						<v-dialog v-model="generateCertificateDialog" max-width="800">
							<template v-slot:activator="{ on }">
								<v-btn
									color="white"
									outlined
									tile
									class="student-button"
									v-on="on"
								>
									<v-icon>mdi-account-card-details</v-icon> Generate Certificate
								</v-btn>
							</template>
							<v-card>
								<v-card-title>
									<span class="headline">Generate Certificate</span>
								</v-card-title>
								<v-card-text>
									<v-container>
										<v-form>
											<v-col>
												<v-text-field
													v-model.trim="newStudentMajor"
													name="student major"
													label="Student Major"
													prepend-icon="card_membership"
													id="studentMajorField"
												/>
											</v-col>
										</v-form>
									</v-container>
									<v-btn
										color="blue darken-1"
										text
										@click="generateCertificate"
									>
										Generate Certificate
									</v-btn>
									<v-btn
										color="blue darken-1"
										text
										@click="generateCertificatedialog = false"
									>
										cancel
									</v-btn>
								</v-card-text>
							</v-card>
						</v-dialog>
					</v-row>
				</v-row>
			</v-toolbar>
			<v-col>
				<v-data-table
					show-select
					v-model="studentsSelected"
					:single-select="true"
					:items="students"
					:headers="sm_headers"
					:items-per-page="10"
					:no-data-text="emptyText"
					item-key="student"
					loading="false"
				/>
			</v-col>
		</v-card>

		<v-card class="column-space">
			<v-toolbar color="light-blue" dark>
				<v-row align="center" class="toolbar-header">
					<h4
						class="text-left text-capitalize font-weight-medium header-title header-text"
					>
						Faculty Manager
					</h4>
					<v-row align="center" justify="end">
						<v-dialog v-model="addFacultyDialog" max-width="800">
							<template v-slot:activator="{ on }">
								<v-btn
									color="white"
									outlined
									tile
									class="student-button"
									v-on="on"
								>
									<v-icon>mdi-database-plus</v-icon> Add a
									Faculty
								</v-btn>
							</template>
							<v-card>
								<v-card-title>
									<span class="headline">Add a Faculty</span>
								</v-card-title>
								<v-card-text>
									<v-container>
										<v-form>
											<v-text-field
												v-model.trim="newFacultyName"
												name="Faculty Name"
												label="Faculty Name"
												id="firstName"
											/>
										</v-form>
									</v-container>
									<v-btn
										color="blue darken-1"
										text
										@click= "addNewFaculty"
									>
										Add Faculty
									</v-btn>
									<v-btn
										color="blue darken-1"
										text
										@click="addFacultyDialog = false"
									>
										cancel
									</v-btn>
								</v-card-text>
							</v-card>
						</v-dialog>
					</v-row>
				</v-row>
			</v-toolbar>
			<v-col>
				<v-data-table
					v-model="facultiesSelected"
					single-select
					:items="facultyList"
					:headers="fm_headers"
					:items-per-page="10"
					:no-data-text="emptyText"
					loading="false"
					@item-selected="onItemSelected"
				/>
			</v-col>
		</v-card>
	</v-col>
</template>

<script>
import store from "../store";

export default
{
		data() {
			return {
				emptyText: "No Student Data To Show, Try Adding A Few Students",
				sm_headers: [
					{ text: "Student ID", value: "studentid" },
					{ text: "First Name", value: "firstName" },
					{ text: "Last Name", value: "lastName" },
					{ text: "Email Address", value: "email" },
					{ text: "Faculty", value: "faculty" },
					{ text: "Status", value: "status" }
				],
				fm_headers: [
					{ text: "Faculty Name", value: "name" }
					// { text: "Student Quantity", value: "students" }
				],
				studentsSelected: [],
				facultiesSelected: [],
				addStudentDialog: false,
				addFacultyDialog: false,
				newStudentFirstName: "",
				newStudentLastName: "",
				newFacultyName: "",
				newStudentID: "",
				newStudentEmail: "",
				newStudentFaculty: "",
				generateCertificateDialog: false,
				newStudentMajor: ""

			};
		},
		methods:
		{
			//eslint-disable-next-line no-unused-vars
			onItemSelected(val)
			{
				val = "";
			},
			addNewFaculty()
			{
				this.addFacultyDialog = false;
				store.dispatch("addFaculty", { facultyName: this.newFacultyName });
			},
			addNewStudent()
			{
				let theStudent =
				{
					student:
					{
						faculty: this.newStudentFaculty,
						firstName: this.newStudentFirstName,
						lastName: this.newStudentLastName,
						studentid: this.newStudentID,
						type: 1,
						university: "City University Of London",
						email: this.newStudentEmail,
						certificates: []
					},
					email: store.state.currentUniversity.email
				}
				this.addStudentDialog = false;
				store.dispatch("addStudent", { student: theStudent });
			},

			generateCertificate()
			{
				this.generateCertificateDialog = false;
				store.dispatch("generateCertificate",
				{
					email: this.studentsSelected[0].email,
					major: this.newStudentMajor,
					faculty: this.studentsSelected[0].faculty,
					status: "Pending Verification"
				});
			}
		},
		computed:
		{
			facultyList: () =>
			{
				return store.state.currentUniversity.faculties;
			},
			addFaculty: () =>
			{
				let outList = [];
				store.state.currentUniversity.faculties.forEach(faculty =>
				{
					outList.push(faculty.name);
				});
				return outList;
			},
			students: () =>
			{
				return store.state.currentUniversity.students;
			},
		}
	};
</script>

<style>
</style>