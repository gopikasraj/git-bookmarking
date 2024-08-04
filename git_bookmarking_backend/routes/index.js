const express = require("express");
const mysql = require("mysql2/promise");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const axios = require("axios");
const authMiddleware = require("../middleware/app.js");
let db;

mysql
  .createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "git_bookmarking",
  })
  .then((res) => {
    db = res;
  });

const encrypt = async (password) => {
  console.log(password);
  return await bcrypt.hash(password, saltRounds).catch((err) => {
    console.log(err);
    return "Error";
  });
};

/* register */
router.post("/register", async (req, res, next) => {
  const requestBody = req.body;
  console.log(requestBody);
  const name = requestBody.name;
  const email = requestBody.email;
  const password = requestBody.password;

  if (!name || !email || !password) {
    return res
      .status(400)
      .send({ Message: "Provide name, email and password" });
  }

  const sql = "select * from users where email = '" + email + "'";
  try {
    const response = await db.query(sql);
    if (response[0].length > 0) {
      return res.status(400).send({ Message: "User Already exist" });
    }

    const hash = await encrypt(password);

    // Store hash in your password DB.
    if (hash == "Error") {
      return res.status(500).send({ Message: "Error generating hash" });
    }
    const insertsql = "insert into users (name,email,password) values (?,?,?)";
    const user = await db.query(insertsql, [name, email, hash]).catch((e) => {
      return res.status(500).send({ Message: "User registration failed" });
    });
    if (user[0].insertId > 0) {
      return res.status(200).send({ Message: "User registration completed" });
    } else {
      return res.status(500).send({ Message: "User registration failed" });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).send({ Message: "User registration failed" });
  }
});

/* login */
router.post("/login", async (req, res, next) => {
  const requestBody = req.body;
  const email = requestBody.email;
  const password = requestBody.password;

  if (!email || !password) {
    return res.status(400).send({ Message: "Provide email and password" });
  }
  try {
    const rows = await db.query("select * from users where email =?", [email]);
    const user = rows?.[0]?.[0];
    if (!user?.id) {
      return res.status(400).send({ Message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ Message: "Invalid Password" });
    }

    const token = jwt.sign({ email: email, userId: user?.id }, "secret", {
      expiresIn: "1h",
    });
    const active_ind = 1;
    await db.query(
      "insert into tokens (user_id, token, active_ind) values (?,?,?)",
      [user.id, token, active_ind]
    );
    return res.status(200).send({ Message: "Successfully Logged in", token });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ Message: "Error Logging in" });
  }
});

/* logout */
router.post("/logout", async (req, res, next) => {
  const requestBody = req.body;
  const token = requestBody.token;
  // const active_ind = 0
  try {
    const updateQuery =
      "UPDATE tokens SET active_ind = 0 WHERE token ='" + token + "'";
    await db.query(updateQuery);
    return res.status(200).send({ Message: "Successfully Logged out" });
  } catch (updateErr) {
    console.log(err);
    return res.status(500).send({ Message: "Error Logging out" });
  }
});

/* search GitHub users */
router.get("/searchUsers", authMiddleware, async (req, res) => {
  const query = req.query;
  if (!query.keyword && !query.email && !query.location) {
    return res
      .status(400)
      .send({
        error: "Query parameters required - Provide keyword/email/location",
      });
  }
  let APICall = "https://api.github.com/search/users?q=";

  let filter = "";
  console.log(query.keyword);
  if (query.keyword || query.location) {
    filter += query.keyword ? query.keyword + " " : "";
    filter += query.location ? "location:" + query.location : "";
  } else {
    filter = query.email ? query.email + "+in:email" : "";
  }
  APICall += filter;

  try {
    console.log(APICall);
    const response = await axios.get(APICall);

    res.send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send({ error: error.message });
  }
});

/* Search GitHub repositories */
router.get("/searchRepositories", authMiddleware, async (req, res) => {
  const query = req.query;
  if (!query.user && !query.topic) {
    return res.status(400).send({ error: "Query parameters required" });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/search/repositories?q=${query}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send({ error: error.message });
  }
});

/* serach for repositories of a user */
router.get("/users/:username/repos", authMiddleware, async (req, res) => {
  const username = req.params.username;
  if (!username) {
    return res.status(400).send({ error: "Username parameter is required" });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send({ error: error.message });
  }
});

/* Bookmark a GitHub repository */
/* input 
{
  "repository": {
    "full_name": "username/reponame",
    "name": "repo",
    "description": "Repository description",
    "url": "https://github.com/username/reponame"
  },
  "user_id": 1
}
*/
router.post("/bookmark", authMiddleware, async (req, res) => {
  const { repository, user_id } = req.body;
  const { full_name, name, description, url } = repository;

  if (!repository || !repository.full_name || !user_id) {
    return res
      .status(400)
      .send({
        error: "Repository object with full_name and user_id are required",
      });
  }

  // Insert or update bookmark information
  const query = `
      INSERT INTO bookmarks (full_name, name, description, url, user_id) 
      VALUES (?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
          name = VALUES(name), 
          description = VALUES(description), 
          url = VALUES(url), 
          user_id = VALUES(user_id)
  `;
  const values = [full_name, name, description, url, user_id];

  let results = await db.query(query, values).catch((e)=>{
    return res.status(500).send({ error: "Internal server error" });
  });
  if (results) {
    return res
      .status(201)
      .send({ message: "Repository bookmarked successfully", repository });
  } else {
    console.error("Error inserting repository:", err);
    return res.status(500).send({ error: "Internal server error" });
  }
});

/* Get all bookmarks for a user */
router.get("/bookmarks/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;

  const results = await db.query("SELECT * FROM bookmarks WHERE user_id = ?",[user_id]).catch((e)=>{
    return res.status(500).send({ error: "Internal server error" });
  });

  if (results) {
    return res.status(201).send({Message:"Bookmarks retrieved successfully", data:results[0]});
  } else {
    console.error("Error fetching bookmarks:", err);
    return res.status(500).send({ error: "Internal server error" });
  }
  
});

/* Delete a bookmark */
router.delete("/bookmark/:user_id", authMiddleware, async(req, res) => {
  const { user_id } = req.params;
  const full_name = req.query.full_name;

  const results = await db.query("DELETE FROM bookmarks WHERE full_name = ? AND user_id = ?",    [full_name, user_id]).catch((e)=>{
    console.error("Error deleting bookmark:", err);
    return res.status(500).send({ error: "Internal server error" });
  });
  
  if (results[0].affectedRows === 0) {
    return res.status(404).send({ error: "Bookmark not found" });
  }
  res.status(200).send({ message: "Bookmark removed successfully" });

});

const upload = multer({ dest: "csvfiles/" });

// Function to validate repository using GitHub API
async function validateRepository(repo_full_name) {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${repo_full_name}`
    );
    return response.status === 200;
  } catch (error) {
    return false; // Repository does not exist or request failed
  }
}

/* Import CSV */
router.post(  "/fileImport",  authMiddleware,  upload.single("file"),  async (req, res) => {
    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    const user_id = req.user.userId
    const filePath = req.file.path;
    const results = [];
    const errors = [];
    const validationErrors = [];

    let rstream = fs.createReadStream(filePath).pipe(csvParser());

      rstream.on("data", async (data) => {
        const {  full_name , description,  url } = data;
      // const user_id = req.user.id;

        // Validate repository data
        if (!full_name || !user_id) {
          errors.push(`Invalid data: ${JSON.stringify(data)}`);
          return;
        }
        results.push([full_name, description, description, url, user_id]);

        // Validate repository existence on GitHub
        

      })
      rstream.on("end", async () => {
        for (const result of results) {
          const isValid = await validateRepository(result[0]);
          if (!isValid) {
            validationErrors.push(`Repository not found: ${result[0]}`);
          }
        }
        if (errors.length > 0) {
          return res.status(400).send({ errors });
        }
        if (validationErrors.length > 0) {
          return res.status(400).send({ validationErrors });
        }

        const query = `INSERT INTO bookmarks (full_name, name, description, url, user_id) 
            VALUES ? 
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name), 
                description = VALUES(description), 
                url = VALUES(url), 
                user_id = VALUES(user_id)
        `;

        let responseObj=await db.query(query, [results]).catch((err)=>{
          if (err) {
            console.error("Error inserting repositories:", err);
            return res.status(500).send({ error: "Internal server error" });
          }
        });
        if (responseObj) {
          res
          .status(201)
          .send({
            message: "Repositories imported successfully",
            results: responseObj[0].affectedRows,
          });
        }

        

        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      })
      rstream.on("error", (err) => {
        console.error("Error reading CSV file:", err);
        res.status(500).send({ error: "Internal server error" });
      });
  }
);

module.exports = router;
