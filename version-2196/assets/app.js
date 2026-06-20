(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
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
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
        play();
    }

    function setupSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
        forms.forEach(function (form) {
            var input = form.querySelector("[data-search-input]");
            if (!input) {
                return;
            }
            var scope = form.closest("main") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            function apply() {
                var keyword = input.value.trim().toLowerCase();
                if (!cards.length && keyword) {
                    window.location.href = "./categories.html?q=" + encodeURIComponent(keyword);
                    return;
                }
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search-text") || card.textContent.toLowerCase();
                    card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
                });
            }
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
            input.addEventListener("input", apply);
            var params = new URLSearchParams(window.location.search);
            var preset = params.get("q");
            if (preset && cards.length) {
                input.value = preset;
                apply();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-player");
    var cover = document.querySelector("[data-player-cover]");
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-player-trigger]"));
    if (!video || !streamUrl) {
        return;
    }
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
        if (prepared) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
        video.controls = true;
        prepared = true;
    }

    function start() {
        prepare();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {});
        }
    }

    triggers.forEach(function (trigger) {
        trigger.addEventListener("click", start);
    });
    video.addEventListener("click", function () {
        if (!prepared || video.paused) {
            start();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
