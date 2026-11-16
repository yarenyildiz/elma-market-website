const config = {
  appReleased: false,
  appStoreUrls: {
    ios: "https://apps.apple.com/tr/app/elma-express/idXXXXXXXXX",
    android: "https://play.google.com/store/apps/details?id=com.elmamarket.express",
  },
  slideInterval: 6000,
  counterDuration: 1600,
  heroPlaybackRate: 0.85,
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function lockScroll(locked) {
  document.body.classList.toggle("is-locked", locked);
}

function initHeader() {
  const header = $("#site-header");
  const nav = $("#site-nav");
  const toggle = $("#menu-toggle");

  const setMenuOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    lockScroll(open);
  };

  toggle.addEventListener("click", () => setMenuOpen(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));

  const updateOnScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
    header.classList.toggle("is-compact", window.scrollY > 38);
  };

  window.addEventListener("scroll", updateOnScroll, { passive: true });
  updateOnScroll();
}

function initHeroSlider() {
  const slides = $$(".hero__slide");
  const dotsContainer = $("#hero-dots");
  let current = 0;
  let timer;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Slayt ${index + 1}`);
    dot.addEventListener("click", () => goTo(index, true));
    dotsContainer.append(dot);
    return dot;
  });

  function goTo(index, userInitiated = false) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
    if (userInitiated) restart();
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), config.slideInterval);
  }

  $("#hero-prev").addEventListener("click", () => goTo(current - 1, true));
  $("#hero-next").addEventListener("click", () => goTo(current + 1, true));

  goTo(0);
  restart();
}

function initHeroVideo() {
  const video = $("#hero-video");
  const toggle = $("#hero-video-toggle");

  video.defaultPlaybackRate = config.heroPlaybackRate;
  video.playbackRate = config.heroPlaybackRate;

  const setPaused = (paused) => {
    if (paused) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
    toggle.classList.toggle("is-paused", paused);
    toggle.setAttribute("aria-label", paused ? "Arka plan videosunu oynat" : "Arka plan videosunu durdur");
  };

  toggle.addEventListener("click", () => setPaused(!video.paused));
  if (prefersReducedMotion) setPaused(true);
}

function initTabs() {
  $$("[data-tabs]").forEach((tabs) => {
    const buttons = $$('[role="tab"]', tabs);
    const panels = $$('[role="tabpanel"]', tabs);

    const select = (button) => {
      buttons.forEach((item) => {
        const selected = item === button;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.id !== button.getAttribute("aria-controls");
      });
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => select(button));
      button.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        const step = event.key === "ArrowRight" ? 1 : -1;
        const next = buttons[(index + step + buttons.length) % buttons.length];
        next.focus();
        select(next);
      });
    });
  });
}

function animateCounter(element) {
  const target = Number(element.dataset.count);
  const useGrouping = !element.hasAttribute("data-count-plain");
  const start = performance.now();

  const render = (value) => {
    element.textContent = useGrouping ? value.toLocaleString("tr-TR") : String(value);
  };

  if (prefersReducedMotion) {
    render(target);
    return;
  }

  const tick = (now) => {
    const progress = Math.min((now - start) / config.counterDuration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    render(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initRevealOnScroll() {
  const targets = $$(".reveal, .reveal-wipe");
  const counters = $$("[data-count]");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        $$("[data-count]", entry.target).forEach(animateCounter);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((target) => observer.observe(target));
}

function initAppLinks() {
  const modal = $("#app-modal");

  const openModal = () => {
    modal.hidden = false;
    $(".modal__close", modal).focus();
  };
  const closeModal = () => {
    modal.hidden = true;
  };

  $$("[data-store]").forEach((link) => {
    if (config.appReleased) {
      link.href = config.appStoreUrls[link.dataset.store];
      link.target = "_blank";
      link.rel = "noopener";
      return;
    }
    link.classList.add("is-disabled");
    link.setAttribute("aria-disabled", "true");
    link.addEventListener("click", (event) => event.preventDefault());
  });

  $$("[data-app-preview]").forEach((device) => {
    device.addEventListener("click", () => {
      if (!config.appReleased) {
        openModal();
        return;
      }
      const platform = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        ? "ios"
        : /Android/i.test(navigator.userAgent)
          ? "android"
          : null;
      if (platform) {
        window.location.href = config.appStoreUrls[platform];
      } else {
        openModal();
      }
    });
  });

  $(".modal__close", modal).addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
}

function initLightbox() {
  const lightbox = $("#lightbox");
  const image = $(".lightbox__image", lightbox);
  const videoContainer = $(".lightbox__video", lightbox);
  const title = $(".lightbox__title", lightbox);
  const counter = $(".lightbox__counter", lightbox);
  let images = [];
  let index = 0;

  const show = (nextIndex) => {
    index = (nextIndex + images.length) % images.length;
    image.src = images[index];
    counter.textContent = images.length > 1 ? `${index + 1} / ${images.length}` : "";
  };

  const open = ({ caption, isVideo }) => {
    title.textContent = caption;
    lightbox.classList.toggle("is-video", isVideo);
    lightbox.classList.toggle("is-single", isVideo || images.length < 2);
    lightbox.hidden = false;
    lockScroll(true);
    $(".lightbox__close", lightbox).focus();
  };

  const close = () => {
    lightbox.hidden = true;
    lightbox.classList.remove("is-video");
    videoContainer.replaceChildren();
    lockScroll(false);
  };

  $$("[data-gallery]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      images = trigger.dataset.gallery.split(",").map((src) => src.trim());
      image.alt = trigger.dataset.caption;
      show(0);
      open({ caption: trigger.dataset.caption, isVideo: false });
    });
  });

  $$("[data-video]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube-nocookie.com/embed/${trigger.dataset.video}?autoplay=1&rel=0`;
      frame.title = trigger.dataset.caption;
      frame.allow = "autoplay; encrypted-media; picture-in-picture";
      frame.allowFullscreen = true;
      videoContainer.replaceChildren(frame);
      counter.textContent = "";
      open({ caption: trigger.dataset.caption, isVideo: true });
    });
  });

  $(".lightbox__close", lightbox).addEventListener("click", close);
  $(".lightbox__nav--prev", lightbox).addEventListener("click", () => show(index - 1));
  $(".lightbox__nav--next", lightbox).addEventListener("click", () => show(index + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") close();
    if (lightbox.classList.contains("is-single")) return;
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  });
}

function initFooterYear() {
  $("#current-year").textContent = new Date().getFullYear();
}

initHeader();
initHeroSlider();
initHeroVideo();
initTabs();
initRevealOnScroll();
initAppLinks();
initLightbox();
initFooterYear();
