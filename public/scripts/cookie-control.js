{
	function setCookie(name, value) {
		document.cookie = name + "=" + value + "; path=/; expires=;";
	}

	function deleteCookie(name) {
		document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
	}

	function getCookie(name) {
		var matches = document.cookie.match(
			new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	  ));
	  return matches ? decodeURIComponent(matches[1]) : undefined;
	}
}