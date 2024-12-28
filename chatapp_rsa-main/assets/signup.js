const form = document.querySelector('.signup form');
const submitBtn = document.querySelector('.button input');
const errorText = document.querySelector('.error-text');
function isPrime(number) {
	if (number <= 1) {
		return false;
	}

	for (let i = 2; i <= Math.sqrt(number); i++) {
		if (number % i === 0) {
			return false;
		}
	}

	return true;
}
function nd(a, b) {
	{
		var r = [], q = [], x = [];
		r[0] = a; r[1] = b;
		x[0] = 1;
		x[1] = 0;
		r[2] = r[0] % r[1];
		var i = 2;
		while (r[i - 1] != 1) {
			r[i] = r[i - 2] % r[i - 1];
			q[i] = Math.floor(r[i - 2] / r[i - 1]);
			x[i] = x[i - 2] - q[i] * x[i - 1];
			i++;
		}
		if (x[i - 1] < 0) x[i - 1] = x[i - 1] + b;
		return x[i - 1];
	}
}
function generateRandomNumber(n) {
	const min = Math.sqrt(Math.pow(10, n * 2 - 1));
	const max = Math.pow(10, n) - Math.pow(10, n - 1);

	return Math.floor(Math.random() * (max - min + 1) + min);
}
function generateRandomPrime(n) {
	var a = generateRandomNumber(n);
	if (a % 2 == 0) a += 1;
	while (isPrime(a) != true) a += 2;
	return a;
}
function generatersa() {
	var p = generateRandomPrime(4);
	var q = p + 2;
	while (isPrime(q) != true) q += 2;
	var n = p * q;
	var t = (p - 1) * (q - 1);
	const e = 65537;
	var d = nd(e, t);
	return [n, d];
}
var [n, d] = generatersa();

document.getElementById("public_key").value = n;

form.onsubmit = (e) => {
	e.preventDefault();
}

submitBtn.onclick = () => {
	let xhr = new XMLHttpRequest();
	xhr.open("POST", 'api/signup.php', true);
	xhr.onload = () => {
		if ((xhr.readyState === XMLHttpRequest.DONE) && (xhr.status === 200)) {
			let data = xhr.response;
			if (!Number.isNaN(data)) {
				window.localStorage.setItem(data + "n", n);
				window.localStorage.setItem(data + "d", d);
				location.href = "users.php";
			} else {
				errorText.style.display = "block";
				errorText.textContent = data;
			}
		}
	}

	let formData = new FormData(form);
	xhr.send(formData);

	
}