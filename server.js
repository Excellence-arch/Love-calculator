const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const port = 5000;
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
let newScore = "dshdjkhds";
const URI = `mongodb+srv://Excellence:oladipupomichael9@cluster0.mzchd.mongodb.net/love_calculator?retryWrites=true&w=majority`;
mongoose.connect(URI, (err) => {
  if (err) {
    console.log("Connection failed. Please try again");
  } else {
    console.log("Connection established successfully");
  }
});

let onlineUser;
let error;

const historySchema = mongoose.Schema({
  id: String,
  firstname: String,
  secondname: String,
  score: Number,
});

const userSchema = mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  online: Boolean,
});

const UserModel = mongoose.model("users_tbs", userSchema);
const HistoryModel = mongoose.model("history_tbs", historySchema);

// const calculateScore = () => {
  
//   // console.log(newScore);
// };

app.get("/", (req, res) => {
  if (onlineUser) {
    res.render("index");
  } else {
    res.redirect("/login");
  }
});

app.post("/calculate", (req, res) => {
  newScore = Math.floor(Math.random() * 100);
  let history = req.body;
  history.id = onlineUser._id;
  const form = new HistoryModel(history);
  form.save((err) => {
    if (err) {
      error =
        "Cannot calculate the sore for you at the moment. Please try again later";
      res.render("wrongDetails", { error });
    } else {
      res.redirect("/");
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  UserModel.find(
    { email: req.body.email, password: req.body.password },
    (err, result) => {
      if (err) {
        error = "Error making this request";
        res.render("wrongDetails", { error });
      } else {
        if (result.length == 0) {
          // console.log(result);
          error = "Incorrect Email or password";
          res.render("wrongDetails", { error });
        } else {
          const foundUser = result[0];
          foundUser.online = true;
          UserModel.findByIdAndUpdate(
            foundUser.id,
            foundUser,
            (newErr, newRes) => {
              if (newErr) {
                error = "Error making logging in. Please try again later";
                res.render("wrongDetails", { error });
              } else {
                onlineUser = newRes;
                res.redirect("/");
              }
            }
          );
        }
      }
    }
  );
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const userDetails = req.body;
  userDetails.online = false;
  UserModel.find({ email: userDetails.email }, (err, result) => {
    if (err) {
      error = "Error making this request";
      res.render("wrongDetails", { error });
    } else {
      if (result.length > 0) {
        // error = "Email already exist";
        res.render("wrongDetails", { error });
      } else {
        const form = new UserModel(userDetails);
        form.save((err) => {
          if (err) {
            error = "Error submitting this form. Please try again later";
            res.render("wrongDetails", { error });
          } else {
            res.redirect("/login");
          }
        });
      }
    }
  });
});

// app.get("/error", (req, res) => {
//   res.render("wrongDetails", { error })
// })

app.post("/logout", (req, res) => {
  const logUser = onlineUser;
  logUser.online = false;
  UserModel.findByIdAndUpdate(logUser.id, logUser, (err, result) => {
    if (err) {
      console.log(err);
      error = "Could not log you out at this time. Please try again later";
      res.render("wrongDetails", { error });
    } else {
      console.log(logUser);
      console.log(result);
      res.redirect("/login");
    }
  });
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
