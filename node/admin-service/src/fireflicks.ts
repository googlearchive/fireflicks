import * as admin from 'firebase-admin';

export async function grantModeratorRole(email: string): Promise<void> {
  const user = await admin.auth().getUserByEmail(email);
  if (user.customClaims && (user.customClaims as any).admin === true) {
    return;
  }
  return admin.auth().setCustomUserClaims(user.uid, {
    admin: true,
  });
}

export async function checkAuth(idToken: string): Promise<void> {
  const decoded = await admin.auth().verifyIdToken(idToken);
  if (decoded.admin !== true) {
    throw new Error('User does not have admin privileges');
  }
}
