(function compactDashboardMealList() {
  function addStyles() {
    if (document.getElementById('compactMealsStyles')) return;
    const style = document.createElement('style');
    style.id = 'compactMealsStyles';
    style.textContent = `
      #page-dashboard .today-food-panel,
      #page-dashboard .yesterday-diary-card {
        padding: 14px;
      }

      #page-dashboard .meal-day-group {
        padding: 0;
      }

      #page-dashboard .meal-day-heading {
        padding: 10px 12px;
        margin-bottom: 8px;
        border-radius: 14px;
        background: rgba(255,255,255,.72);
      }

      #page-dashboard .meal-type-group {
        padding: 10px 8px 8px;
        margin: 8px 0;
        border-radius: 16px;
        background: rgba(255, 251, 244, .72);
        border: 1px solid rgba(126, 84, 39, .08);
      }

      #page-dashboard .meal-type-heading {
        padding: 0 4px 8px;
        margin-bottom: 6px;
        font-size: 13px;
      }

      #page-dashboard .meal-list {
        gap: 8px;
      }

      #page-dashboard .meal-card {
        display: grid;
        grid-template-columns: 76px minmax(0, 1fr) auto;
        align-items: center;
        gap: 12px;
        min-height: 92px;
        padding: 10px;
        border-radius: 15px;
        box-shadow: 0 8px 18px rgba(83, 50, 18, .045);
      }

      #page-dashboard .meal-card img,
      #page-dashboard .meal-card .meal-photo,
      #page-dashboard .meal-card > img {
        width: 76px !important;
        height: 76px !important;
        border-radius: 12px;
        object-fit: cover;
      }

      #page-dashboard .meal-card h4 {
        margin: 0 0 6px;
        font-size: 14px;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      #page-dashboard .meal-card p {
        margin: 0;
        font-size: 12px;
        line-height: 1.35;
      }

      #page-dashboard .meal-card .meal-meta,
      #page-dashboard .meal-card .meal-actions,
      #page-dashboard .meal-card .meal-card-actions {
        gap: 6px;
      }

      #page-dashboard .meal-card button {
        min-height: 30px;
        padding: 0 8px;
        border-radius: 999px;
        font-size: 11px;
      }

      #page-dashboard .meal-card [class*="calorie"],
      #page-dashboard .meal-card [class*="calories"] {
        font-size: 12px;
        padding: 6px 9px;
        border-radius: 10px;
      }

      #page-dashboard .meal-card > span:first-child:not(.meal-emoji) {
        font-size: 13px;
      }

      #page-dashboard .yesterday-diary-card {
        margin-top: 12px;
      }

      #page-dashboard .daily-summary {
        padding: 16px;
      }

      #page-dashboard .summary-grid article {
        min-height: 82px;
        padding: 10px 6px;
      }

      #page-dashboard .summary-grid article > span {
        font-size: 20px;
      }

      #page-dashboard .summary-grid strong {
        font-size: 18px;
      }

      #page-dashboard .calorie-overview {
        margin-top: 12px;
        padding-top: 12px;
      }

      #page-dashboard .dashboard-main-column,
      #page-dashboard .dashboard-side-column {
        gap: 14px;
      }

      #page-dashboard .content-shell,
      #page-dashboard .dashboard-layout {
        padding-bottom: 12px;
      }

      @media (max-width: 760px) {
        #page-dashboard .meal-card {
          grid-template-columns: 68px minmax(0, 1fr) auto;
          min-height: 82px;
          gap: 10px;
          padding: 8px;
        }
        #page-dashboard .meal-card img,
        #page-dashboard .meal-card .meal-photo,
        #page-dashboard .meal-card > img {
          width: 68px !important;
          height: 68px !important;
        }
        #page-dashboard .meal-card h4 {
          font-size: 13px;
        }
        #page-dashboard .meal-card p {
          font-size: 11px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addStyles);
  else addStyles();
})();
