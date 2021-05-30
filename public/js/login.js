let loginBtn = document.getElementById('loginBtn');
let waitingArea = document.getElementById('waitingArea');

loginBtn.addEventListener("click", () => {
    waitingArea.innerHTML = `
	<figure>
	<blockquote class="blockquote mt-2">
	<p>${getRandomFacts()}</p>
	</blockquote>
	<figcaption class="blockquote-footer">
	Có thể học sinh chưa biết
	</figcaption>
	</figure>
	<a class="btn btn-primary text-white"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Đang chuyển hướng...
	</a>`
})