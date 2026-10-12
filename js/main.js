/* ============================================================
   TSW — Main JavaScript
   ============================================================ */

'use strict';

// ─── HEADER SCROLL ───────────────────────────────────────────
const header = document.getElementById('siteHeader');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ─── MOBILE MENU ─────────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!header.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
}

// ─── ACTIVE NAV LINK ─────────────────────────────────────────
(function () {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPath || (currentPath === '' && href === 'index.html') ||
      (currentPath === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ─── INTERSECTION OBSERVER (scroll animations) ───────────────
const animatedEls = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
if (animatedEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  animatedEls.forEach(el => observer.observe(el));
}

// ─── PORTFOLIO FILTER ─────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');

if (filterBtns.length && portfolioCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      portfolioCards.forEach(card => {
        const category = card.dataset.category;
        const match = filter === 'all' || category === filter;

        if (match) {
          card.style.display = '';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });
}

// ─── CONTACT FORM ────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const fields = {
    nom: { required: true, label: 'Nom et prénom' },
    telephone: { required: true, label: 'Téléphone', pattern: /^[+\d\s\-().]{8,20}$/ },
    email: { required: false, label: 'Adresse e-mail', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    prestation: { required: true, label: 'Type de prestation' },
    localisation: { required: true, label: 'Localisation du projet' },
    besoin: { required: true, label: 'Description du besoin', minLength: 20 },
    delai: { required: false, label: 'Délai souhaité' },
    consentement: { required: true, label: 'Consentement', type: 'checkbox' }
  };

  // Live validation
  Object.keys(fields).forEach(key => {
    const el = document.getElementById(key);
    const errEl = document.getElementById(key + 'Error');
    if (!el) return;

    el.addEventListener('blur', () => validateField(key, el, errEl, fields[key]));
    if (el.type === 'checkbox') {
      el.addEventListener('change', () => validateField(key, el, errEl, fields[key]));
    } else {
      el.addEventListener('input', () => {
        if (el.classList.contains('error')) {
          validateField(key, el, errEl, fields[key]);
        }
      });
    }
  });

  // Char count for textarea
  const besoinField = document.getElementById('besoin');
  const charCount = document.getElementById('charCount');
  if (besoinField && charCount) {
    besoinField.addEventListener('input', () => {
      charCount.textContent = besoinField.value.length + ' / 1000';
    });
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all
    let valid = true;
    Object.keys(fields).forEach(key => {
      const el = document.getElementById(key);
      const errEl = document.getElementById(key + 'Error');
      if (el && !validateField(key, el, errEl, fields[key])) {
        valid = false;
      }
    });

    if (!valid) {
      const firstError = contactForm.querySelector('.form-control.error, input.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Anti-spam: honeypot check
    const honeypot = document.getElementById('website');
    if (honeypot && honeypot.value) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Collect values for WhatsApp instant message
    const nomVal = document.getElementById('nom')?.value.trim() || '';
    const telVal = document.getElementById('telephone')?.value.trim() || '';
    const emailVal = document.getElementById('email')?.value.trim() || '';
    const presEl = document.getElementById('prestation');
    const presVal = presEl ? presEl.options[presEl.selectedIndex]?.text : '';
    const locVal = document.getElementById('localisation')?.value.trim() || '';
    const delaiEl = document.getElementById('delai');
    const delaiVal = delaiEl ? delaiEl.options[delaiEl.selectedIndex]?.text : '';
    const besoinVal = document.getElementById('besoin')?.value.trim() || '';

    // Build pre-filled WhatsApp message
    const waLines = [
      'Bonjour TOPO SABUGNOUMA WASSA,',
      '',
      'Je viens de remplir une demande de devis sur votre site web :',
      `• Demandeur : ${nomVal}`,
      `• Téléphone : ${telVal}`,
      emailVal ? `• E-mail : ${emailVal}` : null,
      presVal && !presVal.includes('Sélectionnez') ? `• Prestation : ${presVal}` : null,
      `• Localisation : ${locVal}`,
      delaiVal && !delaiVal.includes('Non précisé') ? `• Délai souhaité : ${delaiVal}` : null,
      `• Description : ${besoinVal}`,
      '',
      'Merci de bien vouloir étudier ma demande.'
    ].filter(Boolean);

    const waEncoded = encodeURIComponent(waLines.join('\n'));
    const waUrl = `https://wa.me/22376292949?text=${waEncoded}`;

    const waDirectBtn = document.getElementById('waDirectBtn');
    if (waDirectBtn) {
      waDirectBtn.href = waUrl;
    }

    // Send data to PHP backend (Hostinger)
    const formData = new FormData(contactForm);
    try {
      const response = await fetch('send-mail.php', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        console.warn('send-mail.php a répondu avec le statut HTTP', response.status);
      }
    } catch (netErr) {
      // Tolérance pour les environnements de test local sans serveur PHP
      console.info('Test local ou hors-ligne : relais WhatsApp opérationnel.', netErr);
    }

    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;

    // Show success view
    const formFields = document.getElementById('formFields');
    const formSuccess = document.getElementById('formSuccess');
    if (formFields && formSuccess) {
      formFields.style.display = 'none';
      formSuccess.classList.add('show');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Reset button handler
    const resetFormBtn = document.getElementById('resetFormBtn');
    if (resetFormBtn && !resetFormBtn.dataset.bound) {
      resetFormBtn.dataset.bound = 'true';
      resetFormBtn.addEventListener('click', () => {
        contactForm.reset();
        const count = document.getElementById('charCount');
        if (count) count.textContent = '0 / 1000';
        if (formSuccess) formSuccess.classList.remove('show');
        if (formFields) {
          formFields.style.display = 'block';
          formFields.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Save to localStorage as client-side backup
    const data = {};
    formData.forEach((v, k) => { data[k] = v; });
    data.timestamp = new Date().toISOString();
    const stored = JSON.parse(localStorage.getItem('tsw_demandes') || '[]');
    stored.push(data);
    localStorage.setItem('tsw_demandes', JSON.stringify(stored));
  });
}

function validateField(key, el, errEl, rules) {
  let error = '';

  if (rules.type === 'checkbox') {
    if (rules.required && !el.checked) {
      error = 'Vous devez accepter pour continuer.';
    }
  } else {
    const val = el.value.trim();

    if (rules.required && !val) {
      error = `${rules.label} est requis(e).`;
    } else if (val && rules.pattern && !rules.pattern.test(val)) {
      if (key === 'telephone') error = 'Numéro de téléphone invalide (8 à 20 chiffres).';
      else if (key === 'email') error = 'Adresse e-mail invalide.';
    } else if (rules.minLength && val.length < rules.minLength) {
      error = `Minimum ${rules.minLength} caractères requis.`;
    }
  }

  if (errEl) {
    errEl.textContent = error;
    errEl.classList.toggle('show', !!error);
  }
  el.classList.toggle('error', !!error);
  return !error;
}

// ─── SMOOTH ANCHOR SCROLLING ─────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH - 10;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

// ─── BACK TO TOP ────────────────────────────────────────────
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── COUNTER ANIMATION ───────────────────────────────────────
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, 16);
  });
}

// Trigger counters when visible
const counterSection = document.querySelector('[data-count]');
if (counterSection) {
  const counterObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      counterObs.disconnect();
    }
  }, { threshold: 0.5 });
  counterObs.observe(counterSection);
}

// ─── TSW LIGHTBOX MODAL ──────────────────────────────────────
(function initLightbox() {
  let lightbox = document.getElementById('tswLightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'tswLightbox';
    lightbox.className = 'tsw-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Visualisation agrandie');
    lightbox.innerHTML = `
      <div class="tsw-lightbox-wrap">
        <button class="tsw-lightbox-close" id="lightboxClose" aria-label="Fermer (Échap)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <img src="" alt="" class="tsw-lightbox-img" id="lightboxImg" />
        <div class="tsw-lightbox-caption" id="lightboxCaption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const lbImg = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  const lbClose = document.getElementById('lightboxClose');

  function openLightbox(src, alt, caption) {
    if (!lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || '';
    if (lbCaption) lbCaption.textContent = caption || alt || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    if (lbImg) lbImg.src = '';
  }

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('tsw-lightbox-wrap')) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Attach to all elements with data-lightbox or agrement frames
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-lightbox], .agrement-doc-frame, .lightbox-trigger');
    if (trigger) {
      e.preventDefault();
      const img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
      const src = trigger.getAttribute('data-lightbox-src') || (img ? img.getAttribute('src') : trigger.getAttribute('href'));
      const caption = trigger.getAttribute('data-lightbox-caption') || (img ? img.getAttribute('alt') : '');
      if (src) {
        openLightbox(src, caption, caption);
      }
    }
  });
})();

// ─── FAQ ACCORDION ───────────────────────────────────────────
(function () {
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('active');
      
      // Close other items
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const btn = other.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('active', !isOpen);
      button.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });
})();


