// VueJS modules
import Vue from "vue";
import { Component, Inject, Model, Prop, Watch } from "vue-property-decorator";
import FirebaseSingleton from "../../services/FirebaseSingleton";
import MoreInfoMoviecard from "../MoreInfoMovieCard";


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
  components: {MoreInfoMoviecard}
})
export default class Moviecard extends Vue {
  fst: FirebaseSingleton;
  userId: string;
  isMyMovie=false;
  libraryMessage="Add to Library";
  reviewMessage="Add Review";
  async mounted() {    
    this.fst = await FirebaseSingleton.GetInstance();
    // if(this.fst.auth.currentUser==null){
    //   await this.fst.auth.signInAnonymously();
    // }
    
    await Promise.all([ this.checkForMovieInUserCollection(), 
      this.checkForRatingInUserCollection() ]);
  }

  async checkForMovieInUserCollection() {
    const isInLibrary = await this.checkForMovieInCollection("movies");
    // If move is in collection, change message
    if (isInLibrary) {
      this.isMyMovie = true;
      this.libraryMessage = "Remove from Library";
    }
  }

  async checkForRatingInUserCollection() {
    const isInLibrary = await this.checkForMovieInCollection("ratings");
    // If move is in collection, change message
    if (isInLibrary) {
      this.reviewMessage = "Edit Review";
    }
  }

  async checkForMovieInCollection(collection: string) {
    this.userId = this.fst.auth.currentUser.uid;
    let checkUserCollection = await this.fst.firestore.collection("users")
    .doc(`${this.userId}/${collection}/${this.movie.key}`)
    .get()
    // If move is in collection, change message
    if (checkUserCollection.exists) {
      return true;
    }
  }


  @Prop()
  movie: Movie;
  // @Watch("movie", {deep: true, immediate: true})
  // onMovieChange() {
  //   console.log(this.movie.key);
  //   console.log(this.movie.poster);
  // }
  changeLibrary(isMyMovie: boolean) {
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
    let movieKey = {};
    movieKey[this.movie.key] = true;
    await this.fst.firestore.collection("users").doc(`${this.userId}/movies/${this.movie.key}`).set(movieKey, { merge: true });
    alert("added to collection");
  }

  async removeFromLibrary() {
    this.userId = this.fst.auth.currentUser.uid;
    await this.fst.firestore.collection("users").doc(`${this.userId}/movies/${this.movie.key}`).delete();
    alert("removed from collection");
  }

  async addReview(movie: Movie) {
    this.$emit("add-review", this.movie);
  }

  // write review to Firestore
  async publishReview(review: String, score: number) {
    this.userId = this.fst.auth.currentUser.uid;
    await this.fst.firestore.collection("users").doc(`${this.userId}/reviews/${this.movie.key}`).set(this.movie, { merge: true });
    alert("added review");
  }

  more_movie_info(movie: Movie) {
    this.$emit("more-info", this.movie);
  }
}

require("./template.html")(Moviecard);
