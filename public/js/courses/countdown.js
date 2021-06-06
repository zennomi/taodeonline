(function() {
    let countDownDate = document.getElementById('countDownDate');
    let countDownHour = document.getElementById('countDownHour');
    let countDownMinute = document.getElementById('countDownMinute');
    let countDownSecond = document.getElementById('countDownSecond');
    let deadline = (new Date('2021-07-08T07:35:00')).getTime();
    let date, hour, minute, second;
    let x = setInterval(() => {
        let now = (new Date()).getTime();
        let distance = Math.floor((deadline - now) / 1000);
        console.log(distance);
        date = Math.floor(distance / (24 * 3600));
        distance -= date * 24 * 3600;

        hour = Math.floor(distance / (3600));
        distance -= hour * 3600;

        minute = Math.floor(distance / (60));
        distance -= minute * 60;

        second = Math.floor(distance);

        countDownDate.innerHTML = date;
        countDownHour.innerHTML = hour;
        countDownMinute.innerHTML = minute;
        countDownSecond.innerHTML = second;
    }, 1000);
})();