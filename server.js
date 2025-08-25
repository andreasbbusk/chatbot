import express from "express"; // Import express framework

const app = express();

const PORT = 3000;

app.set("view engine", "ejs"); // Set EJS as the templating engine
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

const names = [];

// GET - render the index page
app.get("/", (req, res) => {
  res.render("index", { names: names, error: "", name: "", age: "" });
});

app.post("/submit", (req, res) => {
  const name = req.body.name;
  const age = req.body.age;
  let error = "";
  if (!name || name.trim() === "") {
    error = "Du skal indtaste et navn!";
  } else {
    names.push(name);
  }
  res.render("index", { name, age, error, names });
});

app.post("/", (req, res) => {
  names.length = 0;
  res.render("index", { names: names, error: "", name: "", age: "" });
});

// Listen on port 3000
app.listen(PORT, () => console.log("Server running at" + PORT));
