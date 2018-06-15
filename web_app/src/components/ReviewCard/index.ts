// VueJS modules
import Vue from "vue";
import { Component, Inject, Model, Prop, Watch } from "vue-property-decorator";
import FirebaseSingleton from "../../services/FirebaseSingleton";

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
})
export default class Reviewcard extends Vue {
  name="reviewcard";
  fst: FirebaseSingleton;
  userId: string;
  isMyMovie=false;
  libraryMessage="Add to Library";
  review_text: string="";
  
  async mounted() {}

  @Prop()
  movie: Movie;

  @Prop()
  review: Review;

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

    rating: number=1;
  }

require("./template.html")(Reviewcard);
