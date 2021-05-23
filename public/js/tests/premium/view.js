function showOrHideKey(ele) {
    if (ele.checked) {
        document.querySelectorAll('input[type="radio"][data-isTrue="1"]').forEach(i => {
            i.checked = true;
        })
    } else {
        document.querySelectorAll('input[type="radio"][data-isTrue="1"]').forEach(i => {
            i.checked = false;
        })
    }
}

function showOrHideAnswer(ele) {
    if (ele.checked) {
        document.querySelectorAll('.collapse').forEach(c => {
            c.classList.add("show");
        })
    } else {
        document.querySelectorAll('.collapse').forEach(c => {
            c.classList.remove("show");
        })
    }
}

document.getElementById('configForm').addEventListener("submit", (e) => {
    this.innerHTML = `
    <figure>
	    <blockquote class="blockquote mt-2">
	        <p>${getRandomFacts()}</p>
	    </blockquote>
        <figcaption class="blockquote-footer">
            Có thể học sinh chưa biết
        </figcaption>
	</figure>
	<a class="btn btn-primary"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Đang tải đề...
	</a>`
})