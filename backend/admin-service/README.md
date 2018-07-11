# FireFlicks Admin Service (Node.js)

This is a web service that provides some back-end functionality for the
FireFlicks web and mobile apps. It is implemented using the
[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) for Node.js,
and the Express framework.

# Prerequisites

* Node.js 6.0 or higher
* NPM 5.0 or higher
* curl or equivalent tool for sending HTTP requests

## Application Features

* ID token verificiation
* Firestore access
* Setting and retrieving custom claims on user accounts 

## Testing Locally

1. Download a service account key file from your Firebase project, and place it
   at the root of this Git repository. Rename the file to
   `serviceAccountKey.json`.

2. Install the dependencies.

```
$ npm install
```

3. Build the server app.

```
$ npm run build
```

4. Start the server. This will start a server process that listens on port 3000.

```
$ npm run serve
```

5. Use a HTTP client tool like `curl` to send test requests.

```
$ curl -v http://localhost:8080/movies/test
```

The server authorizes incoming requests by default. And without a valid ID
token on the request, the server will return `401 Unauthorized` responses by
default.