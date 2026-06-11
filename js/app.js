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

  /* ---------- product icons (SVG) ---------- */
  var ICONS = {
    beer:
      '<svg viewBox="0 0 40 56" width="32" height="44" aria-hidden="true">' +
      '<path d="M9 9 q-5 -1 -5 4 q-3 0 -3 4 q-3 1 -2 5 q1 3 5 3 l20 0 q5 0 6 -4 q3 -1 2 -5 q3 -2 1 -5 q-2 -3 -6 -2 q-2 -3 -6 -2 q-4 -3 -8 -1 q-3 -1 -4 3 z" fill="#FFFDF5"/>' +
      '<path d="M7 14 h26 l-2.5 36 a4 4 0 0 1 -4 3.6 h-13 a4 4 0 0 1 -4 -3.6 z" fill="#FBC23B" stroke="#C9CDD3" stroke-width="1.4"/>' +
      '<rect x="7" y="14" width="26" height="6" rx="1" fill="#FFF6E0" opacity="0.7"/></svg>',
    bottle:
      '<svg viewBox="0 0 40 56" width="28" height="44" aria-hidden="true">' +
      '<rect x="15.5" y="3" width="9" height="6" rx="1.5" fill="#2e6db4"/>' +
      '<rect x="16.5" y="8.5" width="7" height="5" fill="#e3eaee"/>' +
      '<path d="M14.5 13.5 q-3.2 2 -3.2 7 v25 q0 4 4 4 h9.4 q4 0 4 -4 v-25 q0 -5 -3.2 -7 z" fill="#eef3f6" stroke="#c5ccd2" stroke-width="1.3"/>' +
      '<rect x="10.8" y="30" width="18.4" height="10" rx="1" fill="#3b82c4"/>' +
      '<rect x="15" y="18" width="2.4" height="20" rx="1.2" fill="#ffffff" opacity="0.65"/></svg>',
    cocktail:
      '<svg viewBox="0 0 44 56" width="30" height="44" aria-hidden="true">' +
      '<path d="M8 15 a14 13 0 0 0 28 0 z" fill="#f7d98a" stroke="#c7ced3" stroke-width="1.3"/>' +
      '<ellipse cx="22" cy="15" rx="14" ry="3.2" fill="#fbe7ad" stroke="#c7ced3" stroke-width="1"/>' +
      '<rect x="21" y="28" width="2" height="17" fill="#c7ced3"/>' +
      '<ellipse cx="22" cy="47" rx="9" ry="2.4" fill="#c7ced3"/>' +
      '<path d="M27 9 l5 -5" stroke="#7cc47a" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };

  /* ---------- product datasets (Todos toggles between them) ---------- */
  var SETS = [
    [
      { name: "Pinta ingreso", icon: "beer" },
      { name: "Pinta ingreso", icon: "beer" }
    ],
    [
      { name: "Bebida sin alcohol ingreso", icon: "bottle" },
      { name: "Bebida sin alcohol ingreso", icon: "bottle" },
      { name: "Bebida sin alcohol ingreso", icon: "bottle" },
      { name: "Trago ingreso", icon: "cocktail" }
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
    li.innerHTML =
      '<span class="product__icon">' + ICONS[item.icon] + "</span>" +
      '<span class="product__name">' + item.name + "</span>" +
      '<span class="checkbox" role="checkbox" aria-checked="false" tabindex="0">' +
        '<svg class="checkbox__tick" viewBox="0 0 24 24" width="16" height="16"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</span>";

    function toggle() {
      var box = li.querySelector(".checkbox");
      var sel = li.classList.toggle("is-selected");
      box.setAttribute("aria-checked", sel ? "true" : "false");
      refresh();
    }
    li.addEventListener("click", toggle);
    li.querySelector(".checkbox").addEventListener("keydown", function (e) {
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

  /* ---------- confirm -> build Retiro ticket from selection ---------- */
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
    // No dark fill at rest; it appears and trails the knob as soon as you slide.
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
