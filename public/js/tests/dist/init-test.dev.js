"use strict";

var submitBtn = document.getElementById('submit');
var leavesAreaTimes = 0;
var toastContainer = document.querySelector('.toast-container');
var resultId; // Modal

var initModal = document.getElementById('init-modal');
initModal.addEventListener('hidden.bs.modal', function (event) {
  fetch('/api/new-result', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({
      testId: testId
    })
  }).then(function (res) {
    return res.json();
  }).then(function (res) {
    if (res.status != 200) {
      notify("Hệ thống", "Có vấn đề đường truyền internet. Nếu thấy thông báo này lặp lại vui lòng reload bài thi.");
      return;
    }

    document.querySelector('.test-wrap').style.display = 'block';
    var leaveCountEle = document.getElementById('leaveTimes');

    function userCheated() {
      // The user cheated by leaving this window (e.g opening another window)
      // Do something
      leavesAreaTimes++;
      notify('Cảnh báo', "B\u1EA1n \u0111\xE3 r\u1EDDi kh\u1ECFi khu v\u1EF1c l\xE0m b\xE0i thi ".concat(leavesAreaTimes, " l\u1EA7n."));
    }

    resultId = res.resultId;
    window.onblur = userCheated;
    countdown();
    scrollToTop();
  });
});
initModal = new bootstrap.Modal(initModal, {
  backdrop: 'static',
  keyboard: false
});
initModal.show(); // toast

function notify(title, content) {
  var toastEl = createElementFromHTML("<div class=\"toast\" role=\"alert\" aria-live=\"assertive\" aria-atomic=\"true\"><div class=\"toast-header\"><img class=\"rounded me-2\" src=\"\" alt=\"\" /><strong class=\"me-auto\">".concat(title, "</strong><button class=\"btn-close\" type=\"button\" data-bs-dismiss=\"toast\" aria-label=\"Close\"></button></div><div class=\"toast-body\">").concat(content, "</div></div>"));
  toastContainer.appendChild(toastEl);
  toastEl.addEventListener('hidden.bs.toast', function () {
    toastEl.remove();
  });
  toast = new bootstrap.Toast(toastEl, {});
  toast.show();
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim(); // Change this to div.childNodes to support multiple top-level nodes

  return div.firstChild;
} // window config


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