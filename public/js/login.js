let loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener("click", () => {
	loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Đang đăng nhập...'
	console.log('Hi');
})