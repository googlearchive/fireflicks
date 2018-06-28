import * as admin from 'firebase-admin';

const validGenres = {
  action: true,
  adventure: true,
  animation: true,
  children: true,
  comedy: true,
  crime: true,
  documentary: true,
  drama: true,
  fantasy: true,
  filmnoir: true,
  horror: true,
  musical: true,
  mystery: true,
  romance: true,
  scifi: true,
  thriller: true,
  war: true,
  western: true,
};

export type Genre = keyof typeof validGenres;

export interface Movie {
  title: string;
  overview?: string;
  poster?: string;
  imdb?: string;
  tmdb?: string;
  genres?: {[key in Genre]: boolean};
  ratingsCount: number;
  averageRating: number;
}

function checkNonEmptyString(value: any, field: string): string {
  if (typeof value !== 'string' || value === '') {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value as string;
}

function checkOptionalString(value: any, field: string): (string | undefined) {
  if (typeof value === 'undefined' || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error(`${field} must be a string`);
  }
  return value as string;
}

function checkGenres(genres: any): ({[key in Genre]: boolean} | undefined) {
  if (typeof genres === 'undefined' || genres === null) {
    return undefined;
  }
  if (typeof genres !== 'object') {
    throw new Error('Genres must be an object');
  }
  Object.keys(genres).forEach((g) => {
    if (!(g in validGenres)) {
      throw new Error(`Invalid movie genre: ${g}`);
    }
    if (typeof genres[g] !== 'boolean') {
      throw new Error('Genre values must be boolean');
    }
  });
  return genres;
}

export function newMovie(data: any): Movie {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid movie data');
  }
  return {
    title: checkNonEmptyString(data.title, 'Title'),
    overview: checkOptionalString(data.overview, 'Overview'),
    poster: checkOptionalString(data.poster, 'Poster'),
    imdb: checkOptionalString(data.imdb, 'IMDB'),
    tmdb: checkOptionalString(data.tmdb, 'TMDB'),
    genres: checkGenres(data.genres),
    ratingsCount: 0,
    averageRating: 0,
  };
}

export async function grantModeratorRole(email: string): Promise<void> {
  const user = await admin.auth().getUserByEmail(email);
  if (user.customClaims && (user.customClaims as any).admin === true) {
    return;
  }
  return admin.auth().setCustomUserClaims(user.uid, {
    moderator: true,
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

export async function addMovie(movie: Movie): Promise<string> {
  const collection = admin.firestore().collection('movies');
  const movieRef = await collection.add(movie);
  return movieRef.id;
}

export async function checkAuth(idToken: string): Promise<void> {
  const decoded = await admin.auth().verifyIdToken(idToken);
  if (decoded.moderator !== true) {
    throw new Error('User does not have moderator privileges');
  }
}
