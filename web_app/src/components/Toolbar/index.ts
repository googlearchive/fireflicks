// Copyright 2018 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// VueJS modules
import Vue from "vue";
import { Component, Inject, Model, Prop, Watch } from "vue-property-decorator";
import FirebaseSingleton from "../../services/FirebaseSingleton";
import DataModel from "../../services/DataModel";
System.import("isomorphic-fetch")
require("isomorphic-fetch");

@Component({
})
export default class Toolbar extends Vue {
  name = "toolbar"
  dm: DataModel;
  fst: FirebaseSingleton;
  uid: string;
  anonUID: string;
  async mounted() {
    this.dm = new DataModel();
    await this.dm.init();
    this.fst = await FirebaseSingleton.GetInstance();
    await this.checkLoginStatus();
  }
  filters = { 
    action: false,
    adventure: false,
    animation: false,
    children: false,
    comedy: false,
    crime: false,
    documentary: false,
    drama: false,
    family: false,
    fantasy: false,
    history: false,
    horror: false,
    music: false,
    mystery: false,
    romance: false,
    science_fiction: false,
    thriller: false,
    war: false,
    western: false, 
  };
  filter = "";
  filtersMenu = [
    {label: "All", model: "all"},
    {label: "Action", model: "action"},
    {label: "Adventure", model: "adventure"},
    {label: "Animation", model: "animation"},
    {label: "Children", model: "children"},
    {label: "Crime", model: "crime"},
    {label: "Comedy", model: "comedy"},
    {label: "Documentary", model: "documentary"},
    {label: "Drama", model: "drama"},
    {label: "Family", model: "family"},
    {label: "Fantasy", model: "fantasy"},
    {label: "History", model: "history"},
    {label: "Horror", model: "horror"},
    {label: "Music", model: "music"},
    {label: "Mystery", model: "mystery"},
    {label: "Romance", model: "romance"},
    {label: "Science Fiction", model: "science_fiction"},
    {label: "Thriller", model: "thriller"},
    {label: "War", model:"war"},
    {label: "Western", model:"western"},
  ];

  isResponsive = false;
  /* handles on mobile when filter by genre is selected
  makes list cover other buttons to prevent 
  accidentally clicking in the wrong place */
  isGenreClicked = false;
  isHidden = false;
  isAdmin = false;
  isAdminClicked = false;
  isMyMoviesClicked = false;
  loginTitle = "Log In";

  // listen for calls to hide
  @Prop()
  hide: boolean;
  @Watch("hide", {deep: true, immediate: true})
  onHide() {
    this.isHidden=this.hide;
  }

  // update the currently selected filter
  didSelect(genre: string) {
    let newfilter = "";
    for (let filter in this.filters) {
      if (filter === genre && filter !== "all") {
        newfilter = filter;
      }
    }
    this.filter = newfilter;
    this.$emit("filter-change", this.filter);
  }

  async usersMovies() {
    let userMovies: {movies: string[], ratings: string[]};
    let [myMovies, myRatings] = await Promise.all([this.getMoviesFromQuery(`users/${this.uid}/movies`),
    this.getMoviesFromQuery(`users/${this.uid}/ratings`)
  ])
    userMovies = {
      movies: myMovies,
      ratings: myRatings
    }
    return userMovies;
  }

  async getMoviesFromQuery(collection: string) {
    let keys = [];
    let snapshot = await this.fst.firestore
    .collection(collection).get();
    snapshot.docs.forEach(async snap => {
      keys.push(snap.id);
    })
    return keys;
  }

  // used if merge isn't possible because an anon user was merged before
  async writeMovies(doc: string, movieKeys: string[]) {
    for (let key of movieKeys) {
      console.log(`${this.uid}/${doc}/${key}`)
      let movie = {};
      movie[key] = true;
      const ref = await this.fst.firestore
      .collection("users").doc(`${this.uid}/${doc}/${key}`).set(movie,{merge: true})
    }
  }

  async writeMoviesToNewUser(uid: string, userMovies: {movies: string[], ratings: string[]}) {
    await Promise.all([this.writeMovies("movies", userMovies.movies),
    this.writeMovies("ratings", userMovies.ratings)
  ])
    console.log("movies written to new user");
  }
      
  // login functionality

  changeLoginStatus() {
    if (this.fst.auth.currentUser.isAnonymous) {
      this.logInWithGmail();
    } else {
      this.logOut();
    }
  }

  async checkLoginStatus() {
    let fst = this.fst;
    let _this = this;
    this.fst.auth.onAuthStateChanged(async function (user) {
      // If we have no user, default to signing in anonymously
      if (!user) {
          await fst.auth.signInAnonymously();
          _this.anonUID = fst.auth.currentUser.uid;
          _this.isAdmin = false;
          _this.$emit("login");  
        } else {
          // Otherwise render out the info  
          _this.uid = fst.auth.currentUser.uid;
          _this.displayUserInfo();
          _this.$emit("login");
      }
    });
  }

  async displayUserInfo() {
    if (!this.fst.auth.currentUser.isAnonymous) {
      this.loginTitle = "Log Out";
      this.isAdmin = await this.dm.checkIsMod();
    } else {
      this.loginTitle = "Log In";
    }
  }

  async logInWithGmail() {
    let fst = this.fst;
    let _this = this;
    let uid = this.fst.auth.currentUser.uid;
    let movies = await this.usersMovies();
    // Instead of logging in, we call link method
    this.fst.auth.currentUser.linkWithPopup(this.fst.provider).then(async function(result) {
        // If we succeed, we've now modified our user (no longer anonymous)
        // so we re-render our info
        _this.isAdmin = await _this.dm.checkIsMod();
        _this.loginTitle = "Log Out";
    }).catch(async function(error) {
        // If the link fails (because a previous anonymous account was linked)
        // then we just sign in as the existing user (which will toss all changes into the ether)
        // but hopefully we don't hit this much.
        await fst.auth.signInWithCredential(error.credential);
        _this.uid = fst.auth.currentUser.uid;
        _this.writeMoviesToNewUser(uid, movies);
        _this.isAdmin = await _this.dm.checkIsMod();
        _this.loginTitle = "Log Out";
    });
  }

  async logOut() {
    this.fst = await FirebaseSingleton.GetInstance();
    await this.fst.auth.signOut(); 
    this.loginTitle = "Log In";
    this.isAdmin = false;
  }

}

require("./template.html")(Toolbar);
