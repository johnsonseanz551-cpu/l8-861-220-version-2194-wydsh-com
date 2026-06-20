(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initNavigation() {
        var button = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initGlobalSearch() {
        var forms = document.querySelectorAll(".global-search-form");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = "./search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
        show(0);
    }

    function initFilters() {
        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-filter-year]");
        var type = document.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty]");
        if (!cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        if (input && params.get("q")) {
            input.value = params.get("q");
        }
        function apply() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var y = year ? year.value : "";
            var t = type ? type.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var match = true;
                if (q && text.indexOf(q) === -1) {
                    match = false;
                }
                if (y && cardYear !== y) {
                    match = false;
                }
                if (t && cardType.indexOf(t) === -1) {
                    match = false;
                }
                card.classList.toggle("hidden-card", !match);
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        initNavigation();
        initGlobalSearch();
        initHero();
        initFilters();
    });
})();
