<template>
	<v-navigation-drawer v-model="getTheDrawer" app>
		<v-list dense>
			<v-list-item v-ripple v-if="bIsLoggedIn">
				<v-list-item-avatar
						class="profile-header"
						color="blue"
				>
					<v-img :src='dummyUserPicture' />
				</v-list-item-avatar>
				<v-list-item-title>{{ userName }}</v-list-item-title>
			</v-list-item>
			<v-divider v-if="bIsLoggedIn" />
			<v-list-item to="/">
				<v-list-item-action>
					<v-icon>home</v-icon>
				</v-list-item-action>
				<v-list-item-content>
					<v-list-item-title>Home</v-list-item-title>
				</v-list-item-content>
			</v-list-item>

			<v-list-item
					v-if="(!bIsLoggedIn || bIsStudent)"
					to="/students"
			>
				<v-list-item-action>
					<v-icon>group</v-icon>
				</v-list-item-action>
				<v-list-item-content>
					<v-list-item-title>Students</v-list-item-title>
				</v-list-item-content>
			</v-list-item>


			<v-list-item v-if="!bIsLoggedIn || bIsUniversity" to="/universities">
				<v-list-item-action>
					<v-icon>school</v-icon>
				</v-list-item-action>
				<v-list-item-content>
					<v-list-item-title>Universities</v-list-item-title>
				</v-list-item-content>
			</v-list-item>
			<v-list-item to="about">
				<v-list-item-action>
					<v-icon>chat</v-icon>
				</v-list-item-action>
				<v-list-item-content>
					<v-list-item-title>Contact</v-list-item-title>
				</v-list-item-content>
			</v-list-item>
			<v-list-item>
				<v-list-item-action>
					<div>
						<v-btn
								large
								depressed
								dark
								color="primary"
								v-if="bIsLoggedIn"
								@click="logout"
						>
							Logout
						</v-btn>
					</div>
				</v-list-item-action>
			</v-list-item>
		</v-list>
	</v-navigation-drawer>
</template>

<script>
import store from "@/store";
import dummy from "@/assets/images/profile-adam.jpg";
import { mapGetters, mapActions } from "vuex";

export default
{
	name: "NavigationDrawer",
	data: () => ({
		dummyUserPicture: dummy,
		getTheDrawer: () => {
			return this.intechDrawer;
		}
	}),
	props:
	{
		intechDrawer : Object,
	},
	computed: {
		userName: () =>
		{
			return store.getters.getUserName;
		},
		bIsLoggedIn: () =>
		{
			return !(store.getters.getCurrentUser === undefined || store.getters.getCurrentUser === null);
		},
		bIsStudent: () =>
		{
			return store.getters.getLoggedInAs === "student";
		},
		bIsUniversity: () =>
		{
			return store.getters.getLoggedInAs === "university";
		},
		userPicture: () =>
		{
			return store.getters.getUserPicture;
		}
	},
	methods:
	{
		...mapActions(["logout"])
	}
}

</script>

<style scoped>

</style>