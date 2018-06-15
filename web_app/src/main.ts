import Vue from "vue";
import VueRouter from "vue-router";
import * as Raven from 'raven-js';
import * as RavenVue from 'raven-js/plugins/vue';

import App from "./components/App";
import MyMovies from "./components/MyMovies";
import MyReviews from "./components/MyReviews";
import AdminAddMovie from "./components/AdminAddMovie";
import AdminAddAdmin from "./components/AdminAddAdmin";

console.log(Raven);

Raven
    .config('https://30c86142720c4d90813593ed24717f33@sentry.io/1196339')
    .addPlugin(RavenVue, Vue)
    .install();
    
document.location.port == "5000" && alert("Please use localhost:8080 for debugging.")
// if ("serviceWorker" in navigator) {
//   // && !document.location.host.startsWith("localhost")) {
//   window.addEventListener("load", async () => {
//     try {
//       const reg = await navigator.serviceWorker.register("/sw.js");
//       console.log(
//         "ServiceWorker registration successful with scope: ",
//         reg.scope
//       );
//     } catch (error) {
//       console.log("ServiceWorker registration failed :(", error);
//     }
//   });
// }

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  routes: [
    { path: "/", component: App },
    { path: "/mymovies", component: MyMovies },
    { path: "/myreviews", component: MyReviews },
    { path: "/mod-add-movie", component: AdminAddMovie },
    { path: "/mod-add-mod", component: AdminAddAdmin },
  ]
});

new Vue({
  el: "#app",
  router
});
