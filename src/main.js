import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@/assets/styles/styles.scss';
import VueParticles from 'vue-particles'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import '@mdi/font/css/materialdesignicons.css';
import Vuelidate from 'vuelidate';

Vue.config.productionTip = false;
Vue.use(VueParticles);
Vue.use(Vuelidate);

new Vue({
	router,
	store: store,
	vuetify,
	render: h => h(App)
}).$mount('#app')