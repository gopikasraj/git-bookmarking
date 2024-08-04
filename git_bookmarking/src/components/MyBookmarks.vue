<template>
  <NavigationView />
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <div>
          <h1>My Bookmarks</h1>
          <!-- <button
      @click="toDashboard"
      class="btn btn-link float-sm-right"
      type="button"
    >
      Go To Dashboard&nbsp;
      <span class="glyphicon glyphicon-circle-arrow-left"></span>
    </button> -->
          <div class="row">
            <div class="col-md-6">
              <div class="upload-section">
                <h3>Import Bookmarks</h3>
                <div class="mt-3">
                    <input
                  type="file"
                  @change="handleFileUpload"
                  accept=".csv"
                  class="form-control"
                />
                <button
                  @click="importBookmarks"
                  class="btn btn-primary mt-5"
                  :disabled="importing"
                >
                  Import Bookmarks
                </button>
                </div>
                <div class="alert alert-info mt-5" role="alert">
                  Provide CSV file in the format - full_name, description, url
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Full Name</th>
                    <th>URL</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(bookmark, index) in bookmarks" :key="bookmark.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ bookmark.name }}</td>
                    <td>{{ bookmark.full_name }}</td>
                    <td>
                      <a :href="bookmark.url" target="_blank">{{
                        bookmark.url
                      }}</a>
                    </td>
                    <td>
                      <span
                        @click="deleteBookmark(bookmark?.full_name)"
                        class="glyphicon glyphicon-trash"
                        style="cursor: pointer"
                      ></span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
         
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavigationView from "./Navigation.vue";
import { ref, onMounted } from "vue";
const bookmarks = ref([]);
import { useRouter } from "vue-router";
const router = useRouter();
const selectedFile = ref(null);
const importing = ref(false);


function getUserIdFromToken() {
  const token = localStorage.getItem("token")?.toString();
  if (!token) return null;

  //   const decoded = jwtDecode(token);
  //   return decoded.user_id;
  try {
    return JSON.parse(window.atob(token.split(".")[1])).userId;
  } catch (e) {
    console.warn("Error decoding token");
    return null;
  }
}

function toDashboard() {
  router.replace({ path: "/dashboard" });
}

async function fetchBookmarks() {
  const userId = getUserIdFromToken();
  if (userId) {
    try {
      const response = await fetch(
        `http://localhost:3001/bookmarks/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      const responseJSON = await response.json();
      bookmarks.value = responseJSON.data;
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
    }
  }
}

async function deleteBookmark(full_name) {
  const userId = getUserIdFromToken();
  if (userId) {
    try {
      const response = await fetch(
        `http://localhost:3001/bookmark/${userId}?full_name=${full_name}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        await fetchBookmarks();
        // bookmarks.value = bookmarks.value.filter((b) => b.id !== bookmark.id);
        alert("Bookmark deleted");
      } else {
        console.error("Failed to delete bookmark:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
    }
  }

}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && file.type === "text/csv") {
    selectedFile.value = file;
  } else {
    alert("Please upload a valid CSV file.");
    selectedFile.value = null;
  }
}


async function importBookmarks() {
  if (!selectedFile.value) return;

  importing.value = true;
  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    const userId = getUserIdFromToken();
    if (userId) {
      const response = await fetch(
        `http://localhost:3001/fileImport`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        await fetchBookmarks();
        alert("Bookmarks imported successfully");
        selectedFile.value = null;
      } else {
        const responseJSON = await response.json();
        console.error("Failed to import bookmarks:", responseJSON);
        alert(`Failed to import bookmarks: ${responseJSON.errors || responseJSON.validationErrors}`);
      }
    }
  } catch (error) {
    console.error("Failed to import bookmarks:", error);
  } finally {
    importing.value = false;
  }
}

onMounted(async () => {
  await fetchBookmarks();
});
</script>
<style>
.upload-section {
  border: 1px solid #d3d3d3;
  padding: 25px;
}
</style>
