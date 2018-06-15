// VueJS modules
import Vue from "vue";
import { Component, Inject, Model, Prop, Watch } from "vue-property-decorator";
import Toolbar from "../Toolbar";
import FirebaseSingleton from "../../services/FirebaseSingleton";

type Movie = {
  title: string;
  averageRating: number;
  overview: string;
  poster: string;
  genres: {string: boolean};
  ratigsCount: number;
  //genreList: string;
  //key: string;
};

@Component({
  components: {
    Toolbar, 
  }
})
export default class AdminAddAdmin extends Vue {
  fst: FirebaseSingleton;
  userId: string;
  hide = true;

  base_url = "https://fireflicks-io.appspot.com/"
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


  async onAddAdminUser() {
    const token = await this.fst.auth.currentUser.getIdToken()
    const user = {
      email: this.user_email
    }
    if (this.verifyEmail()) {
      const result = await this.postData(`${this.base_url}admin_users`, user, token)
      alert(`Successfully Added new Admin ${this.user_email}`);
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

require("./template.html")(AdminAddAdmin);
