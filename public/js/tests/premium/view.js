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
    e.target.style.display = 'none';
    document.getElementById('prArea').innerHTML = `
    <figure class="text-center>
        <blockquote class="blockquote mt-2">
            <p>${getRandomFacts()}</p>
        </blockquote>
        <figcaption class="blockquote-footer">
            Có thể học sinh chưa biết
        </figcaption>
    </figure>
    <a class="d-block mx-auto btn btn-primary text-white"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Đang tải đề...
    </a>`
})

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})