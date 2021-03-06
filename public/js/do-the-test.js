var initModal = document.getElementById('init-modal');
initModal.addEventListener('hidden.bs.modal', function (event) {
    countdown();
});
initModal = new bootstrap.Modal(initModal, {
    backdrop: 'static',
    keyboard: false
});
initModal.show();

document.querySelectorAll("input").forEach(input => {
    input.addEventListener("click", function () {
        this.nextSibling.style["box-shadow"] = "0 0 0 2pt var(--bs-primary)";
    })
});

document.getElementById("submit").addEventListener("click", function () {
    let falseCounts = 0;
    let total = 0;
    document.querySelectorAll(".question").forEach(function (q) {
        total++;
        let checkedRadio, trueRadio;
        let title = q.querySelector("b");
        q.querySelectorAll("input").forEach(function (i) {
            if (i.checked) checkedRadio = i;
            if (i.dataset.value == '1') trueRadio = i;
            i.disabled = true;
            i.nextSibling.style["box-shadow"] = "";
        })
        title.innerHTML += (`<span class="badge bg-light"><a class="text-decoration-none" href="/questions/${q.dataset.id}/view" target="_blank">Đáp án chi tiết</a></span><br>`)
        title.classList.add("btn");
        if (!checkedRadio) {
            falseCounts++;
            title.classList.add("btn-danger");
        } else if (trueRadio.dataset.order != checkedRadio.dataset.order) {
            title.classList.add("btn-danger");
            checkedRadio.nextSibling.style.background = "var(--bs-danger)";
            falseCounts++;
        } else title.classList.add("btn-success");
        trueRadio.nextSibling.style.background = "var(--bs-success)";
        trueRadio.nextSibling.style.color = "#FFF";
        trueRadio.nextSibling.style.border = "none";
    })
    alert(`${10 - falseCounts / total * 10} điểm.`);
    this.style.display = "none";
})