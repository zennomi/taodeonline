var countdownCtrl, countDownDate, distance;
var progressBtn = document.getElementById('progress-btn');

function countdown(totalTimes) {

    notify("Thời gian", "Bắt đầu giờ làm bài.");
    notify("Tips", "Khám phá chức năng thú vị ở menu mới nhé.");
    let leftTimeElement = document.getElementById('leftTime');
    countDownDate = new Date().getTime() + totalTimes;

    countdownCtrl = setInterval(function() {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Output the result in an element with id="demo"
        let timeStr = minutes + " phút " + seconds + " giây";
        leftTimeElement.innerHTML = timeStr;
        document.getElementById('leftTimes').innerHTML = minutes + " phút " + seconds + " giây";
        progressBtn.style.width = 100 - distance / totalTimes * 100 + "%";

        // If the count down is over, write some text 
        if (Math.round(distance / 1000) % (5 * 60) == 0) {
            notify("Thời gian", "Còn " + timeStr);
            submitChoices(0);
        }
        if (Math.round(distance / 1000) == (5 * 60)) {
            notify("Nhắc nhở nho nhỏ", "Còn mỗi 5 phút...");
        }
        if (distance < 1000) {
            clearInterval(countdownCtrl);
            notify("Thời gian", `Hết giờ!!!`);
            submitTest();
        }
    }, 1000);
}
// Update the count down every 1 second