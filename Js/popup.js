
(function primaryPopup() {
  try {
    // Elements (guardados en const para evitar re-definición)
    const openBtn = document.getElementById('openAssessment');
    const overlay = document.getElementById('assessmentOverlay');
    const cards = {
      1: document.getElementById('card-step-1'),
      2: document.getElementById('card-step-2'),
      3: document.getElementById('card-step-3'),
      4: document.getElementById('card-step-4'),
      5: document.getElementById('card-step-5')
    };
    const currentStepLabel = document.getElementById('currentStep');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressPct = document.getElementById('progressPct');

    // safety: if overlay missing, abort this IIFE gracefully
    if (!overlay) {
      console.warn('[popup.js] assessmentOverlay no existe en el DOM. Primary IIFE abortada.');
      return;
    }

    // helper: set progress based on step (1..5)
    function setProgress(step) {
      const total = 5;
      const pct = Math.round(((step - 1) / (total - 1)) * 100); // 0% at step1, 100% at step5
      // main progress (guard checks)
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressBar) progressBar.setAttribute('aria-valuenow', pct);
      if (progressPct) progressPct.textContent = pct + '%';
      if (currentStepLabel) currentStepLabel.textContent = step;

      // replicate to per-card elements if exist
      ['progressFill2', 'progressFill3', 'progressFill4', 'progressFill5'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.width = pct + '%';
      });
      ['progressPct2', 'progressPct3', 'progressPct4', 'progressPct5'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = pct + '%';
      });
      ['currentStep2', 'currentStep3', 'currentStep4', 'currentStep5'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = step;
      });
    }

    function showOverlay() {
      overlay.style.display = 'flex';
      overlay.setAttribute('aria-hidden', 'false');
      showStep(1);
      setTimeout(() => {
        const f = document.getElementById('fullName');
        if (f) f.focus();
      }, 80);
      document.addEventListener('keydown', onKey);
    }
    function hideOverlay() {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      Object.values(cards).forEach(c => {
        if (c) {
          c.style.display = 'none';
          c.classList.remove('show');
          c.setAttribute('aria-hidden', 'true');
        }
      });
      document.removeEventListener('keydown', onKey);
      if (openBtn) openBtn.focus();
    }

    function showStep(n) {
      if (!cards[n]) { console.warn('[popup.js] showStep: card-step-' + n + ' no encontrada'); return; }
      Object.values(cards).forEach(c => {
        if (c) {
          c.style.display = 'none';
          c.classList.remove('show');
          c.setAttribute('aria-hidden', 'true');
        }
      });
      const card = cards[n];
      card.style.display = 'block';
      setTimeout(() => card.classList.add('show'), 16);
      card.setAttribute('aria-hidden', 'false');
      const first = card.querySelector('input, select, button, textarea, [tabindex]');
      if (first) setTimeout(() => first.focus(), 80);
      setProgress(n);
    }

    function onKey(e) { if (e.key === 'Escape') hideOverlay(); }

    // Navigation wiring — safe-get elements (no exceptions if missing)
    const safeGet = id => document.getElementById(id) || null;

    const toStep2 = safeGet('toStep2');
    const backTo1 = safeGet('backTo1');
    const toStep3 = safeGet('toStep3');
    const backTo2 = safeGet('backTo2');
    const toStep4 = safeGet('toStep4');
    const backTo3 = safeGet('backTo3');
    const finishBtn = safeGet('finishBtn');
    const closeBtn1 = safeGet('closeBtn1');

    if (toStep2) toStep2.addEventListener('click', () => {
      const name = (document.getElementById('fullName') || {}).value || '';
      const company = (document.getElementById('companyName') || {}).value || '';
      if (!name.trim() || !company.trim()) {
        alert('Please complete Full Name and Company Name.');
        return;
      }
      showStep(2);
    });
    if (backTo1) backTo1.addEventListener('click', () => showStep(1));
    if (toStep3) toStep3.addEventListener('click', () => showStep(3));
    if (backTo2) backTo2.addEventListener('click', () => showStep(2));
    if (toStep4) toStep4.addEventListener('click', () => showStep(4));
    if (backTo3) backTo3.addEventListener('click', () => showStep(3));
    if (finishBtn) finishBtn.addEventListener('click', () => {
      const payload = {
        fullName: (document.getElementById('fullName') || {}).value || '',
        companyName: (document.getElementById('companyName') || {}).value || '',
        industry: (document.getElementById('industry') || {}).value || '',
        email: (document.getElementById('email') || {}).value || '',
        revenue: (document.getElementById('revenue') || {}).value || '',
        employees: (document.getElementById('employees') || {}).value || '',
        q1: getRadio('q1'), q2: getRadio('q2'), q3: getRadio('q3'),
        q4: getRadio('q4'), q5: getRadio('q5'), q6: getRadio('q6'),
        q7: getRadio('q7'), q8: getRadio('q8'), q9: getRadio('q9')
      };

      hideOverlay();
    });
    if (closeBtn1) closeBtn1.addEventListener('click', hideOverlay);
    if (openBtn) openBtn.addEventListener('click', showOverlay);

    function getRadio(name) {
      const el = document.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : null;
    }

    // close overlay by clicking outside card
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) hideOverlay();
    });

    // init hidden
    hideOverlay();
    console.info('[popup.js] primary IIFE initialized');
  } catch (err) {
    console.error('[popup.js] primary IIFE error:', err);
  }
})();

/* Multi-trigger popup bootstrap
   - Mantengo la lógica delegada original y la hago tolerante
   - No borro funciones; si ya están definidas arriba, esta IIFE sólo actúa si overlay existe
*/
(function multiTriggerBootstrap() {
  try {
    const TRIGGER_SELECTOR = '.btn-assessment, [id="openAssessment"], .openAssessment, a[role="button"]';
    const overlay = document.getElementById('assessmentOverlay');
    if (!overlay) {
      console.warn('[popup.js] multiTrigger: assessmentOverlay no encontrado, IIFE abortada.');
      return;
    }

    const cards = {
      1: document.getElementById('card-step-1'),
      2: document.getElementById('card-step-2'),
      3: document.getElementById('card-step-3'),
      4: document.getElementById('card-step-4'),
      5: document.getElementById('card-step-5')
    };

    const currentStepLabel = document.getElementById('currentStep');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressPct = document.getElementById('progressPct');

    function attachOpenTriggers() {
      let triggers = Array.from(document.querySelectorAll(TRIGGER_SELECTOR));
      if (triggers.length === 0) {
        triggers = Array.from(document.querySelectorAll('[id="openAssessment"]'));
      }
      triggers.forEach(el => {
        if (!el.__assessmentBound) {
          el.addEventListener('click', openAssessment);
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAssessment(); }
          });
          el.__assessmentBound = true;
        }
      });
    }

    function openAssessment() {
      overlay.style.display = 'flex';
      overlay.setAttribute('aria-hidden', 'false');
      showStep(1);
      setTimeout(() => {
        const f = document.getElementById('fullName') || overlay.querySelector('input, select, button');
        if (f) f.focus();
      }, 60);
      document.addEventListener('keydown', onKey);
    }
    function hideAssessment() {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      Object.values(cards).forEach(c => {
        if (c) { c.style.display = 'none'; c.classList.remove('show'); c.setAttribute('aria-hidden', 'true'); }
      });
      document.removeEventListener('keydown', onKey);
    }

    function showStep(n) {
      if (!cards[n]) { console.warn('[popup.js] multiTrigger showStep missing card', n); return; }
      Object.values(cards).forEach(c => {
        if (c) { c.style.display = 'none'; c.classList.remove('show'); c.setAttribute('aria-hidden', 'true'); }
      });
      const card = cards[n];
      card.style.display = 'block';
      setTimeout(() => card.classList.add('show'), 16);
      card.setAttribute('aria-hidden', 'false');
      const first = card.querySelector('input, select, button, textarea, [tabindex]');
      if (first) setTimeout(() => first.focus(), 80);
      updateProgress(n);
    }

    function onKey(e) { if (e.key === 'Escape') hideAssessment(); }

    function updateProgress(step) {
      const totalSteps = 5;
      if (typeof step !== 'number' || step < 1) step = 1;
      if (step > totalSteps) step = totalSteps;
      const pct = Math.round(((step - 1) / (totalSteps - 1)) * 100);
      const progressBar = document.getElementById('progressBar');
      const progressFill = document.getElementById('progressFill');
      const progressPct = document.getElementById('progressPct');
      const currentStep = document.getElementById('currentStep');
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressBar) progressBar.setAttribute('aria-valuenow', pct);
      if (progressPct) progressPct.textContent = pct + '%';
      if (currentStep) currentStep.textContent = step;
      const fills = ['progressFill2', 'progressFill3', 'progressFill4', 'progressFill5'];
      const pcts = ['progressPct2', 'progressPct3', 'progressPct4', 'progressPct5'];
      const curs = ['currentStep2', 'currentStep3', 'currentStep4', 'currentStep5'];
      fills.forEach(id => { const el = document.getElementById(id); if (el) el.style.width = pct + '%'; });
      pcts.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = pct + '%'; });
      curs.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = step; });
    }

    // Delegated overlay click handler for buttons inside overlay
    overlay.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-action], button, [id]');
      if (!btn) {
        if (e.target === overlay) hideAssessment();
        return;
      }

      const action = (btn.getAttribute('data-action') || btn.id || '').toLowerCase();

      // NEXT / toStepX
      if (/next|tostep/i.test(action) || /tostep/i.test(btn.id)) {
        const ds = btn.getAttribute('data-step');
        let step = ds ? Number(ds) : null;
        if (!step) {
          const m = (btn.id || '').match(/toStep(\d+)/i);
          if (m) step = Number(m[1]);
        }
        if (step) {
          if (step === 2) {
            const name = (document.getElementById('fullName') || {}).value || '';
            const company = (document.getElementById('companyName') || {}).value || '';
            if (!name.trim() || !company.trim()) { alert('Please complete Full Name and Company Name.'); return; }
          }
          showStep(step);
          return;
        }
      }

      // BACK / backToX
      if (/back|backto/i.test(action) || /backto/i.test(btn.id)) {
        const ds = btn.getAttribute('data-step');
        let step = ds ? Number(ds) : null;
        if (!step) {
          const m = (btn.id || '').match(/backTo(\d+)/i);
          if (m) step = Number(m[1]);
        }
        if (step) { showStep(step); return; }
        // fallback: find current visible and go back one
        for (let i = 2; i <= 5; i++) {
          if (cards[i] && cards[i].style.display !== 'none') { showStep(i - 1); return; }
        }
      }

      // CANCEL / CLOSE
      if (/cancel|close|closebtn/.test(action) || btn.getAttribute('data-action') === 'cancel') {
        hideAssessment();
        return;
      }

      // FINISH
      if (/finish|finishbtn/.test(action) || btn.id === 'finishBtn') {
        const payload = {
          fullName: (document.getElementById('fullName') || {}).value || '',
          companyName: (document.getElementById('companyName') || {}).value || '',
          industry: (document.getElementById('industry') || {}).value || '',
          email: (document.getElementById('email') || {}).value || '',
          revenue: (document.getElementById('revenue') || {}).value || '',
          employees: (document.getElementById('employees') || {}).value || '',
          q1: getRadio('q1'), q2: getRadio('q2'), q3: getRadio('q3'),
          q4: getRadio('q4'), q5: getRadio('q5'), q6: getRadio('q6'),
          q7: getRadio('q7'), q8: getRadio('q8'), q9: getRadio('q9')
        };

      }
    });

    function getRadio(name) {
      const el = document.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : null;
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.style.display === 'flex') hideAssessment();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hideAssessment();
    });

    attachOpenTriggers();
    const mo = new MutationObserver(() => attachOpenTriggers());
    mo.observe(document.body, { childList: true, subtree: true });

    console.info('[popup.js] multi-trigger IIFE initialized');
  } catch (err) {
    console.error('[popup.js] multiTrigger IIFE error:', err);
  }
})();
