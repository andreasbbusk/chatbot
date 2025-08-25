import express from "express"; // Import express framework

const app = express();

const PORT = 3000;

app.set("view engine", "ejs"); // Set EJS as the templating engine
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use("/public", express.static("public"));

const names = [];

// GET - render the index page
app.get("/", (req, res) => {
  res.render("index", { names: names, error: "", name: "", age: "" });
});

// POST-request - add a name to the names array and render the index page
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

// POST-request - clear the names array competely and reset root page
app.post("/", (req, res) => {
  names.length = 0;
  res.render("index", { names: names, error: "", name: "", age: "" });
});

// Listen on port 3000
app.listen(PORT, () => console.log("Server running at" + PORT));
