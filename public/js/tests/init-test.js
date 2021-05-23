let submitBtn = document.getElementById('submit');
let leavesAreaTimes = 0;
let toastContainer = document.querySelector('.toast-container');
let resultId;
// Modal
var initModal = document.getElementById('init-modal');
initModal.addEventListener('hidden.bs.modal', function (event) {
    fetch('/api/results', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({testId})
    })
    .then(res => res.json())
    .then(res => {
        
        document.querySelector('.test-wrap').style.display = 'block';
        let leaveCountEle = document.getElementById('leaveTimes');
    
        function userCheated() {
            // The user cheated by leaving this window (e.g opening another window)
            // Do something
            leavesAreaTimes++;
            notify('Cảnh báo', `Bạn đã rời khỏi khu vực làm bài thi ${leavesAreaTimes} lần.`);
        }
        resultId = res.result._id;
        window.onblur = userCheated;
        countdown(totalTimes);
        scrollToTop();
    })

});

initModal = new bootstrap.Modal(initModal, {
    backdrop: 'static',
    keyboard: false
});
initModal.show();

// toast
function notify(title, content) {
    let toastEl = createElementFromHTML(`<div class="toast" role="alert" aria-live="assertive" aria-atomic="true"><div class="toast-header"><img class="rounded me-2" src="" alt="" /><strong class="me-auto">${title}</strong><button class="btn-close" type="button" data-bs-dismiss="toast" aria-label="Close"></button></div><div class="toast-body">${content}</div></div>`);
    toastContainer.appendChild(toastEl)
    toastEl.addEventListener('hidden.bs.toast', function () {
        toastEl.remove();
    })
    toast = new bootstrap.Toast(toastEl, {});
    toast.show();
}
function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild; 
  }

// window config
function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function onBeforeUnload(e) {
    if (1) {
        e.preventDefault();
        e.returnValue = '';
        return;
    }

    delete e['returnValue'];
}

window.addEventListener('beforeunload', onBeforeUnload);