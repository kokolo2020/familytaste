(function initFoodMapReport() {
  const WIDTH = 900;
  const HEIGHT = 1273;
  const MARGIN = 58;
  const COLORS = {
    ink: '#2d2119',
    muted: '#7d7064',
    cream: '#fbf5ea',
    paper: '#fffdf8',
    green: '#174f3d',
    greenDeep: '#0f3d30',
    greenSoft: '#e4efe8',
    orange: '#ef6825',
    gold: '#f2b33e',
    line: '#e7ddd0',
    coral: '#e96b59',
    sage: '#72a56f'
  };

  let reportReplay = null;
  let reportPages = [];
  let reportBusy = false;
  let reportGenerationToken = 0;

  function makeCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    return canvas;
  }

  function roundedRect(context, x, y, width, height, radius, fill, stroke = '') {
    context.save();
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    if (fill) {
      context.fillStyle = fill;
      context.fill();
    }
    if (stroke) {
      context.strokeStyle = stroke;
      context.lineWidth = 1;
      context.stroke();
    }
    context.restore();
  }

  function reportText(context, text, x, y, maxWidth, lineHeight, maxLines = 3) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width <= maxWidth || !line) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    });
    if (line) lines.push(line);
    const visible = lines.slice(0, maxLines);
    if (lines.length > maxLines && visible.length) {
      let last = visible.at(-1);
      while (last.length > 3 && context.measureText(`${last}...`).width > maxWidth) last = last.slice(0, -1);
      visible[visible.length - 1] = `${last}...`;
    }
    visible.forEach((value, index) => context.fillText(value, x, y + (index * lineHeight)));
    return y + (visible.length * lineHeight);
  }

  function paintPage(context) {
    context.fillStyle = COLORS.cream;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = 'rgba(239,104,37,.045)';
    context.beginPath();
    context.arc(820, 75, 190, 0, Math.PI * 2);
    context.fill();
  }

  function drawBrand(context, light = false) {
    const foreground = light ? '#fffaf0' : COLORS.green;
    const accent = light ? COLORS.gold : COLORS.orange;
    context.save();
    context.translate(MARGIN, 50);
    context.fillStyle = accent;
    context.beginPath();
    context.arc(19, 19, 19, Math.PI, 0);
    context.lineTo(34, 33);
    context.quadraticCurveTo(19, 51, 4, 33);
    context.closePath();
    context.fill();
    context.fillStyle = light ? COLORS.greenDeep : COLORS.paper;
    context.beginPath();
    context.arc(19, 19, 10, 0, Math.PI * 2);
    context.fill();
    context.restore();
    context.fillStyle = foreground;
    context.font = '700 27px Georgia, serif';
    context.fillText('MyMealMap', 105, 78);
    context.font = '800 9px Arial, sans-serif';
    context.fillText('YOUR FOOD STORY, MAPPED.', 106, 96);
  }

  function drawFooter(context, page, total) {
    context.strokeStyle = COLORS.line;
    context.beginPath();
    context.moveTo(MARGIN, 1212);
    context.lineTo(WIDTH - MARGIN, 1212);
    context.stroke();
    context.fillStyle = COLORS.muted;
    context.font = '500 11px Arial, sans-serif';
    context.fillText('Food-pattern insights only. Not medical advice.', MARGIN, 1237);
    context.textAlign = 'right';
    context.fillText(`MY FOOD MAP REPORT  |  ${page} / ${total}`, WIDTH - MARGIN, 1237);
    context.textAlign = 'left';
  }

  function drawPageHeading(context, kicker, title, copy) {
    paintPage(context);
    drawBrand(context);
    context.fillStyle = COLORS.orange;
    context.font = '900 12px Arial, sans-serif';
    context.fillText(kicker.toUpperCase(), MARGIN, 145);
    context.fillStyle = COLORS.ink;
    context.font = '700 48px Georgia, serif';
    context.fillText(title, MARGIN, 202);
    context.fillStyle = COLORS.muted;
    context.font = '400 17px Arial, sans-serif';
    reportText(context, copy, MARGIN, 238, 700, 24, 2);
  }

  function reportDateRange(replay) {
    if (!replay.days.length) return 'No recorded dates';
    const format = { month: 'short', day: 'numeric', year: 'numeric' };
    const start = replay.days[0].date.toLocaleDateString('en-US', format);
    const end = replay.days.at(-1).date.toLocaleDateString('en-US', format);
    return start === end ? start : `${start} - ${end}`;
  }

  function reportOptions() {
    return {
      hideName: Boolean(document.getElementById('foodMapReportHideName')?.checked),
      hidePhotos: Boolean(document.getElementById('foodMapReportHidePhotos')?.checked)
    };
  }

  function reportDisplayName(options) {
    if (options.hideName) return 'My';
    const firstName = getProfileIdentity().firstName || appState.currentMember?.name || 'My';
    return `${firstName}'s`;
  }

  function drawCoverPage(replay, options) {
    const canvas = makeCanvas();
    const context = canvas.getContext('2d');
    const goalPerDay = Number(appState.profileMeasurements[appState.currentMember?.id]?.target_calories || appState.currentMember?.target_calories) || 0;
    const goalTotal = goalPerDay * Math.max(replay.days.length, 1);
    const goalPercent = goalTotal ? Math.round((replay.calories / goalTotal) * 100) : 0;
    const average = replay.days.length ? Math.round(replay.calories / replay.days.length) : 0;
    const name = reportDisplayName(options);

    context.fillStyle = COLORS.greenDeep;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    const glow = context.createRadialGradient(760, 110, 20, 760, 110, 500);
    glow.addColorStop(0, 'rgba(244,179,62,.32)');
    glow.addColorStop(1, 'rgba(244,179,62,0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, WIDTH, 650);
    drawBrand(context, true);

    context.fillStyle = COLORS.gold;
    context.font = '900 14px Arial, sans-serif';
    context.fillText('PERSONAL FOOD INTELLIGENCE', MARGIN, 190);
    context.fillStyle = '#fffaf0';
    context.font = '700 68px Georgia, serif';
    context.fillText(`${name} Food Map`, MARGIN, 276);
    context.fillText('Report', MARGIN, 354);
    context.fillStyle = '#c8dcd2';
    context.font = '500 19px Arial, sans-serif';
    context.fillText(reportDateRange(replay), MARGIN, 405);
    roundedRect(context, MARGIN, 455, 520, 90, 24, 'rgba(255,255,255,.09)', 'rgba(255,255,255,.12)');
    context.fillStyle = COLORS.gold;
    context.font = '900 11px Arial, sans-serif';
    context.fillText('YOUR FOOD CHARACTER', MARGIN + 24, 487);
    context.fillStyle = '#fffaf0';
    context.font = '700 29px Georgia, serif';
    context.fillText(replay.persona.title, MARGIN + 24, 524);
    roundedRect(context, 654, 445, 164, 164, 40, COLORS.orange);
    context.fillStyle = '#fff';
    context.textAlign = 'center';
    context.font = '700 57px Georgia, serif';
    context.fillText(String(replay.foodScore), 736, 520);
    context.font = '900 11px Arial, sans-serif';
    context.fillText('FOOD SCORE', 736, 550);
    context.textAlign = 'left';

    const cards = [
      ['MEALS MAPPED', replay.meals.length.toLocaleString(), 'latest recorded days'],
      ['CALORIES', replay.calories.toLocaleString(), `${average.toLocaleString()} daily average`],
      ['FOOD VARIETY', replay.variety.toLocaleString(), 'different foods']
    ];
    cards.forEach((card, index) => {
      const x = MARGIN + (index * 262);
      roundedRect(context, x, 675, 242, 150, 24, '#fffaf0');
      context.fillStyle = COLORS.orange;
      context.font = '900 11px Arial, sans-serif';
      context.fillText(card[0], x + 20, 711);
      context.fillStyle = COLORS.ink;
      context.font = '700 38px Georgia, serif';
      context.fillText(card[1], x + 20, 760);
      context.fillStyle = COLORS.muted;
      context.font = '500 12px Arial, sans-serif';
      context.fillText(card[2], x + 20, 795);
    });

    roundedRect(context, MARGIN, 855, WIDTH - (MARGIN * 2), 170, 26, 'rgba(255,255,255,.08)', 'rgba(255,255,255,.12)');
    context.fillStyle = '#fffaf0';
    context.font = '700 26px Georgia, serif';
    context.fillText('Your calorie map', MARGIN + 25, 901);
    context.fillStyle = '#c8dcd2';
    context.font = '500 13px Arial, sans-serif';
    context.fillText(goalTotal ? `${goalPercent}% of your recorded-period calorie target` : 'Add a profile calorie target for goal comparison', MARGIN + 25, 931);
    roundedRect(context, MARGIN + 25, 958, WIDTH - (MARGIN * 2) - 50, 15, 8, 'rgba(255,255,255,.12)');
    roundedRect(context, MARGIN + 25, 958, Math.min(WIDTH - (MARGIN * 2) - 50, (WIDTH - (MARGIN * 2) - 50) * (goalPercent / 100)), 15, 8, COLORS.gold);
    context.fillStyle = '#fffaf0';
    context.font = '800 15px Arial, sans-serif';
    context.fillText(`${replay.calories.toLocaleString()} calories recorded`, MARGIN + 25, 1005);

    context.fillStyle = '#a9c4b7';
    context.font = '500 12px Arial, sans-serif';
    context.fillText('Private by default. Generated from your MyMealMap food diary.', MARGIN, 1168);
    context.textAlign = 'right';
    context.fillText('MYMEALMAP1.NETLIFY.APP', WIDTH - MARGIN, 1168);
    context.textAlign = 'left';
    return canvas;
  }

  function drawCaloriePage(replay) {
    const canvas = makeCanvas();
    const context = canvas.getContext('2d');
    drawPageHeading(context, 'Calorie rhythm', 'Your week in motion', 'Recorded food energy by day, with a clear view of your logging rhythm and plate distribution.');
    const chart = { x: MARGIN, y: 320, width: WIDTH - (MARGIN * 2), height: 390 };
    roundedRect(context, chart.x, chart.y, chart.width, chart.height, 28, COLORS.paper, COLORS.line);
    const maxCalories = Math.max(...replay.days.map((day) => day.calories), 1);
    const slotWidth = (chart.width - 90) / Math.max(replay.days.length, 1);
    replay.days.forEach((day, index) => {
      const x = chart.x + 52 + (index * slotWidth);
      const height = Math.max(8, (day.calories / maxCalories) * 245);
      const barWidth = Math.min(54, slotWidth * .55);
      roundedRect(context, x + ((slotWidth - barWidth) / 2), chart.y + 295 - height, barWidth, height, 12, index === replay.days.length - 1 ? COLORS.green : COLORS.orange);
      context.textAlign = 'center';
      context.fillStyle = COLORS.ink;
      context.font = '800 12px Arial, sans-serif';
      context.fillText(Math.round(day.calories).toLocaleString(), x + (slotWidth / 2), chart.y + 326);
      context.fillStyle = COLORS.muted;
      context.font = '700 11px Arial, sans-serif';
      context.fillText(replayDayLabel(day), x + (slotWidth / 2), chart.y + 354);
      context.textAlign = 'left';
    });
    context.fillStyle = COLORS.muted;
    context.font = '500 11px Arial, sans-serif';
    context.fillText('CALORIES BY RECORDED DAY', chart.x + 25, chart.y + 35);

    context.fillStyle = COLORS.ink;
    context.font = '700 29px Georgia, serif';
    context.fillText('Daily detail', MARGIN, 770);
    replay.days.forEach((day, index) => {
      const y = 805 + (index * 49);
      context.strokeStyle = COLORS.line;
      context.beginPath();
      context.moveTo(MARGIN, y + 38);
      context.lineTo(WIDTH - MARGIN, y + 38);
      context.stroke();
      context.fillStyle = COLORS.orange;
      context.font = '900 11px Arial, sans-serif';
      context.fillText(day.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(), MARGIN, y + 22);
      context.fillStyle = COLORS.ink;
      context.font = '700 14px Arial, sans-serif';
      context.fillText(day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), MARGIN + 75, y + 22);
      context.fillText(`${day.meals.length} meal${day.meals.length === 1 ? '' : 's'}`, MARGIN + 255, y + 22);
      context.textAlign = 'right';
      context.fillText(`${Math.round(day.calories).toLocaleString()} cal`, WIDTH - 180, y + 22);
      context.fillStyle = day.score >= 70 ? COLORS.green : COLORS.orange;
      context.fillText(`${day.score}/100`, WIDTH - MARGIN, y + 22);
      context.textAlign = 'left';
    });
    return canvas;
  }

  function mealPhoto(replay, meal) {
    if (!meal) return null;
    return replay.videoImages?.get(meal.id || meal.photo_url) || null;
  }

  function drawImageCover(context, image, x, y, width, height, radius = 20) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    const sourceX = (image.naturalWidth - sourceWidth) / 2;
    const sourceY = (image.naturalHeight - sourceHeight) / 2;
    context.save();
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.clip();
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
    context.restore();
  }

  function drawMealPlaceholder(context, meal, x, y, width, height) {
    const gradient = context.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, '#f3a33b');
    gradient.addColorStop(1, COLORS.green);
    roundedRect(context, x, y, width, height, 20, gradient);
    context.fillStyle = 'rgba(255,255,255,.9)';
    context.font = '700 38px Georgia, serif';
    context.textAlign = 'center';
    context.fillText(String(meal?.food_name || 'Meal').charAt(0).toUpperCase(), x + (width / 2), y + (height / 2) + 13);
    context.textAlign = 'left';
  }

  function drawHighlightsPage(replay, options) {
    const canvas = makeCanvas();
    const context = canvas.getContext('2d');
    drawPageHeading(context, 'Plate highlights', 'The meals that shaped the map', 'Three useful views of your records: the biggest plate, the lightest plate, and the strongest food score.');
    const cards = [
      { label: 'HIGHEST CALORIE', meal: replay.highestCalorieMeal, stat: `${Number(replay.highestCalorieMeal?.calories || 0).toLocaleString()} cal`, color: COLORS.orange },
      { label: 'LIGHTEST PLATE', meal: replay.lowestCalorieMeal, stat: `${Number(replay.lowestCalorieMeal?.calories || 0).toLocaleString()} cal`, color: COLORS.green },
      { label: 'STRONGEST FOOD SCORE', meal: replay.healthiestMeal, stat: `${analyzeMealQuality(replay.healthiestMeal || {}).score}/100`, color: COLORS.gold }
    ];
    cards.forEach((card, index) => {
      const y = 310 + (index * 270);
      roundedRect(context, MARGIN, y, WIDTH - (MARGIN * 2), 235, 26, COLORS.paper, COLORS.line);
      const image = options.hidePhotos ? null : mealPhoto(replay, card.meal);
      if (image) drawImageCover(context, image, MARGIN + 18, y + 18, 240, 199, 18);
      else drawMealPlaceholder(context, card.meal, MARGIN + 18, y + 18, 240, 199);
      context.fillStyle = card.color;
      context.font = '900 11px Arial, sans-serif';
      context.fillText(card.label, MARGIN + 286, y + 47);
      context.fillStyle = COLORS.ink;
      context.font = '700 27px Georgia, serif';
      reportText(context, card.meal?.food_name || 'No meal recorded', MARGIN + 286, y + 88, 430, 34, 2);
      context.fillStyle = COLORS.green;
      context.font = '900 23px Arial, sans-serif';
      context.fillText(card.stat, MARGIN + 286, y + 166);
      context.fillStyle = COLORS.muted;
      context.font = '500 12px Arial, sans-serif';
      const mealDate = card.meal ? new Date(card.meal.eaten_at || card.meal.created_at) : null;
      context.fillText(mealDate && Number.isFinite(mealDate.getTime()) ? mealDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Waiting for records', MARGIN + 286, y + 195);
    });
    return canvas;
  }

  function drawBodyPage(replay) {
    const canvas = makeCanvas();
    const context = canvas.getContext('2d');
    drawPageHeading(context, 'Food signal map', 'Where your foods showed up', 'A playful view of food-pattern signals associated with your strongest recorded areas.');
    roundedRect(context, MARGIN, 300, 410, 790, 30, COLORS.greenDeep);
    const figure = { x: 142, y: 345, width: 242, height: 510 };
    if (replay.bodyImage) context.drawImage(replay.bodyImage, figure.x, figure.y, figure.width, figure.height);
    const positions = {
      brain: [.5, .06], eyes: [.5, .093], heart: [.55, .28], liver: [.42, .32], digestion: [.5, .43],
      muscles: [.28, .44], joints: [.4, .67], immunity: [.49, .35], energy: [.5, .52], skin: [.5, .43],
      recovery: [.35, .56], bones: [.63, .72]
    };
    replay.bodySignals.forEach((signal, index) => {
      const [xRatio, yRatio] = positions[signal.position] || [.5, .45];
      const x = figure.x + (figure.width * xRatio);
      const y = figure.y + (figure.height * yRatio);
      const color = [COLORS.gold, '#5dd0a1', COLORS.coral][index % 3];
      context.shadowColor = color;
      context.shadowBlur = 22;
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, 14, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      context.fillStyle = COLORS.greenDeep;
      context.font = '900 10px Arial, sans-serif';
      context.textAlign = 'center';
      context.fillText(String(index + 1), x, y + 4);
      context.textAlign = 'left';
    });
    context.fillStyle = '#bdd5ca';
    context.font = '500 11px Arial, sans-serif';
    context.textAlign = 'center';
    context.fillText('Profile-selected wellness figure', MARGIN + 205, 1030);
    context.textAlign = 'left';

    context.fillStyle = COLORS.ink;
    context.font = '700 27px Georgia, serif';
    context.fillText('Strongest signals', 515, 335);
    const signals = replay.bodySignals.length ? replay.bodySignals : [{ name: 'Still mapping', score: 0, copy: 'Log more meals to build your food signal map.' }];
    signals.forEach((signal, index) => {
      const y = 380 + (index * 205);
      roundedRect(context, 500, y, 342, 172, 22, COLORS.paper, COLORS.line);
      context.fillStyle = [COLORS.gold, '#5dd0a1', COLORS.coral][index % 3];
      context.beginPath();
      context.arc(530, y + 34, 13, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = COLORS.greenDeep;
      context.font = '900 10px Arial, sans-serif';
      context.textAlign = 'center';
      context.fillText(String(index + 1), 530, y + 38);
      context.textAlign = 'left';
      context.fillStyle = COLORS.ink;
      context.font = '700 21px Georgia, serif';
      context.fillText(signal.name, 555, y + 42);
      context.fillStyle = COLORS.green;
      context.font = '900 17px Arial, sans-serif';
      context.fillText(`${signal.score}% food signal`, 520, y + 78);
      context.fillStyle = COLORS.muted;
      context.font = '500 12px Arial, sans-serif';
      reportText(context, signal.copy, 520, y + 108, 290, 18, 3);
    });
    roundedRect(context, 500, 1010, 342, 80, 18, COLORS.greenSoft);
    context.fillStyle = COLORS.green;
    context.font = '700 12px Arial, sans-serif';
    reportText(context, 'These are general food-pattern associations, not tests, diagnoses, or medical results.', 520, 1042, 300, 18, 2);
    return canvas;
  }

  function reportMealName(meal, index) {
    return meal.food_name || `Meal ${index + 1}`;
  }

  function drawLedgerPage(replay, options, meals, ledgerIndex, ledgerTotal) {
    const canvas = makeCanvas();
    const context = canvas.getContext('2d');
    drawPageHeading(context, 'Detailed food ledger', `Meal records ${ledgerIndex + 1} of ${ledgerTotal}`, 'A clean list of recorded foods, calories, meal timing, and MyMealMap food scores.');
    const columns = [MARGIN, 165, 285, 665, 760];
    roundedRect(context, MARGIN, 294, WIDTH - (MARGIN * 2), 48, 12, COLORS.green);
    context.fillStyle = '#fff';
    context.font = '900 10px Arial, sans-serif';
    ['DATE', 'TYPE', 'FOOD', 'CALORIES', 'SCORE'].forEach((label, index) => context.fillText(label, columns[index] + 10, 324));
    meals.forEach((meal, index) => {
      const y = 356 + (index * 64);
      if (index % 2 === 0) roundedRect(context, MARGIN, y - 8, WIDTH - (MARGIN * 2), 56, 10, 'rgba(255,255,255,.65)');
      const date = new Date(meal.eaten_at || meal.created_at);
      const score = analyzeMealQuality(meal).score;
      context.fillStyle = COLORS.muted;
      context.font = '600 11px Arial, sans-serif';
      context.fillText(Number.isFinite(date.getTime()) ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-', columns[0] + 10, y + 23);
      context.fillText(String(getMealType(meal) || 'meal').replace(/^./, (letter) => letter.toUpperCase()), columns[1] + 10, y + 23);
      context.fillStyle = COLORS.ink;
      context.font = '700 12px Arial, sans-serif';
      reportText(context, reportMealName(meal, index + (ledgerIndex * 12)), columns[2] + 10, y + 16, 350, 16, 2);
      context.fillStyle = COLORS.green;
      context.font = '800 12px Arial, sans-serif';
      context.fillText(Number(meal.calories || 0).toLocaleString(), columns[3] + 10, y + 23);
      context.fillStyle = score >= 70 ? COLORS.green : score >= 45 ? '#a86e12' : COLORS.coral;
      context.fillText(`${score}/100`, columns[4] + 10, y + 23);
      context.strokeStyle = COLORS.line;
      context.beginPath();
      context.moveTo(MARGIN, y + 49);
      context.lineTo(WIDTH - MARGIN, y + 49);
      context.stroke();
    });
    roundedRect(context, MARGIN, 1140, WIDTH - (MARGIN * 2), 48, 14, COLORS.greenSoft);
    context.fillStyle = COLORS.green;
    context.font = '700 11px Arial, sans-serif';
    context.fillText(`${replay.meals.length} meals | ${replay.calories.toLocaleString()} calories | ${replay.variety} different foods`, MARGIN + 18, 1170);
    return canvas;
  }

  function buildReportPages(replay, options) {
    const pages = [
      drawCoverPage(replay, options),
      drawCaloriePage(replay),
      drawHighlightsPage(replay, options),
      drawBodyPage(replay)
    ];
    const chunks = [];
    for (let index = 0; index < replay.meals.length; index += 12) chunks.push(replay.meals.slice(index, index + 12));
    if (!chunks.length) chunks.push([]);
    chunks.forEach((meals, index) => pages.push(drawLedgerPage(replay, options, meals, index, chunks.length)));
    pages.forEach((page, index) => {
      if (index > 0) drawFooter(page.getContext('2d'), index + 1, pages.length);
    });
    return pages;
  }

  function setReportFeedback(message, tone = '') {
    const feedback = document.getElementById('foodMapReportFeedback');
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = `daily-share-feedback${tone ? ` ${tone}` : ''}`;
  }

  function setReportBusy(isBusy) {
    reportBusy = isBusy;
    document.querySelectorAll('#foodMapReportModal [data-action="download-food-map-report"], #foodMapReportModal [data-action="share-food-map-report"]').forEach((button) => {
      button.disabled = isBusy;
    });
  }

  function renderReportPreview() {
    const preview = document.getElementById('foodMapReportPreview');
    if (!preview) return;
    preview.innerHTML = '';
    reportPages.forEach((page, index) => {
      const article = document.createElement('article');
      const image = document.createElement('img');
      const label = document.createElement('span');
      image.src = page.toDataURL('image/jpeg', .78);
      image.alt = `Food Map PDF page ${index + 1}`;
      label.textContent = `Page ${index + 1}`;
      article.append(image, label);
      preview.appendChild(article);
    });
  }

  async function generateReportPreview() {
    if (!reportReplay) return;
    const token = ++reportGenerationToken;
    setReportBusy(true);
    setReportFeedback('Designing your report pages...');
    const preview = document.getElementById('foodMapReportPreview');
    if (preview) preview.innerHTML = '<div class="report-preview-loading">Building charts, food highlights, and your body map...</div>';
    try {
      await prepareWeeklyReplayImages(reportReplay);
      if (token !== reportGenerationToken) return;
      reportPages = buildReportPages(reportReplay, reportOptions());
      renderReportPreview();
      setReportFeedback(`${reportPages.length}-page report ready to download or share.`, 'success');
    } catch (error) {
      console.error(error);
      setReportFeedback(error.message || 'Could not build the report preview.', 'error');
    } finally {
      if (token === reportGenerationToken) setReportBusy(false);
    }
  }

  function reportFileName() {
    const date = new Date().toISOString().slice(0, 10);
    return `mymealmap-food-map-${date}.pdf`;
  }

  function createReportPdfBlob() {
    const JsPdf = window.jspdf?.jsPDF;
    if (!JsPdf) throw new Error('The PDF engine did not load. Check your connection and try again.');
    if (!reportPages.length) throw new Error('Open the report preview before downloading.');
    const pdf = new JsPdf({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    reportPages.forEach((page, index) => {
      if (index) pdf.addPage('a4', 'portrait');
      pdf.addImage(page.toDataURL('image/jpeg', .88), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    });
    return pdf.output('blob');
  }

  function saveReportBlob(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = reportFileName();
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  window.openFoodMapReportModal = function openFoodMapReportModal() {
    const replay = buildWeeklyReplayData();
    if (!replay.meals.length) {
      showAppNotice('Log at least one meal before creating your Food Map PDF.', 'warning');
      return;
    }
    reportReplay = replay;
    reportPages = [];
    document.getElementById('foodMapReportModal')?.classList.remove('hidden');
    generateReportPreview();
  };

  window.closeFoodMapReportModal = function closeFoodMapReportModal() {
    if (reportBusy) return;
    reportGenerationToken += 1;
    document.getElementById('foodMapReportModal')?.classList.add('hidden');
    setReportFeedback('');
  };

  window.downloadFoodMapReport = async function downloadFoodMapReport() {
    try {
      if (reportBusy) return;
      if (!reportPages.length) await generateReportPreview();
      setReportBusy(true);
      setReportFeedback('Packaging your high-resolution PDF...');
      const blob = createReportPdfBlob();
      saveReportBlob(blob);
      setReportFeedback('PDF downloaded successfully.', 'success');
    } catch (error) {
      console.error(error);
      setReportFeedback(error.message || 'Could not download the PDF.', 'error');
    } finally {
      setReportBusy(false);
    }
  };

  window.shareFoodMapReport = async function shareFoodMapReport() {
    try {
      if (reportBusy) return;
      if (!reportPages.length) await generateReportPreview();
      setReportBusy(true);
      setReportFeedback('Preparing your PDF for sharing...');
      const blob = createReportPdfBlob();
      const file = new File([blob], reportFileName(), { type: 'application/pdf' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'My Food Map Report', text: 'My latest MyMealMap food and calorie report.', files: [file] });
        setReportFeedback('Food Map PDF shared.', 'success');
      } else {
        saveReportBlob(blob);
        setReportFeedback('PDF downloaded. Attach it in your preferred app to share.', 'success');
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        setReportFeedback('Sharing canceled.');
        return;
      }
      console.error(error);
      setReportFeedback(error.message || 'Could not share the PDF.', 'error');
    } finally {
      setReportBusy(false);
    }
  };

  document.getElementById('foodMapReportHideName')?.addEventListener('change', generateReportPreview);
  document.getElementById('foodMapReportHidePhotos')?.addEventListener('change', generateReportPreview);
})();
