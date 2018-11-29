let messageBox = document.getElementById('message-box');

function popUpDiplay() {
    messageBox.style.opacity = '1';
    messageBox.style.transform = ' translate(-50%, -100%)';
    messageBox.style.visibility = 'visible';
}

 function popUpHide() {
    messageBox.style.opacity = '0';
    messageBox.style.transform = ' translate(-50%, -25%)';
    messageBox.style.visibility = 'hidden';
} 

function displayMessage(message, error) {
	messageBox.getElementsByTagName("span")[0].innerHTML = message;
	let classList = messageBox.classList;
    
    // 1 - error, 0 - success
	if (error) {
		if (!classList.contains("cmn-ppp-error"))
			classList.add("cmn-ppp-error");

	} else {
		if (classList.contains("cmn-ppp-error"))
			classList.remove("cmn-ppp-error");
	}

    popUpDiplay();
    
    setTimeout(function() {
        popUpHide();
    }, 2000);
}