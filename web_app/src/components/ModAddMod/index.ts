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

// VueJS modules
import Vue from "vue";
import { Component, Inject, Model, Prop, Watch } from "vue-property-decorator";
import Toolbar from "../Toolbar";
import FirebaseSingleton from "../../services/FirebaseSingleton";

@Component({
  components: {
    Toolbar, 
  }
})
export default class ModAddMod extends Vue {
  base_url = "http://localhost:3000/";
  fst: FirebaseSingleton;
  userId: string;
  hide = true;
  user_email = "";
  async mounted() {
    await System.import("isomorphic-fetch");
    require("isomorphic-fetch");
    this.fst = await FirebaseSingleton.GetInstance();
    this.userId = this.fst.auth.currentUser.uid;
  }

  // verify that there is valid data in all fields
  verifyEmail() {
    // remove whitespace around items
    this.user_email = this.user_email.trim();
    // check if fields are blank
    if (this.user_email === "") {
      alert("fields cannot be left blank")
      return false;
    }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isEmail = re.test(String(this.user_email).toLowerCase());
    // check if image url is valid
    if (!isEmail) {
      alert("not a valid email");
      return false;
    }
    return true;
  }

  async onAddModerator() {
    const token = await this.fst.auth.currentUser.getIdToken()
    const user = {
      email: this.user_email
    }
    if (this.verifyEmail()) {
      await this.postData(`${this.base_url}admin_users`, user, token)
      alert(`Successfully Added new Moderator ${this.user_email}`);
      this.user_email = "";
    }
  }

  async postData(url: string, data: {}, token: string) {
    return fetch(url, {
      body: JSON.stringify(data),
      credentials: "same-origin",
      headers: {
        "X-Firebase-ID-Token": token,
        "content-type": "application/json"
      },
      method: "POST",
      mode: "cors",
      redirect: "follow",
      referrer: "no-referrer",
    })
    .then(response => response.json());
  }
}

require("./template.html")(ModAddMod);
