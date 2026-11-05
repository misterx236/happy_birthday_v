// Анимация торта: коржи падают по очереди сверху вниз,
// затем падают розовые свечи и загораются, в конце появляется надпись.

var loaded = false;

function init() {
  if (loaded) return;
  loaded = true;

  var canvas = document.getElementById("heart");
  var ctx = canvas.getContext("2d");
  var dpr = window.devicePixelRatio || 1;

  var W, H, s;          // ширина, высота, масштаб элементов
  var pieces = [];      // коржи
  var candles = [];     // свечи
  var sprinkles = [];   // посыпка на верхнем коржике
  var startTime = 0;
  var lastFrame = 0;
  var t = 0;            // время анимации в секундах
  var textFont = "";

  var G = 0;            // гравитация (зависит от масштаба)
  var CANDLE_COUNT = 15;
  var CANDLE_DELAY = 5.0; // когда начинают падать свечи
  var CANDLE_STEP = 0.2;  // интервал между свечами

  var LAYER_COLORS = [
    { body: "#f6d3a6", frost: "#ff8fb1" }, // нижний корж
    { body: "#f9dcb8", frost: "#ffb3c9" }, // средний корж
    { body: "#fbe6cc", frost: "#ffc2d6" }  // верхний корж
  ];

  function resize() {
    W = innerWidth;
    H = innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  // Строим торт заново (при старте и при изменении размера окна)
  function build() {
    s = Math.min(W / 700, H / 800);
    if (s < 0.5) s = 0.5;
    G = 1800 * s;

    var baseY = H * 0.78;        // низ нижнего коржа
    var cx = W / 2;

    // Размеры коржей: ширина и высота
    var sizes = [
      { w: 340 * s, h: 80 * s, delay: 0.5 },
      { w: 240 * s, h: 68 * s, delay: 2.0 },
      { w: 170 * s, h: 58 * s, delay: 3.5 }
    ];

    pieces = [];
    var targetTop = baseY;
    for (var i = 0; i < sizes.length; i++) {
      targetTop -= sizes[i].h;   // верхняя граница этого коржа
      pieces.push({
        cx: cx,
        w: sizes[i].w,
        h: sizes[i].h,
        delay: sizes[i].delay,
        target: targetTop,
        y: -sizes[i].h - 200 * s,
        vy: 0,
        bounces: 0,
        landed: false,
        landedAt: 0,
        colors: LAYER_COLORS[i]
      });
    }

    // Свечи: ставятся на верхний корж
    var top = pieces[pieces.length - 1];
    var candleH = 46 * s;
    var spacing = (top.w * 0.85) / (CANDLE_COUNT - 1);
    candles = [];
    for (var c = 0; c < CANDLE_COUNT; c++) {
      candles.push({
        x: top.cx - top.w * 0.425 + c * spacing,
        w: 7 * s,
        h: candleH,
        delay: CANDLE_DELAY + c * CANDLE_STEP,
        target: top.target - candleH + 4 * s,
        y: -candleH - 200 * s,
        vy: 0,
        bounces: 0,
        landed: false,
        landedAt: 0,
        seed: Math.random() * 10
      });
    }

    // Посыпка на верхнем коржике (фиксированные точки)
    sprinkles = [];
    for (var k = 0; k < 14; k++) {
      sprinkles.push({
        x: (Math.random() - 0.5) * top.w * 0.8,
        y: top.target + 6 * s + Math.random() * 18 * s,
        color: ["#ff4d6d", "#ffd93d", "#4d96ff", "#6bcb77", "#c77dff"][k % 5],
        angle: Math.random() * Math.PI
      });
    }

    textFont = Math.round(Math.min(44 * s, (W * 0.9) / 13)) + "px Arial";

    t = 0;
    startTime = 0;
  }

  // Физика падения: гравитация, отскок от цели
  function fall(p, dt) {
    if (t < p.delay || p.landed) return;
    p.vy += G * dt;
    p.y += p.vy * dt;
    if (p.y >= p.target) {
      p.y = p.target;
      if (p.vy > 200 * s && p.bounces < 2) {
        p.vy = -p.vy * 0.25;   // небольшой отскок
        p.bounces++;
      } else {
        p.vy = 0;
        p.landed = true;
        p.landedAt = t;
      }
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Рисуем один корж: тело + розовая глазурь с подтёками
  function drawLayer(p) {
    var x = p.cx - p.w / 2;
    var y = p.y;

    // Тело коржа
    ctx.fillStyle = p.colors.body;
    roundRect(x, y, p.w, p.h, 10 * s);
    ctx.fill();

    // Глазурь сверху
    var fh = p.h * 0.32;
    ctx.fillStyle = p.colors.frost;
    roundRect(x, y, p.w, fh, 10 * s);
    ctx.fill();

    // Подтёки глазури
    var drips = Math.max(4, Math.round(p.w / (34 * s)));
    var step = p.w / drips;
    for (var d = 0; d < drips; d++) {
      var dx = x + step * (d + 0.5);
      var len = (6 + ((d * 37) % 10)) * s;
      ctx.beginPath();
      ctx.arc(dx, y + fh, step * 0.28, 0, Math.PI);
      ctx.fill();
      ctx.fillRect(dx - step * 0.28, y + fh - 1, step * 0.56, len);
      ctx.beginPath();
      ctx.arc(dx, y + fh + len, step * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Посыпка на верхнем коржике
  function drawSprinkles(top) {
    for (var i = 0; i < sprinkles.length; i++) {
      var sp = sprinkles[i];
      ctx.save();
      ctx.translate(top.cx + sp.x, sp.y);
      ctx.rotate(sp.angle);
      ctx.fillStyle = sp.color;
      ctx.fillRect(-4 * s, -1.5 * s, 8 * s, 3 * s);
      ctx.restore();
    }
  }

  // Свеча: розовый корпус, фитилёк и пламя
  function drawCandle(c, index) {
    if (t < c.delay) return;

    // Корпус
    ctx.fillStyle = "#ff7eb3";
    roundRect(c.x - c.w / 2, c.y, c.w, c.h, 2 * s);
    ctx.fill();
    // Блик
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(c.x - c.w / 2 + 1 * s, c.y + 4 * s, 1.5 * s, c.h - 10 * s);

    // Фитилёк
    var wickTop = c.y - 5 * s;
    ctx.strokeStyle = "#3a2a2a";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x, wickTop);
    ctx.stroke();

    // Пламя появляется после того, как свеча села
    if (!c.landed) return;
    var lit = t - c.landedAt - 0.3;
    if (lit <= 0) return;
    var alpha = Math.min(1, lit / 0.5);
    drawFlame(c.x, wickTop, index, c.seed, alpha);
  }

  function drawFlame(x, y, index, seed, alpha) {
    var flicker = Math.sin(t * 12 + index + seed) * 1.5 * s;
    var height = (22 + 3 * Math.sin(t * 17 + seed)) * s;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(255, 160, 60, 0.9)";
    ctx.shadowBlur = 18 * s;

    var grad = ctx.createRadialGradient(x, y - height * 0.4, 0, x, y - height * 0.4, height);
    grad.addColorStop(0, "#fff7b0");
    grad.addColorStop(0.5, "#ffb347");
    grad.addColorStop(1, "rgba(255, 90, 40, 0)");
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - 7 * s, y - height * 0.5, x + flicker, y - height);
    ctx.quadraticCurveTo(x + 7 * s, y - height * 0.5, x, y);
    ctx.fill();
    ctx.restore();
  }

  // Надпись внизу, появляется после зажигания всех свечей
  function drawText() {
    var lastLit = candles[candles.length - 1].landedAt + 0.3;
    if (!candles[candles.length - 1].landed || t < lastLit + 0.5) return;
    var alpha = Math.min(1, (t - lastLit - 0.5) / 1.5);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "bold " + textFont;
    ctx.fillStyle = "#ff4d6d";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 6;
    ctx.fillText("С днем рождения, Вика!", W / 2, H * 0.78 + 80 * s);
    ctx.restore();
  }

  function frame(now) {
    if (!lastFrame) lastFrame = now;
    var dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    t += dt;

    // Фон
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#ffe6f0");
    bg.addColorStop(1, "#fff7fb");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Коржи падают по очереди
    for (var i = 0; i < pieces.length; i++) fall(pieces[i], dt);

    // Свечи падают после коржей
    for (var c = 0; c < candles.length; c++) fall(candles[c], dt);

    // Рисуем: нижний корж первым, потом верхние
    for (var j = 0; j < pieces.length; j++) {
      if (t >= pieces[j].delay) drawLayer(pieces[j]);
    }
    drawSprinkles(pieces[pieces.length - 1]);

    for (var k = 0; k < candles.length; k++) {
      drawCandle(candles[k], k);
    }

    drawText();
    window.requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  window.requestAnimationFrame(frame);
}

function continueMusic() {
  const music = document.getElementById("backgroundMusic");

  const isMusicPlaying = localStorage.getItem("musicPlaying") === "true";
  const musicCurrentTime = localStorage.getItem("musicCurrentTime") || 0;

  if (music) {
    if (isMusicPlaying) {
      music.currentTime = parseFloat(musicCurrentTime);
      music.play().catch((error) =>
        console.log("Music playback failed", error)
      );
    }
  }

  document.addEventListener("click", function startMusic() {
    if (music && !isMusicPlaying) {
      music.play().catch((error) => console.log("Autoplay prevented", error));
      document.removeEventListener("click", startMusic);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  init();
  continueMusic();
});
