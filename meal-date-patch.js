(function patchMealDateDisplay() {
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

  function installPatch() {
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

  if (!installPatch()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (installPatch() || tries > 20) clearInterval(timer);
    }, 100);
  }
})();
