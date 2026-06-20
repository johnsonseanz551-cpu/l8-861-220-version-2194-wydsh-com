function setupMoviePlayer(streamUrl, videoId, buttonId, layerId) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var layer = document.getElementById(layerId);
  var loaded = false;
  var hls = null;

  function loadVideo() {
    if (!video || loaded) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      loaded = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      loaded = true;
      return;
    }
    video.src = streamUrl;
    loaded = true;
  }

  function startPlayback() {
    loadVideo();
    if (layer) {
      layer.classList.add("is-hidden");
    }
    if (video) {
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
        });
      }
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      startPlayback();
    });
  }

  if (layer) {
    layer.addEventListener("click", function () {
      startPlayback();
    });
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        startPlayback();
      }
    });
  }
}
