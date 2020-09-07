import Vue from 'vue'
import Router from 'vue-router'
import Store from './store'
import Home from './views/Home.vue'
import Contact from './views/Contact.vue'
import Firebase from "firebase"

Vue.use(Router)

export default new Router({
	mode: "history",
	routes: [
		{
			path: "*",
			redirect: "/home"
		},
		{
			path: '/',
			name: 'home',
			component: Home
		},
		// {
		// 	path: '/students',
		// 	name: 'students',
		// 	component: Students
		// },
		// {
		// 	path: '/universities',
		// 	name: 'universities',
		// 	component: Universities
		// },
		{
			path: '/contact',
			name: 'contact',
			component: Contact
		},
		{
			path: '/about',
			name: 'about',
			// route level code-splitting
			// this generates a separate chunk (about.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
		}
	]
});//.beforeEach((to, from, next) =>
// {
//
// })