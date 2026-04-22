(function () {
  window.navMenu = function () {
    return {
      isOpen: false,
      open() {
        this.isOpen = true;
        document.documentElement.classList.add("menu-open");
        document.body.classList.add("menu-open");
      },
      close() {
        this.isOpen = false;
        document.documentElement.classList.remove("menu-open");
        document.body.classList.remove("menu-open");
      },
      toggle() {
        if (this.isOpen) {
          this.close();
          return;
        }
        this.open();
      },
      init() {
        const closeOnDesktop = window.matchMedia("(min-width: 821px)");
        const onViewportChange = () => {
          if (closeOnDesktop.matches) this.close();
        };

        if (typeof closeOnDesktop.addEventListener === "function") {
          closeOnDesktop.addEventListener("change", onViewportChange);
        } else {
          closeOnDesktop.addListener(onViewportChange);
        }
      }
    };
  };

  function normalizePath(pathname) {
    const safePath = (pathname || "/").toLowerCase();
    if (safePath === "/" || safePath.endsWith("/index.html")) return "/index.html";
    return safePath;
  }

  function getScrollOffset() {
    const stickyNav = document.querySelector(".main-nav");
    const navHeight = stickyNav ? stickyNav.getBoundingClientRect().height : 0;
    return Math.max(84, Math.round(navHeight + 18));
  }

  function smoothScrollToHash(hash, behavior) {
    if (!hash || hash === "#") return false;
    const target = document.querySelector(hash);
    if (!target) return false;

    const y = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({
      top: Math.max(0, y),
      behavior: behavior || "smooth"
    });
    return true;
  }

  function setupHashScroll() {
    document.addEventListener("click", function (event) {
      const link = event.target.closest('a[href*="#"]');
      if (!link) return;

      const rawHref = link.getAttribute("href");
      if (!rawHref || rawHref === "#") return;

      let url;
      try {
        url = new URL(rawHref, window.location.href);
      } catch (_error) {
        return;
      }

      if (!url.hash) return;
      if (url.origin !== window.location.origin) return;
      if (normalizePath(url.pathname) !== normalizePath(window.location.pathname)) return;
      if (!document.querySelector(url.hash)) return;

      event.preventDefault();
      if (smoothScrollToHash(url.hash, "smooth")) {
        history.replaceState(null, "", url.hash);
      }
    });

    if (!window.location.hash) return;

    window.requestAnimationFrame(function () {
      window.setTimeout(function () {
        smoothScrollToHash(window.location.hash, "smooth");
      }, 80);
    });
  }

  function setupFallbackMenu(navRoot) {
    const menuToggle = navRoot.querySelector(".menu-toggle");
    const navPanel = navRoot.querySelector(".nav-panel");
    const backdrop = navRoot.querySelector(".menu-backdrop");
    const closeButton = navRoot.querySelector(".menu-close");

    if (!menuToggle || !navPanel || !backdrop) return;

    let isOpen = false;

    const sync = () => {
      navPanel.classList.toggle("is-open", isOpen);
      backdrop.classList.toggle("is-open", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.documentElement.classList.toggle("menu-open", isOpen);
      document.body.classList.toggle("menu-open", isOpen);
    };

    const close = () => {
      if (!isOpen) return;
      isOpen = false;
      sync();
    };

    const open = () => {
      if (isOpen) return;
      isOpen = true;
      sync();
    };

    const toggle = () => {
      if (isOpen) close();
      else open();
    };

    menuToggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggle();
    }, true);

    backdrop.addEventListener("click", function (event) {
      event.stopImmediatePropagation();
      close();
    }, true);

    if (closeButton) {
      closeButton.addEventListener("click", function (event) {
        event.stopImmediatePropagation();
        close();
      }, true);
    }

    navPanel.addEventListener("click", function (event) {
      if (event.target.closest("a")) close();
    }, true);

    document.addEventListener("click", function (event) {
      if (!isOpen) return;
      if (!navRoot.contains(event.target)) close();
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 821px)").matches) close();
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });
  }

  function initFallbackMenus() {
    document.querySelectorAll(".main-nav").forEach(function (navRoot) {
      if (navRoot.__menuFallbackBound) return;
      setupFallbackMenu(navRoot);
      navRoot.__menuFallbackBound = true;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initFallbackMenus();
      setupHashScroll();
    });
  } else {
    initFallbackMenus();
    setupHashScroll();
  }

  window.setTimeout(initFallbackMenus, 120);
  window.setTimeout(initFallbackMenus, 360);
})();
