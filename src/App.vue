<template>
	<v-app id="app">
		<intech-nav-drawer :intech-drawer="drawer"/>
		<v-app-bar dark app color="light-blue darken-1">
			<v-app-bar-nav-icon
				@click.stop="drawer = !drawer"
				color="#fff"
			/>
			<v-spacer/>
			<v-toolbar-title>Intech Degree</v-toolbar-title>
		</v-app-bar>

		<v-main>
			<router-view class="the-content"/>
			<intech-footer/>
		</v-main>

	</v-app>
</template>

<script>
	// import Home from "./views/Home";
	import store from "./store";
	import footer from "./views/components/Footer";
	import navDrawer from "./views/components/NavigationDrawer";

	export default
	{
		name: "App",
		components:
		{
			"intech-footer": footer,
			"intech-nav-drawer": navDrawer
		},
		data: () => ({
			drawer: null,
			socialIcons: [
				"fab fa-facebook",
				"fab fa-twitter",
				"fab fa-google-plus",
				"fab fa-linkedin",
				"fab fa-instagram"
			]
		}),
		created()
		{
			store.dispatch("initializeFirebase");
		}
	};
</script>