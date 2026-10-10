/* ==========================================================================
   Hearth & Home Remodeling — shared JavaScript
   Fictional portfolio demonstration website. Vanilla JS, no dependencies.
   ========================================================================== */

/* Mark the document as JS-enabled immediately so CSS can switch on
   enhanced behaviour (mobile menu, modal buttons) without a flash. */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     CONFIGURATION
     The contact form runs in DEMO MODE while formEndpoint is an empty string.
     To connect a real form service later (Formspree, Netlify Forms, Getform,
     your own API, etc.), paste its endpoint URL below. Nothing else needs
     to change: valid submissions are then POSTed as form data and the
     success/error messages below are shown according to the response.
     Never place secret keys in this file — it is public.
     ----------------------------------------------------------------------- */
  var CONFIG = {
    formEndpoint: '',
    demoSuccessMessage:
      'Demo submission complete. This demonstration form is not connected to a real business inbox.',
    liveSuccessMessage:
      'Thank you. Your request has been sent and we will be in touch soon.',
    liveErrorMessage:
      'Sorry, something went wrong and your request could not be sent. Please try again later.',
    invalidSummaryMessage:
      'Please correct the highlighted fields and submit the form again.'
  };

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
    'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* -----------------------------------------------------------------------
     Current year in footer
     ----------------------------------------------------------------------- */
  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = year;
    });
  }

  /* -----------------------------------------------------------------------
     Active page state in navigation
     ----------------------------------------------------------------------- */
  function initActiveNav() {
    var path = window.location.pathname.split('/').pop();
    if (!path) { path = 'index.html'; }
    document.querySelectorAll('.site-nav a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') { return; }
      var file = href.split('#')[0].split('?')[0];
      if (file === path && !link.classList.contains('btn')) {
        link.setAttribute('aria-current', 'page');
      } else if (!link.classList.contains('btn') && link.getAttribute('aria-current') === 'page' && file !== path) {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* -----------------------------------------------------------------------
     Mobile navigation
     ----------------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) { return; }

    var label = toggle.querySelector('.nav-toggle-label');

    function setOpen(open, returnFocus) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) { label.textContent = open ? 'Close' : 'Menu'; }
      if (!open && returnFocus) { toggle.focus(); }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close after choosing a destination.
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) { setOpen(false); }
    });

    // Escape closes the menu and returns focus to the button.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false, true);
      }
    });

    // Click outside closes the menu.
    document.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') === 'true' &&
          !nav.contains(event.target) && !toggle.contains(event.target)) {
        setOpen(false);
      }
    });

    // Reset when the layout returns to desktop width.
    var mq = window.matchMedia('(min-width: 961px)');
    var reset = function (e) { if (e.matches) { setOpen(false); } };
    if (mq.addEventListener) { mq.addEventListener('change', reset); }
    else if (mq.addListener) { mq.addListener(reset); }
  }

  /* -----------------------------------------------------------------------
     Image fallbacks (replaces inline onerror handlers)
     ----------------------------------------------------------------------- */
  function markFailed(img) {
    var holder = img.closest('.media, .hero-bg, .modal-media');
    if (holder) { holder.classList.add('img-failed'); }
  }

  function initImageFallbacks() {
    document.querySelectorAll('img').forEach(function (img) {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
        markFailed(img);
      }
      img.addEventListener('error', function () { markFailed(img); });
      img.addEventListener('load', function () {
        var holder = img.closest('.media, .hero-bg, .modal-media');
        if (holder) { holder.classList.remove('img-failed'); }
      });
    });
  }

  /* -----------------------------------------------------------------------
     Project detail modal (projects page)
     ----------------------------------------------------------------------- */
  function initModal() {
    var modal = document.getElementById('project-modal');
    if (!modal) { return; }

    var panel = modal.querySelector('.modal-panel');
    var imgEl = document.getElementById('modal-img');
    var catEl = document.getElementById('modal-cat');
    var titleEl = document.getElementById('modal-title');
    var descEl = document.getElementById('modal-desc');
    var lastTrigger = null;

    function open(card, trigger) {
      var cardImg = card.querySelector('img');
      var title = card.querySelector('[data-project-title]');
      var cat = card.querySelector('[data-project-category]');
      var summary = card.querySelector('[data-project-summary]');
      var detail = card.querySelector('.project-detail');
      if (!cardImg || !title) { return; }

      lastTrigger = trigger || document.activeElement;

      imgEl.src = cardImg.getAttribute('data-large') || cardImg.currentSrc || cardImg.src;
      imgEl.alt = cardImg.alt;
      modal.querySelector('.modal-media').classList.remove('img-failed');
      catEl.textContent = cat ? cat.textContent : '';
      titleEl.textContent = title.textContent;

      // Rebuild description from the card's own content (no HTML strings).
      descEl.textContent = '';
      if (summary) {
        var p = document.createElement('p');
        p.className = 'lead';
        p.textContent = summary.textContent;
        descEl.appendChild(p);
      }
      if (detail) {
        var clone = detail.cloneNode(true);
        clone.removeAttribute('class');
        clone.className = 'modal-detail';
        descEl.appendChild(clone);
      }

      modal.hidden = false;
      document.body.classList.add('modal-open');
      panel.scrollTop = 0;
      var closeBtn = modal.querySelector('.modal-close');
      (closeBtn || panel).focus();
    }

    function close() {
      if (modal.hidden) { return; }
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      imgEl.removeAttribute('src');
      if (lastTrigger && typeof lastTrigger.focus === 'function') { lastTrigger.focus(); }
      lastTrigger = null;
    }

    // Open: delegated so every "View Details" button works.
    document.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-project-open]');
      if (!btn) { return; }
      event.preventDefault();
      var card = btn.closest('[data-project]');
      if (card) { open(card, btn); }
    });

    // Close: close button and backdrop.
    modal.addEventListener('click', function (event) {
      if (event.target.closest('[data-modal-close]')) { close(); }
    });

    // Keyboard: Escape closes; Tab is kept inside the dialog.
    document.addEventListener('keydown', function (event) {
      if (modal.hidden) { return; }
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === 'Tab') {
        var items = Array.prototype.filter.call(panel.querySelectorAll(FOCUSABLE), function (el) {
          return el.offsetParent !== null;
        });
        if (!items.length) { event.preventDefault(); panel.focus(); return; }
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    // Landing from the home page (projects.html#project-id): scroll to and
    // gently highlight the card. It does not open the modal automatically.
    var hash = window.location.hash.replace('#', '');
    if (hash) {
      var target = document.getElementById(hash);
      if (target && target.hasAttribute('data-project')) {
        target.classList.add('is-highlighted');
        window.setTimeout(function () { target.classList.remove('is-highlighted'); }, 3500);
      }
    }
  }

  /* -----------------------------------------------------------------------
     Contact form: validation and demo submission
     ----------------------------------------------------------------------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var RULES = {
    name: function (v) {
      if (!v.trim()) { return 'Please enter your full name.'; }
      if (v.trim().length < 2) { return 'Your name looks too short.'; }
      return '';
    },
    email: function (v) {
      if (!v.trim()) { return 'Please enter your email address.'; }
      if (!EMAIL_RE.test(v.trim())) { return 'Please enter a valid email address, such as name@example.com.'; }
      return '';
    },
    phone: function (v) {
      if (!v.trim()) { return ''; } // optional
      var digits = v.replace(/\D/g, '');
      if (!/^[0-9+()\-.\s]+$/.test(v) || digits.length < 7 || digits.length > 15) {
        return 'Please enter a valid phone number, or leave this field blank.';
      }
      return '';
    },
    project_type: function (v) {
      return v ? '' : 'Please choose a project type.';
    },
    budget: function () { return ''; }, // optional
    location: function (v) {
      return v.trim() ? '' : 'Please enter your project location (city and state, or area).';
    },
    details: function (v) {
      if (!v.trim()) { return 'Please tell us a little about your project.'; }
      if (v.trim().length < 10) { return 'Please add a few more details (at least 10 characters).'; }
      return '';
    },
    consent: function (_v, el) {
      return el.checked ? '' : 'Please confirm that you agree to be contacted about your inquiry.';
    }
  };

  function initForm() {
    var form = document.getElementById('quote-form');
    if (!form) { return; }

    var status = document.getElementById('form-status');
    var submitBtn = form.querySelector('button[type="submit"]');

    function fieldFor(name) { return form.elements[name]; }
    function errorFor(el) { return document.getElementById(el.name + '-error'); }

    function showStatus(kind, message) {
      status.hidden = false;
      status.className = 'form-status is-' + kind;
      status.textContent = message;
      status.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    }
    function clearStatus() {
      status.hidden = true;
      status.textContent = '';
      status.className = 'form-status';
    }

    function validateField(el) {
      var rule = RULES[el.name];
      if (!rule) { return true; }
      var message = rule(el.type === 'checkbox' ? '' : el.value, el);
      var err = errorFor(el);
      if (message) {
        el.setAttribute('aria-invalid', 'true');
        if (err) { err.textContent = message; }
        return false;
      }
      el.removeAttribute('aria-invalid');
      if (err) { err.textContent = ''; }
      return true;
    }

    // Validate a field when the user leaves it; re-check live once it has an error.
    Object.keys(RULES).forEach(function (name) {
      var el = fieldFor(name);
      if (!el) { return; }
      el.addEventListener('blur', function () {
        if (el.type === 'checkbox' || el.value !== '' || el.hasAttribute('aria-invalid')) { validateField(el); }
      });
      var evt = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'input';
      el.addEventListener(evt, function () {
        if (el.hasAttribute('aria-invalid')) { validateField(el); }
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearStatus();

      var firstInvalid = null;
      Object.keys(RULES).forEach(function (name) {
        var el = fieldFor(name);
        if (el && !validateField(el) && !firstInvalid) { firstInvalid = el; }
      });

      if (firstInvalid) {
        showStatus('error', CONFIG.invalidSummaryMessage);
        status.setAttribute('tabindex', '-1');
        firstInvalid.focus();
        return;
      }

      // ---- Demo mode: no network request is made. ----
      if (!CONFIG.formEndpoint) {
        showStatus('success', CONFIG.demoSuccessMessage);
        status.setAttribute('tabindex', '-1');
        form.reset();
        status.focus();
        return;
      }

      // ---- Live mode (only when CONFIG.formEndpoint is set). ----
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-disabled', 'true');
      fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      }).then(function (response) {
        if (!response.ok) { throw new Error('Request failed'); }
        showStatus('success', CONFIG.liveSuccessMessage);
        form.reset();
      }).catch(function () {
        showStatus('error', CONFIG.liveErrorMessage);
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-disabled');
        status.setAttribute('tabindex', '-1');
        status.focus();
      });
    });

    form.addEventListener('reset', function () {
      form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
      form.querySelectorAll('.field-error').forEach(function (el) { el.textContent = ''; });
    });
  }

  /* -----------------------------------------------------------------------
     Smooth in-page anchors (respects reduced-motion preference)
     ----------------------------------------------------------------------- */
  function initAnchors() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) { return; }
      var id = link.getAttribute('href').slice(1);
      if (!id) { return; }
      var target = document.getElementById(id);
      if (!target) { return; }
      event.preventDefault();
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); }
      target.focus({ preventScroll: true });
      if (window.history && window.history.pushState) { window.history.pushState(null, '', '#' + id); }
    });
  }

  onReady(function () {
    initYear();
    initActiveNav();
    initNav();
    initImageFallbacks();
    initModal();
    initForm();
    initAnchors();
  });
})();
