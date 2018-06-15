// VueJS modules
import Vue from "vue";
import { Component, Inject, Model, Prop, Watch } from "vue-property-decorator";
import FirebaseSingleton from "../../services/FirebaseSingleton";
import { firestore } from "firebase/app";
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
export default class MoreInfoMoviecard extends Vue {
  fst: FirebaseSingleton;
  userId: string;
  isMyMovie=false;
  libraryMessage="Add to Library";
  
  async mounted() {
    this.checkForMovieInUserCollection();
  }

  @Prop()
  movie: Movie;

  async checkForMovieInUserCollection() {
    this.fst = await FirebaseSingleton.GetInstance();
    this.userId = this.fst.auth.currentUser.uid;
    let checkUserCollection = await this.fst.firestore.collection("users")
    .doc(`${this.userId}/movies/${this.movie.key}`)
    .get()    
    if (checkUserCollection.exists) {
      console.log(`this movie is in collection: ${checkUserCollection}`);
      this.isMyMovie = true;
      this.libraryMessage = "Remove from Library";
    } else {
      console.log("cannot find movie")
    }
  }

  async addReview() {
    this.$emit("add-review", this.movie);
    console.log("add review called")
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
}

require("./template.html")(MoreInfoMoviecard );
