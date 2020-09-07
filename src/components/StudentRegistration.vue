<template>
	<v-form>
		<p color="dark">
			Register For Free With Intech Degree
		</p>
		<v-autocomplete class="myClass"
			name="University"
			allow-overflow:false
			autofocus:true
			:items="universityList"
			label="University"
			id="university-n"
			prepend-icon="school"
			placeholder="Start typing to Search"
		/>
		<v-text-field
			v-model.trim="username"
			name="email"
			label="Email Address"
			prepend-icon="email"
			messages=""
			id="name"
		/>
		<v-text-field
			v-model.trim="studentID"
			name="Student ID"
			label="Student ID"
			prepend-icon="assignment_ind"
			messages=""
			id="studentid"
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
				<v-flex
					justify-content="between"
					align-self:
					center
				>
					<v-btn
						class="intech-btn"
						depressed
						color="primary"
						dark
						b="10"
						@click="onRegisterPress"
					>
						Register
					</v-btn>
				</v-flex>
			</v-layout>
		</v-container>
	</v-form>
</template>

<script>
	export default
	{
		data: () => ({
			showPwd: false,
			showPwd2: false,
			universityList: [
				"City University Of London"
			],
			username: "",
			password: "",
			studentID: ""
		}),
		methods:
		{
			onRegisterPress()
			{
				this.$store.dispatch("createAccount",
				{
					username: this.username,
					password: this.password,
					id: this.studentID,
					university: "City University Of London",
					bIsUniversityAccount: false
				})
				.then(() =>
				{
					this.$store.dispatch("fetchUserStatus", { dashboardType: 1 }).catch((err) =>
					{
						console.log(err);
					});
				});
			},
		}
		//uncomment This If You Want To Keep Password Validation (useless for now)
		// validations:
		// {
		// 	username:
		// 	{
		// 		required,
		// 		email
		// 	},
		// 	password:
		// 	{
		// 		required,
		// 		minValue: 8,
		// 	},
		// 	passwordRepeat:
		// 	{
		// 		required,
		// 		minValue: 8,
		// 	}
		// }
	};
</script>

<style>
</style>