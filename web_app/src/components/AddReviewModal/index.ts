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
import Moviecard from "../Moviecard"

type Movie = {
  title: string;
  averageRating: number;
  overview: string;
  poster: string;
  genres: {string: boolean};
  genreList: string;
  key: string;
};

@Component({
  components: {Moviecard}
})
export default class AddReviewModal extends Vue {
  fst: FirebaseSingleton;
  userId: string;
  isMyMovie=false;
  libraryMessage="Add to Library";
  review_text: string="";
  update = "";
  
  async mounted() {
    this.checkForMovieInUserRating();
  }

  @Prop()
  movie: Movie;

  async checkForMovieInUserRating() {
    this.fst = await FirebaseSingleton.GetInstance();
    this.userId = this.fst.auth.currentUser.uid;
    let checkUserCollection = await this.fst.firestore.collection("users")
    .doc(`${this.userId}/ratings/${this.movie.key}`)
    .get()    
    if (checkUserCollection.exists) {
      this.update = "Update "
      this.review_text = checkUserCollection.data().review_text;
      this.rating = checkUserCollection.data().rating;
    }
  }

  async changeLibrary(isMyMovie: boolean) {
    // if movie is in collection, remove it
    if (isMyMovie) {
      this.removeFromLibrary();
    } else {
      // otherwise, add movie
      this.addToLibrary();
    }
  }
  
   async addToLibrary() {
      this.userId = this.fst.auth.currentUser.uid;
      await this.fst.firestore.collection("users").doc(`${this.userId}/movies/${this.movie.key}`).set(this.movie, { merge: true });
      alert("added to collection");
    }
  
    async removeFromLibrary() {
      this.userId = this.fst.auth.currentUser.uid;
      await this.fst.firestore.collection("users").doc(`${this.userId}/movies/${this.movie.key}`).delete();
      alert("removed from collection");
    }

    close() {
      this.$emit("close");
    }

    rating: number=1;
    async onPublishReview() {
      // publish rating and reviewtext;
      const review = {
        review_text: this.review_text,
        rating: this.rating
      }
      // use a batch write to write to user's reviews
      // and review collection
      let batch = this.fst.firestore.batch();
      const userReviewRef = this.fst.firestore.collection("users")
      .doc(`${this.userId}/ratings/${this.movie.key}`);
      batch.set(userReviewRef, review);
      let newRating = {};
      newRating[`${this.userId}`] = this.rating;
      const reviewRef = this.fst.firestore.collection("ratings").doc(`${this.movie.key}`);
      batch.set(reviewRef, newRating, {merge: true});
      await batch.commit();
      alert("Review Submitted!");
      this.close();
    }
  }

require("./template.html")(AddReviewModal);
