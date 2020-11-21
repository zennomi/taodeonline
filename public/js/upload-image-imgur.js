$(document).ready(function(){

    var feedback = function(res) {
    $(".snippet_image_div").empty();
    $(".imgur-link").text("");
    if (res.success === true) {
    var get_link = res.data.link.replace(/^http:\/\//i, 'https://');
    var image ='<img alt="Imgur-Upload" class="imgur-upload" src=\"' + get_link + '\"/>' ; $(".snippet_image_div").append(image); $('#snippet_image').val(get_link); $(".imgur-link").text("Imgur image Link - "+get_link);
                
       }
   };
   
   new Imgur({
       clientid: '9a613ef5317ff5c', //You can change this ClientID
       callback: feedback
   });
       
   });