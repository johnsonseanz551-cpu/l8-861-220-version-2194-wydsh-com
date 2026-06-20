(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

    inputs.forEach(function (input) {
      var list = document.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }

      var items = Array.prototype.slice.call(list.children).filter(function (child) {
        return child.nodeType === 1;
      });
      var empty = document.createElement('div');
      empty.className = 'empty-filter-message';
      empty.textContent = '没有找到匹配的影片，请尝试更换关键词。';

      function applyFilter() {
        var keyword = normalizeText(input.value);
        var visibleCount = 0;

        items.forEach(function (item) {
          if (item.classList.contains('empty-filter-message')) {
            return;
          }
          var haystack = normalizeText(item.getAttribute('data-search') || item.textContent);
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          item.classList.toggle('is-hidden-by-filter', !matched);
          if (matched) {
            visibleCount += 1;
          }
        });

        if (visibleCount === 0 && keyword) {
          if (!empty.parentNode) {
            list.appendChild(empty);
          }
        } else if (empty.parentNode) {
          empty.parentNode.removeChild(empty);
        }
      }

      if (input.hasAttribute('data-query-param')) {
        var params = new URLSearchParams(window.location.search);
        var queryName = input.getAttribute('data-query-param') || 'q';
        var value = params.get(queryName);
        if (value) {
          input.value = value;
        }
      }

      input.addEventListener('input', applyFilter);
      applyFilter();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.video-play-button');
      var source = player.getAttribute('data-src') || (video && video.getAttribute('data-src'));
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (video.src !== source) {
            video.src = source;
          }
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          }
          return Promise.resolve();
        }

        if (video.src !== source) {
          video.src = source;
        }
        return Promise.resolve();
      }

      function startPlayback() {
        attachSource().then(function () {
          var playAttempt = video.play();
          if (playAttempt && typeof playAttempt.catch === 'function') {
            playAttempt.catch(function () {
              player.classList.remove('is-playing');
            });
          }
          player.classList.add('is-playing');
        });
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
          player.classList.remove('is-playing');
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
    });
  }

  setupHeroCarousel();
  setupFilters();
  setupPlayers();
})();
