<template>
  <div class="d-flex justify-content-center align-items-center vh-100 mt-5">
    <div class="card shadow-sm" style="width: 100%; max-width: 500px">
      <div class="card-body">
        <h1 class="card-title mb-4 text-center">Sign Up</h1>

        <form @submit.prevent="validateAndSubmit">
          <div class="mb-3">
            <label for="name" class="form-label"><b>Name</b></label>
            <input
              v-model="name"
              type="text"
              class="form-control"
              id="name"
              placeholder="Enter Name"
              name="name"
              required
            />
            <div v-if="nameError" class="text-danger mt-1">{{ nameError }}</div>
          </div>

          <div class="mb-3">
            <label for="email" class="form-label"><b>Email</b></label>
            <input
              v-model="email"
              type="email"
              class="form-control"
              id="email"
              placeholder="Enter Email"
              name="email"
              required
            />
            <div v-if="emailError" class="text-danger mt-1">
              {{ emailError }}
            </div>
          </div>

          <div class="mb-3">
            <label for="password" class="form-label"><b>Password</b></label>
            <input
              v-model="password"
              type="password"
              class="form-control"
              id="password"
              placeholder="Enter Password"
              name="password"
              required
            />
            <div v-if="passwordError" class="text-danger mt-1">
              {{ passwordError }}
            </div>
          </div>

          <div class="mt-4 text-center">
            <button
              @click="validateAndSubmit"
              type="submit"
              class="btn btn-primary mr-2"
            >
              Submit
            </button>
            <button @click="clear" type="button" class="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
        <div class="text-center mt-3">
          Already have account?
          <button @click="loginpage" type="button" class="btn btn-link">
            Login
          </button>
        </div>
        <div
          v-if="showSuccessPopup"
          class="position-fixed alert-box alert-box-success"
        >
          <div
            class="alert alert-success alert-dismissible fade show"
            role="alert"
          >
            Registration successful!
            <button type="button" class="close" @click="closePopup()">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");
const nameError = ref("");
const emailError = ref("");
const passwordError = ref("");
let showSuccessPopup = ref(false);
const router = useRouter();

async function loginpage() {
  router.replace({ path: "/login" });
}

async function validateAndSubmit() {
  nameError.value = "";
  emailError.value = "";
  passwordError.value = "";

  if (!name.value) {
    nameError.value = "Name is required.";
  }

  if (!email.value) {
    emailError.value = "Email is required.";
  } else if (!validateEmail(email.value)) {
    emailError.value = "Please enter a valid email address.";
  }

  if (!password.value) {
    passwordError.value = "Password is required.";
  }

  if (!nameError.value && !emailError.value && !passwordError.value) {
    // Proceed with form submission or API call
    await register();
    console.log("Form submitted", {
      name: name.value,
      email: email.value,
      password: password.value,
    });
    clear();
  }
}

function validateEmail(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(email);
}

function clear() {
  name.value = "";
  email.value = "";
  password.value = "";
  nameError.value = "";
  emailError.value = "";
  passwordError.value = "";
}

async function register() {
  try {
    const response = await fetch("http://localhost:3001/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
      }),
    });
    const data = await response.json();
    console.log(data);
    showSuccessPopup.value = true;
    if (response.status == 200) {
      localStorage.setItem("token", data.token);
    } else {
      throw new Error(data.message || "User Registration failed");
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}

function closePopup() {
  showSuccessPopup.value = false;
  router.replace({ path: "/login" });
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
