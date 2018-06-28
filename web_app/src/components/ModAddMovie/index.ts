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
import Toolbar from "../Toolbar";
import FirebaseSingleton from "../../services/FirebaseSingleton";

@Component({
  components: {
    Toolbar, 
  }
})
export default class ModAddMovie extends Vue {
  base_url = "http://localhost:3000/";
  fst: FirebaseSingleton;
  userId: string;
  hide = true;
  
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
  filtersMenu = [
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
  movie_title = "";
  image_url = "";
  movie_description = "";
  async mounted() {
    await System.import("isomorphic-fetch");
    require("isomorphic-fetch");
    this.fst = await FirebaseSingleton.GetInstance();
    this.userId = this.fst.auth.currentUser.uid;
  }

  // verify that there is valid data in all fields
  verifyFields() {
    // remove whitespace around items
    this.movie_title = this.movie_title.trim();
    this.movie_description = this.movie_description.trim();
    this.image_url = this.image_url.trim();
    // check if fields are blank
    if (this.movie_title === "" || this.movie_description === "" || this.image_url === "") {
      alert("fields cannot be left blank")
      return false;
    }
    // check if image url is valid
    if (!this.imageExists(this.image_url)) {
      alert("not a valid url");
      return false;
    }
    return true;
  }

  imageExists(image_url) {
    let http = new XMLHttpRequest();

    http.open("HEAD", image_url, false);
    http.send();

    return http.status != 404;
  }

  async getMovie() {
    let trueFilters = {};
    // get only the filters that are checked
    Object.keys(this.filters).forEach(key => {
      if (this.filters[key] === true) {
        trueFilters[key] = true;
      }
    })
    let movie = {
      title: this.movie_title,
      genres: trueFilters,
      overview: this.movie_description,
      poster: this.image_url,
    }
    return movie;
  }

  // write movie to database
  async onPublishMovie() {
    // if fields aren't correct, exit function
    if (!this.verifyFields()) {
      return;
    }
    const movie = await this.getMovie();
    const token = await this.fst.auth.currentUser.getIdToken();
    const result = await this.postData(`${this.base_url}movies`, movie, token);
    alert(result);
    this.movie_title = "";
    this.movie_description = "";
    this.image_url = "";
  }

  async postData(url: string, data: {}, token: string) {
    return fetch(url, {
      body: JSON.stringify(data),
      credentials: "same-origin",
      headers: {
        "X-Firebase-ID-Token": token,
        "content-type": "application/json"
      },
      method: "POST",
      mode: "cors",
      redirect: "follow",
      referrer: "no-referrer",
    })
    .then(response => response.json());
  }
}

require("./template.html")(ModAddMovie);
