(function () {
  "use strict";

  var selected = new Set();

  /* ---------- screen navigation ---------- */
  function show(id) {
    var screens = document.querySelectorAll(".screen");
    screens.forEach(function (s) {
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

  /* ---------- product selection ---------- */
  var products = document.querySelectorAll(".product");
  var countLabel = document.getElementById("count-label");
  var confirmBtn = document.getElementById("confirm-btn");

  function refresh() {
    var n = selected.size;
    countLabel.textContent = n + (n === 1 ? " Producto" : " Productos");
    confirmBtn.disabled = n === 0;
  }

  function toggle(li) {
    var id = li.getAttribute("data-id");
    var box = li.querySelector(".checkbox");
    if (selected.has(id)) {
      selected.delete(id);
      li.classList.remove("is-selected");
      box.setAttribute("aria-checked", "false");
    } else {
      selected.add(id);
      li.classList.add("is-selected");
      box.setAttribute("aria-checked", "true");
    }
    refresh();
  }

  products.forEach(function (li) {
    li.addEventListener("click", function () { toggle(li); });
    var box = li.querySelector(".checkbox");
    box.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(li); }
    });
  });

  confirmBtn.addEventListener("click", function () {
    if (confirmBtn.disabled) return;
    show("screen-retiro");
    resetSwipe();
  });

  /* ---------- swipe to confirm ---------- */
  var swipe = document.getElementById("swipe");
  var knob = document.getElementById("swipe-knob");
  var fill = document.getElementById("swipe-fill");
  var dragging = false, startX = 0, currentX = 0, maxX = 0, done = false;

  function paint(x, anim) {
    var t = anim ? "left .25s ease" : "none";
    var tf = anim ? "width .25s ease" : "none";
    knob.style.transition = t;
    fill.style.transition = tf;
    knob.style.left = (6 + x) + "px";
    fill.style.width = (6 + x + knob.offsetWidth / 2) + "px";
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
    setTimeout(function () {
      show("screen-success");
    }, 2200);
  }
})();
