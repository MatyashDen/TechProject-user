{
	let 
		db = firebase.firestore(),

		buttons = $(".card-button"),

		dishViewBar = $("#book-view-bar"),
		backButton = $("#book-view-back"),
		addButton = $("#book-view-add"),

		bookImg = $("#book-img"),
		bookName = $("#book-name"),
		bookWriters = $("#book-writers"),
		bookGenres = $("#book-genres"),
		bookDescription = $("#book-description"),

		dark = $(".black").eq(1),
		loadBar = $("#load-bar");

	var CountdownLatch = function (limit) {
	  this.limit = limit;
	  this.count = 0;
	  this.waitBlock = function () {};
	}

	CountdownLatch.prototype.countDown = function () {
	  this.count = this.count + 1;
	  if (this.limit <= this.count) {
	    return this.waitBlock();
	  }
	}

	CountdownLatch.prototype.await = function(callback) {
	  this.waitBlock = callback;
	}

	// Show dish
	buttons.on("click", function () {
		let bookId = $(this).attr("data-id");

		showView(bookId);
	});

	backButton.on("click", closeView);
	dark.on("click", closeView);

	addButton.on("click", function() {
		loadBar.css("display", "block");

		let 
			journal = db.collection("journal"),
			key = journal.doc().id;

		journal.doc(key).set({
			id: key,
			userId: firebase.auth().currentUser.uid,
			bookId: $("#book-view-bar").attr("data-bookId"),
			status: "new",
			dateOfAccept: -1,
			dateOfEnd: -1,
			dateOfAdd: new Date().getTime()
		}).then(function() {
			closeView();
			displayMessage("Заявку вiдправлено, зайдiть до бiблiотеки щоб забрати книгу");
		});
	});

	function showView(bookId) {
		loadBar.css("display", "block");
		dishViewBar.attr("data-bookId", bookId);

		db.collection("books").doc(bookId).get()
		.then(function(doc) {
			let 
				genresId = doc.data().genresId,
				writersId = doc.data().writersId,
				genres = [],
				writers = [],

				barrier = new CountdownLatch(genresId.length + writersId.length);

			bookImg.attr("src", doc.data().pictureUrl);

			genresId.forEach(function(id, index) {
				db.collection("genres").doc(id).get()
				.then(function(doc) {
					genres[index] = doc.data().title;
					barrier.countDown();
				});
			});

			writersId.forEach(function(id, index) {
				db.collection("writers").doc(id).get()
				.then(function(doc) {
					writers[index] = doc.data().name;
					barrier.countDown();
				});
			});

			barrier.await(function() {
				bookName.html(doc.data().title);
				bookDescription.html(doc.data().description);

				bookGenres.html(genres.join(", "));
				bookWriters.html(writers.join(", "));

				dishViewBar.css("display", "block");
				loadBar.css("display", "none");
				dark.css("display", "block");
			});
		});
	}

	function closeView() {
		loadBar.css("display", "none");

		dishViewBar.css("display", "none");
		dark.css("display", "none");
	}
}	