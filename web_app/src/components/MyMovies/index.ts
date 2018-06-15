// VueJS modules
import Vue from "vue";
import { Component, Inject, Model, Prop, Watch } from "vue-property-decorator";
import Toolbar from "../Toolbar";
import Moviecard from "../Moviecard";
import FirebaseSingleton from "../../services/FirebaseSingleton";
import FirestoreModule from "@firebase/firestore-types";
import MoreInfoMoviecard from "../MoreInfoMovieCard";
import AddReviewModal from "../AddReviewModal";
import DataModel from "../../services/DataModel";


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
    AddReviewModal
  }
})
export default class MyMovies extends Vue {
  filter = "";
  movies: Movie[] = [];
  reviews: Review[] = [];
  fst: FirebaseSingleton;
  dm: DataModel;
  lastMovie: FirestoreModule.DocumentSnapshot;
  more_movies_found=false;
  no_movies_found_error_message="No more movies match your criteria";

  async mounted() {
    this.dm = new DataModel();
    this.fst = await FirebaseSingleton.GetInstance();
    await this.dm.init();
    
  }

  async loadMyMovies(loadMore: boolean) {
    await this.dm.init();
    if (!this.fst.auth.currentUser) {
      return;
    }
    const userId = this.fst.auth.currentUser.uid;
    const collection = `users/${userId}/movies`
    const type = "mymovies";
    const updateResult = await this.dm.loadMovies(loadMore, collection, this.lastMovie, 
      this.filter, this.more_movies_found, 
      this.movies, this.reviews,
      type,
    )
    this.more_movies_found = updateResult.more_movies_found;
    if (this.more_movies_found) {
      this.lastMovie = updateResult.lastMovie;
      this.movies = updateResult.movies
      console.log(this.movies)
    }
    if (!this.more_movies_found && !loadMore) {
      this.movies = updateResult.movies
    }
  }

  add_review_movie: Movie | boolean = false;
  onAddReview(movie: Movie) {
    this.add_review_movie = movie;
  }

  more_info_movie: Movie | boolean = false;
  onLoadMoreInfo(movie: Movie) {
    this.more_info_movie = movie;
  }
  
  onFilterChanged(filter: any) {
    this.filter = filter;
    console.log("change made" + this.filter);
    console.log(this.filter);
    this.loadMyMovies(false);
  }

  onLogin() {
    this.loadMyMovies(false);
  }

  topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }

}

require("./template.html")(MyMovies);
