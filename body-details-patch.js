(function patchBodyDetailsPage() {
  const bodyStats = [
    ['brain','🧠','Brain','28','green tea, walnut halves — supports focus and steady fuel.','purple'],
    ['eyes','👁️','Eyes','62','walnuts, green tea, carrots and greens support vision nutrients.','blue'],
    ['lungs','🫁','Lungs','70','antioxidant-rich foods support respiratory wellness.','teal'],
    ['muscles','💪','Muscles','16','almond milk and protein foods support muscle repair.','orange'],
    ['energy','⚡','Energy','100','today’s logged foods supply steady daily energy.','green'],
    ['immune','🛡️','Immune System','68','green tea, walnuts and greens support immune defense.','violet'],
    ['heart','❤️','Heart','0','No matching heart-supporting food logged yet.','red'],
    ['digestive','🌙','Digestive System','33','dumplings and grains move through digestion for nutrient absorption.','gold'],
    ['bones','🦴','Bones','16','almond milk can contribute calcium and bone nutrients.','sky'],
    ['sugar','🩸','Blood Sugar','42','mixed meals show moderate blood sugar impact.','red'],
    ['hydration','💧','Hydration','58','tea and drinks add to daily fluid intake.','blue'],
    ['liver','🟣','Liver','48','lighter meals and tea support lower processed-food load.','violet'],
    ['sleep','🌙','Sleep Quality','55','earlier tea is better; avoid caffeine late at night.','navy'],
    ['mood','🙂','Mood & Stress','60','walnuts and green tea support balanced mood.','orange'],
    ['weight','⚖️','Weight Management','72','balanced meals help keep portions consistent.','green'],
    ['long','🌱','Longevity','66','plant-rich foods support long-term wellness patterns.','green']
  ];

  function addStyles() {
    if (document.getElementById('bodyDetailsStyles')) return;
    const style = document.createElement('style');
    style.id = 'bodyDetailsStyles';
    style.textContent = `
      .body-details-page{padding:0 0 22px}.body-details-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.body-details-back{border:0;background:#fff7eb;border-radius:14px;padding:10px 13px;font-weight:900;color:#5f3d23}.body-details-shell{padding:22px;border-radius:28px;background:#fffdf8;border:1px solid rgba(126,84,39,.11);box-shadow:0 14px 38px rgba(83,50,18,.07)}.body-details-title{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}.body-details-title h3{margin:0;font-size:28px;line-height:1.05}.body-details-title p{margin:6px 0 0;color:var(--muted,#7f6e5e)}.body-details-pill{display:inline-flex;align-items:center;gap:6px;margin:8px 0 18px;padding:8px 12px;border-radius:12px;background:#fff1d8;color:#9a5d00;font-size:12px;font-weight:900}.body-details-map{position:relative;min-height:720px}.body-details-figure{position:absolute;inset:18px 31% 84px;display:grid;place-items:center;border-radius:100px;background:radial-gradient(circle,rgba(255,224,190,.42),transparent 68%)}.body-details-figure img{width:100%;max-width:255px;max-height:620px;object-fit:contain;filter:drop-shadow(0 18px 22px rgba(142,75,33,.13))}.body-detail-card{position:absolute;width:28%;min-height:118px;padding:12px;border:1px solid #eadfd5;border-radius:16px;background:rgba(255,253,249,.97);box-shadow:0 8px 18px rgba(76,42,18,.06)}.body-detail-card h4{margin:0;color:inherit;font-size:13px}.body-detail-card strong{display:block;margin:4px 0;font-size:25px;line-height:1}.body-detail-card p{margin:0;color:#61574e;font-size:10px;line-height:1.38}.bd-left{left:0}.bd-right{right:0}.bd-bottom{bottom:0;width:23%}.bd-brain{top:2%;color:#a83c9c}.bd-eyes{top:18%;color:#2878bd}.bd-lungs{top:34%;color:#1b9ba0}.bd-muscles{top:50%;color:#e37a12}.bd-energy{top:66%;color:#4b9e24}.bd-immune{top:82%;color:#7b39b3}.bd-heart{top:7%;color:#d94343}.bd-digestive{top:24%;color:#d9900e}.bd-bones{top:41%;color:#3c8ab1}.bd-sugar{top:58%;color:#d94343}.bd-hydration{top:75%;color:#2878bd}.bd-liver{top:92%;color:#8933b4}.bd-sleep{left:0}.bd-mood{left:25.5%}.bd-weight{left:51%}.bd-long{right:0}.health-center-link{display:flex;align-items:center;gap:12px;margin-top:18px;padding:16px;border:1.5px solid #f06418;border-radius:18px;background:#fffaf4;color:#43291d;text-decoration:none}.health-center-link span{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#fff}.health-center-link strong{display:block}.health-center-link small{color:var(--muted,#7f6e5e)}.health-center-link b{margin-left:auto;color:#f06418;font-size:28px}@media(max-width:900px){.body-details-map{min-height:auto;display:grid;gap:12px}.body-details-figure{position:relative;inset:auto;min-height:380px}.body-detail-card{position:relative;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;width:auto}.bd-bottom{width:auto}}
    `;
    document.head.appendChild(style);
  }

  function systemCard(item, index) {
    const side = index < 6 ? 'bd-left' : index < 12 ? 'bd-right' : 'bd-bottom';
    return `<article class="body-detail-card ${side} bd-${item[0]}"><h4>${item[1]} ${item[2]}</h4><strong>${item[3]}%</strong><p>${item[4]}</p></article>`;
  }

  function ensureDetailsPage() {
    const shell = document.querySelector('.content-shell');
    if (!shell || document.getElementById('page-body-details')) return;
    const page = document.createElement('section');
    page.id = 'page-body-details';
    page.className = 'page body-details-page';
    page.dataset.title = 'Body Analysis';
    page.dataset.kicker = 'Full food impact';
    page.innerHTML = `<div class="body-details-top"><button class="body-details-back" type="button" data-page="dashboard">← Back</button><button class="secondary-button" type="button">Today</button></div><section class="body-details-shell"><div class="body-details-title"><div><h3>AI Food Impact – Full Details</h3><p>Explore more body systems and food insights.</p></div><span>↗</span></div><span class="body-details-pill">✦ AI Analysis</span><div class="body-details-map"><div class="body-details-figure"><img src="assets/illustrations/anatomical-body.png" alt="Anatomical wellness illustration"></div>${bodyStats.map(systemCard).join('')}</div><p class="analysis-note">Percentages estimate how much today's logged food contributes to each body system.</p><a class="health-center-link" href="#" aria-label="Health Center coming soon"><span>🏥</span><div><strong>Health Center</strong><small>Food history, records and long-term trends coming later</small></div><b>›</b></a></section>`;
    shell.insertBefore(page, document.getElementById('mobileNav'));
  }

  function ensureDetailsButton() {
    const panel = document.querySelector('.body-impact-panel');
    if (!panel || document.getElementById('bodyDetailsButton')) return;
    const button = document.createElement('button');
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
    addStyles();
    ensureDetailsPage();
    ensureDetailsButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  setTimeout(install, 500);
  setTimeout(install, 1500);
})();
