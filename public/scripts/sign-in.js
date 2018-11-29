{
	let 
		db = firebase.firestore(),

		signInBut = document.getElementById("sign-in-button"),

		userEmail = document.getElementById("sign-in-email"),
		userPassword = document.getElementById("sign-in-password"),

		black = document.getElementById("black"),
		loadBar = document.getElementById("load-bar");

	signInBut.onclick = signIn;

	function signIn() {
		black.style.display = "block";
		loadBar.style.display = "block";

		firebase.auth().signInWithEmailAndPassword(userEmail.value, userPassword.value)
		.then(function() {
			db.collection("users").where("email", "==", userEmail.value).get()
			.then(function(queryUsers) {
				if (queryUsers.size == 1) {
					window.location.href = '/add';
				}

				else {
					black.style.display = "none";
					loadBar.style.display = "none";

		      		displayMessage("Невiрний логiн або пароль", 1);
				}
			});
		}).catch(function(error) {
			var 
				errorCode = error.code,
				errorMessage = error.message;
				
			black.style.display = "none";
			loadBar.style.display = "none";

			displayMessage("Невірний логін або пароль", 1);
		});
	}
}