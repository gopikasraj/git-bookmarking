<template>
  <div class="container-fluid">
    <div class="row justify-content-center mt-5">
      <div class="col-md-4">
        <div class="card p-4 shadow-sm">
          <h1 class="text-center mb-4">Login</h1>
          <div class="form-group">
            <label for="email"><b>Email</b></label>
            <input
              v-model="loginEmail"
              type="text"
              class="form-control"
              placeholder="Enter Email"
              name="email"
              required
            />
            <span v-if="emailError" class="text-danger">{{ emailError }}</span>
          </div>
          <div class="form-group">
            <label for="psw"><b>Password</b></label>
            <input
              v-model="loginPassword"
              type="password"
              class="form-control"
              placeholder="Enter Password"
              name="psw"
              required
            />
            <span v-if="passwordError" class="text-danger">{{ passwordError }}</span>
          </div>
          <div class="form-group text-center mt-4">
            <button @click="validateAndLogin()" type="button" class="btn btn-primary">Login</button>
            <button @click="clear" type="button" class="btn btn-secondary ml-2">Clear</button>
          </div>
          <div class="text-center mt-3">
            Not registered? <button @click="register" type="button" class="btn btn-link">Create an account</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showSuccessPopup" class="position-fixed alert-box alert-box-success">
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        Login successful!
        <button type="button" class="close" @click="closePopup()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from "vue";
import { useRoute } from "vue-router";
import router from '@/router'
const loginEmail = ref("");
const loginPassword = ref("");
const emailError = ref("");
const passwordError = ref("");
const showSuccessPopup = ref(false);
const route = useRoute()
function closePopup() {
  showSuccessPopup.value = false;
}
async function register(){
  router.replace({path:'/register'})
}

async function validateAndLogin() {
  emailError.value = "";
  passwordError.value = "";

  if (!loginEmail.value) {
    emailError.value = "Email is required.";
  } else if (!validateEmail(loginEmail.value)) {
    emailError.value = "Please enter a valid email address.";
  }

  if (!loginPassword.value) {
    passwordError.value = "Password is required.";
  }

  if (!emailError.value && !passwordError.value) {
    await login();
  }
}

function validateEmail(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(email);
}
async function login() {
  // router.push({path:'/dashboard'})  
  try {
    const response = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value
      }),
    });
    const data = await response.json();

    if (data.token) {
      showSuccessPopup.value=true;
      setTimeout(() => {
        router.replace({path:'/dashboard'})
        localStorage.setItem("token",data.token)
      },500);
     
    } else {
      throw new Error(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}

function clear() {
  loginEmail.value = "";
  loginPassword.value = "";
  emailError.value = "";
  passwordError.value = "";
}
</script>

<style scoped>
.alert-box-success {
  position: absolute;
}

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

.close {
  background: none;
  border: none;
  font-size: 1.25rem;
}
.alert-box{
    position: fixed;
    margin: 0 auto;
    align-items: center;
    align-self: center;
    top: 0;
    left: 43%;
}
</style>