require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require('express-session');
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const nodemailer = require("nodemailer");
// const MongoClient = require('mongodb').MongoClient;

// const sendMail = require("./controllers/sendMail");

// const transporter = nodemailer.createTransport(transport[, defaults]);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://pratikkpandey:Pratik@@cluster0.nywmnlk.mongodb.net/")
// mongodb://127.0.0.1:27017/trickShotDB

const Registeration = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  city: String,
  googleId: String
});

const Contacts = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  mobile_no: String,
  message: String
});


const bookingSchema = new mongoose.Schema({
  turfName: String,
  location: String,
  check_in_date: String,
  timeSlot: String,
  members: String
});

Registeration.plugin(passportLocalMongoose); //hashing and salting of password
Registeration.plugin(findOrCreate);

const Registers = mongoose.model("Register", Registeration);
const Booking = mongoose.model("Booking", bookingSchema);
const Contact = mongoose.model("Contact", Contacts);


passport.use(Registers.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});


passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


passport.use(new GoogleStrategy({
  clientID: "51813200070-ljrf2b35kg8ghpeqrg5efvot4pp8ak4v.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://localhost:3000/auth/google/turf_booking"
},
  function (accessToken, refreshToken, profile, cb) {
    console.log(profile);

    Registers.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



// Registeration
app.get("/Registeration.html", function (req, res) {
  res.sendFile(__dirname + "/Registeration.html");
});

// app.get("/mail",sendMail);

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/turf_booking",
  passport.authenticate('google', { failureRedirect: "/SignIn.html" }),
  function (req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/");
  });

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/dicee.html");
})

app.post("/Registeration.html", function (req, res) {

  // const register = new Registers({
  //   name:req.body.name,
  //   city:req.body.city
  // });

  Registers.register({ username: req.body.username, name: req.body.name, city: req.body.city }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      console.log("Not Registered");
      res.redirect("/Registeration.html");
    } else {
      console.log("Registered In");
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});


// SignIn
app.get("/SignIn.html", function (req, res) {
  res.sendFile(__dirname + "/SignIn.html");
});

// app.post("/SignIn.html", passport.authenticate("local", {
//   successRedirect: "/",
//   failureRedirect: "/SignIn.html"
// }));

app.post("/SignIn.html", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/SignIn.html",
  failureFlash: true
}));

// app.post("/SignIn.html",function(req,res){
  
//   const user = new Registers({
//     username: req.body.username,
//     password: req.body.password
//   });

//    req.login(user, function (err) {
//     if (err) {
//       console.log(err);
//       res.redirect("/SignIn.html");
//     } else {
//       passport.authenticate("local")(req, res, function () {
//         res.redirect("/");
//       });
//     }
//   });
// });




 



app.get("/explore.html", function (req, res) {
  res.sendFile(__dirname + "/explore.html");
})

app.get("/contact.html", function (req, res) {
  res.sendFile(__dirname + "/contact.html");
})

app.listen(3000, function () {
  console.log("Server is running on port 3000");
})

app.post("/Cart", function (req, res) {
  const query = {}; // Empty query object to retrieve all users
  const projection = { turfName: 1, members: 1 }; // Projection to specify the fields to be retrieved
  const options = { sort: { score: 1 } }; // Sorting option to sort users by score in descending order

  User.find(query, projection, options) // Query for all users with specified projection and sorting
    .then(users => {
      res.render("Cart", { usersWithSecrets: users });
      // console.log('List of users:');
      // users.forEach(user => {
      //   console.log(`Username: ${user.username}, Score: ${user.score}`);
      // });
    })
    .catch(err => {
      console.error(err);
    });
})

var item1 = {
  _id: 1,
  name: "St. Mary's High School, 4 Bungalows, Near Versova Telephone Exchange,Andheri West",
  location: "Mumbai",
  map_url: "https://goo.gl/maps/uiHg68cVjXM2",
  image_icon: "https://www.sporloc.com/image/cache/catalog/911158FINALLOGO-286x180.jpg"
}

var item2 = {
  _id: 2,
  name: "Rajasthani Sammelan Education Trust, SV Road, Malad West, Mumbai 400064",
  location: "Mumbai",
  map_url: "https://maps.app.goo.gl/5rFCzCkY3JTL3LT68",
  image_icon: "https://www.sporloc.com/image/cache/catalog/632721lOGO30-286x180.jpg"
}

var item3 = {
  _id: 3,
  name: "FS Turf, Churchgate - by SPORLOC",
  location: "Mumbai",
  map_url: "https://goo.gl/maps/VJqHp2xzv7tKDRjd7",
  image_icon: "https://www.sporloc.com/image/cache/catalog/754285FinalLogo20-286x180.jpg"
}

var item4 = {
  _id: 4,
  name: "Trickshot, Mulund - by SPORLOC",
  location: "Mumbai",
  map_url: "https://goo.gl/maps/axTihBSDg5mrPBwTA",
  image_icon: "https://www.sporloc.com/image/cache/catalog/714786FINALLOGO-286x180.jpg"
}

var item5 = {
  _id: 5,
  name: "Play The Turf, Malad - by SPORLOC",
  location: "Mumbai",
  map_url: "https://goo.gl/maps/eD8sQWppNkSQMfDt9",
  image_icon: "https://www.sporloc.com/image/cache/catalog/805106LOGO30-286x180.jpg"
}

var item6 = {
  _id: 6,
  name: "UMRB Turf, Azad Nagar - by SPORLOC",
  location: "Mumbai",
  map_url: "https://goo.gl/maps/t3D9j6AwDAgVFd6A7",
  image_icon: "https://www.sporloc.com/image/cache/catalog/506061Logo20-286x180.jpg"
}

var turfs = [item1, item2, item3, item4, item5, item6];
var id = 0;
app.get("/booking.ejs", function (req, res) {
  // console.log(turfs[0].image_icon);
  if (req.isAuthenticated()) {
    res.render('booking', { turfImage: turfs });
  } else {
    res.redirect("/Registeration.html");
  }
})
app.post("/booking.ejs", function (req, res) {
  id = Number(req.body.turf);
  console.log(id);
  //  turfs.forEach(function(turf){
  //     if(id===turf._id){
  //     var array = turf;
  //     }
  //   res.render('booking1',{oneturf:array});
  res.redirect("/booking1");
  // })
})

// app.get("/booking1",function(req,res){
//     res.render('/booking1',{oneturf:turf});
// })
var bool = false;
app.get("/booking1", function (req, res) {
  turfs.forEach(function (turf) {
    if (id === turf._id) {
      var array = turf;
      bool = true;
      if (bool) {
        // console.log(turf.image_icon);
        res.render('booking1', { oneturf: array });
      }
    }
  });
})

app.get("/book_now.ejs", function (req, res) {
  turfs.forEach(function (turf) {
    if (id === turf._id) {
      var array = turf;
      res.render('book_now', { oneturf: array });
    }
  });
});

app.post("/book_now", function (req, res) {
  var turfName = req.body.turfname;
  var location = req.body.location;
  var check_in_date = req.body.check_in_date;
  var check_out_date = req.body.check_out_date;
  var timeSlot = req.body.timeslot;
  var members = req.body.members;
  var email = req.body.email;
  var phone = req.body.phone;

  // arr object for generating ticket

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: "587",
    secure: false,
    auth: {
      user: 'apj752003@gmail.com',
      pass: 'lzwfmkgoeiquvroy'
    }
  });

  let info = transporter.sendMail({
    from: "apj752003@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Turf Booking Website Team", // Subject line
    // This is for any other mail service
    // text: "Hi! Your Booked turf is: "+turfName+"<br/>"+" Turf Location is: "+location+"<br/>"+" Check-in-date : "+check_in_date+"<br/>"+" Check-out-date : "+check_out_date+"<br/>"+" Timeslot :"+timeSlot+"<br/>"+ "Number of memebers are: "+members, // plain text body
    // html: "<html><title>Ticket</title><body><h1>`${arr[0].turfName}`</h1></body></html>", // html body
    // This is for the Gmail
    text: "Hi! Your Booked turf is: " + turfName + "\n Turf Location is: " + location + "\n Check-in-date : " + check_in_date + "\n Check-out-date : " + check_out_date + "\n Timeslot :" + timeSlot + "\n Number of memebers are: " + members
    // html:"<table ><tr><th>Location</th><th>Timeslot</th><th>Country</th></tr><tr><td>`${location}`</td><td>`${timeSlot}`</td><td>Germany</td></tr><tr><td>Centro comercial Moctezuma</td><td>Francisco Chang</td><td>Mexico</td></tr></table>"


  });

  console.log("Message sent is %s", info.messageId);
  // res.json(info);

  // module.exports = arr;

  const b2 = new Booking({
    turfName: turfName,
    location: location,
    check_in_date: check_in_date,
    timeSlot: timeSlot,
    members: members
  })
  b2.save();

  res.redirect("/successful.html");
})

app.post("/contact.html", function (req, res) {
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var mobile = req.body.mobile;
  var message = req.body.feedback;

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: "587",
    secure: false,
    auth: {
      user: 'apj752003@gmail.com',
      pass: 'lzwfmkgoeiquvroy'
    }
  });

  let info = transporter.sendMail({
    from: "apj752003@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Turf Booking Website Team", // Subject line
    html: "<b>Hi! Thanks for Contacting Us! Thank you for your feedback !!</b>", // html body
  });

  console.log("Message sent is %s", info.messageId);

  const b5 = new Contact({
    firstname: firstname,
    lastname: lastname,
    email: email,
    mobile_no: mobile,
    message: message
  });
  b5.save();

  res.redirect("/successful1.html")

})

// app.get("/book_now.ejs",function(req,res){
//     res.render('book_now',{oneturf:array});
// });

app.get("/successful.html", function (req, res) {
  res.sendFile(__dirname + "/successful.html");
})
app.get("/successful1.html", function (req, res) {
  res.sendFile(__dirname + "/successful1.html");
})


