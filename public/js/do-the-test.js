
document.querySelectorAll("input").forEach(input => {
    input.addEventListener("click", function () {
        this.nextSibling.style["box-shadow"] = "0 0 3pt 2pt var(--primary)";
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
        title.innerHTML += (`<a class="badge badge-light" href="/questions/${q.dataset.id}/view" target="_blank">Đáp án chi tiết</a>`)
        title.classList.add("badge");
        if (!checkedRadio) {
            falseCounts++;
            title.classList.add("badge-danger");
        } else if (trueRadio.dataset.order != checkedRadio.dataset.order) {
            title.classList.add("badge-danger");
            checkedRadio.nextSibling.style.background = "var(--danger)";
            falseCounts++;
        } else title.classList.add("badge-success");
        trueRadio.nextSibling.style.background = "var(--success)";
        trueRadio.nextSibling.style.color = "#FFF";
        trueRadio.nextSibling.style.border = "none";
    })
    alert(`${10 - falseCounts / total * 10} điểm.`);
    this.style.display = "none";
})