// get toastContainer

let toastContainer = document.querySelector('.toast-container');

// toast
function notify(title, content) {
    let toastEl = createElementFromHTML(`<div class="toast" role="alert" aria-live="assertive" aria-atomic="true"><div class="toast-header"><img class="rounded me-2" src="" alt="" /><strong class="me-auto">${title}</strong><button class="btn-close" type="button" data-bs-dismiss="toast" aria-label="Close"></button></div><div class="toast-body">${content}</div></div>`);
    toastContainer.appendChild(toastEl)
    toastEl.addEventListener('hidden.bs.toast', function() {
        toastEl.remove();
    })
    toast = new bootstrap.Toast(toastEl, {
        delay: 5000
    });
    toast.show();
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}