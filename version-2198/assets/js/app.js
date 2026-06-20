(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    start();
  }

  function setupLocalFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var targets = Array.prototype.slice.call(document.querySelectorAll('.filter-targets [data-title]'));
    if (!panel || targets.length === 0) {
      return;
    }
    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var countNode = panel.querySelector('[data-filter-count]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var shown = 0;

      targets.forEach(function (node) {
        var haystack = normalize([
          node.getAttribute('data-title'),
          node.getAttribute('data-region'),
          node.getAttribute('data-year'),
          node.getAttribute('data-type'),
          node.getAttribute('data-tags'),
          node.textContent
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesRegion = !region || normalize(node.getAttribute('data-region')).indexOf(region) !== -1;
        var matchesYear = !year || normalize(node.getAttribute('data-year')).indexOf(year) !== -1;
        var matchesType = !type || normalize(node.getAttribute('data-type')).indexOf(type) !== -1;
        var visible = matchesKeyword && matchesRegion && matchesYear && matchesType;
        node.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + shown + ' / ' + targets.length + ' 条影片';
      }
    }

    [keywordInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        apply();
      });
    }

    apply();
  }

  function createMovieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">' +
        '<a class="poster-wrap" href="./' + escapeHtml(movie.file) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<img src="./' + movie.coverIndex + '.jpg" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">' +
          '<span class="play-float">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<div class="card-meta"><span>' + escapeHtml(movie.categoryName) + '</span><strong>★ ' + Number(movie.rating).toFixed(1) + '</strong></div>' +
          '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="mini-tags">' + tags + '</div>' +
          '<div class="card-foot"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupGlobalSearch() {
    var page = document.querySelector('[data-search-page]');
    if (!page || !window.MOVIE_DATA) {
      return;
    }
    var input = page.querySelector('[data-global-search-input]');
    var region = page.querySelector('[data-global-search-region]');
    var type = page.querySelector('[data-global-search-type]');
    var results = page.querySelector('[data-global-search-results]');
    var summary = page.querySelector('[data-global-search-summary]');
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function runSearch() {
      var keyword = normalize(input.value);
      var regionValue = normalize(region.value);
      var typeValue = normalize(type.value);
      var matches = window.MOVIE_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' '));
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        var regionOk = !regionValue || normalize(movie.region).indexOf(regionValue) !== -1;
        var typeOk = !typeValue || normalize(movie.type).indexOf(typeValue) !== -1;
        return keywordOk && regionOk && typeOk;
      }).slice(0, 120);

      if (!keyword && !regionValue && !typeValue) {
        matches = window.MOVIE_DATA.slice(0, 24);
      }

      results.innerHTML = matches.map(createMovieCard).join('');
      summary.textContent = '当前显示 ' + matches.length + ' 条结果；搜索页最多即时展示前 120 条，完整片库可通过分类页与排行榜继续浏览。';
    }

    if (initialKeyword) {
      input.value = initialKeyword;
    }

    [input, region, type].forEach(function (control) {
      control.addEventListener('input', runSearch);
      control.addEventListener('change', runSearch);
    });

    runSearch();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var src = player.getAttribute('data-src');
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var status = player.querySelector('[data-player-status]');
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playVideo() {
        if (!src || !video) {
          setStatus('未找到播放源');
          return;
        }
        setStatus('正在加载高清播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.play().then(function () {
            player.classList.add('is-playing');
          }).catch(function () {
            setStatus('浏览器阻止自动播放，请再次点击播放按钮');
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源解析完成，正在播放...');
            video.play().then(function () {
              player.classList.add('is-playing');
            }).catch(function () {
              setStatus('请再次点击播放器开始播放');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请刷新页面或稍后重试');
            }
          });
          return;
        }

        video.src = src;
        setStatus('当前浏览器可能不支持此播放格式，请使用新版 Safari、Chrome、Edge 或 Firefox');
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupLocalFilters();
    setupGlobalSearch();
    setupPlayers();
  });
})();
