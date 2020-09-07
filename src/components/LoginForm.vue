<template>
	<v-form>
		<v-text-field
			v-model.trim="username"
			name="email"
			label="Email Address"
			prepend-icon="email"
			messages=""
			id="name"
		/>
		<v-text-field
			v-model.trim="password"
			:append-icon="showPwd ? 'visibility' : 'visibility_off'"
			:type="showPwd ? 'text' : 'password'"
			name="password"
			label="Password"
			prepend-icon="lock"
			id="password"
			hit="At least 8 characters"
			@click:append="showPwd = !showPwd"
		/>
		<v-container fill-height>
			<v-layout row wrap align-content-center>
				<v-flex justify-content="between" align-self: center>
					<v-btn
						class="intech-btn"
						depressed
						color="primary"
						dark
						b="10"
						@click="loginWithFirebase"
					>
						Sign In
					</v-btn>
					<v-btn
						class="intech-btn"
						depressed
						color="primary"
						dark
						@click="forgotPassword"
					>
						Forgot Your Password?
					</v-btn>
				</v-flex>
			</v-layout>
		</v-container>
	</v-form>
</template>
<script>
	export default {
		data: () => ({
			showPwd: false,
			username: "",
			password: ""
		}),

		methods: {
			loginWithFirebase()
			{
				this.$store.dispatch("login",
				{
					email: this.username,
					password: this.password,
					dashboardType: 0
				}).then(() =>
				{
					this.$store.dispatch("mutateData");
					// this.$store.dispatch("fetchUserStatus", { dashboardType: 0 }).catch((err) =>
					// {
					// 	console.log(err);
					// });
				});
			},

			forgotPassword() {
				//TODO: Implement this
			}
		}
	};
</script>

<style scoped></style>