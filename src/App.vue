<template>
	<v-app id="app">
		<v-navigation-drawer v-model="intechDrawer" app>
			<v-list dense>
				<v-list-item v-ripple v-if="bIsLoggedIn">
					<v-list-item-avatar
						class="profile-header"
						color="blue"
						horizontal:true
						tile:true
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
					v-if="!bIsLoggedIn || bIsStudent"
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
								@click="logOut"
							>
								Logout
							</v-btn>
						</div>
					</v-list-item-action>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>
		<v-app-bar dark app color="light-blue darken-1">
			<v-app-bar-nav-icon
				@click.stop="intechDrawer = !intechDrawer"
				color="#fff"
			/>
			<v-spacer />
			<v-toolbar-title>Intech Degree</v-toolbar-title>
		</v-app-bar>
		<v-content class="the-content">
			<router-view />
			<v-footer dark padless width="100vw" inset elevation="4">
				<v-card flat tile class="teal accent-3 white--text text-center">
					<v-card-text>
						<v-btn
							v-for="icon in socialIcons"
							:key="icon"
							class="mx-4 white--text"
							icon
						>
							<v-icon size="24px">
								{{ icon }}
							</v-icon>
						</v-btn>
					</v-card-text>
					<v-card-text class="white--text pt-0 the-footer">
						Phasellus feugiat arcu sapien, et iaculis ipsum
						elementum sit amet. Mauris cursus commodo interdum.
						Praesent ut risus eget metus luctus accumsan id ultrices
						nunc.
					</v-card-text>

					<v-divider />

					<v-card-text class="white--text">
						{{ new Date().getFullYear() }} —
						<strong>Intech Degree</strong>
					</v-card-text>
				</v-card>
			</v-footer>
		</v-content>
	</v-app>
</template>

<script>
	// import Home from "./views/Home";
	import store from "./store";
	import dummy from "../src/assets/images/profile-adam.jpg";

	export default
	{
		name: "App",
		components:
		{
			// Home
		},
		data: () => ({
			dummyUserPicture: dummy,
			intechDrawer: null,
			socialIcons: [
				"fab fa-facebook",
				"fab fa-twitter",
				"fab fa-google-plus",
				"fab fa-linkedin",
				"fab fa-instagram"
			]
		}),
		computed:
		{
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
			logOut: () =>
			{
				store.dispatch("logout");
			}
			//intechDrawer: ()=>
			//{
			//	console.log("hello");
			//	return;
			//}
		},
		created()
		{
			store.dispatch("initializeFirebase");
		}
	};
</script>