(function patchMealDateDisplayAndEntryTime() {
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
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

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function toLocalDateValue(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function toLocalTimeValue(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function localDateTimeToIso(dateValue, timeValue) {
    const now = new Date();
    const [year, month, day] = String(dateValue || toLocalDateValue(now)).split('-').map(Number);
    const [hour, minute] = String(timeValue || toLocalTimeValue(now)).split(':').map(Number);
    const date = new Date(year || now.getFullYear(), (month || now.getMonth() + 1) - 1, day || now.getDate(), hour || 0, minute || 0, 0, 0);
    return date.toISOString();
  }

  function installMealDisplayPatch() {
    if (typeof window.mealDisplayMeta !== 'function' && typeof mealDisplayMeta !== 'function') return false;

    window.mealDisplayMeta = function mealDisplayMetaWithDate(meal) {
      const storedType = String(meal?.notes || '').match(/\[\[meal_type:([^\]]+)\]\]/i)?.[1]?.toLowerCase() || '';
      const label = storedType
        ? storedType.charAt(0).toUpperCase() + storedType.slice(1)
        : meal.restaurant_name || 'Family meal';
      const mealDate = new Date(meal.eaten_at || meal.created_at || Date.now());
      const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(mealDate);
      const prefix = datePrefix(mealDate);

      return [prefix, label, time].filter(Boolean).join(' · ');
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
    const fieldsReady = installDateTimeFields();
    const saveReady = installSavePatch();
    return displayReady && fieldsReady && saveReady;
  }

  if (!installAll()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (installAll() || tries > 30) clearInterval(timer);
    }, 100);
  }
})();
