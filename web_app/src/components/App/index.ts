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
import Moviecard from "../Moviecard";
import MoreInfoMoviecard from "../MoreInfoMovieCard";
import AddReviewModal from "../AddReviewModal";
import FirebaseSingleton from "../../services/FirebaseSingleton";
import DataModel from "../../services/DataModel";
import FirestoreModule from "@firebase/firestore-types";

type Movie = {
  title: string;
  averageRating: number;
  overview: string;
  poster: string;
  genres: {string: boolean};
  genreList: string;
  key: string;
};
type Review = {
  review_text: string;
  rating: number;
};

@Component({
  components: {
    Toolbar, 
    Moviecard, 
    MoreInfoMoviecard,
    AddReviewModal,
  }
})
export default class App extends Vue {
  filter = "";
  movies: Movie[] = [];
  reviews: Review[] = [];
  fst: FirebaseSingleton;
  dm: DataModel;
  lastMovie: FirestoreModule.DocumentSnapshot;
  more_movies_found=false;
  userId: string;
  no_movies_found_error_message="No more movies match your criteria";
  async mounted() {
    this.dm = new DataModel();
    this.fst = await FirebaseSingleton.GetInstance();
    await this.dm.init();
    this.loadMovies(false);
  }

  async loadMovies(loadMore: boolean) {
    this.dm = new DataModel();
    await this.dm.init();
    const collection = "movies";
    const type = "app";
    const updateResult = await this.dm.loadMovies(loadMore, collection, this.lastMovie, 
      this.filter, this.more_movies_found, 
      this.movies, this.reviews,
      type
    )
    this.more_movies_found = updateResult.more_movies_found;
    if (this.more_movies_found) {
      this.lastMovie = updateResult.lastMovie;
      this.movies = updateResult.movies
    }
  }

  more_info_movie: Movie | boolean = false;
  onLoadMoreInfo(movie: Movie) {
    this.more_info_movie = movie;
  }

  add_review_movie: Movie | boolean = false;
  onAddReview(movie: Movie) {
    this.add_review_movie = movie;
  }

  onFilterChanged(filter: any) {
    this.filter = filter;
    console.log("change made" + this.filter);
    console.log(this.filter);
    this.loadMovies(false);
  }

  onLogin() {
    this.userId = this.fst.auth.currentUser.uid;
    this.loadMovies(false);
  }

  topFunction() {
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }
}


require("./template.html")(App);
