<template>
  <nav class="navbar navbar-expand-lg navbar navbar-dark bg-dark">
    <a class="navbar-brand" href="#"><h2>Github Search Dashboard</h2></a>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarText"
      aria-controls="navbarText"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarText">
      <ul class="navbar-nav mr-auto">
        <!-- <li class="nav-item active">
            <a class="nav-link" href="#"
              >Home <span >(current)</span></a
            >
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Features</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Pricing</a>
          </li> -->
      </ul>
      <button
        class="btn btn-link float-sm-right mr-3"
        style="color: white; font-size: 12px;"
        type="button"
        v-on:click="toDashboard()"
      >
        Dashboard&nbsp;
        <span class="glyphicon glyphicon-dashboard float-sm-right"></span>
      </button>
      <button
        class="btn btn-link float-sm-right mr-3"
         style="color: white; font-size: 12px;"
        type="button"
        v-on:click="listbookmarks()"
      >
        My Bookmarks&nbsp;
        <span class="glyphicon glyphicon-star-empty float-sm-right"></span>
      </button>
      <button
        class="btn btn-link float-sm-right"
         style="color: white; font-size: 12px;"
        type="button"
        v-on:click="logout()"
      >
        Logout&nbsp; <span class="glyphicon glyphicon-log-out"></span>
      </button>

     
    </div>
  </nav>
</template>

<script setup lang="ts">

import router from "@/router";
function toDashboard() {
  router.replace({ path: "/dashboard" });
}
async function listbookmarks() {
  router.replace({ path: "/mybookmarks" });
}
async function logout() {
  try {
    const token = localStorage.getItem("token")?.toString();

    const response = await fetch(`http://localhost:3001/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token")}`,
      },
    });

    const responsejson = await response.json();
    console.log(responsejson);
    router.replace({ path: "/login" });
  } catch (error) {
    console.error("Error during login:", error);
  }
}
</script>

<style scoped>
.card {
  background-color: #fff;
  border-radius: 0.25rem;
}

.text-center {
  text-align: center;
}

.btn-link {
  color: #007bff;
  font-size: 0.875rem;
  padding: 0;
}

.error {
  color: #dc3545;
}

.alert-box {
  position: fixed;
  margin: 0 auto;
  align-items: center;
  align-self: center;
  top: 0;
  left: 43%;
}
</style>
