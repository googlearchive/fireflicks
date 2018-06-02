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

app.use(express.json());
app.use(async (req, res, next) => {
  const idToken = req.header('X-Firebase-ID-Token');
  if (!idToken) {
    return next(new HttpError('ID token not specified', 401));
  }
  try {
    await fireflicks.checkAuth(idToken);
  } catch (err) {
    return next(new HttpError('Request not authorized', 401, err));
  }
  next();
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

app.listen(3000, () => {
  console.log('Example app listening on port 3000');
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
