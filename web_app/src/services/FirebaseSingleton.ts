// Copyright 2018 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

let singleton: FirebaseSingleton;
let waitForSingleton: Promise<FirebaseSingleton>;

// Typings for modules imported dynamically
import FirebaseAppModule = require("@firebase/app-types");
import FirestoreModule = require("@firebase/firestore-types");
import FirebaseAuthModule = require("@firebase/auth-types");

export default class FirebaseSingleton {
  firestore: FirestoreModule.FirebaseFirestore;
  auth: FirebaseAuthModule.FirebaseAuth;
  provider: FirebaseAuthModule.GoogleAuthProvider;
  token: String;
  tokenIsUploaded = false;

  required: {
    [s: string]: any;
  } = {};

  async init() {
    await Promise.all([
      System.import("firebase"),
      System.import("isomorphic-fetch")
    ]);

    this.required.firebase = require("firebase/app");
    require("firebase/firestore");
    require("isomorphic-fetch");

    const config = await fetch("/__/firebase/init.json").then(response =>
      response.json()
    );

    this.required.firebase.initializeApp(config);
    this.firestore = this.required.firebase.firestore() as FirestoreModule.FirebaseFirestore;
    this.firestore.settings({ timestampsInSnapshots: true });
    this.auth = this.required.firebase.auth() as FirebaseAuthModule.FirebaseAuth;
    this.provider = new this.required.firebase.auth.GoogleAuthProvider();
    return this;
  }

  public static async GetInstance() {
    if (singleton) {
      return singleton;
    } else if (waitForSingleton) {
      return waitForSingleton;
    } else {
      return (waitForSingleton = new FirebaseSingleton()
        .init()
        .then(_singleton => {
          return (singleton = _singleton);
        }));
    }
  }
}
