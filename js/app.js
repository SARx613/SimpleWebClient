(function () {
  "use strict";

  /* ---------- live clock (real current time, HH:MM:SS) ---------- */
  var hora = document.getElementById("hora-time");
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var d = new Date();
    hora.textContent = "Hora " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- product icon fallbacks (SVG) ---------- */
  var ICONS = {
    beer:
      '<svg viewBox="0 0 40 56" width="32" height="44" aria-hidden="true">' +
      '<path d="M9 9 q-5 -1 -5 4 q-3 0 -3 4 q-3 1 -2 5 q1 3 5 3 l20 0 q5 0 6 -4 q3 -1 2 -5 q3 -2 1 -5 q-2 -3 -6 -2 q-2 -3 -6 -2 q-4 -3 -8 -1 q-3 -1 -4 3 z" fill="#FFFDF5"/>' +
      '<path d="M7 14 h26 l-2.5 36 a4 4 0 0 1 -4 3.6 h-13 a4 4 0 0 1 -4 -3.6 z" fill="#FBC23B" stroke="#C9CDD3" stroke-width="1.4"/>' +
      '<rect x="7" y="14" width="26" height="6" rx="1" fill="#FFF6E0" opacity="0.7"/></svg>',
    trago:
      '<svg viewBox="0 0 64 84" width="36" height="48" aria-hidden="true">' +
      '<ellipse cx="32" cy="78" rx="12" ry="2.6" fill="#dfe6ea"/>' +
      '<rect x="30.7" y="52" width="2.6" height="24" fill="#dfe6ea"/>' +
      '<path d="M13 30 a19 19 0 0 0 38 0 a19 8 0 0 0 -38 0 Z" fill="#eef6fa" stroke="#c5ccd2" stroke-width="1.3"/>' +
      '<ellipse cx="32" cy="30" rx="19" ry="6.5" fill="#f4fafd" stroke="#c5ccd2" stroke-width="1.3"/>' +
      '<rect x="24" y="34" width="9" height="9" rx="2" fill="#dff0f7" transform="rotate(12 28 38)"/>' +
      '<rect x="33" y="40" width="8" height="8" rx="2" fill="#cfe7f1" transform="rotate(-15 37 44)"/>' +
      '<rect x="27" y="44" width="7" height="7" rx="2" fill="#e7f4f9"/>' +
      '<circle cx="24" cy="27" r="5.5" fill="#ffe23d" stroke="#e9c11f" stroke-width="1"/>' +
      '<circle cx="41" cy="28" r="4.8" fill="#9bd23f" stroke="#74a82c" stroke-width="1"/></svg>'
  };

  /* ---------- product datasets ---------- */
  var SETS = [
    [
      { name: "Pinta ingreso", img: "https://assets.skipit.com.ar/60/cropped_1768234365786.webp" },
      { name: "Pinta ingreso", img: "https://assets.skipit.com.ar/60/cropped_1768234365786.webp" }
    ],
    [
      { name: "Trago ingreso", img: "images/trago-gintonic.jpeg" }
    ]
  ];
  var setIndex = 0;

  var listEl = document.getElementById("product-list");
  var countLabel = document.getElementById("count-label");
  var confirmBtn = document.getElementById("confirm-btn");

  function refresh() {
    var n = listEl.querySelectorAll(".product.is-selected").length;
    countLabel.textContent = n + (n === 1 ? " Producto" : " Productos");
    confirmBtn.disabled = n === 0;
  }

  function buildProduct(item, i) {
    var li = document.createElement("li");
    li.className = "product";
    li.style.animationDelay = (i * 0.07) + "s";

    var mediaHtml;
    if (item.img) {
      mediaHtml =
        '<div class="product__img-wrap">' +
          '<img class="product__img" src="' + item.img + '" alt="' + item.name + '" loading="lazy" />' +
        '</div>';
    } else {
      mediaHtml =
        '<div class="product__icon-wrap">' + ICONS[item.icon] + '</div>';
    }

    li.innerHTML =
      mediaHtml +
      '<div class="product__info">' +
        '<p class="product__name" translate="no">' + item.name + '</p>' +
      '</div>' +
      '<div class="product__radio">' +
        '<input type="checkbox" tabindex="-1" />' +
        '<span></span>' +
      '</div>';

    var radioInput = li.querySelector('.product__radio input');

    function toggle() {
      var sel = li.classList.toggle("is-selected");
      radioInput.checked = sel;
      refresh();
    }
    li.addEventListener("click", toggle);
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
    li.setAttribute("tabindex", "0");
    li.setAttribute("role", "checkbox");
    li.setAttribute("aria-checked", "false");

    var origToggle = toggle;
    toggle = function () {
      var sel = li.classList.toggle("is-selected");
      radioInput.checked = sel;
      li.setAttribute("aria-checked", sel ? "true" : "false");
      refresh();
    };
    li.removeEventListener("click", origToggle);
    li.addEventListener("click", toggle);
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });

    return li;
  }

  function renderProducts() {
    listEl.innerHTML = "";
    SETS[setIndex].forEach(function (item, i) {
      listEl.appendChild(buildProduct(item, i));
    });
    refresh();
  }

  document.querySelector(".chip-btn").addEventListener("click", function () {
    setIndex = (setIndex + 1) % SETS.length;
    renderProducts();
  });

  renderProducts();

  /* ---------- screen navigation ---------- */
  function show(id) {
    document.querySelectorAll(".screen").forEach(function (s) {
      if (s.id === id) {
        s.classList.remove("is-leaving");
        s.classList.add("is-active");
      } else if (s.classList.contains("is-active")) {
        s.classList.remove("is-active");
        s.classList.add("is-leaving");
        setTimeout(function () { s.classList.remove("is-leaving"); }, 450);
      }
    });
  }

  /* ---------- confirm -> build Retiro ticket ---------- */
  var retiroItems = document.getElementById("retiro-items");
  var retiroTotal = document.getElementById("retiro-total");

  confirmBtn.addEventListener("click", function () {
    if (confirmBtn.disabled) return;
    var sels = listEl.querySelectorAll(".product.is-selected");
    retiroItems.innerHTML = "";
    sels.forEach(function (li) {
      var name = li.querySelector(".product__name").textContent;
      var row = document.createElement("div");
      row.className = "ticket-card__item";
      row.innerHTML = '<span class="ticket-card__qty">1</span><span>' + name + "</span>";
      retiroItems.appendChild(row);
    });
    retiroTotal.textContent = sels.length;
    show("screen-retiro");
    resetSwipe();
  });

  /* ---------- swipe to confirm ---------- */
  var swipe = document.getElementById("swipe");
  var knob = document.getElementById("swipe-knob");
  var fill = document.getElementById("swipe-fill");
  var dragging = false, startX = 0, currentX = 0, maxX = 0, done = false;

  function paint(x, anim) {
    knob.style.transition = anim ? "left .25s ease" : "none";
    fill.style.transition = anim ? "width .25s ease" : "none";
    knob.style.left = (6 + x) + "px";
    fill.style.width = (x <= 0 ? 0 : 6 + x + knob.offsetWidth / 2) + "px";
  }

  function resetSwipe() {
    done = false;
    currentX = 0;
    paint(0, true);
  }

  function knobX(px) {
    maxX = swipe.clientWidth - knob.offsetWidth - 12;
    var x = Math.max(0, Math.min(px, maxX));
    paint(x, false);
    return x;
  }

  function pointerDown(e) {
    if (done) return;
    dragging = true;
    knob.style.transition = "none";
    startX = (e.touches ? e.touches[0].clientX : e.clientX) - currentX;
  }
  function pointerMove(e) {
    if (!dragging) return;
    var px = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
    currentX = knobX(px);
    if (e.cancelable) e.preventDefault();
  }
  function pointerUp() {
    if (!dragging) return;
    dragging = false;
    if (currentX >= maxX * 0.82) {
      done = true;
      currentX = maxX;
      paint(maxX, true);
      finish();
    } else {
      currentX = 0;
      paint(0, true);
    }
  }

  knob.addEventListener("mousedown", pointerDown);
  window.addEventListener("mousemove", pointerMove);
  window.addEventListener("mouseup", pointerUp);
  knob.addEventListener("touchstart", pointerDown, { passive: true });
  window.addEventListener("touchmove", pointerMove, { passive: false });
  window.addEventListener("touchend", pointerUp);

  function finish() {
    show("screen-loading");
    setTimeout(function () { show("screen-success"); }, 2200);
  }
})();
