const form = document.querySelector('.typing-area');
const inputField = form.querySelector('.input-field');
const sendBtn = form.querySelector('button');
const chatBox = document.querySelector('.chat-box');

const incoming_id = form.querySelector('.incoming_id').value;
const public_key = document.getElementById("public_key").textContent;
const outgoing_id = document.getElementById("outgoing_id").textContent;

function powerModulo(a, b, n) {
	let result = 1;
	while (b > 0) {
		if (b % 2 === 1) {
			result = (result * a) % n;
		}
		a = (a * a) % n;
		b = Math.floor(b / 2);
	}
	return result;
}
function rsa_encrypt(message, n, e) {
	var ascii_message = "";
	for (var i = 0; i < message.length; i++) {
		var s = message.charCodeAt(i).toString();
		while (s.length < 4) {
			s = '0' + s;
		}
		ascii_message += s;
	}

	return powerModulo(ascii_message, e, n);
}
function rsa_decrypt(encrypt_message, n, d) {
	var message = "";
	var ascii_message = powerModulo(encrypt_message, d, n);
	ascii_message = String(ascii_message);

	while (ascii_message.length % 4 !== 0) {
		ascii_message = '0' + ascii_message;
	}
	for (var i = 0; i < ascii_message.length; i += 4) {
		var s = ascii_message.substr(i, 4);
		message += String.fromCharCode(parseInt(s));
	}
	return message;
}
function splitString(str,n) {
	let result = [];

	for (let i = 0; i < str.length; i += n) {
		let substring = str.substring(i, i + n);
		result.push(substring);
	}

	return result;
}

form.onsubmit = (e) => {
	e.preventDefault();
}

inputField.focus();
inputField.onkeyup = () => {
	if (inputField.value != "") {
		sendBtn.classList.add("active")
	} else {
		sendBtn.classList.remove("active")
	}
}
sendBtn.onclick = () => {
	let xhr = new XMLHttpRequest();

	let splitResult = splitString(encodeURI(inputField.value),2);
	let s = ""; let s1 = "";
	splitResult.forEach(function (element) {
		s1 = rsa_encrypt(element, public_key, 65537).toString();
		while (s1.length < 8) s1 = '0' + s1;
		s = s + s1;
	});
	inputField.value = s;
	xhr.open("POST", 'api/insert-chat.php', true);
	xhr.onload = () => {
		if ((xhr.readyState === XMLHttpRequest.DONE) && (xhr.status === 200)) {
			inputField.value = "";
			scrollToBottom();
		}
	}
	let formData = new FormData(form);
	xhr.send(formData);
}

setInterval(() => {
	let xhr = new XMLHttpRequest();
	xhr.open("POST", 'api/get-chat.php', true);
	xhr.onload = () => {
		if ((xhr.readyState === XMLHttpRequest.DONE) && (xhr.status === 200)) {
			n = window.localStorage.getItem(outgoing_id.toString() + "n")
			d = window.localStorage.getItem(outgoing_id.toString() + "d")

			var tempDiv = document.createElement('div');
			tempDiv.innerHTML = xhr.response;

			var elements = tempDiv.querySelectorAll('.chat.incoming');

			elements.forEach(function (element) {
				var paragraph = element.querySelector('.details p');

				let splitResult = splitString(paragraph.textContent,8);

				let s = ""; let s1 = "";
				splitResult.forEach(function (element) {
					s1 = rsa_decrypt(element, n, d).toString();
					s = s + s1;
				});
				paragraph.textContent = decodeURI(s);
			});

			n = window.localStorage.getItem(incoming_id.toString() + "n")
			d = window.localStorage.getItem(incoming_id.toString() + "d")

			var elements = tempDiv.querySelectorAll('.chat.outgoing');

			elements.forEach(function (element) {
				var paragraph = element.querySelector('.details p');

				let splitResult = splitString(paragraph.textContent,8);

				let s = ""; let s1 = "";
				splitResult.forEach(function (element) {
					s1 = rsa_decrypt(element, n, d).toString();
					s = s + s1;
				});
				paragraph.textContent = decodeURI(s);
			});

			var updatedHTML = tempDiv.innerHTML;

			chatBox.innerHTML = updatedHTML;
			if (!chatBox.classList.contains('active')) {
				scrollToBottom();
			}
		}
	}
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send('incoming_id=' + incoming_id);
}, 500)

chatBox.onmouseenter = () => {
	chatBox.classList.add('active')
}

chatBox.onmouseleave = () => {
	chatBox.classList.remove('active')
}

function scrollToBottom() {
	chatBox.scrollTop = chatBox.scrollHeight;
}