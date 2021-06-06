let resultId, submitBtn;
let questionList = [];
let leavesAreaTimes = 0;

document.addEventListener("DOMContentLoaded", function() {
    //dom is fully loaded, but maybe waiting on images & css files


    submitBtn = document.getElementById('submit');
    var initModal = document.getElementById('init-modal');

    initModal.addEventListener('hidden.bs.modal', function(event) {
        anotherMethod('/api/results', 'POST', { testId }, (res) => {
            document.querySelector('.test-wrap').style.display = 'block';
            resultId = res.result._id;
            countdown(totalTimes);
            window.onblur = userCheated;
            scrollToTop();
        })
    });

    initModal = new bootstrap.Modal(initModal, {
        backdrop: 'static',
        keyboard: false
    });
    initModal.show();

    Question.prototype.selectChoice = function() {
        let selectedChoice = this.getSelectedChoice();
        if (selectedChoice) {
            this.choiceId = selectedChoice.dataset['id'];
            this.moment = new Date();
            this.shortcut.style.background = 'var(--bs-success)';
            this.shortcut.style.color = 'var(--bs-white)';
            this.getSelectedChoice().nextSibling.style["box-shadow"] = "0 0 0 2pt var(--bs-success)";
            this.getSelectedChoice().nextSibling.style["border"] = "solid 1px var(--bs-white)";
        }
    }

    document.querySelectorAll(".question").forEach(q => questionList.push(new Question(q)));



    // Menu

    let sideNav = document.querySelector("#sidemenu");
    let offcanvas = new bootstrap.Offcanvas(sideNav);


    document.querySelectorAll(".sidenav a").forEach(a => a.addEventListener("click", () => {
        setTimeout(function() { offcanvas.hide(); }, 500);

    }));

    // Submit btn
    submitBtn.addEventListener('click', () => {
        if (!confirm("Nộp bài nhé?")) return;
        submitTest();
    })
});


// Submit choices
function submitChoices(isFinished) {
    let choicesList = [];
    questionList.forEach(q => {
        let choiceIdAndMoment = q.getChoiceIdAndMoment();
        if (choiceIdAndMoment) {
            choicesList.push(choiceIdAndMoment)
        }
    })
    anotherMethod('/api/results/' + resultId, 'PUT', { choices: choicesList, isFinished, leavesAreaTimes },
        (res) => {
            if (isFinished) {
                viewResult(resultId);
                notify("Hệ thống", "Đã lưu lại kết quả làm bài.");
            }
        },
        handleError
    );
}

// questions prototype
function Question(element) {
    this._element = element;
    this._id = element.dataset['id'];
    this._title = element.querySelector("b");
    this._choices = element.querySelectorAll('input[type="radio"]');
    this.choiceId = "";
    this.shortcut = document.querySelector(`a[href="#q-${this._id}"]`);
    this.moment;
    this.getSelectedChoice = () => {
        return this._element.querySelector('input:checked');
    }
    this.getChoiceById = (id) => {
        return this._element.querySelector(`input[data-id=a-${id}]`)
    }
    this.getChoiceIdAndMoment = () => {
        let selectedChoice = this.getSelectedChoice();
        if (!selectedChoice) return null;
        let choiceIdAndMoment = {
            choice_id: this.choiceId || selectedChoice.dataset['id'],
            moment: this.moment || new Date()
        };
        return choiceIdAndMoment;
    }
    var self = this;
    this._choices.forEach(c => {
        c.addEventListener("input", function() { self.selectChoice() })
    })
}

// Submit test
function submitTest() {

    clearInterval(countdownCtrl);
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Đang nộp`;
    notify("Hệ thống", "Đừng thoát vội, chờ hệ thống lưu lại kết quả cái đã...");
    getMethod('/api/tests/' + testId + '/true-choices',
        (res) => {
            window.onblur = undefined;
            document.getElementById('timeBtn').remove();
            progressBtn.parentNode.remove();
            window.onblur = undefined;
            let isPublic = res.isPublic;
            submitChoices(1);

            let trueChoicesId = [...res.result],
                falseCounts = 0;
            questionList.forEach(q => {
                let checkedRadio, trueRadio;
                q._choices.forEach(function(i) {
                    if (i.checked) checkedRadio = i;
                    if (trueChoicesId.indexOf(i.dataset.id) > -1) trueRadio = i;
                    i.disabled = true;
                    i.nextSibling.style["box-shadow"] = "";
                })
                if (trueRadio) {
                    if (isPublic) {
                        q._title.classList.add("btn", "btn-sm", "fw-bold");
                        q.shortcut.style.color = "var(--bs-white)";
                    }
                    if (!checkedRadio) {
                        falseCounts++;
                        if (isPublic) {
                            q._title.classList.add("btn-danger");
                            q.shortcut.style.background = "var(--bs-danger)";
                            q.shortcut.style.border = "solid 2px var(--bs-danger)";
                        }
                    } else if (trueRadio.dataset.id != checkedRadio.dataset.id) {
                        if (isPublic) {
                            q.shortcut.style.background = "var(--bs-danger)";
                            q.shortcut.style.border = "solid 2px var(--bs-danger)";
                            q._title.classList.add("btn-danger");
                            checkedRadio.nextSibling.style.background = "var(--bs-danger)";
                        }

                        falseCounts++;
                    } else if (isPublic) q._title.classList.add("btn-success");
                    if (isPublic) {
                        trueRadio.nextSibling.style.background = "var(--bs-success)";
                        trueRadio.nextSibling.style.color = "var(--bs-white)";
                        trueRadio.nextSibling.style.border = "none";
                        q._title.style.color = "var(--bs-white)";
                        q._title.classList.remove("text-success");
                        q._title.nextElementSibling.innerHTML = `   <a class="text-decoration-none btn btn-success btn-sm sans-serif" data-bs-toggle="collapse" href="#ans-${q._id}" role="button" aria-expanded="false">
                        lời giải chi tiết
                      </a><br>` + q._title.nextElementSibling.innerHTML;
                    }
                }
            });
            document.getElementById('result').innerHTML = questionList.length - falseCounts;
            notify("Hệ thống", "Đã chấm xong!");
            submitBtn.remove();
            document.getElementById('resultCard').style.display = 'block';
            scrollToTop();
        },
        (res) => {
            notify("Hệ thống", "Không ổn, nộp lại xem nào.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Nộp lại";
        })
}