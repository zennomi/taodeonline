(function () {
    var playBtn = document.getElementById('playBtn');
    var shuffleBtn = document.getElementById('shuffleBtn');
    var musicSelect = document.getElementById('musicSelect');
    var player = SC.Widget(document.getElementById('sc-widget'));
    player.bind(SC.Widget.Events.READY, function () {
        playBtn.disabled = false;
        player.getSounds((sounds) => {
            shuffleBtn.disabled = false;
            shuffleBtn.onclick = () => {
                let index = Math.floor(Math.random()*sounds.length);
                player.skip(index);
            }
        });
        musicSelect.addEventListener('change', (e) => {
            player.load(e.target.value, {
                callback: () => {
                    player.toggle();
                }
            });
        })
    }); //Set info on load
    playBtn.onclick = () => {
        player.toggle();
    }

    player.bind(SC.Widget.Events.PLAY, () => {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    })
    player.bind(SC.Widget.Events.PAUSE, () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    })
    player.bind(SC.Widget.Events.LOAD_PROGRESS, () => {
        playBtn.innerHTML = '<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>';
    })
})();