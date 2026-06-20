(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function show(next) {
        if (!slides.length) {
          return;
        }
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

      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
    });

    document.querySelectorAll("[data-filter-area]").forEach(function (area) {
      var input = area.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));
      var buttons = Array.prototype.slice.call(area.querySelectorAll("[data-filter-button]"));
      var type = "全部";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-keywords") || card.textContent || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var typeOk = type === "全部" || cardType.indexOf(type) !== -1 || text.indexOf(type.toLowerCase()) !== -1;
          var queryOk = !query || text.indexOf(query) !== -1;
          card.classList.toggle("hidden-card", !(typeOk && queryOk));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button, i) {
        if (i === 0) {
          button.classList.add("is-active");
        }
        button.addEventListener("click", function () {
          type = button.getAttribute("data-filter-value") || "全部";
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          apply();
        });
      });
    });
  });
}());
