(function compactDashboardMealList() {
  function addStyles() {
    let style = document.getElementById('compactMealsStyles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'compactMealsStyles';
      document.head.appendChild(style);
    }
    style.textContent = `
      #page-dashboard .dashboard-main-column { gap: 10px !important; }
      #page-dashboard .today-food-panel { padding: 10px !important; }
      #page-dashboard .meal-list { gap: 5px !important; }
      #page-dashboard .meal-type-group { padding: 6px !important; margin: 5px 0 !important; }
      #page-dashboard .meal-type-heading { padding: 0 2px 4px !important; margin: 0 !important; }
      #page-dashboard .meal-card { min-height: 64px !important; padding: 6px !important; gap: 7px !important; border-radius: 12px !important; }
      #page-dashboard .meal-card img, #page-dashboard .meal-card .meal-photo { width: 56px !important; height: 56px !important; border-radius: 10px !important; object-fit: cover !important; }
      #page-dashboard .meal-card h4 { margin: 0 0 2px !important; font-size: 12px !important; line-height: 1.15 !important; }
      #page-dashboard .meal-card p { margin: 0 !important; font-size: 10px !important; line-height: 1.2 !important; }
      #page-dashboard .meal-card > strong { font-size: 10px !important; padding: 4px 6px !important; }
      #page-dashboard .meal-actions { margin-top: 4px !important; gap: 4px !important; }
      #page-dashboard .meal-actions button { min-height: 22px !important; padding: 0 6px !important; font-size: 9px !important; }
      #page-dashboard .daily-summary { padding: 12px !important; }
    `;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addStyles);
  else addStyles();
  setTimeout(addStyles, 800);
})();
