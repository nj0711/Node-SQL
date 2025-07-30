const express = require("express");
const app = express();
const path = require("path");
const { v4: uuid } = require("uuid");
const methodOverride = require("method-override");
const mysql = require("mysql2/promise");
const { faker } = require("@faker-js/faker");

app.use(methodOverride("_method"));

// for ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// get data from form to encode in js
app.use(express.urlencoded({ extended: true }));

// create mysql connection pool (better than single connection)
const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  database: "nodesql",
  user: "root",
  password: "root",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// get all data and print
app.get("/", async (req, res) => {
  console.log("running at home");
  try {
    const [data] = await pool.query("SELECT * FROM user");
    res.render("users.ejs", { data });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
});

// insert data
app.get("/user/new", async (req, res) => {
  res.render("new-user"); // renders views/new-user.ejs
});

app.post("/user", async (req, res) => {
  try {
    const id = uuid();
    const { username, email, password, dob } = req.body;
    const query =
      "INSERT INTO user (id, username, email, password, dob) VALUES (?, ?, ?, ?, ?)";
    await pool.query(query, [id, username, email, password, dob]);
    res.redirect("/");
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).send("Failed to insert user");
  }
});

// edit data - show form
app.get("/user/:id/edit", async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await pool.query("SELECT * FROM user WHERE id = ?", [id]);
    if (results.length === 0) {
      return res.status(404).send("User not found.");
    }
    const user = results[0];
    res.render("edit-user", { user });
  } catch (error) {
    console.error("Error fetching user for edit:", error);
    res.status(500).send("Internal Server Error");
  }
});

// edit data - update record
app.patch("/user/:id/edit", async (req, res) => {
  const userId = req.params.id;
  const { username, email, password, dob } = req.body;
  try {
    const query =
      "UPDATE user SET username = ?, email = ?, password = ?, dob = ? WHERE id = ?";
    await pool.query(query, [username, email, password, dob, userId]);
    res.redirect("/");
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).send("Failed to update user.");
  }
});

// delete data
app.delete("/user/:id/delete", async (req, res) => {
  const { id } = req.params;
  try {
    const query = "DELETE FROM user WHERE id = ?";
    await pool.query(query, [id]);
    res.redirect("/");
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).send("Failed to delete user.");
  }
});

// server listen
app.listen(3000, () => {
  console.log("server running...");
});

//fake data generator
// // genertae 10 fake data
// let createRandomUser = () => {
//   return [
//     faker.string.uuid(),
//     faker.internet.username(),
//     faker.internet.email(),
//     faker.internet.password(),
//     faker.date.birthdate(),
//   ];
// };
// let usersList = [];
// for (let i = 0; i < 10; i++) {
//   usersList.push(createRandomUser());
// }
// try {
//   connection.query("insert into user values ?", [usersList], (err, result) => {
//     if (err) throw err;
//     console.log("record inserted");
//   });
// } catch (err) {
//   console.log(err);
// }
