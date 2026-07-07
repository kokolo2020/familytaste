(function patchMealDisplaySortOrder() {
  const mealTypeRank = {
    dessert: 6,
    dinner: 5,
    snack: 4,
    lunch: 3,
    brunch: 2,
    breakfast: 1,
    other: 0
  };

  const mealTypeLabels = {
    breakfast: '☀️ Breakfast',
    brunch: '🥞 Brunch',
    lunch: '🌤️ Lunch',
    dinner: '🌙 Dinner',
    snack: '🍎 Snacks',
    dessert: '🍰 Dessert',
    other: '🍽️ Other'
  };

  function getStoredMealType(meal) {
    return String(meal?.notes || '').match(/\[\[meal_type:([^\]]+)\]\]/i)?.[1]?.toLowerCase() || 'other';
  }

  function mealTimeValue(meal) {
    const type = getStoredMealType(meal);
    const typeScore = mealTypeRank[type] ?? mealTypeRank.other;
    const eatenAt = new Date(meal?.eaten_at || meal?.created_at || Date.now()).getTime();
    return (typeScore * 10000000000000) + (Number.isFinite(eatenAt) ? eatenAt : 0);
  }

  function sortMealsByMealTime(meals) {
    return [...(meals || [])].sort((a, b) => mealTimeValue(b) - mealTimeValue(a));
  }

  function mealCaloriesTotal(meals) {
    return meals.reduce((total, meal) => total + (Number(meal.calories) || 0), 0);
  }

  function getDayKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function formatDayTitle(date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (sameDay(date, today)) return 'Today';
    if (sameDay(date, yesterday)) return 'Yesterday';
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(date);
  }

  function renderSortedMealList(elementId, meals, emptyMessage) {
    const target = document.getElementById(elementId);
    if (!target) return;
    if (!meals || !meals.length) {
      target.innerHTML = typeof emptyState === 'function' ? emptyState(emptyMessage) : `<p>${emptyMessage}</p>`;
      return;
    }

    const days = new Map();
    meals.forEach((meal) => {
      const mealDate = new Date(meal.eaten_at || meal.created_at || Date.now());
      const key = getDayKey(mealDate);
      if (!days.has(key)) days.set(key, { date: mealDate, meals: [] });
      days.get(key).meals.push(meal);
    });

    target.innerHTML = Array.from(days.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((day) => {
        const sortedMeals = sortMealsByMealTime(day.meals);
        const groups = sortedMeals.reduce((items, meal) => {
          const type = getStoredMealType(meal);
          const group = items.find((item) => item.type === type);
          if (group) group.meals.push(meal);
          else items.push({ type, meals: [meal] });
          return items;
        }, []);

        return `
          <section class="meal-day-group">
            <div class="meal-day-heading">
              <strong>📅 ${formatDayTitle(day.date)}</strong>
              <span>${day.meals.length} meal${day.meals.length === 1 ? '' : 's'} · ${mealCaloriesTotal(day.meals).toLocaleString()} cal</span>
            </div>
            ${groups.map((group) => `
              <section class="meal-type-group">
                <div class="meal-type-heading">
                  <strong>${mealTypeLabels[group.type] || mealTypeLabels.other}</strong>
                  <span>${group.meals.length} item${group.meals.length === 1 ? '' : 's'} · ${mealCaloriesTotal(group.meals).toLocaleString()} cal</span>
                </div>
                ${group.meals.map((meal) => mealTemplate(meal, true)).join('')}
              </section>
            `).join('')}
          </section>
        `;
      }).join('');
  }

  function loadScriptOnce(src) {
    if (document.querySelector(`script[src^="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = `${src}?v=1`;
    script.async = false;
    document.body.appendChild(script);
  }

  function installSortPatch() {
    if (typeof mealTemplate !== 'function' || typeof getMemberMeals !== 'function') return false;

    window.renderFoodList = function patchedRenderFoodList(elementId, meals, emptyMessage) {
      renderSortedMealList(elementId, sortMealsByMealTime(meals), emptyMessage);
    };

    window.renderMeals = function patchedRenderMeals() {
      renderSortedMealList('timelineList', sortMealsByMealTime(getMemberMeals()), 'Your food timeline will appear here.');
    };

    if (typeof renderAll === 'function') renderAll();
    loadScriptOnce('profile-save-fix.js');
    loadScriptOnce('compact-meals-patch.js');
    return true;
  }

  if (!installSortPatch()) {
    const retry = setInterval(() => {
      if (installSortPatch()) clearInterval(retry);
    }, 100);
    setTimeout(() => clearInterval(retry), 3000);
  }
})();
