const express = require("express");
const app = express();
const path = require("path");
const { v4: uuid } = require("uuid");
const methodOverride = require("method-override");
const mysql = require("mysql2");
const { faker } = require("@faker-js/faker");

app.use(methodOverride("_method"));

//for ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

//get data from form to encode in js
app.use(express.urlencoded({ extended: true }));

//mysql
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  database: "nodesql",
  user: "root",
  password: "root",
});

//get all data and print
app.get("/", async (req, res) => {
  console.log("runing at home");

  try {
    connection.query("select * from user", (err, data) => {
      // console.log(data);
      res.render("users.ejs", { data });
    });
  } catch (error) {
    console.log("error");
  }
});


//insert data
app.get("/user/new", async (req, res) => {
  res.render("new-user"); // renders views/new-user.ejs
});

app.post("/user", (req, res) => {
  try {
    const id = uuid();
    let { username, email, password, dob } = req.body;
    user = [id, username, email, password, dob];
    console.log(id, username, email, password, dob);

    let qs = "insert into user values (?,?,?,?,?)";

    connection.query(qs, user, (err, data) => {
      if (err) throw err;
      res.redirect("/");
    });
  } catch (error) {
    console.log(error);
  }
});

//edit data
app.get("/user/:id/edit", (req, res) => {
  const { id } = req.params;
  // console.log(id);

  const query = "SELECT * FROM user WHERE id = ?";

  connection.query(query, id, (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send("User not found.");
    }
    const user = results[0];
    res.render("edit-user", { user });
  });
});

app.patch("/user/:id/edit", (req, res) => {
  const userId = req.params.id;
  const { username, email, password, dob } = req.body;
  const query =
    "UPDATE user SET username = ?, email = ?, password = ?, dob = ? WHERE id = ?";

  connection.query(
    query,
    [username, email, password, dob, userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Failed to update user.");
      }
      res.redirect("/");
    }
  );
});

//delete data
app.delete("/user/:id/delete", (req, res) => {
  const { id } = req.params;
  // console.log(id);
  let qs = `delete from user where id='${id}'`;
  connection.query(qs, (err, data) => {
    if (err) throw err;
    res.redirect("/");
  });
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

app.listen(3000, () => {
  console.log("server running...");
});
