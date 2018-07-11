import * as admin from 'firebase-admin';
import * as fireflicks from './fireflicks';

const serviceAccount = require('../../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

if (process.argv.length !== 3) {
  throw Error('Invalid use of promote. Usage: node promote.js <email>');
}
const email = process.argv[2];
fireflicks.grantModeratorRole(email).then((res) => {
  console.log(`User ${email} has been given moderator role`);
  process.exit(0);
}).catch((err) => {
  console.log('Failed to grant user moderator role: ' + err);
  process.exit(1);
});
