(function addBodyDetailsButtonFallback() {
  function createDetailsPage() {
    const shell = document.querySelector('.content-shell');
    if (!shell || document.getElementById('page-body-details')) return;
    const page = document.createElement('section');
    page.id = 'page-body-details';
    page.className = 'page';
    page.dataset.title = 'Body Analysis';
    page.dataset.kicker = 'Full food impact';
    page.innerHTML = '<div class="dashboard-card" style="padding:22px"><button class="secondary-button" data-page="dashboard" type="button">← Back</button><h3 style="margin-top:18px">AI Food Impact – Full Details</h3><p class="muted">Detailed body analysis page is ready for the next design pass.</p><div class="body-impact-panel dashboard-card" style="margin-top:16px;padding:22px"><div class="body-impact-content"><div class="human-figure"><img src="assets/illustrations/anatomical-body.png" alt="Anatomical wellness illustration"></div><div class="body-impact-list"><article class="impact-callout impact-brain"><span class="impact-callout-title">🧠 Brain</span><strong>28%</strong><p>Food support for focus and steady fuel.</p></article><article class="impact-callout impact-heart"><span class="impact-callout-title">❤️ Heart</span><strong>0%</strong><p>Add heart-supporting foods for better balance.</p></article><article class="impact-callout impact-muscles"><span class="impact-callout-title">💪 Muscles</span><strong>16%</strong><p>Protein foods help muscle repair.</p></article><article class="impact-callout impact-digestion"><span class="impact-callout-title">🌙 Digestion</span><strong>33%</strong><p>Meals contribute to digestion and absorption.</p></article><article class="impact-callout impact-energy"><span class="impact-callout-title">⚡ Energy</span><strong>100%</strong><p>Logged meals provide today’s energy.</p></article><article class="impact-callout impact-bones"><span class="impact-callout-title">🦴 Bones</span><strong>16%</strong><p>Calcium-rich foods support bones.</p></article></div></div></div></div>';
    shell.appendChild(page);
  }

  function addButton() {
    const panel = document.querySelector('.body-impact-panel');
    if (!panel || document.getElementById('bodyDetailsButton')) return false;
    const button = document.createElement('button');
    button.id = 'bodyDetailsButton';
    button.className = 'secondary-button';
    button.type = 'button';
    button.dataset.page = 'body-details';
    button.style.width = '100%';
    button.style.marginTop = '14px';
    button.textContent = 'View Full Details ›';
    panel.appendChild(button);
    return true;
  }

  function install() {
    createDetailsPage();
    addButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  setTimeout(install, 300);
  setTimeout(install, 1000);
  setTimeout(install, 2000);
})();
