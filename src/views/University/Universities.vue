<template>
	<v-container grid-list-md text-center wrap pa-5>
		<component :is="progress" v-if="bIsFetchingData" />
		<v-row align="center" justify="center" v-if="!bIsDashboard">
			<v-card class="intech-card" v-if="!bIsFetchingData">
				<v-container pa-5>
					<v-col align="center" justify="center">
						<component :is="form" />
						<a
								href="#"
								@click="goToLoginForm"
								v-if="bIsLogin"
						>Already Have An Account?</a
						>
						<a
								href="#"
								@click="goToRegistrationForm"
								v-if="!bIsLogin"
						>Don't Have An Account? Register Here</a
						>
					</v-col>
				</v-container>
			</v-card>
		</v-row>
<!--		<h1>HHASDHJKASDJLASJD</h1>-->
		<component :is="dashboard" v-if="bIsDashboard" />
<!--		<university-view/>-->
	</v-container>
</template>

<script>
//Next Step Is To Check If There's Currently An User Signed In, If so, Show Dashboard
import LoginForm from "../../components/LoginForm";
import RegisterForm from "../../components/Registration";
import Dashboard from "./components/UniversityDashboard";
import store from "../../store";
import ProgressView from "../../components/LoadingComponents.vue";

export default {
	methods: {
		// eslint-disable-next-line no-unused-vars
		goToRegistrationForm: function(event)
		{
			this.form = "register-form";
			this.bIsLogin = true;
		},
		// eslint-disable-next-line no-unused-vars
		goToLoginForm: function(event)
		{
			this.form = "login-form";
			this.bIsLogin = false;
		}
	},
	components: {
		"login-form": LoginForm,
		"register-form": RegisterForm,
		"progress-view": ProgressView,
		"university-dashboard": Dashboard
	},
	data: () => ({
		form: "login-form",
		progress: "progress-view",
		dashboard: "university-dashboard",
		bIsLogin: false
	}),

	computed: {
		bIsFetchingData: () =>
		{
			return store.state.loadingRequest;
		},
		bIsDashboard: () =>
		{
			return true;
			return store.state.bIsuniversityDashboard;
		}
	},
	created()
	{
		this.$store.dispatch("fetchUserStatus", { dashboardType: 0 }).catch((err) =>
		{
			console.log(err);
		});
	}
};
</script>

<style scoped></style>