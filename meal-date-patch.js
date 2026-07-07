(function patchMealDateDisplayAndEntryTime() {
  const mealTypeOrder = ['breakfast', 'brunch', 'lunch', 'dinner', 'snack', 'dessert', 'other'];
  const mealTypeLabels = {
    breakfast: '☀️ Breakfast',
    brunch: '🥞 Brunch',
    lunch: '🌤️ Lunch',
    dinner: '🌙 Dinner',
    snack: '🍎 Snacks',
    dessert: '🍰 Dessert',
    other: '🍽️ Other'
  };

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function toLocalDateValue(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function toLocalTimeValue(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function dayKey(date) {
    return toLocalDateValue(date);
  }

  function formatDayTitle(date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (sameDay(date, today)) return 'Today';
    if (sameDay(date, yesterday)) return 'Yesterday';

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  function datePrefix(date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (sameDay(date, today)) return '';
    if (sameDay(date, yesterday)) return 'Yesterday';

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  function localDateTimeToIso(dateValue, timeValue) {
    const now = new Date();
    const [year, month, day] = String(dateValue || toLocalDateValue(now)).split('-').map(Number);
    const [hour, minute] = String(timeValue || toLocalTimeValue(now)).split(':').map(Number);
    const date = new Date(year || now.getFullYear(), (month || now.getMonth() + 1) - 1, day || now.getDate(), hour || 0, minute || 0, 0, 0);
    return date.toISOString();
  }

  function getStoredMealType(meal) {
    return String(meal?.notes || '').match(/\[\[meal_type:([^\]]+)\]\]/i)?.[1]?.toLowerCase() || 'other';
  }

  function getStoredHealthScore(meal) {
    const match = String(meal?.notes || '').match(/\[\[health_score:([0-9.]+)\]\]/i);
    return match ? Number(match[1]) : null;
  }

  function stripHealthScore(notes) {
    return String(notes || '').replace(/\s*\[\[health_score:[^\]]+\]\]\s*/ig, ' ').trim();
  }

  function notesWithHealthScore(notes, score) {
    const cleanNotes = stripHealthScore(notes);
    return `${cleanNotes}${cleanNotes ? ' ' : ''}[[health_score:${Number(score).toFixed(1)}]]`;
  }

  function clampScore(value) {
    return Math.max(1, Math.min(10, Number(value) || 5));
  }

  function healthScoreForMeal(meal) {
    const saved = getStoredHealthScore(meal);
    if (saved !== null && !Number.isNaN(saved)) return clampScore(saved);

    const name = `${meal?.food_name || ''} ${meal?.restaurant_name || ''} ${meal?.notes || ''}`.toLowerCase();
    const calories = Number(meal?.calories) || 0;
    let score = 6.4;

    const excellentFoods = ['salmon', 'fish', 'tuna', 'sardine', 'chicken breast', 'grilled chicken', 'egg', 'tofu', 'beans', 'lentil', 'oat', 'brown rice', 'quinoa', 'salad', 'vegetable', 'veggie', 'broccoli', 'spinach', 'kale', 'avocado', 'fruit', 'apple', 'banana', 'berry', 'yogurt', 'milk'];
    const poorFoods = ['fried', 'fries', 'burger', 'pizza', 'soda', 'cola', 'coke', 'cake', 'donut', 'doughnut', 'candy', 'ice cream', 'chips', 'instant noodle', 'processed', 'sausage', 'bacon'];
    const mealType = getStoredMealType(meal);

    excellentFoods.forEach((word) => {
      if (name.includes(word)) score += 0.35;
    });
    poorFoods.forEach((word) => {
      if (name.includes(word)) score -= 0.45;
    });

    if (name.includes('grilled') || name.includes('steamed') || name.includes('boiled') || name.includes('baked')) score += 0.6;
    if (name.includes('deep fried') || name.includes('fried')) score -= 0.7;
    if (name.includes('water')) score += 0.2;
    if (name.includes('vegetable') || name.includes('salad') || name.includes('greens')) score += 0.8;
    if (name.includes('fruit') || name.includes('apple') || name.includes('banana') || name.includes('berry')) score += 0.5;
    if (name.includes('soda') || name.includes('cola') || name.includes('sweet tea')) score -= 0.9;

    if (calories > 0) {
      if (mealType === 'snack' || mealType === 'dessert') {
        if (calories <= 250) score += 0.4;
        if (calories > 450) score -= 0.8;
      } else {
        if (calories >= 350 && calories <= 850) score += 0.3;
        if (calories > 1000) score -= 0.9;
        if (calories > 1400) score -= 0.8;
        if (calories < 180) score -= 0.3;
      }
    }

    return Math.round(clampScore(score) * 10) / 10;
  }

  function healthScoreMeta(score) {
    if (score >= 8.5) return { label: 'Excellent', tone: 'excellent', dot: '🟢' };
    if (score >= 7) return { label: 'Healthy', tone: 'healthy', dot: '🟢' };
    if (score >= 5.5) return { label: 'Fair', tone: 'fair', dot: '🟡' };
    if (score >= 4) return { label: 'Improve', tone: 'improve', dot: '🟠' };
    return { label: 'Poor', tone: 'poor', dot: '🔴' };
  }

  function healthScoreBadge(meal) {
    const score = healthScoreForMeal(meal);
    const meta = healthScoreMeta(score);
    return `<span class="health-score-badge ${meta.tone}" title="Health Score: ${score.toFixed(1)}/10">${meta.dot} ${score.toFixed(1)}</span>`;
  }

  function mealCaloriesTotal(meals) {
    return meals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
  }

  function mealCardTemplate(meal, withActions = false) {
    const actions = withActions ? `
        <div class="meal-actions" aria-label="Actions for ${escapeAttr(meal.food_name)}">
          <button class="meal-edit-button" type="button" data-edit-meal="${escapeAttr(meal.id)}">✏️ Edit</button>
          <button class="meal-delete-button" type="button" data-delete-meal="${escapeAttr(meal.id)}">🗑 Delete</button>
        </div>` : '';
    return `
      <article class="meal-card ${meal.photo_url ? 'has-photo' : ''}">
        <span class="meal-emoji">${mealEmoji(meal.food_name)}</span>
        ${meal.photo_url ? `<img class="meal-photo" src="${escapeAttr(meal.photo_url)}" alt="${escapeAttr(meal.food_name)}">` : ''}
        <div>
          <h4 class="meal-title-with-score"><span>${escapeHtml(meal.food_name)}</span>${healthScoreBadge(meal)}</h4>
          <p>${escapeHtml(mealDisplayMeta(meal))}</p>${actions}
        </div>
        <strong>${Number(meal.calories || 0).toLocaleString()} cal</strong>
      </article>
    `;
  }

  function installMealDisplayPatch() {
    if (typeof window.mealDisplayMeta !== 'function' && typeof mealDisplayMeta !== 'function') return false;

    window.mealDisplayMeta = function mealDisplayMetaWithDate(meal) {
      const storedType = getStoredMealType(meal);
      const label = storedType !== 'other'
        ? storedType.charAt(0).toUpperCase() + storedType.slice(1)
        : meal.restaurant_name || 'Family meal';
      const mealDate = new Date(meal.eaten_at || meal.created_at || Date.now());
      const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(mealDate);
      const prefix = datePrefix(mealDate);

      return [prefix, label, time].filter(Boolean).join(' · ');
    };

    window.mealTemplate = mealCardTemplate;
    return true;
  }

  function renderGroupedMealList(elementId, meals, emptyMessage) {
    const target = document.getElementById(elementId);
    if (!target) return;
    if (!meals || !meals.length) {
      target.innerHTML = typeof emptyState === 'function' ? emptyState(emptyMessage) : `<p>${emptyMessage}</p>`;
      return;
    }

    const days = new Map();
    meals.forEach((meal) => {
      const mealDate = new Date(meal.eaten_at || meal.created_at || Date.now());
      const key = dayKey(mealDate);
      if (!days.has(key)) days.set(key, { date: mealDate, meals: [] });
      days.get(key).meals.push(meal);
    });

    const html = Array.from(days.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((day) => {
        const byType = new Map();
        day.meals.forEach((meal) => {
          const type = getStoredMealType(meal);
          if (!byType.has(type)) byType.set(type, []);
          byType.get(type).push(meal);
        });

        const groups = mealTypeOrder
          .filter((type) => byType.has(type))
          .map((type) => {
            const groupMeals = byType.get(type).sort((a, b) => new Date(a.eaten_at || a.created_at).getTime() - new Date(b.eaten_at || b.created_at).getTime());
            return `
              <section class="meal-type-group">
                <div class="meal-type-heading">
                  <strong>${mealTypeLabels[type] || mealTypeLabels.other}</strong>
                  <span>${groupMeals.length} item${groupMeals.length === 1 ? '' : 's'} · ${mealCaloriesTotal(groupMeals).toLocaleString()} cal</span>
                </div>
                ${groupMeals.map((meal) => mealCardTemplate(meal, true)).join('')}
              </section>
            `;
          }).join('');

        return `
          <section class="meal-day-group">
            <div class="meal-day-heading">
              <strong>📅 ${formatDayTitle(day.date)}</strong>
              <span>${day.meals.length} meal${day.meals.length === 1 ? '' : 's'} · ${mealCaloriesTotal(day.meals).toLocaleString()} cal</span>
            </div>
            ${groups}
          </section>
        `;
      }).join('');

    target.innerHTML = html;
  }

  function installGroupedMealLists() {
    if (typeof window.mealTemplate !== 'function' && typeof mealTemplate !== 'function') return false;

    window.renderFoodList = function patchedRenderFoodList(elementId, meals, emptyMessage) {
      renderGroupedMealList(elementId, meals, emptyMessage);
    };

    window.renderMeals = function patchedRenderMeals() {
      renderGroupedMealList('timelineList', getMemberMeals(), 'Your food timeline will appear here.');
    };

    if (typeof window.renderAll === 'function') window.renderAll();
    return true;
  }

  function installDateTimeFields() {
    const form = document.getElementById('mealForm');
    const mealType = document.getElementById('mealType');
    if (!form || !mealType || document.getElementById('mealDate')) return Boolean(form && mealType);

    const now = new Date();
    const row = document.createElement('div');
    row.className = 'meal-date-time-row';
    row.innerHTML = `
      <label>Meal Date<input id="mealDate" name="meal_date" type="date" required></label>
      <label>Meal Time<input id="mealTime" name="meal_time" type="time" required></label>
    `;
    mealType.closest('label').insertAdjacentElement('afterend', row);
    document.getElementById('mealDate').value = toLocalDateValue(now);
    document.getElementById('mealTime').value = toLocalTimeValue(now);
    return true;
  }

  function mealText(meal) {
    return `${meal?.food_name || ''} ${meal?.restaurant_name || ''} ${meal?.notes || ''}`.toLowerCase();
  }

  function mealsSince(daysBack) {
    const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
    const meals = typeof getMemberMeals === 'function' ? getMemberMeals() : (appState.meals || []);
    return meals.filter((meal) => new Date(meal.eaten_at || meal.created_at || Date.now()).getTime() >= cutoff);
  }

  function countMatches(meals, words) {
    return meals.reduce((count, meal) => {
      const text = mealText(meal);
      return count + (words.some((word) => text.includes(word)) ? 1 : 0);
    }, 0);
  }

  function buildAiCoachMessage() {
    const recentMeals = mealsSince(2);
    if (!recentMeals.length) {
      return {
        title: 'Start your AI nutrition coach',
        copy: 'Log meals today and I will start giving gentle balance reminders based on your recent food pattern.',
        chips: ['Waiting for meals']
      };
    }

    const vegetables = countMatches(recentMeals, ['vegetable', 'veggie', 'salad', 'greens', 'broccoli', 'spinach', 'kale', 'cucumber', 'tomato', 'carrot']);
    const fruits = countMatches(recentMeals, ['fruit', 'apple', 'banana', 'berry', 'orange', 'mango', 'grape', 'melon', 'pineapple']);
    const dairy = countMatches(recentMeals, ['milk', 'yogurt', 'cheese', 'dairy']);
    const protein = countMatches(recentMeals, ['chicken', 'fish', 'salmon', 'tuna', 'egg', 'beef', 'pork', 'tofu', 'beans', 'lentil', 'shrimp']);
    const fried = countMatches(recentMeals, ['fried', 'fries', 'chips', 'burger', 'pizza', 'soda', 'cola', 'cake', 'donut', 'ice cream']);

    const missing = [];
    if (vegetables < 2) missing.push('green vegetables');
    if (fruits < 1) missing.push('fruit');
    if (dairy < 1) missing.push('dairy or calcium food');
    if (protein < 2) missing.push('protein');

    if (missing.length) {
      return {
        title: 'Gentle balance reminder',
        copy: `Over the last 2 days, your meals look low in ${missing.slice(0, 3).join(', ')}. Try adding one simple serving today to improve your balance.`,
        chips: missing.slice(0, 3)
      };
    }

    if (fried >= 2) {
      return {
        title: 'Small improvement idea',
        copy: 'You have logged a few fried or sweet items recently. Balance them today with water, greens, and a lean protein.',
        chips: ['Hydrate', 'Add greens', 'Lean protein']
      };
    }

    return {
      title: 'Nice balance recently',
      copy: 'Your recent meals show a good mix. Keep adding colorful vegetables, fruit, and protein to stay balanced.',
      chips: ['Good variety', 'Keep going']
    };
  }

  function installAiCoachCard() {
    if (document.getElementById('aiNutritionCoachCard')) {
      renderAiCoachCard();
      return true;
    }

    const nutritionPanel = document.querySelector('.nutrition-panel');
    const dailySummary = document.querySelector('.daily-summary');
    const anchor = nutritionPanel || dailySummary;
    if (!anchor) return false;

    const card = document.createElement('section');
    card.id = 'aiNutritionCoachCard';
    card.className = 'ai-coach-card dashboard-card';
    card.innerHTML = `
      <div class="ai-coach-heading">
        <div><p class="eyebrow">AI Coach</p><h3 id="aiCoachTitle">Gentle nutrition reminder</h3></div>
        <span class="ai-badge">AI</span>
      </div>
      <p id="aiCoachCopy">Analyzing recent meals...</p>
      <div id="aiCoachChips" class="ai-coach-chips"></div>
    `;
    anchor.insertAdjacentElement('afterend', card);
    renderAiCoachCard();
    return true;
  }

  function renderAiCoachCard() {
    const title = document.getElementById('aiCoachTitle');
    const copy = document.getElementById('aiCoachCopy');
    const chips = document.getElementById('aiCoachChips');
    if (!title || !copy || !chips) return;

    const message = buildAiCoachMessage();
    title.textContent = message.title;
    copy.textContent = message.copy;
    chips.innerHTML = (message.chips || []).map((chip) => `<span>${escapeHtml(chip)}</span>`).join('');
  }

  function installRenderHook() {
    if (window.renderAll?.aiCoachPatched) return true;
    if (typeof window.renderAll !== 'function') return false;
    const originalRenderAll = window.renderAll;
    const patchedRenderAll = function patchedRenderAllWithAiCoach(...args) {
      const result = originalRenderAll.apply(this, args);
      setTimeout(() => {
        installAiCoachCard();
        renderAiCoachCard();
      }, 0);
      return result;
    };
    patchedRenderAll.aiCoachPatched = true;
    window.renderAll = patchedRenderAll;
    return true;
  }

  function installStyles() {
    if (document.getElementById('mealGroupingStyles')) return true;
    const style = document.createElement('style');
    style.id = 'mealGroupingStyles';
    style.textContent = `
      .meal-date-time-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .meal-day-group{display:grid;gap:10px;margin-bottom:16px}
      .meal-day-heading,.meal-type-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .meal-day-heading{padding:10px 2px 2px;border-bottom:1px solid rgba(77,54,31,.12)}
      .meal-day-heading strong{font-size:15px;color:#2f2318}
      .meal-day-heading span,.meal-type-heading span{color:#7d6d5d;font-size:12px;font-weight:800;white-space:nowrap}
      .meal-type-group{display:grid;gap:8px;padding:10px;border-radius:18px;background:rgba(255,248,237,.72);border:1px solid rgba(77,54,31,.08)}
      .meal-type-heading strong{font-size:13px;color:#5a3b1c}
      .meal-title-with-score{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .health-score-badge{display:inline-flex;align-items:center;gap:3px;padding:3px 7px;border-radius:999px;font-size:11px;font-weight:900;line-height:1;border:1px solid transparent;white-space:nowrap}
      .health-score-badge.excellent,.health-score-badge.healthy{background:#e8f7e8;color:#1f7a3a;border-color:#bfe8c4}
      .health-score-badge.fair{background:#fff7d6;color:#9a6a00;border-color:#f2dc82}
      .health-score-badge.improve{background:#fff0dd;color:#b75600;border-color:#f0c08a}
      .health-score-badge.poor{background:#ffe7e5;color:#b52d24;border-color:#f1aaa4}
      .ai-coach-card{margin-top:14px;padding:16px;display:grid;gap:10px;background:linear-gradient(135deg,#fffdf7,#f2ffe9)}
      .ai-coach-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
      .ai-coach-heading h3{margin:2px 0 0}
      .ai-coach-card p:last-of-type{margin:0;color:#6f6253;line-height:1.45}
      .ai-coach-chips{display:flex;flex-wrap:wrap;gap:7px}
      .ai-coach-chips span{padding:6px 9px;border-radius:999px;background:#fff;border:1px solid rgba(77,54,31,.12);font-size:11px;font-weight:900;color:#5a3b1c}
      @media(max-width:520px){.meal-date-time-row{grid-template-columns:1fr}.meal-day-heading,.meal-type-heading{align-items:flex-start;flex-direction:column;gap:3px}.meal-day-heading span,.meal-type-heading span{white-space:normal}}
    `;
    document.head.appendChild(style);
    return true;
  }

  function resetDateTimeDefaults() {
    const now = new Date();
    const mealDate = document.getElementById('mealDate');
    const mealTime = document.getElementById('mealTime');
    if (mealDate) mealDate.value = toLocalDateValue(now);
    if (mealTime) mealTime.value = toLocalTimeValue(now);
  }

  function installSavePatch() {
    const form = document.getElementById('mealForm');
    if (!form || form.dataset.dateTimePatchInstalled === 'true') return Boolean(form);
    form.dataset.dateTimePatchInstalled = 'true';

    const upload = document.getElementById('mealPhotoUpload');
    const camera = document.getElementById('mealPhotoCamera');
    if (upload) upload.multiple = false;
    if (camera) camera.multiple = false;
    const hint = document.getElementById('photoHint');
    if (hint) hint.textContent = 'Choose one photo. For best AI accuracy, include the full meal in the picture.';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const formData = new FormData(form);
      const photoUrl = document.getElementById('photoPreview')?.dataset.photoUrl || '';
      const foodName = String(formData.get('food_name') || '').trim();
      if (!foodName) return;

      const baseMeal = {
        food_name: foodName,
        restaurant_name: String(formData.get('restaurant_name') || '').trim(),
        calories: numberOrNull(formData.get('calories')),
        notes: notesWithMealType(formData.get('notes'), formData.get('meal_type'))
      };
      const healthScore = healthScoreForMeal(baseMeal);

      const meal = {
        id: crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}`,
        family_id: appState.familyId,
        member_id: appState.currentMember.id,
        food_name: foodName,
        restaurant_name: baseMeal.restaurant_name,
        location_name: String(formData.get('location_name') || '').trim(),
        price: numberOrNull(formData.get('price')),
        calories: baseMeal.calories,
        notes: notesWithHealthScore(baseMeal.notes, healthScore),
        photo_url: photoUrl,
        eaten_at: localDateTimeToIso(formData.get('meal_date'), formData.get('meal_time'))
      };

      appState.meals.unshift(meal);
      saveStoredAppData();
      form.reset();
      resetPhotoPreview();
      resetDateTimeDefaults();
      showPage('dashboard');
      renderAll();
      renderAiCoachCard();

      if (window.familyBitesDb?.isConfigured) {
        try {
          if (meal.photo_url && meal.photo_url.startsWith('data:')) {
            try {
              const uploadedUrl = await window.familyBitesDb.uploadMealPhoto(meal.photo_url);
              if (uploadedUrl) meal.photo_url = uploadedUrl;
            } catch (uploadError) {
              console.warn('Photo upload to storage failed, keeping local copy.', uploadError);
            }
          }
          const savedMeal = await window.familyBitesDb.saveMeal(meal);
          appState.meals = appState.meals.map((item) => item.id === meal.id ? normalizeMeal(savedMeal) : item);
          saveStoredAppData();
          renderAll();
          renderAiCoachCard();
        } catch (error) {
          console.warn('Meal saved locally but Supabase write failed.', error);
        }
      }
    }, true);

    return true;
  }

  function installAll() {
    const displayReady = installMealDisplayPatch();
    const stylesReady = installStyles();
    const fieldsReady = installDateTimeFields();
    const groupsReady = installGroupedMealLists();
    const renderHookReady = installRenderHook();
    const coachReady = installAiCoachCard();
    const saveReady = installSavePatch();
    return displayReady && stylesReady && fieldsReady && groupsReady && renderHookReady && coachReady && saveReady;
  }

  if (!installAll()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (installAll() || tries > 30) clearInterval(timer);
    }, 100);
  }
})();
