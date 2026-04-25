/* ==============================================
   AI Content Creator Portfolio — Main JS
   Handles: Navbar, Lazy Loading, Filters,
   Lightbox, Scroll Animations, Sharing
   ============================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLazyLoading();
  initScrollAnimations();
  initFilters();
  initLightbox();
  initShareButtons();
  initCustomCursor();
  initInteractiveExtras();
});

/* ==============================================
   CUSTOM CURSOR
   ============================================== */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  // Track mouse
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate update for inner dot using hardware-accelerated transform
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  // Smooth follow for outer circle
  function renderCursor() {
    followerX += (mouseX - followerX) * 0.2;
    followerY += (mouseY - followerY) * 0.2;
    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover effects on interactables
  const interactables = document.querySelectorAll('a, button, input, textarea, select, .float-card');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ==============================================
   INTERACTIVE EXTRAS
   ============================================== */
function initInteractiveExtras() {
  // Magnetic Buttons
  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  magneticBtns.forEach(btn => {
    let rect = null;
    btn.addEventListener('mouseenter', () => {
      rect = btn.getBoundingClientRect();
    });
    btn.addEventListener('mousemove', (e) => {
      if (!rect) return;
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      // Using requestAnimationFrame implicitly by letting browser handle the transform via GPU,
      // but caching the rect prevents synchronous layout thrashing
      btn.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
    }, { passive: true });
    btn.addEventListener('mouseleave', () => {
      rect = null;
      btn.style.transform = 'translate3d(0px, 0px, 0)';
    });
  });

  // 3D Tilt for Video Cards
  const videoCards = document.querySelectorAll('.video-card');
  videoCards.forEach(card => {
    let rect = null;
    let centerX = 0, centerY = 0;
    
    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
      centerX = rect.width / 2;
      centerY = rect.height / 2;
    });

    card.addEventListener('mousemove', (e) => {
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }, { passive: true });
    
    card.addEventListener('mouseleave', () => {
      rect = null;
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });
}

/* ==============================================
   NAVBAR
   ============================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.nav-mobile');
  const allLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  let lastScrollY = 0;
  let ticking = false;

  // Scroll effects: frosted glass + hide on scroll down
  function onScroll() {
    const scrollY = window.scrollY;

    navbar.classList.toggle('scrolled', scrollY > 50);

    if (scrollY > lastScrollY && scrollY > 300) {
      navbar.classList.add('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Mobile menu toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('active');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    });
  }

  // Close mobile menu on link click
  allLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggle?.classList.remove('active');
      mobileMenu?.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });

  // Active section tracking via IntersectionObserver
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          allLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72}px 0px -40% 0px`,
    }
  );

  sections.forEach(section => sectionObserver.observe(section));
}

/* ==============================================
   LAZY LOADING (Iframes + Images)
   ============================================== */
function initLazyLoading() {
  const lazyElements = document.querySelectorAll('[data-src]');

  if ('IntersectionObserver' in window) {
    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.tagName.toLowerCase() === 'img') {
              el.setAttribute('decoding', 'async');
            }
            el.src = el.dataset.src;
            el.removeAttribute('data-src');

            // When iframe loads, hide skeleton and show content
            el.addEventListener('load', () => {
              el.classList.add('loaded');
              const skeleton = el.closest('.card-media')?.querySelector('.card-skeleton');
              if (skeleton) skeleton.classList.add('loaded');
            });

            lazyObserver.unobserve(el);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '800px 0px', // Load much earlier to prevent blur/wait
      }
    );

    lazyElements.forEach(el => lazyObserver.observe(el));
  } else {
    // Fallback: load everything immediately
    lazyElements.forEach(el => {
      el.src = el.dataset.src;
      el.removeAttribute('data-src');
    });
  }
}

/* ==============================================
   SCROLL ANIMATIONS
   ============================================== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  if (!animatedElements.length) return;

  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          animObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  animatedElements.forEach(el => animObserver.observe(el));
}

/* ==============================================
   FILTERS
   ============================================== */
function initFilters() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = Array.from(document.querySelectorAll('.video-card'));
  const viewMoreBtn = document.getElementById('view-more-btn');
  let currentFilter = 'all';
  let visibleLimit = 6;

  if (!pills.length || !cards.length) return;

  function updateGrid() {
    let matchCount = 0;
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.dataset.category;
      const isFeatured = card.dataset.featured === 'true';

      let matchesFilter = false;
      if (currentFilter === 'all') {
        matchesFilter = true;
      } else if (currentFilter === 'featured') {
        matchesFilter = isFeatured;
      } else {
        matchesFilter = category === currentFilter;
      }

      if (matchesFilter) {
        matchCount++;
        if (visibleCount < visibleLimit) {
          card.style.display = 'block';
          // Use small timeout to allow CSS transitions if they exist
          setTimeout(() => card.classList.remove('filtered-out'), 10);
          visibleCount++;
        } else {
          card.classList.add('filtered-out');
          setTimeout(() => card.style.display = 'none', 300);
        }
      } else {
        card.classList.add('filtered-out');
        setTimeout(() => card.style.display = 'none', 300);
      }
    });

    const viewMoreContainer = document.getElementById('view-more-container');
    if (viewMoreContainer) {
      if (matchCount > visibleLimit) {
        viewMoreContainer.style.display = 'flex';
      } else {
        viewMoreContainer.style.display = 'none';
      }
    }
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      visibleLimit = 6; // Reset limit on filter change
      updateGrid();
    });
  });

  if (viewMoreBtn) {
    viewMoreBtn.addEventListener('click', () => {
      visibleLimit += 6;
      updateGrid();
    });
  }

  // Initialize
  updateGrid();
}

/* ==============================================
   LIGHTBOX
   ============================================== */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxIframe = document.getElementById('lightbox-iframe');
  const lightboxTitle = document.getElementById('lightbox-title');
  const closeBtn = lightbox?.querySelector('.lightbox-close');

  if (!lightbox || !lightboxIframe) return;

  let previousFocus = null;

  // Open lightbox when play button or card is clicked
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(btn);
    });
  });

  function openLightbox(trigger) {
    const card = trigger.closest('.video-card');
    if (!card) return;

    const videoSrc = card.dataset.videoSrc;
    const title = card.querySelector('h3')?.textContent || '';

    previousFocus = document.activeElement;
    
    // Smooth transition
    lightboxIframe.classList.remove('loaded');
    lightboxIframe.src = videoSrc;
    lightboxIframe.onload = () => {
      lightboxIframe.classList.add('loaded');
    };
    
    if (lightboxTitle) lightboxTitle.textContent = title;

    lightbox.hidden = false;
    // Force reflow for transition
    lightbox.offsetHeight;
    lightbox.classList.add('open');
    document.body.classList.add('lightbox-open');

    closeBtn?.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.classList.remove('lightbox-open');

    setTimeout(() => {
      lightbox.hidden = true;
      lightboxIframe.src = '';
    }, 350);

    previousFocus?.focus();
  }

  // Close triggers
  closeBtn?.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) {
      closeLightbox();
    }
  });

  // Focus trap
  lightbox.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const focusable = lightbox.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

/* ==============================================
   SHARE BUTTONS
   ============================================== */
function initShareButtons() {
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const card = btn.closest('.video-card');
      if (!card) return;

      const shareUrl = card.dataset.shareUrl;
      const title = card.querySelector('h3')?.textContent || 'Check out this AI creation!';

      // Try native share API first (mobile)
      if (navigator.share) {
        try {
          await navigator.share({ title, url: shareUrl });
          return;
        } catch {
          // User cancelled or error — fall through to clipboard
        }
      }

      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard!');
      } catch {
        // Final fallback
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
        showToast('Link copied to clipboard!');
      }
    });
  });
}

/* ==============================================
   TOAST NOTIFICATION
   ============================================== */
function showToast(message) {
  // Remove any existing toast
  document.querySelector('.toast')?.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}
