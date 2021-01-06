
document.addEventListener("DOMContentLoaded", function () {

    var feedback = function (res) {
        document.querySelector(".snippet_image_div").innerHTML = "";
        document.querySelector(".imgur-link").innerText = "";
        if (res.success === true) {
            var get_link = res.data.link.replace(/^http:\/\//i, 'https://');
            var image = '<img alt="Imgur-Upload" class="imgur-upload" src=\"' + get_link + '\"/>'; 
            document.querySelector(".snippet_image_div").innerHTML += (image); 
            document.querySelector(".imgur-link").innerText = (get_link);

        }
    };

    new Imgur({
        clientid: '9a613ef5317ff5c', //You can change this ClientID
        callback: feedback
    });
});

