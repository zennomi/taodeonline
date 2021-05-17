

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
        console.log(choiceIdAndMoment);
        return choiceIdAndMoment;
    }
    var self = this;
    this._choices.forEach(c => {
        c.addEventListener("input", function () { self.selectChoice() })
    })
}

// function () {
//     let itemMenuEle = document.querySelector(`a[href="#q-${element.dataset['id']}"]`);
//     itemMenuEle.style.background = 'var(--bs-primary)';
//     itemMenuEle.style.color = '#fff';
//     this.nextSibling.style["box-shadow"] = "0 0 0 2pt var(--bs-primary)";
//     this.dataset['moment'] = (new Date).getTime();
// }

Question.prototype.selectChoice = function () {
    console.log(this);
    let selectedChoice = this.getSelectedChoice();
    if (selectedChoice) {
        this.choiceId = selectedChoice.dataset['id'];
        this.moment = new Date();
        this.shortcut.style.background = 'var(--bs-success)';
        this.shortcut.style.color = '#fff';
        this.getSelectedChoice().nextSibling.style["box-shadow"] = "0 0 0 2pt var(--bs-success)";
        this.getSelectedChoice().nextSibling.style["border"] = "solid 1px white";
    }
}

let questionList = [];
document.querySelectorAll(".question").forEach(q => questionList.push(new Question(q)));



// Menu

let sideNav = document.querySelector("#sidemenu");
let offcanvas = new bootstrap.Offcanvas(sideNav);

    
document.querySelectorAll(".sidenav a").forEach(a => a.addEventListener("click", () => {
    setTimeout(function(){ offcanvas.hide(); }, 1000);
    
}));

// Submit choices
function submitChoices(isFinished) {
    return;
    let choicesList = [];
    questionList.forEach(q => {
        let choiceIdAndMoment = q.getChoiceIdAndMoment();
        if (choiceIdAndMoment) {
            choicesList.push(choiceIdAndMoment)
        }
    })
    fetch('/api/submit-choices', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ choices: choicesList, testId, isFinished, resultId, leavesAreaTimes })
    })
        .then(res => res.json())
        .then(res => {
            if (res.status != 200) {
                notify("Hệ thống", "Có vấn đề đường truyền internet. Nếu thấy thông báo này lặp lại vui lòng reload bài thi.");
                return;
            }
            if (isFinished)
                notify("Hệ thống", "Đã lưu lại kết quả làm bài.");
        })
}

// Submit test
function submitTest(testId) {
    return ;
    if (!alert("Nộp bài nhé?")) return;
    window.onblur = undefined;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Đang nộp`;
    notify("Hệ thống", "Đừng thoát vội, chờ hệ thống lưu lại kết quả cái đã...");
    fetch('/api/tests/' + testId + '/trueChoices')
        .then(res => res.json())
        .then(data => {
            if (data.status != 200) {
                notify("Hệ thống", "Không ổn, nộp lại xem nào.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Nộp lại";
                return;
            }
            submitChoices(1);
            let trueChoicesId = [...data.result], falseCounts = 0, isPublic = data.isPublic;
            questionList.forEach(q => {
                let checkedRadio, trueRadio;
                q._choices.forEach(function (i) {
                    if (i.checked) checkedRadio = i;
                    if (trueChoicesId.indexOf(i.dataset.id) > -1) trueRadio = i;
                    i.disabled = true;
                    i.nextSibling.style["box-shadow"] = "";
                })
                if (isPublic) q._title.classList.add("btn");
                if (!checkedRadio) {
                    falseCounts++;
                    if (isPublic) q._title.classList.add("btn-danger");
                } else if (trueRadio.dataset.id != checkedRadio.dataset.id) {
                    if (isPublic) {
                        q._title.classList.add("btn-danger");
                        checkedRadio.nextSibling.style.background = "var(--bs-danger)";
                    }
                    falseCounts++;
                } else if (isPublic) q._title.classList.add("btn-success");
                if (isPublic) {
                    trueRadio.nextSibling.style.background = "var(--bs-success)";
                    trueRadio.nextSibling.style.color = "#FFF";
                    trueRadio.nextSibling.style.border = "none";
                    q._title.innerHTML += (`<a class="btn btn-sm btn-outline-light" href="/questions/${q._id}/view" target="_blank">Đáp án chi tiết</a>`);
                    q._title.nextElementSibling.innerHTML = '<br>' + q._title.nextElementSibling.innerHTML;
                }

            });
            document.getElementById('result').innerHTML = questionList.length - falseCounts;
            document.getElementById('leaveTimes').innerHTML = leavesAreaTimes;

            notify("Hệ thống", "Chấm xong òi!");
            submitBtn.remove();
            document.getElementById('resultCard').style.display = 'block';
            scrollToTop();
        })
}
