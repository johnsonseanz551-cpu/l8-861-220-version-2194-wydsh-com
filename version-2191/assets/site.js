(function () {
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('[data-menu-toggle]');

  if (menuButton && header) {
    menuButton.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupLibraryFilter() {
    var toolbar = document.querySelector('[data-library-toolbar]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');

    if (!toolbar || cards.length === 0) {
      return;
    }

    var input = toolbar.querySelector('[data-movie-search]');
    var buttons = Array.prototype.slice.call(toolbar.querySelectorAll('[data-filter-value]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var activeValue = '';

    if (input && query) {
      input.value = query;
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var filterValue = normalize(activeValue);
      var visible = 0;

      cards.forEach(function (card) {
        var content = normalize(card.getAttribute('data-search'));
        var keywordMatch = !keyword || content.indexOf(keyword) !== -1;
        var filterMatch = !filterValue || content.indexOf(filterValue) !== -1;
        var show = keywordMatch && filterMatch;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        activeValue = button.getAttribute('data-filter-value') || '';
        apply();
      });
    });

    apply();
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        render(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        render(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        render(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        render(dotIndex);
        start();
      });
    });

    render(0);
    start();
  }

  function setupPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));

    function playVideo(video) {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function attachSource(video, src, callback) {
      if (video.dataset.ready === '1') {
        callback();
        return;
      }

      video.dataset.ready = '1';

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', callback, { once: true });
        video.load();
        callback();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, callback);
        return;
      }

      video.src = src;
      video.addEventListener('loadedmetadata', callback, { once: true });
      video.load();
      callback();
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var player = button.closest('[data-player]');
        var video = player ? player.querySelector('video') : null;
        var src = button.getAttribute('data-hls');

        if (!video || !src) {
          return;
        }

        button.classList.add('is-hidden');
        attachSource(video, src, function () {
          playVideo(video);
        });
      });
    });
  }

  setupLibraryFilter();
  setupHeroSlider();
  setupPlayers();
})();
