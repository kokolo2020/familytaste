(function patchDailyMealCompletionTracker() {
  const mealSteps = [
    { type: 'breakfast', label: 'Breakfast', icon: '☀️' },
    { type: 'brunch', label: 'Brunch', icon: '🥞' },
    { type: 'lunch', label: 'Lunch', icon: '🌤️' },
    { type: 'snack', label: 'Snack', icon: '🍎' },
    { type: 'dinner', label: 'Dinner', icon: '🌙' }
  ];

  function getStoredMealType(meal) {
    return String(meal?.notes || '').match(/\[\[meal_type:([^\]]+)\]\]/i)?.[1]?.toLowerCase() || 'other';
  }

  function injectTrackerStyles() {
    if (document.getElementById('mealCompletionTrackerStyles')) return;
    const style = document.createElement('style');
    style.id = 'mealCompletionTrackerStyles';
    style.textContent = `
      .meal-completion-card {
        margin: 14px 0 16px;
        padding: 16px;
        border-radius: 24px;
        background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(255,245,234,.88));
        border: 1px solid rgba(255, 168, 90, .2);
        box-shadow: 0 16px 36px rgba(70, 40, 20, .08);
      }

      .meal-completion-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .meal-completion-head strong {
        display: block;
        font-size: .98rem;
      }

      .meal-completion-head small {
        color: var(--muted, #8b7b72);
      }

      .meal-completion-progress {
        min-width: 76px;
        text-align: center;
        padding: 8px 10px;
        border-radius: 18px;
        background: rgba(255, 255, 255, .8);
        font-weight: 800;
      }

      .meal-completion-track {
        height: 8px;
        border-radius: 999px;
        background: rgba(120, 80, 45, .12);
        overflow: hidden;
        margin-bottom: 14px;
      }

      .meal-completion-fill {
        display: block;
        height: 100%;
        width: var(--meal-completion, 0%);
        border-radius: inherit;
        background: linear-gradient(90deg, #ff9f43, #58c27d);
        transition: width .25s ease;
      }

      .meal-completion-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
        gap: 10px;
      }

      .meal-completion-item {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 10px;
        border-radius: 18px;
        background: rgba(255,255,255,.74);
        color: var(--muted, #8b7b72);
        border: 1px solid rgba(120, 80, 45, .08);
      }

      .meal-completion-item.complete {
        color: #245f3f;
        background: rgba(88, 194, 125, .16);
        border-color: rgba(88, 194, 125, .28);
      }

      .meal-completion-item.current {
        color: #8a4b00;
        background: rgba(255, 190, 92, .18);
        border-color: rgba(255, 159, 67, .26);
      }

      .meal-completion-status {
        margin-left: auto;
        font-weight: 900;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureTrackerCard() {
    const todayPanel = document.querySelector('.today-food-panel');
    if (!todayPanel) return null;
    let card = document.getElementById('mealCompletionTracker');
    if (!card) {
      card = document.createElement('section');
      card.id = 'mealCompletionTracker';
      card.className = 'meal-completion-card';
      todayPanel.insertAdjacentElement('beforebegin', card);
    }
    return card;
  }

  function findNextMeal(completedTypes) {
    return mealSteps.find((step) => !completedTypes.has(step.type))?.type || '';
  }

  function renderMealCompletionTracker() {
    injectTrackerStyles();
    const card = ensureTrackerCard();
    if (!card || typeof getMemberMeals !== 'function' || typeof isToday !== 'function') return;

    const todayMeals = getMemberMeals().filter(isToday);
    const completedTypes = new Set(todayMeals.map(getStoredMealType));
    const completedCount = mealSteps.filter((step) => completedTypes.has(step.type)).length;
    const percent = Math.round((completedCount / mealSteps.length) * 100);
    const nextType = findNextMeal(completedTypes);

    card.innerHTML = `
      <div class="meal-completion-head">
        <div>
          <strong>Daily meal tracker</strong>
          <small>${completedCount === mealSteps.length ? 'All key meals are logged for today.' : `Next suggested log: ${mealSteps.find((step) => step.type === nextType)?.label || 'Meal'}`}</small>
        </div>
        <span class="meal-completion-progress">${completedCount}/${mealSteps.length}</span>
      </div>
      <div class="meal-completion-track" aria-label="Daily meal completion ${percent}%">
        <span class="meal-completion-fill" style="--meal-completion:${percent}%"></span>
      </div>
      <div class="meal-completion-list">
        ${mealSteps.map((step) => {
          const isComplete = completedTypes.has(step.type);
          const isCurrent = !isComplete && step.type === nextType;
          return `
            <div class="meal-completion-item ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}">
              <span>${isComplete ? '✅' : isCurrent ? '⏳' : '⬜'}</span>
              <strong>${step.icon} ${step.label}</strong>
              <span class="meal-completion-status">${isComplete ? 'Done' : isCurrent ? 'Next' : ''}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function installTrackerPatch() {
    if (typeof renderDashboard !== 'function') return false;
    const originalRenderDashboard = renderDashboard;
    window.renderDashboard = function renderDashboardWithMealCompletion() {
      originalRenderDashboard();
      renderMealCompletionTracker();
    };
    renderMealCompletionTracker();
    return true;
  }

  if (!installTrackerPatch()) {
    const retry = setInterval(() => {
      if (installTrackerPatch()) clearInterval(retry);
    }, 100);
    setTimeout(() => clearInterval(retry), 3000);
  }
})();
