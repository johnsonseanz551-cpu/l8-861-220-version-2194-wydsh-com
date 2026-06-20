(function () {
    function setup(sourceUrl) {
        var video = document.getElementById("movie-player");
        var cover = document.querySelector("[data-player-cover]");
        if (!video || !sourceUrl) {
            return;
        }
        var ready = false;
        var hls = null;
        function load() {
            if (!ready) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(sourceUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
                ready = true;
            }
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", load);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                load();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }
    window.MoviePlayer = {
        setup: setup
    };
})();
