(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var menu = document.querySelector('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            menu.hidden = expanded;
            button.textContent = expanded ? '☰' : '×';
        });
    }

    function setupHero() {
        var hero = document.querySelector('.hero-carousel');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var previous = hero.querySelector('.hero-control.prev');
        var next = hero.querySelector('.hero-control.next');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
                dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (!slides.length) {
            return;
        }
        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var filterInput = document.querySelector('.js-filter-input');
        var categorySelect = document.querySelector('.js-filter-category');
        var typeSelect = document.querySelector('.js-filter-type');
        var yearSelect = document.querySelector('.js-filter-year');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));
        var empty = document.querySelector('.no-results');
        if (!cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && filterInput) {
            filterInput.value = query;
        }

        function matchesYear(cardYear, selectedYear) {
            if (!selectedYear) {
                return true;
            }
            var year = parseInt(cardYear, 10);
            var selected = parseInt(selectedYear, 10);
            if (selected === 2019) {
                return year <= 2019;
            }
            return year === selected;
        }

        function apply() {
            var text = normalize(filterInput && filterInput.value);
            var category = normalize(categorySelect && categorySelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.category,
                    card.dataset.tags
                ].join(' '));
                var keep = true;
                if (text && haystack.indexOf(text) === -1) {
                    keep = false;
                }
                if (category && normalize(card.dataset.category) !== category) {
                    keep = false;
                }
                if (type && normalize(card.dataset.type).indexOf(type) === -1) {
                    keep = false;
                }
                if (!matchesYear(card.dataset.year, year)) {
                    keep = false;
                }
                card.hidden = !keep;
                if (keep) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? 'none' : 'block';
            }
        }

        [filterInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.player-play-button');
            var source = shell.dataset.videoUrl;
            var hlsInstance = null;
            if (!video || !source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }

            function toggleVideo() {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('click', toggleVideo);
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
