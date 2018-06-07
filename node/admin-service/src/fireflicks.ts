import * as admin from 'firebase-admin';

export interface Movie {
  title: string;
  overview: string;
  poster: string;
  imdb: string;
  tmdb: string;
  genres: {[key: string]: boolean};
  ratingsCount: number;
  averageRating: number;
}

export async function grantModeratorRole(email: string): Promise<void> {
  const user = await admin.auth().getUserByEmail(email);
  if (user.customClaims && (user.customClaims as any).admin === true) {
    return;
  }
  return admin.auth().setCustomUserClaims(user.uid, {
    admin: true,
  });
}

export async function getMovie(id: string): Promise<Movie | null> {
  const movieRef = admin.firestore().collection('movies').doc(id);
  const snapshot = await movieRef.get();
  if (!snapshot.exists) {
    return null;
  }
  return snapshot.data() as Movie;
}

export async function checkAuth(idToken: string): Promise<void> {
  const decoded = await admin.auth().verifyIdToken(idToken);
  if (decoded.admin !== true) {
    throw new Error('User does not have admin privileges');
  }
}
