(function installNutritionBreakdownPatch() {
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCurrentMemberId() {
    return window.appState?.currentMember?.id || null;
  }

  function isTodayMeal(meal) {
    const mealDate = new Date(meal?.eaten_at || meal?.created_at || Date.now());
    return mealDate.toDateString() === new Date().toDateString();
  }

  function getVisibleMeals() {
    const memberId = getCurrentMemberId();
    return (window.appState?.meals || []).filter((meal) => {
      if (memberId && meal.member_id && meal.member_id !== memberId) return false;
      return isTodayMeal(meal);
    });
  }

  function extractMealTag(notes, tag) {
    const escapedTag = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(notes || '').match(new RegExp(`\\[\\[${escapedTag}:([\\s\\S]*?)\\]\\]`, 'i'))?.[1] || '';
  }

  function getMealInsight(meal) {
    if (typeof window.getMealInsight === 'function') {
      return window.getMealInsight(meal);
    }
    const rawInsight = extractMealTag(meal?.notes, 'ai_insight');
    if (!rawInsight) return null;
    try {
      return JSON.parse(decodeURIComponent(rawInsight));
    } catch (error) {
      console.warn('Could not decode saved meal insight metadata.', error);
      return null;
    }
  }

  function normalizeName(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .trim();
  }

  function formatMealTime(meal) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(meal.eaten_at || meal.created_at || Date.now()));
  }

  function extractCardTitle(card) {
    const titleNode = card.querySelector('h4 span') || card.querySelector('h4');
    if (!titleNode) return '';
    return normalizeName(titleNode.textContent);
  }

  function extractCardTime(card) {
    const text = Array.from(card.querySelectorAll('p'))
      .map((node) => node.textContent || '')
      .join(' ');
    return text.match(/\b\d{1,2}:\d{2}\s?[AP]M\b/i)?.[0] || '';
  }

  function matchMealToCard(card, meals, usedIds) {
    const title = extractCardTitle(card);
    const time = extractCardTime(card);
    const candidates = meals.filter((meal) => !usedIds.has(meal.id) && normalizeName(meal.food_name) === title);
    if (!candidates.length) return null;
    const exactTime = candidates.find((meal) => formatMealTime(meal).toLowerCase() === time.toLowerCase());
    return exactTime || candidates[0];
  }

  function topMealNutrients(meal) {
    const insight = getMealInsight(meal);
    if (!insight) return [];
    return [
      ...(insight.vitamins || []).map((item) => ({ ...item, group: 'vitamin' })),
      ...(insight.minerals || []).map((item) => ({ ...item, group: 'minerals' }))
    ].filter((item) => item?.name).slice(0, 4);
  }

  function renderMealBreakdown(card, meal) {
    card.querySelectorAll('.real-nutrient-breakdown').forEach((node) => node.remove());
    const nutrients = topMealNutrients(meal);
    if (!nutrients.length) return;

    const container = document.createElement('div');
    container.className = 'real-nutrient-breakdown';
    container.innerHTML = `
      <strong>Vitamin breakdown</strong>
      <div class="real-nutrient-chip-row">
        ${nutrients.map((item) => `
          <span class="real-nutrient-chip">
            ${escapeHtml(item.name)}${item.amount ? ` · ${escapeHtml(item.amount)}` : ''}
          </span>
        `).join('')}
      </div>
    `;

    const content = Array.from(card.children).find((node) => node.tagName === 'DIV') || card;
    content.appendChild(container);
  }

  function renderDashboardBreakdown() {
    const panel = document.querySelector('.nutrition-panel');
    if (!panel) return;

    let section = panel.querySelector('.runtime-dashboard-breakdown');
    if (!section) {
      section = document.createElement('div');
      section.className = 'runtime-dashboard-breakdown';
      const note = panel.querySelector('.analysis-note');
      panel.insertBefore(section, note || null);
    }

    const meals = getVisibleMeals();
    const nutrientMap = new Map();
    meals.forEach((meal) => {
      topMealNutrients(meal).forEach((item) => {
        const key = normalizeName(item.name);
        if (!nutrientMap.has(key)) {
          nutrientMap.set(key, { name: item.name, amount: item.amount || '', count: 0 });
        }
        nutrientMap.get(key).count += 1;
      });
    });

    const ranked = Array.from(nutrientMap.values())
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 6);

    if (!ranked.length) {
      section.innerHTML = `<p class="runtime-dashboard-copy">Scan meals to show today’s vitamin breakdown.</p>`;
      return;
    }

    const vitamins = ranked.filter((item) => /vitamin|folate/i.test(item.name)).slice(0, 3);
    const minerals = ranked.filter((item) => !/vitamin|folate/i.test(item.name)).slice(0, 3);
    section.innerHTML = `
      <p class="runtime-dashboard-copy">Today’s AI scans found these recurring vitamins and minerals.</p>
      <div class="runtime-dashboard-columns">
        <div>
          <h4>Top vitamins</h4>
          <div class="runtime-dashboard-list">
            ${(vitamins.length ? vitamins : [{ name: 'No vitamin estimate yet', amount: '' }]).map((item) => `
              <span class="runtime-dashboard-chip">${escapeHtml(item.name)}${item.amount ? ` · ${escapeHtml(item.amount)}` : ''}</span>
            `).join('')}
          </div>
        </div>
        <div>
          <h4>Top minerals</h4>
          <div class="runtime-dashboard-list">
            ${(minerals.length ? minerals : [{ name: 'No mineral estimate yet', amount: '' }]).map((item) => `
              <span class="runtime-dashboard-chip">${escapeHtml(item.name)}${item.amount ? ` · ${escapeHtml(item.amount)}` : ''}</span>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function patchMealCards() {
    const cards = Array.from(document.querySelectorAll('#todayFoodList .meal-card, .today-food-panel .meal-card, .meal-type-group .meal-card'));
    if (!cards.length) return;
    const meals = getVisibleMeals();
    const usedIds = new Set();
    cards.forEach((card) => {
      const meal = matchMealToCard(card, meals, usedIds);
      if (!meal) return;
      usedIds.add(meal.id);
      renderMealBreakdown(card, meal);
    });
  }

  function installStyles() {
    if (document.getElementById('nutritionBreakdownPatchStyles')) return;
    const style = document.createElement('style');
    style.id = 'nutritionBreakdownPatchStyles';
    style.textContent = `
      .real-nutrient-breakdown{margin-top:8px;display:grid;gap:6px}
      .real-nutrient-breakdown strong{color:#53381c;font-size:12px}
      .real-nutrient-chip-row,.runtime-dashboard-list{display:flex;flex-wrap:wrap;gap:6px}
      .real-nutrient-chip,.runtime-dashboard-chip{display:inline-flex;align-items:center;min-height:28px;padding:0 10px;border-radius:999px;background:#eef7e5;color:#355326;font-size:11px;font-weight:800}
      .runtime-dashboard-breakdown{margin-top:12px;padding-top:12px;border-top:1px solid #f1e7da;display:grid;gap:10px}
      .runtime-dashboard-copy{margin:0;color:#6f6253;font-size:11px;line-height:1.45}
      .runtime-dashboard-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .runtime-dashboard-columns h4{margin:0;color:#39271c;font-size:13px}
      @media(max-width:520px){.runtime-dashboard-columns{grid-template-columns:1fr}.runtime-dashboard-columns h4{font-size:12px}.runtime-dashboard-copy{font-size:10px}.real-nutrient-chip,.runtime-dashboard-chip{font-size:10px}}
    `;
    document.head.appendChild(style);
  }

  function runPatch() {
    installStyles();
    patchMealCards();
    renderDashboardBreakdown();
  }

  function installRenderHook() {
    if (window.renderAll?.nutritionBreakdownPatched) return;
    if (typeof window.renderAll !== 'function') return;
    const original = window.renderAll;
    const patched = function patchedRenderAll(...args) {
      const result = original.apply(this, args);
      setTimeout(runPatch, 0);
      return result;
    };
    patched.nutritionBreakdownPatched = true;
    window.renderAll = patched;
  }

  installRenderHook();
  runPatch();
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    runPatch();
    if (tries > 30) clearInterval(timer);
  }, 300);
})();
