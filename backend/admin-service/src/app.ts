import express from 'express';
import * as admin from 'firebase-admin';

import * as fireflicks from './fireflicks';

class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: Error) {
    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

const serviceAccount = require('../../../serviceAccountKey.json');

const app = express();
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const enableAuth: boolean = true;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Firebase-ID-Token');
  if ('OPTIONS' === req.method) {
    res.send(200);
  } else {
    next();
  }
});
app.use(express.json());
app.use(async (req, res, next) => {
  if (enableAuth) {
    const idToken = req.header('X-Firebase-ID-Token');
    if (!idToken) {
      return next(new HttpError('ID token not specified', 401));
    }
    try {
      await fireflicks.checkAuth(idToken);
    } catch (err) {
      return next(new HttpError('Request not authorized', 401, err));
    }
  }
  next();
});

app.get('/movies/:movieId', async (req, res, next) => {
  try {
    const movie = await fireflicks.getMovie(req.params.movieId);
    if (movie === null) {
      return next(new HttpError(`No movie found for ID: ${req.params.movieId}`, 404));
    }
    res.json(movie);
  } catch (err) {
    return next(new HttpError('Failed to retrieve movie', 500, err));
  }
});

app.post('/movies', async (req, res, next) => {
  let movie: fireflicks.Movie;
  try {
    movie = fireflicks.newMovie(req.body);
  } catch (err) {
    return next(new HttpError('Failed to parse request', 400, err));
  }

  try {
    const id = await fireflicks.addMovie(movie);
    res.json({id});
  } catch (err) {
    return next(new HttpError('Failed to save movie', 500, err));
  }
});

app.post('/moderators', async (req, res, next) => {
  const body = req.body || {};
  if (!body.email) {
    return next(new HttpError('User email not specified', 400));
  }

  try {
    await fireflicks.grantModeratorRole(body.email);
    res.json({success: true});
  } catch (err) {
    next(new HttpError('Failed to grant admin role to user', 500, err));
  }
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(err);
  let status: number = 500;
  let details: any;
  if (err instanceof HttpError) {
    status = err.status;
    if (err.details) {
      details = err.details.message;
    }
  }
  res.status(status);
  res.json({
    message: err.message,
    details,
  });
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000');
});
