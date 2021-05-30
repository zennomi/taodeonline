(function() {
    var playBtn = document.getElementById('playBtn');
    var shuffleBtn = document.getElementById('shuffleBtn');
    var musicSelect = document.getElementById('musicSelect');
    var player = SC.Widget(document.getElementById('sc-widget'));
    let soundsTotal;
    player.bind(SC.Widget.Events.READY, function() {
        playBtn.disabled = false;
        player.getSounds((sounds) => {
            shuffleBtn.disabled = false;
            soundsTotal = sounds.length;
            shuffleBtn.onclick = () => {
                player.skip(Math.floor(Math.random() * soundsTotal));
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
    player.bind(SC.Widget.Events.FINISH, () => {
        player.skip(Math.floor(Math.random() * soundsTotal));
    })
})();