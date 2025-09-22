/* 
  Modernized 3D Coverflow
  Refactored for 2025 with better structure and performance
  Original: TemplateMo 595 3D Coverflow
*/

// DOM elements
const items = document.querySelectorAll(".coverflow-item");
const dotsContainer = document.getElementById("dots");
const currentTitle = document.getElementById("current-title");
const currentDescription = document.getElementById("current-description");
const container = document.querySelector(".coverflow-container");
const menuToggle = document.getElementById("menuToggle");
const mainMenu = document.getElementById("mainMenu");
const playIcon = document.querySelector(".play-icon");
const pauseIcon = document.querySelector(".pause-icon");
const sections = document.querySelectorAll(".section");
const menuItems = document.querySelectorAll(".menu-item");
const header = document.getElementById("header");
const scrollToTopBtn = document.getElementById("scrollToTop");

// Data
const imageData = [
  { title: "Mountain Landscape", description: "Majestic peaks covered in snow during golden hour" },
  { title: "Forest Path", description: "A winding trail through ancient woodland" },
  { title: "Lake Reflection", description: "Serene waters mirroring the surrounding landscape" },
  { title: "Ocean Sunset", description: "Golden hour over endless ocean waves" },
  { title: "Desert Dunes", description: "Rolling sand dunes under vast blue skies" },
  { title: "Starry Night", description: "Countless stars illuminating the dark sky" },
  { title: "Waterfall", description: "Cascading water through lush green forest" }
];

// State
let currentIndex = 3;
let isAnimating = false;
let autoplayInterval = null;
let isPlaying = true;

/* ------------------------
   Mobile Menu
------------------------- */
menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  mainMenu.classList.toggle("active");
});

document.querySelectorAll(".menu-item:not(.external)").forEach(item => {
  item.addEventListener("click", () => {
    menuToggle.classList.remove("active");
    mainMenu.classList.remove("active");
  });
});

document.addEventListener("click", (e) => {
  if (!menuToggle.contains(e.target) && !mainMenu.contains(e.target)) {
    menuToggle.classList.remove("active");
    mainMenu.classList.remove("active");
  }
});

/* ------------------------
   Coverflow Core
------------------------- */
function updateCoverflow() {
  if (isAnimating) return;
  isAnimating = true;

  items.forEach((item, index) => {
    let offset = index - currentIndex;

    if (offset > items.length / 2) offset -= items.length;
    else if (offset < -items.length / 2) offset += items.length;

    const absOffset = Math.abs(offset);
    const sign = Math.sign(offset);

    const translateX = offset * 220;
    const translateZ = -absOffset * 200;
    const rotateY = -sign * Math.min(absOffset * 60, 60);
    const opacity = absOffset > 3 ? 0 : 1 - absOffset * 0.2;
    const scale = 1 - absOffset * 0.1;

    item.style.transform = `
      translateX(${translateX}px) 
      translateZ(${translateZ}px) 
      rotateY(${rotateY}deg) 
      scale(${scale})
    `;
    item.style.opacity = opacity;
    item.style.zIndex = 100 - absOffset;
    item.classList.toggle("active", index === currentIndex);
  });

  dots.forEach((dot, index) => dot.classList.toggle("active", index === currentIndex));

  const { title, description } = imageData[currentIndex];
  currentTitle.textContent = title;
  currentDescription.textContent = description;

  currentTitle.style.animation = currentDescription.style.animation = "none";
  requestAnimationFrame(() => {
    currentTitle.style.animation = "fadeIn 0.6s forwards";
    currentDescription.style.animation = "fadeIn 0.6s forwards";
  });

  setTimeout(() => (isAnimating = false), 600);
}

function navigate(direction) {
  if (isAnimating) return;
  currentIndex = (currentIndex + direction + items.length) % items.length;
  updateCoverflow();
}

function goToIndex(index) {
  if (!isAnimating && index !== currentIndex) {
    currentIndex = index;
    updateCoverflow();
  }
}

/* ------------------------
   Navigation & Interactions
------------------------- */
container.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") navigate(-1);
  if (e.key === "ArrowRight") navigate(1);
});

items.forEach((item, index) => {
  item.addEventListener("click", () => goToIndex(index));
});

// Swipe Support
let touchStartX = 0, touchStartY = 0, isSwiping = false;

container.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
  isSwiping = true;
}, { passive: true });

container.addEventListener("touchend", (e) => {
  if (!isSwiping) return;
  const diffX = touchStartX - e.changedTouches[0].screenX;
  const diffY = touchStartY - e.changedTouches[0].screenY;
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
    handleUserInteraction();
    navigate(diffX > 0 ? 1 : -1);
  }
  isSwiping = false;
}, { passive: true });

/* ------------------------
   Autoplay
------------------------- */
function startAutoplay() {
  autoplayInterval = setInterval(() => navigate(1), 4000);
  isPlaying = true;
  playIcon.style.display = "none";
  pauseIcon.style.display = "block";
}

function stopAutoplay() {
  clearInterval(autoplayInterval);
  autoplayInterval = null;
  isPlaying = false;
  playIcon.style.display = "block";
  pauseIcon.style.display = "none";
}

function toggleAutoplay() {
  isPlaying ? stopAutoplay() : startAutoplay();
}

function handleUserInteraction() {
  stopAutoplay();
}

/* ------------------------
   Scroll & Menu
------------------------- */
function updateActiveMenuItem() {
  const scrollPosition = window.scrollY + 100;

  sections.forEach((section, index) => {
    const { offsetTop, clientHeight } = section;
    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + clientHeight) {
      menuItems.forEach(item => item.classList.remove("active"));
      if (menuItems[index] && !menuItems[index].classList.contains("external")) {
        menuItems[index].classList.add("active");
      }
    }
  });

  header.classList.toggle("scrolled", window.scrollY > 50);
  scrollToTopBtn.classList.toggle("visible", window.scrollY > 500);
}

window.addEventListener("scroll", updateActiveMenuItem);

menuItems.forEach(item => {
  item.addEventListener("click", (e) => {
    const targetId = item.getAttribute("href");
    if (targetId && targetId.startsWith("#")) {
      e.preventDefault();
      document.querySelector(targetId)?.scrollIntoView({ behavior: "smooth" });
    }
  });
});

document.querySelector(".logo-container").addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

scrollToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ------------------------
   Forms
------------------------- */
function handleSubmit(e) {
  e.preventDefault();
  alert("✅ Thank you for your message! We'll get back to you soon.");
  e.target.reset();
}

/* ------------------------
   Init
------------------------- */
items.forEach((item) => {
  const img = item.querySelector("img");
  const reflection = item.querySelector(".reflection");

  img.onload = () => {
    item.classList.remove("image-loading");
    reflection.style.backgroundImage = `url(${img.src})`;
  };

  img.onerror = () => item.classList.add("image-loading");
});

// Create dots
imageData.forEach((_, index) => {
  const dot = document.createElement("div");
  dot.className = "dot";
  dot.onclick = () => goToIndex(index);
  dot.addEventListener("click", handleUserInteraction);
  dotsContainer.appendChild(dot);
});
const dots = document.querySelectorAll(".dot");

// Init
updateCoverflow();
container.focus();
startAutoplay();
