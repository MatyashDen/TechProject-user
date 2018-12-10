"use strict";

var 
	express = require('express'),
	app = express(),
	firebase = require('firebase'),
	//admin = require('firebase-admin'),
	//serviceAccount = require('./admin-key.json'),
	favicon = require('serve-favicon'),
	path = require('path');

firebase.initializeApp({
  apiKey: "AIzaSyCok2kYqVlgwE2D5oB-SwH02P_vAEs6vXc",
  authDomain: "tech-project-713a5.firebaseapp.com",
  databaseURL: "https://tech-project-713a5.firebaseio.com",
  projectId: "tech-project-713a5",
  storageBucket: "tech-project-713a5.appspot.com",
  messagingSenderId: "44726095220"
});
firebase.firestore().settings( { timestampsInSnapshots: true });
/*
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tui-project-a3956.firebaseio.com"
});*/

var db = firebase.firestore();

app.set('port', (process.env.PORT || 5001));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicons/favicon.png'));

app.get('/', function(request, response) {
  response.render('pages/sign-in');
});

app.get("/sign-up", function(request, response) {
  response.render("pages/sign-up");
});

app.get("/books", function(request, response) {
  let 
    booksCol = db.collection("books"),
    writersCol = db.collection("writers"),
    genresCol = db.collection("genres");

  writersCol.orderBy("dateOfAdd", "desc").get()
  .then(function(writersQuery) {

    genresCol.orderBy("dateOfAdd", "desc").get()
    .then(function(genresQuery) {

      booksCol.orderBy("dateOfAdd", "desc").get()
      .then(function(booksQuery) {
        let 
          books = [],
          allGenres = [],
          allWriters = [];

        booksQuery.forEach(function(doc) {
          books.push(doc.data());
        });

        genresQuery.forEach(function(doc) {
          allGenres.push(doc.data());
        });

        writersQuery.forEach(function(doc) {
          allWriters.push(doc.data());
        });

        response.render("pages/books", {books: books, allGenres: allGenres, allWriters: allWriters});
      });
    });
  });
});

app.get("/writers", function(request, response) {
  let writersCol = db.collection("writers").orderBy("dateOfAdd", "desc");

  writersCol.get()
  .then(writersQuery => {
    let writers = [];

    writersQuery.forEach(doc => {
      writers.push(doc.data());
    });

    response.render("pages/writers", {writers: writers});
  });
});

app.get("/profile", function(request, response) {
  response.render("pages/profile");
});

app.get("/exit", function(request, response) {
  response.redirect("/");
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});