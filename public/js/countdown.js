var toastElList = [].slice.call(document.querySelectorAll('.toast'));
var toastList = toastElList.map(function (toastEl) {
  return new bootstrap.Toast(toastEl, {})
})

function notify(index, content) {
    toastElList[index].querySelector(".toast-body").innerHTML = content;
    toastList[index].show();
}

function countdown() {
    notify(0, "Bắt đầu giờ làm bài.");
    notify(1, "Bạn có thể nhấn vào thanh thời gian để xem thời gian còn lại.");
    var totalTimes = Number(document.getElementById('totalTimes').innerHTML)*60*1000;
    var progressBtn = document.getElementById('progress-btn');
    
    countDownDate = new Date().getTime() + totalTimes;
    var x = setInterval(function () {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Output the result in an element with id="demo"
        progressBtn.dataset.lefttime = minutes + " phút " + seconds + " giây";
        progressBtn.style.width = 100 - distance / totalTimes * 100 + "%";
        document.getElementById('leftTimes').innerHTML = minutes + " phút " + seconds + " giây";
        // If the count down is over, write some text 
        if (distance < 0) {
            clearInterval(x);
            notify(0, `Hết giờ!!!`);
            document.getElementById("submit").click();
        }
    }, 1000);

    progressBtn.parentNode.addEventListener("click", function() {
        
        notify(0, `Còn ${progressBtn.dataset.lefttime}`);
    })
    document.getElementById("submit").addEventListener("click", function() {
        progressBtn.parentNode.remove();
        clearInterval(x);
    })
}
// Update the count down every 1 second
