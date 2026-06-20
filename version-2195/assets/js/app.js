(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

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

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function bindMovieFilter() {
    var list = document.querySelector('[data-movie-list]');
    var searchInput = document.querySelector('[data-movie-search]');
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));

    if (!list || (!searchInput && !filters.length)) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var selected = {};

      filters.forEach(function (filter) {
        selected[filter.getAttribute('data-filter')] = normalize(filter.value);
      });

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));

        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesFilters = Object.keys(selected).every(function (key) {
          if (!selected[key]) {
            return true;
          }

          return normalize(card.getAttribute('data-' + key)).indexOf(selected[key]) !== -1;
        });

        card.classList.toggle('is-hidden-by-filter', !(matchesKeyword && matchesFilters));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    filters.forEach(function (filter) {
      filter.addEventListener('change', applyFilter);
    });
  }

  function bindRankFilter() {
    var list = document.querySelector('[data-rank-list]');
    var input = document.querySelector('[data-rank-search]');

    if (!list || !input) {
      return;
    }

    var rows = Array.prototype.slice.call(list.querySelectorAll('.rank-row'));

    input.addEventListener('input', function () {
      var keyword = normalize(input.value);

      rows.forEach(function (row) {
        var haystack = normalize([
          row.getAttribute('data-title'),
          row.getAttribute('data-region'),
          row.getAttribute('data-year'),
          row.getAttribute('data-genre'),
          row.getAttribute('data-tags'),
          row.textContent
        ].join(' '));

        row.classList.toggle('is-hidden-by-filter', keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }

  function bindPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('[data-player-cover]');
      var hlsInstance = null;
      var prepared = false;

      if (!video) {
        return;
      }

      function prepare() {
        if (prepared) {
          return Promise.resolve();
        }

        prepared = true;
        var source = video.getAttribute('data-video');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.load();
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                resolve();
              }
            });
          });
        }

        video.src = source;
        video.load();
        return Promise.resolve();
      }

      function play() {
        prepare().then(function () {
          if (cover) {
            cover.classList.add('is-hidden');
          }

          var promise = video.play();

          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              if (cover) {
                cover.classList.remove('is-hidden');
              }
            });
          }
        });
      }

      if (cover) {
        cover.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (cover && video.currentTime === 0) {
          cover.classList.remove('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  bindMovieFilter();
  bindRankFilter();
  bindPlayers();
})();
