// Cover card khulne ke baad hi background video load hoti hai, isse pehle page halka rehta hai.
const cardGate = document.getElementById("card-gate");
const openCardButton = document.getElementById("open-card");
const heroVideo = document.querySelector(".hero-video");
const heroVideoSources = heroVideo.querySelectorAll("source");
const networkConnection = navigator.connection;
const skipVideoForDataSaver = networkConnection && (
  networkConnection.saveData || /^(slow-2g|2g)$/.test(networkConnection.effectiveType || "")
);
let cardIsOpening = false;
let cardHasOpened = false;
let heroIsVisible = true;
openCardButton.focus();

// Hero screen se bahar ho ya tab background mein ho to video pause rehti hai.
function playHeroVideo() {
  if (skipVideoForDataSaver || !cardHasOpened || !heroIsVisible || !heroVideo.currentSrc) return;
  const playback = heroVideo.play();
  if (playback && typeof playback.catch === "function") {
    playback.catch(function () { heroVideo.classList.add("video-fallback"); });
  }
}

if ("IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(function (entries) {
    heroIsVisible = entries[0].isIntersecting;
    if (heroIsVisible) {
      playHeroVideo();
    } else {
      heroVideo.pause();
    }
  }, { threshold: 0.1 });
  heroObserver.observe(document.querySelector(".hero"));
}
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    heroVideo.pause();
  } else {
    playHeroVideo();
  }
});

function openWeddingCard() {
  if (cardIsOpening) return;
  cardIsOpening = true;
  cardHasOpened = true;
  openCardButton.disabled = true;
  cardGate.classList.add("is-opening");

  let gateIsClosed = false;
  function closeGate() {
    if (gateIsClosed) return;
    gateIsClosed = true;
    cardGate.hidden = true;
    document.body.classList.remove("card-locked");
    document.querySelector(".hero-content .button").focus();
  }
  cardGate.addEventListener("transitionend", function (event) {
    if (event.target === cardGate && event.propertyName === "opacity") closeGate();
  });
  window.setTimeout(closeGate, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 50 : 750);

  if (!skipVideoForDataSaver) {
    heroVideo.addEventListener("canplay", playHeroVideo, { once: true });
    heroVideoSources.forEach(function (source) {
      source.src = source.dataset.src;
      delete source.dataset.src;
    });
    heroVideo.load();
  } else {
    heroVideo.classList.add("video-fallback");
  }
}

openCardButton.addEventListener("click", openWeddingCard);
cardGate.addEventListener("keydown", function (event) {
  if (event.key === "Tab") {
    event.preventDefault();
    openCardButton.focus();
  }
});
heroVideo.addEventListener("playing", function () {
  heroVideo.classList.add("is-playing");
  heroVideo.classList.remove("video-fallback");
});
heroVideo.addEventListener("stalled", function () {
  heroVideo.classList.add("video-fallback");
});
heroVideo.addEventListener("waiting", function () {
  heroVideo.classList.add("video-fallback");
});
heroVideo.addEventListener("error", function () {
  heroVideo.classList.add("video-fallback");
});

// Countdown target ko local time ke hisaab se set kiya hai; date badalne par yahi line edit karein.
const weddingDate = new Date(2026, 11, 10, 18, 0, 0).getTime();
const countdownFields = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds")
};

// Har second remaining time calculate karke countdown numbers update hote hain.
function updateCountdown() {
  const remaining = weddingDate - Date.now();
  if (remaining <= 0) {
    countdownFields.days.textContent = "000";
    countdownFields.hours.textContent = "00";
    countdownFields.minutes.textContent = "00";
    countdownFields.seconds.textContent = "00";
    return;
  }

  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000)
  };
  countdownFields.days.textContent = String(values.days).padStart(3, "0");
  countdownFields.hours.textContent = String(values.hours).padStart(2, "0");
  countdownFields.minutes.textContent = String(values.minutes).padStart(2, "0");
  countdownFields.seconds.textContent = String(values.seconds).padStart(2, "0");
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

// Mobile menu ko accessible state ke saath open/close karta hai.
const menuButton = document.querySelector(".menu-toggle");
const menuLinks = document.querySelector(".nav-links");
function setMenuOpen(isOpen) {
  menuLinks.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  menuButton.querySelector("span").textContent = isOpen ? "×" : "☰";
}
menuButton.addEventListener("click", function () {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});
menuLinks.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () { setMenuOpen(false); });
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") setMenuOpen(false);
});

// IntersectionObserver screen par aane wale sections ko soft reveal karta hai.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(function (item) { revealObserver.observe(item); });
} else {
  revealItems.forEach(function (item) { item.classList.add("is-visible"); });
}

// Blessings form native validation ke baad sender ke naam se confirmation dikhata hai.
const rsvpForm = document.getElementById("rsvp-form");
const formStatus = document.getElementById("form-status");
rsvpForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (!rsvpForm.reportValidity()) return;

  const firstName = document.getElementById("guest-first-name").value.trim();
  const lastName = document.getElementById("guest-last-name").value.trim();
  formStatus.textContent = "Thank you, " + firstName + " " + lastName + "! Aapki pyaari wishes ke liye bahut shukriya.";
  rsvpForm.reset();
});
