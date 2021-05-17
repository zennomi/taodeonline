function countdown() {

    notify("Thời gian", "Bắt đầu giờ làm bài.");
    notify("Tips", "Bạn có thể vào menu để xem thời gian còn lại.");
    var progressBtn = document.getElementById('progress-btn');
    let leftTimeElement = document.getElementById('leftTime');
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
        let timeStr = minutes + " phút " + seconds + " giây";
        leftTimeElement.innerHTML = timeStr;
        document.getElementById('leftTimes').innerHTML = minutes + " phút " + seconds + " giây";
        progressBtn.style.width = 100 - distance / totalTimes * 100 + "%";

        // If the count down is over, write some text 
        if (Math.round(distance/1000) % (5*60) == 0) {
            notify("Thời gian","Còn " + timeStr);
            submitChoices(0);
        }
        if (Math.round(distance/1000) == (5*60)) {
            notify("Nhắc nhở nho nhỏ", "Lúc này thì nên bắt đầu tô đáp án nhó. Bỏ câu khó đi mà làm người.");
        }
        if (distance <= 1) {
            clearInterval(x);
            notify("Thời gian", `Hết giờ!!!`);
            document.getElementById("submit").click();
        }
    }, 1000);

    document.getElementById("submit").addEventListener("click", function() {
        progressBtn.parentNode.remove();
        clearInterval(x);
    })
}
// Update the count down every 1 second
