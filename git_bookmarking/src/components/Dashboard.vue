<template>
  <NavigationView />
  <div class="container-fluid">
    <h1>My Bookmarks</h1>
    <div class="row">
      <div class="col-sm-6">
        <div class="search-container-fluid mt-5">
          <div class="btn-group btn-group-toggle">
            <label
              class="btn btn-primary"
              :class="[filter.searchType == 'usersearch' ? 'active' : '']"
            >
              <input
                v-model="filter.searchType"
                value="usersearch"
                v-on:change="userResults=[];repoResults=[];"
                type="radio"
                name="options"
                id="userSearch"
                autocomplete="off"
              />
              User Search
            </label>
            <!-- <label
              class="btn btn-primary"
              :class="[filter.searchType == 'reposearch' ? 'active' : '']"
            >
              <input
                v-model="filter.searchType"
                value="reposearch"
                v-on:change="userResults=[];repoResults=[];"
                type="radio"
                name="options"
                id="repoSearch"
                autocomplete="off"
              />
              Repository Search
            </label> -->
          </div>
         <div class="mt-5">
            <div v-if="filter.searchType === 'usersearch'" class="row">
            <div class="col-sm-4">
              <label>Keyword</label>
              <input
                v-model="filter.userFilter.keyword"
                type="text"
                class="form-control"
                id="keyword"
                placeholder="Keyword"
              />
            </div>
            <div class="col-sm-4">
              <label>Email</label>
              <input
                v-model="filter.userFilter.email"
                type="email"
                class="form-control"
                id="email"
                placeholder="Email"
              />
            </div>
            <div class="col-sm-4">
              <label>Location</label>
              <input
                v-model="filter.userFilter.location"
                type="text"
                class="form-control"
                id="location"
                placeholder="Location"
              />
            </div>
          </div>
          <!-- <div class="row" v-if="filter.searchType === 'reposearch'">
            <div class="col-sm-3">
              <label for="user">User</label>
              <input
                v-model="filter.repoFilter.user"
                type="text"
                class="form-control"
                id="user"
                placeholder="User"
              />
            </div>
            <div class="col-sm-3">
              <label for="topic" >Topic</label>
              <input
                v-model="filter.repoFilter.topic"
                type="text"
                class="form-control"
                id="topic"
                placeholder="Topic"
              />
            </div>
           
            <div class="col-sm-3">
              <label for="language" >Language</label>
              <input
                v-model="filter.repoFilter.language"
                type="text"
                class="form-control"
                id="language"
                placeholder="Language"
              />
            </div>
            
          </div> -->
         </div>
          <button
            v-on:click="search()"
            type="button"
            class="btn btn-primary mb-2 mt-5"
          >
            Search
          </button>
        </div>
      </div>
      <div class="col-md-6">
        <div class="results mt-5" id="results">
          <div v-if="userResults?.length > 0 || repoResults?.length > 0">
            <h2>Results</h2>
            <div v-if="filter.searchType === 'usersearch'">
              <ul class="list-group" id="myGroup">
                <!-- {{ userResults }} -->
                <li
                  class="list-group-item"
                  v-for="(repo, index) in userResults.values()"
                  :key="repo"
                >
                  <img
                    alt="Avatar"
                    class="avatar"
                    :src="repo?.avatar_url"
                    width="20"
                  />
                  <a :href="repo?.repos_url" target="_blank"
                    ><span
                      style="
                        font-size: 15px;
                        text-transform: capitalize;
                        padding-left: 10px;
                      "
                    >
                      {{ repo?.login }}
                    </span></a
                  >
                  <button
                    class="btn btn-link float-sm-right"
                    type="button"
                    data-toggle="collapse"
                    :data-target="'#collapseExample' + index"
                    aria-expanded="false"
                    :aria-controls="'collapseExample' + index"
                    v-on:click="searchRepos(repo?.repos_url)"
                  >
                    <span class="float-sm-right">
                      <span class="glyphicon glyphicon-eye-open"></span> Show
                      Repository
                    </span>
                  </button>
                  <div data-bs-parent="#myGroup" class="collapse" :id="'collapseExample' + index">
                    <div class="card card-body mt-5">
                      <ul class="list-group">
                        <!-- {{ userResults }} -->
                        <li
                          v-if="reposList.length"
                          class="list-group-item"
                          v-for="repoItem in reposList.values() || []"
                          :key="repoItem"
                        >
                          <div v-if="repoItem">
                            <span style="font-size: 13px;color: blueviolet;">
                              {{ repoItem?.full_name }}</span
                            >
                            <span
                              class="glyphicon glyphicon-star-empty float-sm-right"
                              @click="
                                bookmark({
                                  full_name: repoItem?.full_name,
                                  name: repoItem?.name,
                                  description: repoItem?.name,
                                  url: repoItem?.html_url,
                                })
                              "
                            ></span>

                            <a
                              class="glyphicon glyphicon-eye-open float-sm-right mr-3"
                              target="_blank"
                              href="{{repoItem?.html_url}}"
                            ></a>
                            <br />
                            <span style="color: #757575;">{{ repoItem?.description }}</span>
                            <!-- <span>{{ repoItem?.created_at }}</span> -->
                            
                          </div>
                          <div v-else>No repositories found</div>
                        </li>
                        <li v-else style="text-decoration: none;display: block;text-align: center;">No repositories found</li>
                      </ul>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div v-if="filter.searchType === 'reposearch'">
             
            </div>
          </div>
          <div v-else class="text-center">
            <p style="margin-top: 100px;color: blue;">
                <img src="../assets/no-results.png" alt="">
                <!-- <span>No results found.</span> -->
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showSuccessPopup" class="position-fixed alert-box" id="show-alert">
    <div class="alert alert-success alert-dismissible fade show row">
      Bookmarked repository
      <span
        class="pl-2 glyphicon glyphicon-remove"
        @click="closePopup()"
      ></span>
    </div>
  </div>
</template>
<script setup lang="ts">
import NavigationView from "./Navigation.vue";
import { ref } from "vue";
import router from "@/router";

let filter = ref({
  searchType: "usersearch",
  userFilter: {
    email: "",
    keyword: "",
    location: "",
  },
  repoFilter: {
    user: "",
    topic: "",
    license: "",
    language: "",
  },
});
let showSuccessPopup = ref(false);
let repoResults = ref([]);
let userResults = ref([]);
let reposList = ref([]);
function closePopup() {
  showSuccessPopup.value = false;
}
async function search() {
  const url = "http://localhost:3001/searchUsers";
  let userFilterCriteria = {
    ...(filter.value.userFilter.email
      ? { email: filter.value.userFilter.email }
      : {}),
    ...(filter.value.userFilter.keyword
      ? { keyword: filter.value.userFilter.keyword }
      : {}),
    ...(filter.value.userFilter.location
      ? { location: filter.value.userFilter.location }
      : {}),
  };
  let repoFilterCriteria = {
    ...(filter.value.repoFilter.user
      ? { user: filter.value.repoFilter.user }
      : {}),
    ...(filter.value.repoFilter.topic
      ? { topic: filter.value.repoFilter.topic }
      : {}),
    ...(filter.value.repoFilter.license
      ? { license: filter.value.repoFilter.license }
      : {}),
    ...(filter.value.repoFilter.language
      ? { language: filter.value.repoFilter.language }
      : {}),
  };

  let criteria =
    filter.value.searchType == "usersearch"
      ? new URLSearchParams(userFilterCriteria)
      : new URLSearchParams(repoFilterCriteria);
  try {
    const response = await fetch(`${url}?${criteria}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token")}`,
      },
    });
    const responsejson = await response.json();
    console.log(responsejson);
    if (responsejson?.total_count) {
      userResults.value = responsejson.items;
    } else {
      userResults.value = [];
      throw new Error(responsejson.message || "Login failed");
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}
async function searchRepos(url: string) {
  try {
    const reposContainerList=document.getElementsByClassName('collapse show');
    reposContainerList?.[0]?.classList?.remove('show')
    
    const response = await fetch(`${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token")}`,
      },
    });
    const responsejson = await response.json();
    reposList.value = responsejson || [];
  } catch (error) {
    console.error("Error during login:", error);
  }
}
function decode(token: string) {
  try {
    return JSON.parse(window.atob(token.split(".")[1]));
  } catch (e) {
    console.warn("Error decoding token");
  }
}

async function bookmark(req: any) {
  try {
    const token = localStorage.getItem("token")?.toString();

    const user = decode(token || "");

    const response = await fetch(`http://localhost:3001/bookmark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ repository: req, user_id: user.userId }),
    });

    const responsejson = await response.json();
    showSuccessPopup.value = true;
  } catch (error) {
    console.error("Error during login:", error);
  }
}


</script>
<style>
.avatar {
  vertical-align: middle;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
.alert-box {
  position: fixed;
  margin: 0 auto;
  align-items: center;
  align-self: center;
  top: 0;
  left: 40%;
}
</style>
