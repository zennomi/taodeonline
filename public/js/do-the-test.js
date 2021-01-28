var initModal = document.getElementById('init-modal');
initModal.addEventListener('hidden.bs.modal', function (event) {
    let leaveCountEle = document.getElementById('leaveTimes');

    function userCheated() {
    // The user cheated by leaving this window (e.g opening another window)
    // Do something
    leaveCountEle.innerHTML = Number(leaveCountEle.innerHTML) + 1;
    notify(0, 'Bạn vừa rời khỏi khu vực làm bài thi.');
}

window.onblur = userCheated;
    countdown();
    scrollToTop();
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
    let questionArr = document.querySelectorAll(".question");
    questionArr.forEach(function (q) {
        total++;
        let checkedRadio, trueRadio;
        let title = q.querySelector("b");
        q.querySelectorAll("input").forEach(function (i) {
            if (i.checked) checkedRadio = i;
            if (i.dataset.value == '1') trueRadio = i;
            i.disabled = true;
            i.nextSibling.style["box-shadow"] = "";
        })
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
        title.innerHTML += (`<span class="badge bg-light"><a class="text-decoration-none" href="/questions/${q.dataset.id}/view" target="_blank">Đáp án chi tiết</a></span>`);
        title.nextElementSibling.innerHTML = '<br>' + title.nextElementSibling.innerHTML;
        
    });

    document.getElementById('result').innerHTML = questionArr.length - falseCounts;
    
    this.remove();
    document.getElementById('resultCard').style.display = 'block';
    scrollToTop();
})

function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
