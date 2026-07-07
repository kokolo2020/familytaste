(function addVisibleBodyDetailsButton() {
  function ensurePage() {
    var shell = document.querySelector('.content-shell');
    if (!shell || document.getElementById('page-body-details')) return;
    var page = document.createElement('section');
    page.id = 'page-body-details';
    page.className = 'page';
    page.dataset.title = 'Body Analysis';
    page.dataset.kicker = 'Food impact details';
    page.innerHTML = '<section class="dashboard-card" style="padding:22px"><button class="secondary-button" data-page="dashboard" type="button">← Back</button><h3 style="margin:18px 0 8px">Detailed Body Analysis</h3><p class="muted">More body-system food insights will appear here.</p><section class="body-impact-panel dashboard-card" style="margin-top:16px;padding:22px"><div class="body-impact-content"><div class="human-figure" aria-hidden="true"><img src="assets/illustrations/anatomical-body.png" alt="Anatomical wellness illustration"></div><div class="body-impact-list"><article class="impact-callout impact-brain"><span class="impact-callout-title">🧠 Brain</span><strong>28%</strong><p>Focus and steady fuel.</p></article><article class="impact-callout impact-heart"><span class="impact-callout-title">❤️ Heart</span><strong>0%</strong><p>Heart-supporting foods.</p></article><article class="impact-callout impact-muscles"><span class="impact-callout-title">💪 Muscles</span><strong>16%</strong><p>Protein support.</p></article><article class="impact-callout impact-digestion"><span class="impact-callout-title">🌙 Digestion</span><strong>33%</strong><p>Nutrient absorption.</p></article><article class="impact-callout impact-energy"><span class="impact-callout-title">⚡ Energy</span><strong>100%</strong><p>Daily energy support.</p></article><article class="impact-callout impact-bones"><span class="impact-callout-title">🦴 Bones</span><strong>16%</strong><p>Bone nutrients.</p></article></div></div></section></section>';
    shell.appendChild(page);
  }

  function ensureButton() {
    var panel = document.querySelector('.body-impact-panel');
    if (!panel || document.getElementById('bodyDetailsButton')) return;
    var button = document.createElement('button');
    button.id = 'bodyDetailsButton';
    button.className = 'secondary-button';
    button.type = 'button';
    button.dataset.page = 'body-details';
    button.style.width = '100%';
    button.style.marginTop = '14px';
    button.textContent = 'View Full Details ›';
    panel.appendChild(button);
  }

  function install() {
    ensurePage();
    ensureButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  setTimeout(install, 500);
  setTimeout(install, 1500);
  setTimeout(install, 2500);
})();
