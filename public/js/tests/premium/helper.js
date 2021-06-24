// toggle night mode
let r = document.querySelector(':root');

function toggleNightMode(btn) {
    if (getComputedStyle(r).getPropertyValue('--bs-white') == '#fff') {
        r.style.setProperty('--bs-white', '#121212');
        r.style.setProperty('--bs-dark', '#eee');
        r.style.setProperty('--bs-filter', 'invert(95%)');
        btn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        r.style.setProperty('--bs-white', '#fff');
        r.style.setProperty('--bs-dark', '#212529');
        r.style.setProperty('--bs-filter', 'none');
        btn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// play/pause time
function playOrPauseTime(btn) {
    if (countdownCtrl) {
        clearInterval(countdownCtrl);
        countdownCtrl = false;
        btn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        btn.innerHTML = '<i class="fas fa-pause"></i>';
        countdown(distance);
    };
}

// effect for menu button
let menuBtn = document.getElementById('menuBtn');
var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        menuBtn.style.left = "10px";
    } else {
        menuBtn.style.left = "-80px";
    }
    prevScrollpos = currentScrollPos;
}

// zoom function
let containerEle = document.querySelector('.container');

function zoomOut() {
    let size = Number(containerEle.style.zoom);
    let backDrop = document.querySelector('.modal-backdrop.show');
    if (size < 1.5) {
        backDrop.style.opacity = 0;
        containerEle.style.zoom = size + 0.1;
        optionArea();
    }
}

function zoomIn() {
    let size = Number(containerEle.style.zoom);
    let backDrop = document.querySelector('.modal-backdrop.show');
    if (size > 0.5) {
        backDrop.style.opacity = 0;
        containerEle.style.zoom = size - 0.1;
        optionArea();
    }
}
/* Get into full screen */
function GoInFullscreen(element) {
    if (element.requestFullscreen)
        element.requestFullscreen();
    else if (element.mozRequestFullScreen)
        element.mozRequestFullScreen();
    else if (element.webkitRequestFullscreen)
        element.webkitRequestFullscreen();
    else if (element.msRequestFullscreen)
        element.msRequestFullscreen();
}

/* Get out of full screen */
function GoOutFullscreen() {
    if (document.exitFullscreen)
        document.exitFullscreen();
    else if (document.mozCancelFullScreen)
        document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen)
        document.webkitExitFullscreen();
    else if (document.msExitFullscreen)
        document.msExitFullscreen();
}

/* Is currently in full screen or not */
function IsFullScreenCurrently() {
    var full_screen_element = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || null;

    // If no element is in full-screen
    if (full_screen_element === null)
        return false;
    else
        return true;
}

let fullScrennBtn;

const fullScreenOrEsc = function(ele) {
    fullScrennBtn = ele;
    if (IsFullScreenCurrently()) {
        GoOutFullscreen();
    } else {
        GoInFullscreen(document.querySelector('html'));
    }
};

for (let evt of['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']) {
    document.addEventListener(evt, () => {
        if (IsFullScreenCurrently()) {
            containerEle.style.zoom = '1.3';
            fullScrennBtn.innerHTML = '<i class="fas fa-compress"></i>  Thoát toàn màn hình';
        } else {
            containerEle.style.zoom = '1';
            fullScrennBtn.innerHTML = '<i class="fas fa-expand-wide"></i>';
        }
    })
}

// window config
function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

// Alert when close window
function onBeforeUnload(e) {
    if (1) {
        e.preventDefault();
        e.returnValue = '';
        return;
    }

    delete e['returnValue'];
}

window.addEventListener('beforeunload', onBeforeUnload);

// leaving this window
function userCheated() {
    // The user cheated by leaving this window (e.g opening another window)
    // Do something
    leavesAreaTimes++;
    notify('Cảnh báo', `Bạn đã rời khỏi khu vực làm bài thi ${leavesAreaTimes} lần.`);
}

// handle error
const handleError = (err) => {
    console.log(err);
    notify('Lỗi', err);
}