import * as admin from 'firebase-admin';
const {movies, ratings} = require('../movies.json');

const serviceAccount = require('../../../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

function addMovies() {
  const moviesRef = admin.firestore().collection('movies');
  const promises: Array<Promise<any>> = [];
  Object.keys(movies).forEach((movieId) => {
    promises.push(moviesRef.doc(movieId).set(movies[movieId]));
  });
  return Promise.all(promises);
}

function addRatings() {
  const ratingsRef = admin.firestore().collection('ratings');
  const promises: Array<Promise<any>> = [];
  Object.keys(ratings).forEach((movieId) => {
    promises.push(ratingsRef.doc(movieId).set(ratings[movieId]));
  });
  return Promise.all(promises);
}

addMovies().then((res) => {
  console.log('Added movies...');
  return addRatings();
}).then((res) => {
  console.log('Added ratings...');
}).catch((err) => {
  console.log('Failed to add data: ' + err);
});
