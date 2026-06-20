(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll(".js-filter-list"));
    if (!lists.length) {
      return;
    }
    var textInput = document.querySelector(".js-page-filter");
    var selects = Array.prototype.slice.call(document.querySelectorAll(".js-filter-select"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (textInput && query) {
      textInput.value = query;
    }

    function matchesSelect(card, select) {
      var key = select.getAttribute("data-filter-key");
      var value = select.value;
      if (!key || !value) {
        return true;
      }
      return (card.getAttribute("data-" + key) || "").indexOf(value) !== -1;
    }

    function apply() {
      var text = textInput ? textInput.value.trim().toLowerCase() : "";
      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-row"));
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var textOk = !text || haystack.indexOf(text) !== -1;
          var selectOk = selects.every(function (select) {
            return matchesSelect(card, select);
          });
          card.classList.toggle("is-hidden", !(textOk && selectOk));
        });
      });
    }

    if (textInput) {
      textInput.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    apply();
  }

  window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(buttonId);
    if (!video || !cover || !sourceUrl) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;

    function attachStream() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
        });
      }
      video.src = sourceUrl;
      return Promise.resolve();
    }

    function play() {
      cover.classList.add("is-hidden");
      attachStream().then(function () {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      });
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
