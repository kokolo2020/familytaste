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

  function mealCaloriesTotal(meals) {
    return meals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
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
                ${groupMeals.map((meal) => mealTemplate(meal, true)).join('')}
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

      const meal = {
        id: crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}`,
        family_id: appState.familyId,
        member_id: appState.currentMember.id,
        food_name: foodName,
        restaurant_name: String(formData.get('restaurant_name') || '').trim(),
        location_name: String(formData.get('location_name') || '').trim(),
        price: numberOrNull(formData.get('price')),
        calories: numberOrNull(formData.get('calories')),
        notes: notesWithMealType(formData.get('notes'), formData.get('meal_type')),
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
    const saveReady = installSavePatch();
    return displayReady && stylesReady && fieldsReady && groupsReady && saveReady;
  }

  if (!installAll()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (installAll() || tries > 30) clearInterval(timer);
    }, 100);
  }
})();
