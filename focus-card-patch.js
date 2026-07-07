(function patchFocusCard() {
  function addStyles() {
    if (document.getElementById('focusCardStyles')) return;
    const style = document.createElement('style');
    style.id = 'focusCardStyles';
    style.textContent = `.focus-card{margin-top:16px;padding:22px;border-radius:28px;background:rgba(255,252,246,.94);border:1px solid rgba(135,95,55,.12);box-shadow:0 18px 40px rgba(70,40,20,.08)}.focus-card h3{margin:0 0 16px;font-size:clamp(1.35rem,3vw,2rem);letter-spacing:-.03em;color:#2f211a;text-align:right}.focus-row{display:grid;grid-template-columns:108px 1fr 48px;align-items:center;gap:14px;margin:16px 0;color:#3a2b23}.focus-track{height:10px;border-radius:999px;overflow:hidden;background:rgba(115,84,60,.09)}.focus-fill{display:block;width:var(--focus-width,0%);height:100%;border-radius:inherit}.focus-fill.a{background:linear-gradient(90deg,#ffb000,#ffc13d)}.focus-fill.b{background:linear-gradient(90deg,#49c65a,#74d46f)}.focus-fill.c{background:linear-gradient(90deg,#ff442c,#ff6a3c)}.focus-fill.d{background:linear-gradient(90deg,#d8cfc5,#efe8df)}.focus-percent{font-weight:900;font-size:1.05rem;text-align:right}.focus-divider{height:1px;margin:18px 0 14px;background:rgba(100,75,52,.12)}.focus-note{margin:0;color:var(--muted,#8b7b72);font-size:.95rem}@media(max-width:560px){.focus-card{padding:18px}.focus-card h3{text-align:left;font-size:1.4rem}.focus-row{grid-template-columns:86px 1fr 42px;gap:10px}}`;
    document.head.appendChild(style);
  }

  function ensureCard() {
    const nutritionPanel = document.querySelector('.nutrition-panel');
    if (!nutritionPanel) return null;
    let card = document.getElementById('focusCard');
    if (!card) {
      card = document.createElement('section');
      card.id = 'focusCard';
      card.className = 'focus-card dashboard-card';
      nutritionPanel.insertAdjacentElement('afterend', card);
    }
    return card;
  }

  function mealCount() {
    if (typeof getMemberMeals !== 'function' || typeof isToday !== 'function') return 0;
    return getMemberMeals().filter(isToday).length;
  }

  function renderFocusCard() {
    addStyles();
    const card = ensureCard();
    if (!card) return;
    const meals = mealCount();
    const values = meals ? [Math.min(100, meals * 12), Math.min(100, meals * 9), Math.min(100, meals * 8), Math.min(100, meals * 4)] : [0, 0, 0, 0];
    const rows = [['Fiber','a',values[0]],['Iron','b',values[1]],['Calcium','c',values[2]],['Vitamin D','d',values[3]]];
    card.innerHTML = `<h3>Micronutrient Focus</h3>${rows.map(([label,tone,value]) => `<div class="focus-row"><span>${label}</span><div class="focus-track"><i class="focus-fill ${tone}" style="--focus-width:${value}%"></i></div><strong class="focus-percent">${value}%</strong></div>`).join('')}<div class="focus-divider"></div><p class="focus-note">Estimated from today's logged meals.</p>`;
  }

  function install() {
    if (typeof renderDashboard !== 'function') return false;
    const previous = renderDashboard;
    window.renderDashboard = function renderDashboardWithFocusCard() {
      previous();
      renderFocusCard();
    };
    renderFocusCard();
    return true;
  }

  if (!install()) {
    const retry = setInterval(function() {
      if (install()) clearInterval(retry);
    }, 100);
    setTimeout(function() { clearInterval(retry); }, 3000);
  }
})();
