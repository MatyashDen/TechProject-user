{
	let 
		db = firebase.firestore(),
		journalCol = db.collection("journal"),

		buttons = $(".card-button"),

		dishViewBar = $("#book-view-bar"),
		backButton = $("#book-view-back"),
		addButton = $("#book-view-add"),

		bookImg = $("#book-img"),
		bookName = $("#book-name"),
		bookWriters = $("#book-writers"),
		bookGenres = $("#book-genres"),
		bookDescription = $("#book-description"),
		bookAmount = $("#book-amount"),

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

	$("#sidebar-filter-btn").on("click", function() {
		let 
			genres = $("[name='genreRadio']:checked"),
			writers = $("[name='writerRadio']:checked"),
			books = $(".index-dish-card"),
			have = false;

		$(".index-title").html("Усi книги");

        $("#sidebar").animate({width: "toggle"});

		for (let i = 0; i < books.length; ++i) {
			let 
				genre = genres.length == 0,
				writer = writers.length == 0;

			for (let j = 0; j < genres.length; ++j) {
				if (books.eq(i).attr("data-genres").indexOf(genres.eq(j).val()) != -1) {
					genre = true;
					break;
				}
			}

			for (let j = 0; j < writers.length; ++j) {
				if (books.eq(i).attr("data-writers").indexOf(writers.eq(j).val()) != -1) {
					writer = true;
					break;
				}
			}

			if (genre && writer) {
				books.eq(i).css("display", "block");
				have = 1;
			}
			else 
				books.eq(i).css("display", "none");
		}

		if (!have) {
			$(".index-title").html("Немає книг");
		}
	});

	// Show dish
	buttons.on("click", function () {
		let bookId = $(this).attr("data-id");

		showView(bookId);
	});

	backButton.on("click", closeView);
	dark.on("click", closeView);

	addButton.on("click", function() {
		loadBar.css("display", "block");

		if (bookAmount.html()[0] != 0) {
			let 
				userId = firebase.auth().currentUser.uid,
				bookId = $("#book-view-bar").attr("data-bookId"),
				key = journalCol.doc().id;

			journalCol.where("userId", "==", userId).where("bookId", "==", bookId)
			.where("status", "==", "new").get()
			.then(function(journalQuery) {
				if (journalQuery.size == 0) {
					journalCol.doc(key).set({
						id: key,
						userId: userId,
						bookId: bookId,
						status: "new",
						dateOfAccept: -1,
						dateOfEnd: -1,
						dateOfAdd: new Date().getTime()
					}).then(function() {
						closeView();
						displayMessage("Заявку вiдправлено, зайдiть до бiблiотеки щоб забрати книгу");
					});
				} else {
					loadBar.css("display", "none");

					displayMessage("Заявку вже вiдправлено", 1);
				}
			});
		} else {
			loadBar.css("display", "none");

			displayMessage("Немає книг, зайдiть пiзнiше", 1);
		}
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

				let amount = doc.data().amount;

				amount = amount.toString();

				if (amount % 10 >= 5 || amount % 100 >= 5 && amount % 100 <= 20 || !(amount % 10)) { 
                    amount += " книг"
                } else if (amount % 10 == 1) { 
                    amount += " книга";
                } else { 
                    amount += " книги";
                } 

				bookAmount.html(amount);

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