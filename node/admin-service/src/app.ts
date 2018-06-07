import express from 'express';
import * as admin from 'firebase-admin';

import * as fireflicks from './fireflicks';

class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: any) {
    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

const app = express();
admin.initializeApp();

const enableAuth: boolean = false;

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
  let status: number = 500;
  let details: any;
  if (err instanceof HttpError) {
    status = err.status;
    details = err.details;
  }
  res.status(status);
  res.json({
    details,
    message: err.message,
  });
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000');
});
