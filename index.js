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

var CountdownLatch = function (limit) {
  this.limit = limit;
  this.count = 0;
  this.waitBlock = function () {};
};

CountdownLatch.prototype.countDown = function () {
  this.count = this.count + 1;
  if (this.limit <= this.count) {
    return this.waitBlock();
  }
};

CountdownLatch.prototype.await = function(callback) {
  this.waitBlock = callback;
}

var db = firebase.firestore();

app.set('port', (process.env.PORT || 5001));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicons/favicon.png'));

app.get('/', function(request, response) {
  if (!isLogged(request))
    response.render('pages/sign-in');
  else
    response.redirect("/books");
});

app.get("/sign-up", function(request, response) {
  if (!isLogged(request))
    response.render("pages/sign-up");
  else
    response.redirect("/books");
});

app.get("/books", function(request, response) {
  if (isLogged(request)) {
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
  } else
      response.redirect("/");
});

app.get("/writers", function(request, response) {
  if (isLogged(request)) {
    let writersCol = db.collection("writers").orderBy("dateOfAdd", "desc");

    writersCol.get()
    .then(writersQuery => {
      let writers = [];

      writersQuery.forEach(doc => {
        writers.push(doc.data());
      });

      response.render("pages/writers", {writers: writers});
    });
  } else 
      response.redirect("/");
});

app.get("/profile", function(request, response) {
  if (isLogged(request)) {
    let 
      journalCol = db.collection('journal'),
      booksCol = db.collection("books"),
      requests = [],
      active = [],
      archive = [],
      user = undefined,
      userId = getCookie(request, "uid");

    db.collection("users").doc(userId).get()
    .then(function(doc) {
      user = doc.data();

      journalCol.where("userId", "==", userId).where("status", "==", "new").get()
      .then(function(requestsQuery) {

        journalCol.where("userId", "==", userId).where("status", "==", "active").get()
        .then(function(activeQuery) {

          journalCol.where("userId", "==", userId).where("status", "==", "old").get()
          .then(function(archiveQuery) {

            let barrier = new CountdownLatch(requestsQuery.size + activeQuery.size + archiveQuery.size);

            requestsQuery.docs.forEach(function(doc2, index) {
              requests[index] = doc2.data();

              booksCol.doc(doc2.data().bookId).get()
              .then(function(doc3) {
                requests[index].pictureUrl = doc3.data().pictureUrl;
                requests[index].bookTitle = doc3.data().title;

                barrier.countDown();
              });
            });

            activeQuery.docs.forEach(function(doc2, index) {
              active[index] = doc2.data();

              booksCol.doc(doc2.data().bookId).get()
              .then(function(doc3) {
                active[index].pictureUrl = doc3.data().pictureUrl;
                active[index].bookTitle = doc3.data().title;

                barrier.countDown();
              });
            });

            archiveQuery.docs.forEach(function(doc2, index) {
              archive[index] = doc2.data();

              booksCol.doc(doc2.data().bookId).get()
              .then(function(doc3) {
                archive[index].pictureUrl = doc3.data().pictureUrl;
                archive[index].bookTitle = doc3.data().title;

                barrier.countDown();
              });
            });

            if (requestsQuery.size + activeQuery.size + archiveQuery.size == 0)
              response.render("pages/profile", {user: user, requests: requests, active: active, archive: archive});

            barrier.await(function() {
              console.log(archive);
              
              response.render("pages/profile", {user: user, requests: requests, active: active, archive: archive});
            });
          });
        });
      });
    });
  }
  else
    response.redirect("/");
});

function getCookie(request, name) {
    let cookie = request.headers["cookie"];
    if (cookie !== undefined) {
      var matches = cookie.match(
        new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    } else {
      return undefined;
    }
}

function isLogged(request) {
  return getCookie(request, "uid") != undefined;
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});