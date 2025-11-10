/*
  Romantic Birthday Surprise - JS Interactions

  What this file handles:
  - Date validation and unlock transition
  - Floating hearts background
  - Confetti/heart burst on unlock and when making a wish
  - Cake candle flame blow-out and optional whoosh sound
  - Button color/text change (Make a Wish -> Wish Made)
  - Scroll fade-in for story cards and gallery items
  - Love letter envelope open and typewriter reveal
  - Optional background music toggle after unlock

  How to change the unlock date:
  - Update the constant UNLOCK_DATE_ISO below. Format must be YYYY-MM-DD.
  - Current default: 2006-11-11 (11 Nov 2006)

  How to customize the cake flame/smoke:
  - See CSS classes `.candle__flame` and `.candle__smoke` in style.css
  - JS toggles classes `off` for flame and `show` for smoke

  How to replace gallery images or edit texts:
  - Replace <img src="..."> in index.html #memories
  - Update Love Story text in index.html #story
  - Update Love Letter text in the `LOVE_LETTER_TEXT` template below
*/

const UNLOCK_DATE_ISO = "2006-11-11"; // YYYY-MM-DD

const unlockPage = document.getElementById("unlock");
const mainPage = document.getElementById("main");
const birthdayInput = document.getElementById("birthdayInput");
const unlockBtn = document.getElementById("unlockBtn");
const unlockMessage = document.getElementById("unlockMessage");

const wishBtn = document.getElementById("wishBtn");
const flames = document.querySelectorAll(".candle__flame");
const smokes = document.querySelectorAll(".candle__smoke");
const whoosh = document.getElementById("whoosh");

const revealGiftBtn = document.getElementById("revealGiftBtn");
const envelope = document.getElementById("envelope");
const envelopeFlap = document.getElementById("envelopeFlap");
const letterPaper = document.getElementById("letterPaper");
const letterText = document.getElementById("letterText");
// Full-screen overlay elements
const letterOverlay = document.getElementById("letterOverlay");
const overlayLetter = document.getElementById("overlayLetter");
const overlayClose = document.getElementById("overlayClose");

const musicControls = document.getElementById("musicControls");
const musicToggle = document.getElementById("musicToggle");
const bgm = document.getElementById("bgm");

// Store the typewriter timer to prevent multiple instances
let typewriterTimer = null;

const LOVE_LETTER_TEXT = `My Love,

On your special day, I want to remind you how I deeply love and cherish you.
You are my lily among the thorns, my sunshine in the rain, my everything. Your smile lights up my world, your kindness inspires me, and your heart is my home.
Thank you for all the joy you gave me and I pray the Lord blesses you for all the smiles you continue to put on peoples' faces.
No matter what life throws at us, As long as we choose to be by each other's side, we will always get through it together — always and forever.

Happy Birthday, Nae Saengi. `;

// Smooth show/hide main section
function unlockExperience() {
  unlockPage.classList.remove("page--active");
  unlockPage.classList.add("page--hidden");
  mainPage.classList.remove("page--hidden");
  mainPage.classList.add("page--active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  heartConfettiBurst(window.innerWidth / 2, 80);
  // Reveal music controls and try to autoplay softly
  musicControls.setAttribute("aria-hidden", "false");
  tryPlayMusic();
}

function validateDateAndUnlock() {
  const val = birthdayInput.value; // expects YYYY-MM-DD
  if (val === UNLOCK_DATE_ISO) {
    unlockMessage.textContent = "";
    unlockExperience();
  } else {
    unlockMessage.textContent = "You've shaa!!! Try again 😅";
    const card = document.querySelector(".card--unlock");
    card.classList.remove("shake");
    // reflow
    void card.offsetWidth;
    card.classList.add("shake");
  }
}

unlockBtn.addEventListener("click", validateDateAndUnlock);
birthdayInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") validateDateAndUnlock();
});

// Floating hearts background
const heartsContainer = document.getElementById("floating-hearts-container");
function spawnFloatingHeart() {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = "❤";
  const size = Math.random() * 18 + 12; // 12-30px
  const left = Math.random() * 100; // vw
  const duration = Math.random() * 8 + 10; // 10-18s
  const delay = Math.random() * 3;
  heart.style.fontSize = size + "px";
  heart.style.left = left + "vw";
  heart.style.bottom = "-40px";
  heart.style.animationDuration = duration + "s";
  heart.style.animationDelay = delay + "s";
  heart.style.opacity = (Math.random() * 0.5 + 0.3).toFixed(2);
  heartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), (duration + delay) * 1000);
}
setInterval(spawnFloatingHeart, 900);
for (let i = 0; i < 12; i++) setTimeout(spawnFloatingHeart, i * 250);

// Heart confetti burst
function heartConfettiBurst(x, y) {
  const count = 26;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "heart";
    el.textContent = Math.random() > 0.5 ? "❤" : "💖";
    const size = Math.random() * 10 + 10;
    el.style.fontSize = size + "px";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.position = "fixed";
    el.style.animation = "none";
    el.style.opacity = "1";
    document.body.appendChild(el);
    const angle = (Math.PI * 2 * i) / count;
    const velocity = 2 + Math.random() * 4;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    let life = 0;
    const gravity = 0.05;
    const timer = setInterval(() => {
      life += 1;
      x += vx;
      y += vy;
      // gravity
      y += gravity * life;
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.opacity = String(Math.max(0, 1 - life / 60));
      if (life > 60) {
        clearInterval(timer);
        el.remove();
      }
    }, 16);
  }
}

// Cake wish logic
let wishMade = false;
wishBtn.addEventListener("click", (e) => {
  if (wishMade) return;
  wishMade = true;
  // Blow out all flames with a tiny stagger
  flames.forEach((f, i) => setTimeout(() => f.classList.add("off"), i * 80));
  smokes.forEach((s, i) => setTimeout(() => s.classList.add("show"), i * 80));
  // Play whoosh quietly
  try { whoosh.currentTime = 0; whoosh.volume = 0.4; whoosh.play(); } catch {}
  // Button style
  wishBtn.classList.add("success");
  wishBtn.textContent = "Wish Made !!!";
  // Confetti hearts at cake area
  const rect = e.currentTarget.getBoundingClientRect();
  heartConfettiBurst(rect.left + rect.width / 2, rect.top);
});

// Reveal-on-scroll for story and gallery
const revealEls = document.querySelectorAll(".reveal-on-scroll, .story-card, .gallery__item");
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("revealed");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => io.observe(el));

// Love letter: open envelope then full-screen overlay with typewriter
revealGiftBtn.addEventListener("click", () => {
  envelope.classList.add("open");
  // Show overlay after flap animation
  setTimeout(() => {
    openOverlayLetter();
  }, 600);
});

function openOverlayLetter() {
  if (!letterOverlay) return;
  letterOverlay.classList.remove("overlay--hidden");
  letterOverlay.setAttribute("aria-hidden", "false");
  // Fill and typewriter the big letter content
  typewriter(overlayLetter, LOVE_LETTER_TEXT, 16);
}

function closeOverlayLetter() {
  if (!letterOverlay) return;
  // Clear any running typewriter animation
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
  letterOverlay.classList.add("overlay--hidden");
  letterOverlay.setAttribute("aria-hidden", "true");
  if (overlayLetter) overlayLetter.textContent = "";
}

overlayClose?.addEventListener("click", closeOverlayLetter);

function typewriter(target, text, speed = 20) {
  // Clear any existing typewriter animation
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
  
  target.textContent = "";
  let i = 0;
  typewriterTimer = setInterval(() => {
    target.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }
  }, speed);
}

// Cursor heart particles near buttons
function attachCursorHearts(el) {
  let on = false;
  let moveHandler;
  el.addEventListener("mouseenter", () => {
    on = true;
    moveHandler = (e) => {
      if (!on) return;
      const h = document.createElement("div");
      h.className = "heart";
      h.textContent = Math.random() > 0.5 ? "❤" : "💗";
      h.style.position = "fixed";
      h.style.left = e.clientX + "px";
      h.style.top = e.clientY + "px";
      h.style.fontSize = (10 + Math.random() * 10) + "px";
      h.style.animation = "none";
      document.body.appendChild(h);
      let life = 0;
      const timer = setInterval(() => {
        life++;
        h.style.transform = `translateY(${-life * 1.2}px)`;
        h.style.opacity = String(Math.max(0, 1 - life / 30));
        if (life > 30) { clearInterval(timer); h.remove(); }
      }, 16);
    };
    document.addEventListener("mousemove", moveHandler);
  });
  el.addEventListener("mouseleave", () => {
    on = false;
    document.removeEventListener("mousemove", moveHandler);
  });
}

document.querySelectorAll(".btn").forEach(attachCursorHearts);

// Optional music control
function tryPlayMusic() {
  if (!bgm) return;
  // Some browsers require user interaction; the unlock click counts.
  bgm.volume = 0.35;
  bgm.play().then(() => {
    musicToggle.textContent = "♫ Pause Music";
  }).catch(() => {
    // If blocked, keep control available
    musicToggle.textContent = "♫ Play Music";
  });
}

musicToggle.addEventListener("click", () => {
  if (bgm.paused) {
    bgm.play();
    musicToggle.textContent = "♫ Pause Music";
  } else {
    bgm.pause();
    musicToggle.textContent = "♫ Play Music";
  }
});


