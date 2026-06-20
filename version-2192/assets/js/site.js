(function() {
    var navButton = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (navButton && mobileNav) {
        navButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-nav]"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                showSlide(Number(dot.getAttribute("data-hero-nav")) || 0);
            });
        });

        window.setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]")).forEach(function(scope) {
        var input = scope.querySelector("[data-search-input]");
        var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-field]"));
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function matches(card) {
            var query = input ? normalize(input.value) : "";
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));

            if (query && haystack.indexOf(query) === -1) {
                return false;
            }

            return selects.every(function(select) {
                var field = select.getAttribute("data-filter-field");
                var selected = normalize(select.value);
                if (!selected) {
                    return true;
                }
                return normalize(card.getAttribute("data-" + field)) === selected;
            });
        }

        function applyFilters() {
            cards.forEach(function(card) {
                card.hidden = !matches(card);
            });
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }
        selects.forEach(function(select) {
            select.addEventListener("change", applyFilters);
        });
    });
}());
