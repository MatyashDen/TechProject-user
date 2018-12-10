{
	let 
		db = firebase.firestore(),

		signUpBut = $("#sign-up-button"),

		userName = $("#name"),
		bornDate = $("#born-date"),
		userEmail = $("#email"),
		phoneNumber = $("#phone-number"),
		userPassword = $("#password"),
		userPassword2 = $("#password2"),

		loadBar = $("#load-bar");

	signUpBut.on("click", signUp);

	function signUp() {
		loadBar.css("display", "block");

		if (userName.val() && userEmail.val() && bornDate.val() && 
			userPassword.val() && userPassword2.val()) {
			if (userPassword.val() == userPassword2.val()) {
				let 
					millisecondsBorn = Date.parse(bornDate.val()),
					currentTime = new Date().getTime();

				if (phoneNumber.val().length !== 12 || phoneNumber.val()[0] != '3' || 
					phoneNumber.val()[1] != '8' || phoneNumber.val()[2] != '0') {
			        loadBar.css("display", "none");

					displayMessage("Напишiть правильний номер", 1);
				} else {
					if (millisecondsBorn < currentTime) {
						firebase.auth().createUserWithEmailAndPassword(userEmail.val(), userPassword.val())
						.then(function() {
							let user = firebase.auth().currentUser;

							db.collection("users").doc(user.uid)
							.set({
								id: user.uid, 

								name: userName.val(),
								bornDate: bornDate.val(),
								email: user.email,
								phoneNumber: phoneNumber.val(),

								dateOfAdd: new Date().getTime()
							}).then(function() {
								window.location.href = "/books";
							});
						}).catch(function(error) {
							var 
								errorCode = error.code,
								errorMessage = error.message;
								
							loadBar.css("display", "none");

							if (errorMessage == "The email address is badly formatted.")
			                    displayMessage("Введiть правильний email", 1);
			                else if (errorMessage == "Password should be at least 6 characters")
			                    displayMessage("Пароль повинен мiстити хоча б 6 сиволiв", 1);
			                else
			                    displayMessage("Цей email вже використвується", 1);
						});
					} else {
						loadBar.css("display", "none");

						displayMessage("Виберiть правильно дату", 1);
					}
					
				}
			} else {
				loadBar.css("display", "none");

				displayMessage("Паролi не спiвпадають", 1);
			}
		} else {
			loadBar.css("display", "none");

			displayMessage("Заповнiть усi поля", 1);
		}
	}
}