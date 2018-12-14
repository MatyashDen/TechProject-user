{
	let 
		db = firebase.firestore(),

		signInBut = document.getElementById("sign-in-button"),

		userEmail = document.getElementById("sign-in-email"),
		userPassword = document.getElementById("sign-in-password"),

		loadBar = $("#load-bar");

	signInBut.onclick = signIn;

	function signIn() {
		loadBar.css("display", "block");

		firebase.auth().signInWithEmailAndPassword(userEmail.value, userPassword.value)
		.then(function() {
			db.collection("users").where("email", "==", userEmail.value).get()
			.then(function(queryUsers) {
				if (queryUsers.size == 1) {
					setCookie("uid", firebase.auth().currentUser.uid);
					window.location.href = '/books';
				}

				else {
					loadBar.css("display", "none");

		      		displayMessage("Невiрний логiн або пароль", 1);
				}
			});
		}).catch(function(error) {
			var 
				errorCode = error.code,
				errorMessage = error.message;
				
			loadBar.css("display", "none");

			displayMessage("Невірний логін або пароль", 1);
		});
	}
}