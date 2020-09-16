/* eslint-disable no-unused-vars */
import Vue from "vue";
import Vuex from "vuex";
import "firebase/auth";
import "firebase/firestore";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		firebaseGod: null,
		currentUser: null,
		userProfile: null,
		loadingRequest: false,
		bIsuniversityDashboard: false,
		bIsStudentDashboard: false,
		currentUniversity: {
			university: "",
			certificates: [],
			students: [],
			faculties: []
		},
		currentStudent: {},
		allCertificates: [],
		allStudents: [],
		studentCertificate: []
	},

	mutations:
	{

	},

	actions:
	{

}, //Actions
	getters:
	{
		getCurrentUser(state)
		{
			//Do Something
			return state.currentUser;
		},
	},
});