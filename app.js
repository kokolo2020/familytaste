const appState = {
  familyId: null,
  currentMember: null,
  currentPage: 'dashboard',
  members: [
    { id: 'dad', name: 'Dad', avatar: '👨', role: 'Family Admin', photo: 'assets/avatars/dad.jpg' },
    { id: 'rithyna', name: 'Rithyna', avatar: '👩', role: 'Meal Planner', photo: 'assets/avatars/mom.jpg' },
    { id: 'add', name: 'Add Member', avatar: '＋', role: 'Invite family' }
  ],
  meals: [],
  favorites: [
    { id: 'fav-1', name: 'Grandma Kitchen', phone: 'Add number', address: 'Near home', notes: 'Comfort food for Sunday dinner.' },
    { id: 'fav-2', name: 'Pizza Company', phone: '1112', address: 'Delivery', notes: 'Fast Friday-night order.' },
    { id: 'fav-3', name: 'Sushi Family Bar', phone: 'Add number', address: 'City center', notes: 'Daughter always votes for salmon rolls.' }
  ],
  chat: [],
  chefOrders: [],
  cart: [],
  voiceNotes: [],
  bioLogs: {},
  profileMeasurements: {}
};

const profilePhotoStorageKey = 'familyBites.profilePhotos';
const localMealsStorageKey = 'familyBites.meals.v2';
const localChatStorageKey = 'familyBites.chat.v2';
const localMembersStorageKey = 'familyBites.members.v1';
const chefOrdersStorageKey = 'familyBites.chefOrders';
const chefCartStorageKey = 'familyBites.chefCart';
const chefVoiceStorageKey = 'familyBites.chefVoiceNotes';
const bioLogsStorageKey = 'familyBites.bioLogs.v1';
const profileMeasurementsStorageKey = 'familyBites.profileMeasurements.v1';
const APP_VERSION = 'v0.7.0';
const APP_BUILD_DATE = '2026-07-07';
const seededDefaultMemberIds = new Set(['dad', 'rithyna']);
const seededDefaultMemberNames = new Set(['dad', 'rithyna']);

const avatarOptions = [
  { id: 'dad', label: 'Dad', url: 'assets/avatars/dad.jpg' },
  { id: 'rithyna', label: 'Rithyna', url: 'assets/avatars/mom.jpg' },
  { id: 'emily', label: 'Emily', url: 'assets/avatars/emily.jpg' },
  { id: 'james', label: 'James', url: 'assets/avatars/james.jpg' },
  { id: 'sophia', label: 'Sophia', url: 'assets/avatars/sophia.jpg' },
  { id: 'chef', label: 'Chef', url: 'assets/avatars/chef.jpg' }
];

const menuItems = [
  { id: 'lemon-chicken', name: 'Lemon Garlic Chicken', detail: 'Roasted veggies, family portion', emoji: '🍗', photo: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=700&q=82' },
  { id: 'salmon-rice', name: 'Salmon Rice Bowl', detail: 'Protein bowl with greens', emoji: '🍣', photo: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=700&q=82' },
  { id: 'spaghetti', name: 'Spaghetti Bolognese', detail: 'Classic red sauce pasta', emoji: '🍝', photo: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=700&q=82' },
  { id: 'tacos', name: 'Tacos Night', detail: 'Chicken, salsa, and salad', emoji: '🌮', photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=700&q=82' },
  { id: 'pizza', name: 'Homemade Pizza', detail: 'Cheese, tomato, basil', emoji: '🍕', photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=82' },
  { id: 'brunch', name: 'Family Brunch', detail: 'Pancakes, fruit, and eggs', emoji: '🥞', photo: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=700&q=82' }
];

let voiceRecorder = null;
let voiceChunks = [];
let dashboardHistoryRange = 'yesterday';
let timelineFilters = {
  memberId: 'current',
  search: '',
  mealType: 'all',
  dateRange: 'all',
  health: 'all'
};

const navItems = [
  { page: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { page: 'order', icon: '🧑‍🍳', label: 'Chef Menu' },
  { page: 'snap', icon: '📷', label: 'Snap Food' },
  { page: 'favorites', icon: '❤️', label: 'Favorites' },
  { page: 'weekly', icon: '📊', label: 'Weekly Report' },
  { page: 'chat', icon: '💬', label: 'Family Chat' },
  { page: 'chef', icon: '📥', label: 'Chef Screen' },
  { page: 'timeline', icon: '📅', label: 'Timeline' },
  { page: 'profile', icon: '👤', label: 'Profile' },
  { page: 'settings', icon: '⚙️', label: 'Settings' }
];

const mobileItems = [
  { page: 'dashboard', icon: '⌂', label: 'Home' },
  { page: 'timeline', icon: '♜', label: 'Meals' },
  { page: 'snap', icon: '📷', label: 'Snap Food' },
  { page: 'chat', icon: '◌', label: 'Chat' },
  { page: 'settings', icon: '•••', label: 'More' }
];

document.addEventListener('DOMContentLoaded', () => {
  applyStoredAppData();
  applyStoredProfilePhotos();
  renderProfiles();
  renderNavigation();
  bindEvents();
  setMealFormDateTimeDefaults();
  hydrateFromSupabase();
});

function bindEvents() {
  document.body.addEventListener('click', (event) => {
    const pageTarget = event.target.closest('[data-page]');
    const actionTarget = event.target.closest('[data-action]');

    if (pageTarget) {
      showPage(pageTarget.dataset.page);
    }

    if (actionTarget) {
      handleAction(actionTarget.dataset.action);
    }

    const avatarTarget = event.target.closest('[data-avatar-url]');
    if (avatarTarget) {
      chooseProfileAvatar(avatarTarget.dataset.avatarUrl);
    }

    const orderTarget = event.target.closest('[data-add-cart]');
    if (orderTarget) {
      addToCart(orderTarget.dataset.addCart);
    }

    const cartRemoveTarget = event.target.closest('[data-remove-cart]');
    if (cartRemoveTarget) {
      removeFromCart(cartRemoveTarget.dataset.removeCart);
    }

    const completeTarget = event.target.closest('[data-complete-order]');
    if (completeTarget) {
      completeChefOrder(completeTarget.dataset.completeOrder);
    }

    const orderAgainTarget = event.target.closest('[data-order-again]');
    if (orderAgainTarget) {
      orderAgain(orderAgainTarget.dataset.orderAgain);
    }

    const removeMemberTarget = event.target.closest('[data-remove-member]');
    if (removeMemberTarget) {
      removeMember(removeMemberTarget.dataset.removeMember);
    }

    const editMealTarget = event.target.closest('[data-edit-meal]');
    if (editMealTarget) {
      openMealModal(editMealTarget.dataset.editMeal);
    }

    const deleteMealTarget = event.target.closest('[data-delete-meal]');
    if (deleteMealTarget) {
      handleDeleteMeal(deleteMealTarget.dataset.deleteMeal);
    }

    const addMealTarget = event.target.closest('[data-add-meal]');
    if (addMealTarget) {
      if (addMealTarget.dataset.addMeal === 'yesterday') {
        openMealComposer('yesterday');
      } else {
        openMealModal(null, addMealTarget.dataset.addMeal);
      }
    }

    const historyRangeTarget = event.target.closest('[data-history-range]');
    if (historyRangeTarget) {
      dashboardHistoryRange = historyRangeTarget.dataset.historyRange;
      renderDashboard();
    }

    const logAgainTarget = event.target.closest('[data-log-again]');
    if (logAgainTarget) {
      handleLogAgain(logAgainTarget.dataset.logAgain);
    }

    const renameFavTarget = event.target.closest('[data-rename-fav]');
    if (renameFavTarget) {
      handleRenameFavorite(renameFavTarget.dataset.renameFav);
    }

    const removeFavTarget = event.target.closest('[data-remove-fav]');
    if (removeFavTarget) {
      handleRemoveFavorite(removeFavTarget.dataset.removeFav);
    }
  });

  document.getElementById('mealForm').addEventListener('submit', saveMeal);
  document.getElementById('chatForm').addEventListener('submit', sendChat);
  document.getElementById('mealPhotoUpload').addEventListener('change', handlePhotoChange);
  document.getElementById('mealPhotoCamera').addEventListener('change', handlePhotoChange);
  document.getElementById('aiEstimateCalories').addEventListener('click', applyAiCalorieEstimate);
  document.getElementById('editAiEstimateCalories').addEventListener('click', applyEditAiCalorieEstimate);
  document.getElementById('profilePhotoInput').addEventListener('change', handleProfilePhotoChange);
  document.getElementById('voiceRecordButton').addEventListener('click', toggleVoiceRecording);
  document.getElementById('sendCartButton').addEventListener('click', sendCartToChef);
  document.getElementById('confirmAddMember').addEventListener('click', handleConfirmAddMember);
  document.getElementById('cancelAddMember').addEventListener('click', closeAddMemberModal);
  document.getElementById('saveProfileName').addEventListener('click', handleSaveProfileName);
  document.getElementById('saveProfileMeasurements').addEventListener('click', handleSaveProfileMeasurements);
  document.getElementById('saveBioStats')?.addEventListener('click', handleSaveBioStats);
  document.getElementById('saveMealEdit').addEventListener('click', handleSaveMealEdit);
  document.getElementById('cancelMealEdit').addEventListener('click', () => {
    clearAutoEditEstimate();
    document.getElementById('mealModal').classList.add('hidden');
  });
  document.getElementById('profileNameInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSaveProfileName();
  });

  ['foodName', 'mealType', 'restaurantName', 'calories', 'mealDate', 'mealTime'].forEach((id) => {
    document.getElementById(id).addEventListener('input', updateMealPreview);
  });
  ['timelineMemberFilter', 'timelineMealTypeFilter', 'timelineDateFilter', 'timelineHealthFilter'].forEach((id) => {
    document.getElementById(id).addEventListener('change', handleTimelineFilterChange);
  });
  document.getElementById('timelineSearchFilter').addEventListener('input', handleTimelineFilterChange);
  ['editFoodName', 'editRestaurant', 'editNotes'].forEach((id) => {
    document.getElementById(id).addEventListener('input', scheduleAutoEditAiCalorieEstimate);
  });
  ['editMealType'].forEach((id) => {
    document.getElementById(id).addEventListener('change', scheduleAutoEditAiCalorieEstimate);
  });
}

async function hydrateFromSupabase() {
  if (!window.familyBitesDb?.isConfigured) {
    selectMember(getDefaultMember(), { openDashboard: false });
    return;
  }

  try {
    await window.familyBitesDb.ensureFamily();
    appState.familyId = window.familyBitesDb.familyId;
    const [members, meals, favorites, chat] = (await Promise.allSettled([
      window.familyBitesDb.getMembers(),
      window.familyBitesDb.getMeals(),
      window.familyBitesDb.getFavorites(),
      window.familyBitesDb.getChat()
    ])).map((result) => {
      if (result.status === 'rejected') {
        console.warn('One Supabase table failed to load.', result.reason);
        return [];
      }
      return result.value;
    });

    if (members.length) {
      appState.members = mergeMembers(appState.members, members.map(normalizeMember));
      applyStoredProfilePhotos();
    }
    if (meals.length) appState.meals = mergeRecords(meals.map(normalizeMeal), appState.meals);
    if (favorites.length) appState.favorites = favorites;
    if (chat.length) appState.chat = mergeRecords(chat.map(normalizeChat), appState.chat);

    try {
      const bioLogs = await window.familyBitesDb.getBioLogs(todayKey());
      bioLogs.forEach((log) => {
        if (!appState.bioLogs[log.member_id]) appState.bioLogs[log.member_id] = {};
        const existingLog = appState.bioLogs[log.member_id][log.log_date] || {};
        appState.bioLogs[log.member_id][log.log_date] = {
          weight_kg: log.weight_kg,
          steps: log.steps,
          sugar_level: log.sugar_level,
          ...existingLog
        };
      });
    } catch (bioError) {
      console.warn('Bio logs unavailable (table may not exist yet).', bioError);
    }

    subscribeToFamilyChat();
  } catch (error) {
    console.warn('Supabase unavailable, using local demo data.', error);
  }

  saveStoredAppData();

  renderProfiles();
  selectMember(getDefaultMember(), { openDashboard: false });
}

function renderProfiles() {
  const currentProfile = document.getElementById('landingCurrentProfile');
  const profileGrid = document.getElementById('profileGrid');
  const visibleMembers = getVisibleMembers();
  const realMembers = visibleMembers.filter((member) => member.id !== 'add' && member.name !== 'Add Member');
  const featuredMember = realMembers.find((member) => member.id === appState.currentMember?.id) || realMembers[0] || null;

  if (currentProfile) {
    currentProfile.innerHTML = featuredMember ? `
      <button class="selector-current-card" type="button" data-open-member-id="${escapeAttr(featuredMember.id)}">
        <span class="selector-current-avatar">${avatarMarkup(featuredMember)}</span>
        <span class="selector-current-copy">
          <small>Current profile</small>
          <strong>${escapeHtml(featuredMember.name)}</strong>
          <span>${escapeHtml(featuredMember.role || 'Family member')}</span>
        </span>
        <span class="selector-current-arrow" aria-hidden="true">↗</span>
      </button>
    ` : '';
  }

  profileGrid.innerHTML = visibleMembers.map((member) => `
    <button class="profile-card ${featuredMember?.id === member.id ? 'is-active' : ''}" type="button" data-member-id="${escapeAttr(member.id)}">
      <span class="avatar">${avatarMarkup(member)}</span>
      <strong>${escapeHtml(member.name)}</strong>
    </button>
  `).join('');

  currentProfile?.querySelectorAll('[data-open-member-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const member = appState.members.find((item) => item.id === button.dataset.openMemberId);
      selectMember(member);
    });
  });

  profileGrid.querySelectorAll('[data-member-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const member = appState.members.find((item) => item.id === button.dataset.memberId);
      if (!member) return;
      if (member.id === 'add' || member.name === 'Add Member') {
        selectMember(member);
        return;
      }
      if (featuredMember?.id === member.id) {
        selectMember(member);
        return;
      }
      appState.currentMember = member;
      updateProfileUi();
      renderProfiles();
    });
  });
}

function renderNavigation() {
  document.getElementById('desktopNav').innerHTML = navItems.map(navTemplate).join('');
  document.getElementById('mobileNav').innerHTML = mobileItems.map(navTemplate).join('');
}

function navTemplate(item) {
  return `
    <button class="nav-item" type="button" data-page="${item.page}">
      <span>${item.icon}</span>
      <span>${item.label}</span>
    </button>
  `;
}

function selectMember(member, options = { openDashboard: true }) {
  if (!member) return;

  if (member.id === 'add' || member.name === 'Add Member') {
    openAddMemberModal();
    return;
  }

  appState.currentMember = member;
  updateProfileUi();

  if (options.openDashboard) {
    document.getElementById('landing').classList.add('hidden');
    document.getElementById('workspace').classList.remove('hidden');
    showPage('dashboard');
  } else {
    renderAll();
  }
}

function handleAction(action) {
  if (action === 'home') {
    document.getElementById('workspace').classList.add('hidden');
    document.getElementById('landing').classList.remove('hidden');
  }

  if (action === 'demo-dashboard') {
    selectMember(appState.currentMember || getDefaultMember());
  }

  if (action === 'demo-order') {
    openDemoPage('order');
  }

  if (action === 'demo-chat') {
    openDemoPage('chat');
  }

  if (action === 'demo-weekly') {
    openDemoPage('weekly');
  }

  if (action === 'add-member') {
    openAddMemberModal();
  }

  if (action === 'clear-all-data') {
    if (!confirm('Clear all meals, chat, and orders saved in this browser? This cannot be undone.')) return;
    [localMealsStorageKey, localChatStorageKey, chefOrdersStorageKey, chefCartStorageKey, chefVoiceStorageKey, profilePhotoStorageKey].forEach((key) => localStorage.removeItem(key));
    appState.meals = [];
    appState.chat = [];
    appState.chefOrders = [];
    appState.cart = [];
    appState.voiceNotes = [];
    renderAll();
  }
}

function showPage(pageName) {
  if (!appState.currentMember) {
    selectMember(getDefaultMember());
  }

  appState.currentPage = pageName;
  document.querySelectorAll('.page').forEach((page) => page.classList.remove('active-page'));
  const page = document.getElementById(`page-${pageName}`);
  if (page) page.classList.add('active-page');

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });

  document.getElementById('pageTitle').textContent = page?.dataset.title || 'FamilyBites';
  document.getElementById('activeKicker').textContent = page?.dataset.kicker || 'FamilyBites';
  renderAll();
}

function openDemoPage(pageName) {
  selectMember(appState.currentMember || getDefaultMember(), { openDashboard: false });
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('workspace').classList.remove('hidden');
  showPage(pageName);
}

function openMealComposer(defaultDay = 'today') {
  const form = document.getElementById('mealForm');
  if (!form) return;

  form.reset();
  document.getElementById('mealPhotoUpload').value = '';
  document.getElementById('mealPhotoCamera').value = '';
  resetPhotoPreview();

  const targetDate = defaultDay === 'yesterday'
    ? new Date(Date.now() - 24 * 60 * 60 * 1000)
    : new Date();

  setMealFormDateTimeDefaults(targetDate);
  updateMealPreview();
  showPage('snap');
  document.getElementById('foodName').focus();
}

function renderAll() {
  renderDashboard();
  renderMeals();
  renderFavorites();
  renderOrderMenu();
  renderCart();
  renderChefInterface();
  renderReport();
  renderChat();
  renderProfile();
  renderSettings();
  updateMealPreview();
}

function updateProfileUi() {
  const member = appState.currentMember;
  document.getElementById('navAvatar').innerHTML = avatarMarkup(member);
  document.getElementById('navName').textContent = member.name;
  document.getElementById('activeAvatar').innerHTML = `${avatarMarkup(member)} <span>${escapeHtml(member.name)}</span>`;
}

function renderDashboard() {
  const memberMeals = getMemberMeals();
  const todayMeals = memberMeals.filter(isToday);
  const yesterdayMeals = memberMeals.filter(isYesterday);
  const calories = sum(todayMeals, 'calories');
  const savedTargets = appState.profileMeasurements[appState.currentMember?.id] || {};
  const goal = Number(savedTargets.target_calories || appState.currentMember?.target_calories) || 2200;

  document.getElementById('dashboardMealCount').textContent = `${todayMeals.length} meal${todayMeals.length === 1 ? '' : 's'}`;
  document.getElementById('dashboardCalorieCount').textContent = `${calories.toLocaleString()} cal`;
  setText('bioCalories', calories.toLocaleString());

  renderFoodList('todayFoodList', todayMeals, 'No food logged today yet.');
  renderDashboardHistory(memberMeals, yesterdayMeals);
  renderFavoriteFoods(memberMeals);
  renderBioInputs();
  renderHealthInsights(todayMeals, calories, goal);
}

function renderDashboardHistory(memberMeals, yesterdayMeals) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const historyMeals = dashboardHistoryRange === 'week'
    ? memberMeals.filter((meal) => new Date(meal.eaten_at || meal.created_at).getTime() >= weekAgo)
    : yesterdayMeals;
  const isWeek = dashboardHistoryRange === 'week';
  const historyCalories = sum(historyMeals, 'calories');
  document.getElementById('foodHistoryTitle').textContent = isWeek ? 'Last 7 Days Food Diary' : 'Yesterday’s Food Diary';
  document.getElementById('yesterdayDiarySummary').textContent = `${historyMeals.length} meal${historyMeals.length === 1 ? '' : 's'} · ${historyCalories.toLocaleString()} cal`;
  document.querySelectorAll('[data-history-range]').forEach((button) => {
    button.classList.toggle('active', button.dataset.historyRange === dashboardHistoryRange);
  });
  const addYesterdayButton = document.querySelector('.yesterday-diary-heading [data-add-meal="yesterday"]');
  if (addYesterdayButton) addYesterdayButton.classList.toggle('hidden', isWeek);
  renderFoodList('yesterdayFoodList', historyMeals, isWeek ? 'No food logged in the last 7 days.' : 'Nothing was logged yesterday.');
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function renderHealthInsights(todayMeals, calories, calorieGoal) {
  const log = getTodayBioLog();
  const steps = Number(log.steps) || 0;
  const glucose = Number(log.sugar_level) || 0;
  const mealCount = todayMeals.length;
  const calorieRatio = calorieGoal ? calories / calorieGoal : 0;
  const calorieScore = calories === 0 ? 35 : clampScore(100 - Math.abs(1 - calorieRatio) * 82);
  const activityScore = clampScore(38 + (steps / 10000) * 62);
  const glucoseScore = glucose ? clampScore(100 - Math.abs(glucose - 100) * 1.25) : 55;
  const mealVariety = new Set(todayMeals.map((meal) => meal.food_name?.toLowerCase()).filter(Boolean)).size;
  const nutrition = clampScore((calorieScore * .55) + Math.min(mealVariety * 10, 30) + (mealCount ? 15 : 0));
  const health = clampScore((nutrition * .35) + (activityScore * .35) + (glucoseScore * .3));
  const progress = calorieGoal ? clampScore((calories / calorieGoal) * 100) : 0;

  setText('dashboardDate', new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date()));
  setText('dashboardMemberName', appState.currentMember?.name || 'Family');
  setText('summaryCalories', calories.toLocaleString());
  const currentWeight = getMemberWeight(appState.currentMember);
  setText('summaryWeight', currentWeight !== null && currentWeight !== undefined ? Number(currentWeight).toLocaleString() : '--');
  setText('summarySteps', steps.toLocaleString());
  setText('summaryGlucose', glucose ? Math.round(glucose).toLocaleString() : '--');
  setText('summaryCalorieProgress', `${progress}%`);
  setText('summaryCalorieGoal', `${calories.toLocaleString()} / ${calorieGoal.toLocaleString()} cal`);
  setText('summaryRingCalories', calories.toLocaleString());
  setText('nutritionDonutCalories', calories.toLocaleString());
  setText('summaryTip', mealCount
    ? `You’re ${progress}% of the way to your daily calorie goal.`
    : 'Log your first meal to start your daily analysis.');
  const summaryBar = document.getElementById('summaryCalorieBar');
  if (summaryBar) summaryBar.style.width = `${progress}%`;
  const summaryRing = document.getElementById('summaryCalorieRing');
  if (summaryRing) summaryRing.style.setProperty('--ring-progress', `${progress * 3.6}deg`);
  setText('bodyHealthScore', health);
  setText('healthScoreStatus', health >= 80 ? 'Excellent' : health >= 65 ? 'On track' : health >= 45 ? 'Building up' : 'Needs attention');
  setText('averageGlucose', glucose ? Math.round(glucose) : '--');
  setText('glucoseStatus', !glucose ? 'Add reading' : glucose < 70 ? 'Below range' : glucose <= 140 ? 'In range' : 'Above range');
  setText('nutritionBalance', nutrition);
  setText('nutritionStatus', nutrition >= 80 ? 'Well balanced' : nutrition >= 60 ? 'Good progress' : mealCount ? 'Can improve' : 'Log a meal');

  const impacts = [
    ...buildFoodBodyImpacts(todayMeals, calories),
    ...buildSecondaryFoodBodyImpacts(todayMeals, calories)
  ];
  const impactList = document.getElementById('bodyImpactList');
  if (impactList) impactList.innerHTML = impacts.map((impact) => `
    <article class="impact-callout impact-${impact.position}${impact.compact ? ' impact-compact' : ''}">
      <span class="impact-callout-title">${impact.icon} ${escapeHtml(impact.name)}</span>
      <strong>${impact.score}%</strong>
      <p title="${escapeAttr(impact.copy)}">${escapeHtml(impact.copy)}</p>
    </article>`).join('');

  const recommendations = buildRecommendations({ calories, calorieGoal, steps, glucose, mealCount, nutrition });
  const recommendationList = document.getElementById('aiRecommendationList');
  if (recommendationList) recommendationList.innerHTML = recommendations.map((item) => `
    <article class="recommendation-item">
      <span>${item.icon}</span><div><strong>${item.title}</strong><p>${item.copy}</p></div>
    </article>`).join('');
}

function buildFoodBodyImpacts(todayMeals, totalCalories) {
  const systems = [
    { name: 'Brain', icon: '🧠', position: 'brain', words: ['coffee', 'latte', 'tea', 'nuts', 'walnut', 'fish', 'salmon', 'egg', 'berry', 'chocolate'], benefit: 'supports focus and steady brain fuel' },
    { name: 'Heart', icon: '🫀', position: 'heart', words: ['nuts', 'fish', 'salmon', 'avocado', 'olive', 'oat', 'bean', 'vegetable', 'salad'], benefit: 'provides heart-supporting fats and fiber' },
    { name: 'Muscles', icon: '💪', position: 'muscles', words: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'egg', 'tofu', 'nuts', 'yogurt', 'milk', 'protein'], benefit: 'provides protein for muscle repair' },
    { name: 'Digestive System', icon: '🌙', position: 'digestion', words: ['vegetable', 'salad', 'fruit', 'berry', 'nuts', 'bean', 'oat', 'rice', 'noodle', 'ramen', 'taco', 'gyoza', 'kyosa'], benefit: 'moves through digestion for nutrient absorption' },
    { name: 'Energy', icon: '⚡', position: 'energy', words: [], benefit: 'supplies energy for the whole body', includeAll: true },
    { name: 'Bones', icon: '🦴', position: 'bones', words: ['milk', 'latte', 'cheese', 'yogurt', 'almond', 'tofu', 'fish', 'salmon', 'leafy'], benefit: 'can contribute calcium and bone nutrients' }
  ];

  return systems.map((system) => {
    const matched = system.includeAll
      ? todayMeals
      : todayMeals.filter((meal) => system.words.some((word) => foodSearchText(meal).includes(word)));
    const matchedCalories = matched.reduce((sumValue, meal) => sumValue + (Number(meal.calories) || 0), 0);
    const score = totalCalories ? clampScore((matchedCalories / totalCalories) * 100) : 0;
    const names = matched.map((meal) => meal.food_name).filter(Boolean);
    const foodList = names.length ? names.join(', ') : 'No matching food logged';
    const copy = names.length ? `${foodList} — ${system.benefit}.` : `${foodList} yet.`;
    return { name: system.name, score, icon: system.icon, copy, position: system.position, compact: false };
  });
}

function buildSecondaryFoodBodyImpacts(todayMeals, totalCalories) {
  const systems = [
    {
      name: 'Liver',
      icon: '🧽',
      position: 'liver',
      supportWords: ['coffee', 'tea', 'greens', 'broccoli', 'spinach', 'garlic', 'walnut', 'salmon', 'fish', 'tofu', 'berry'],
      cautionWords: ['fried', 'fries', 'soda', 'soft serve', 'dessert', 'bacon'],
      benefit: 'foods logged today include ingredients commonly associated with liver-supportive nutrients'
    },
    {
      name: 'Eyes',
      icon: '👁️',
      position: 'eyes',
      supportWords: ['carrot', 'spinach', 'leafy', 'egg', 'salmon', 'tuna', 'mango', 'orange', 'pumpkin'],
      cautionWords: ['soda', 'dessert'],
      benefit: 'foods logged today include nutrients often linked to eye support'
    },
    {
      name: 'Joints / Knees',
      icon: '🦵',
      position: 'joints',
      supportWords: ['salmon', 'tuna', 'ginger', 'olive', 'berry', 'nuts', 'turmeric', 'yogurt'],
      cautionWords: ['fried', 'burger', 'fries'],
      benefit: 'foods logged today include ingredients often associated with joint-friendly eating'
    },
    {
      name: 'Skin',
      icon: '✨',
      position: 'skin',
      supportWords: ['avocado', 'salmon', 'nuts', 'berry', 'tomato', 'yogurt', 'orange', 'mango'],
      cautionWords: ['soda', 'dessert', 'frappe'],
      benefit: 'foods logged today include nutrients commonly linked to skin support'
    },
    {
      name: 'Immunity',
      icon: '🛡️',
      position: 'immunity',
      supportWords: ['orange', 'berry', 'fruit', 'yogurt', 'garlic', 'ginger', 'tea', 'vegetable', 'greens'],
      cautionWords: ['soda'],
      benefit: 'foods logged today include ingredients often associated with immune support'
    },
    {
      name: 'Recovery',
      icon: '🔧',
      position: 'recovery',
      supportWords: ['chicken', 'fish', 'salmon', 'egg', 'tofu', 'yogurt', 'protein', 'milk', 'beef'],
      cautionWords: ['dessert'],
      benefit: 'foods logged today include protein and recovery-oriented building blocks'
    }
  ];

  return systems.map((system) => buildSecondaryImpact(system, todayMeals, totalCalories));
}

function buildSecondaryImpact(system, meals, totalCalories) {
  const matchedMeals = meals.filter((meal) => system.supportWords.some((word) => foodSearchText(meal).includes(word)));
  const matchedCalories = matchedMeals.reduce((total, meal) => total + (Number(meal.calories) || 0), 0);
  const supportHits = matchedMeals.length;
  const cautionHits = meals.filter((meal) => system.cautionWords.some((word) => foodSearchText(meal).includes(word))).length;
  const baseScore = totalCalories ? (matchedCalories / totalCalories) * 100 : 0;
  const score = clampScore(baseScore + (supportHits * 8) - (cautionHits * 5));
  const foodList = matchedMeals.map((meal) => meal.food_name).filter(Boolean).slice(0, 3).join(', ');
  return {
    name: system.name,
    icon: system.icon,
    position: system.position,
    compact: true,
    score,
    copy: foodList
      ? `${foodList} — ${system.benefit}.`
      : 'No strong food signal logged yet for this area.'
  };
}

function foodSearchText(meal) {
  return [meal.food_name, meal.notes, meal.restaurant_name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function buildRecommendations({ calories, calorieGoal, steps, glucose, mealCount, nutrition }) {
  const items = [];
  if (!mealCount) items.push({ icon: '🥗', title: 'Start with a balanced meal', copy: 'Add protein, vegetables, and a steady-energy carbohydrate.' });
  else if (calories < calorieGoal * .55) items.push({ icon: '🍲', title: 'Fuel the rest of your day', copy: `You have about ${Math.max(calorieGoal - calories, 0).toLocaleString()} calories remaining toward your goal.` });
  else if (calories > calorieGoal * 1.05) items.push({ icon: '🥬', title: 'Keep the next meal light', copy: 'Favor vegetables, lean protein, and water for the rest of today.' });
  else items.push({ icon: '✓', title: 'Calories are pacing well', copy: 'Your intake is tracking close to today’s energy target.' });

  if (!glucose) items.push({ icon: '🩸', title: 'Add a glucose reading', copy: 'A reading helps personalize your body-impact estimate.' });
  else if (glucose > 140) items.push({ icon: '🥦', title: 'Choose steady-energy foods', copy: 'Pair fiber and protein, and avoid another sugary snack right now.' });
  else if (glucose < 70) items.push({ icon: '🍌', title: 'Glucose looks low', copy: 'Consider a quick carbohydrate and recheck based on your care plan.' });
  else items.push({ icon: '🩸', title: 'Glucose is in range', copy: 'Keep the momentum with water and a fiber-rich next meal.' });

  const personalized = buildProfileRecommendation(appState.currentMember);
  if (personalized) items.push(personalized);
  else {
    const remainingSteps = Math.max(10000 - steps, 0);
    items.push(steps >= 10000
      ? { icon: '👟', title: 'Movement goal reached', copy: 'Great work—gentle recovery and hydration are a good finish.' }
      : { icon: '🚶', title: 'Take a short walk', copy: `${remainingSteps.toLocaleString()} steps remain; even 10 minutes after a meal can help.` });
  }
  if (nutrition < 65 && mealCount) items.push({ icon: '🌈', title: 'Add more color', copy: 'A fruit or vegetable can improve today’s nutrition balance.' });
  return items.slice(0, 3);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function getTodayBioLog() {
  const member = appState.currentMember;
  if (!member) return {};
  return appState.bioLogs[member.id]?.[todayKey()] || {};
}

function getMemberWeight(member) {
  if (!member) return null;
  const measurements = appState.profileMeasurements[member.id];
  if (measurements?.weight_kg !== null && measurements?.weight_kg !== undefined) return measurements.weight_kg;
  const weights = Object.values(appState.bioLogs[member.id] || {})
    .map((log) => log?.weight_kg)
    .filter((value) => value !== null && value !== undefined);
  if (weights.length) return weights[weights.length - 1];
  if (member.weight_kg !== null && member.weight_kg !== undefined) return member.weight_kg;
  return null;
}

function renderBioInputs() {
  const member = appState.currentMember;
  if (!member) return;
  const log = getTodayBioLog();
  const fill = (id, value) => {
    const input = document.getElementById(id);
    if (!input) return;
    if (document.activeElement !== input) input.value = value ?? '';
  };
  fill('bioWeight', log.weight_kg ?? getMemberWeight(member) ?? '');
  fill('bioSteps', log.steps ?? '');
  fill('bioSugar', log.sugar_level ?? '');
}

async function handleSaveBioStats() {
  const member = appState.currentMember;
  if (!member) return;
  const weightInput = document.getElementById('bioWeight');
  const stepsInput = document.getElementById('bioSteps');
  const sugarInput = document.getElementById('bioSugar');
  if (!weightInput || !stepsInput || !sugarInput) return;

  const log = {
    weight_kg: numberOrNull(weightInput.value),
    steps: numberOrNull(stepsInput.value),
    sugar_level: numberOrNull(sugarInput.value)
  };

  if (!appState.bioLogs[member.id]) appState.bioLogs[member.id] = {};
  appState.bioLogs[member.id][todayKey()] = log;
  if (log.weight_kg !== null) member.weight_kg = log.weight_kg;
  saveStoredAppData();

  const button = document.getElementById('saveBioStats');
  if (button) {
    button.textContent = 'Saved ✓';
    setTimeout(() => { button.textContent = 'Save Bio Stats'; }, 1800);
  }
  renderDashboard();

  if (window.familyBitesDb?.isConfigured && appState.familyId) {
    if (log.weight_kg !== null) {
      try {
        await window.familyBitesDb.updateMember(member.id, { weight_kg: log.weight_kg });
      } catch (error) {
        console.warn('Weight saved locally but Supabase write failed.', error);
      }
    }
    try {
      await window.familyBitesDb.saveBioLog({
        family_id: appState.familyId,
        member_id: member.id,
        log_date: todayKey(),
        ...log
      });
    } catch (error) {
      console.warn('Bio stats saved locally but Supabase write failed.', error);
    }
  }
}

function renderFoodList(elementId, meals, emptyMessage) {
  const orderedMeals = [...meals].sort(compareDashboardMealOrder);
  const groupedMarkup = buildDashboardMealGroups(orderedMeals);
  document.getElementById(elementId).innerHTML =
    groupedMarkup || emptyState(emptyMessage);
}

let editingMealId = null;
let editEstimateDebounce = null;
let lastEditEstimateSignature = '';

function openMealModal(mealId, defaultDay) {
  clearAutoEditEstimate();
  editingMealId = mealId || null;
  const meal = mealId ? appState.meals.find((item) => item.id === mealId) : null;
  const defaultDate = defaultDay === 'yesterday' ? new Date(Date.now() - 24 * 60 * 60 * 1000) : new Date();

  document.getElementById('mealModalTitle').textContent = meal ? 'Edit Food Entry' : 'Add Food Entry';
  document.getElementById('editFoodName').value = meal?.food_name || '';
  document.getElementById('editMealType').value = getMealType(meal) || '';
  document.getElementById('editRestaurant').value = meal?.restaurant_name || '';
  document.getElementById('editLocation').value = meal?.location_name || '';
  document.getElementById('editPrice').value = meal?.price ?? '';
  document.getElementById('editCalories').value = meal?.calories ?? '';
  document.getElementById('editNotes').value = notesWithoutMealType(meal?.notes);
  document.getElementById('editDate').value = dateKey(meal ? new Date(meal.eaten_at) : defaultDate);
  const estimateStatus = document.getElementById('editCalorieEstimate');
  estimateStatus.classList.remove('estimate-success', 'estimate-error');
  estimateStatus.textContent = meal?.photo_url
    ? 'Use the saved meal photo and your updated description to refresh the calorie estimate.'
    : 'This meal has no saved photo. Add calories manually or resave it later with a photo.';
  lastEditEstimateSignature = getEditEstimateSignature();
  document.getElementById('mealModal').classList.remove('hidden');
  document.getElementById('editFoodName').focus();
}

function mergeDateKeepTime(originalIso, dateValue) {
  if (!dateValue) return originalIso;
  const original = new Date(originalIso);
  const [year, month, day] = dateValue.split('-').map(Number);
  original.setFullYear(year, month - 1, day);
  return original.toISOString();
}

async function handleSaveMealEdit() {
  clearAutoEditEstimate();
  const foodName = document.getElementById('editFoodName').value.trim();
  if (!foodName) {
    document.getElementById('editFoodName').focus();
    return;
  }
  const mealType = document.getElementById('editMealType').value;
  if (!mealType) {
    document.getElementById('editMealType').focus();
    return;
  }

  const fields = {
    food_name: foodName,
    restaurant_name: document.getElementById('editRestaurant').value.trim(),
    location_name: document.getElementById('editLocation').value.trim(),
    price: numberOrNull(document.getElementById('editPrice').value),
    calories: numberOrNull(document.getElementById('editCalories').value),
    notes: notesWithMealType(document.getElementById('editNotes').value, mealType)
  };
  const dateValue = document.getElementById('editDate').value;
  document.getElementById('mealModal').classList.add('hidden');

  if (editingMealId) {
    const meal = appState.meals.find((item) => item.id === editingMealId);
    if (!meal) return;
    Object.assign(meal, fields);
    meal.eaten_at = mergeDateKeepTime(meal.eaten_at, dateValue);
    saveStoredAppData();
    renderAll();
    if (window.familyBitesDb?.isConfigured) {
      try {
        await window.familyBitesDb.updateMeal(meal.id, { ...fields, eaten_at: meal.eaten_at });
      } catch (error) {
        console.warn('Meal updated locally but Supabase write failed.', error);
      }
    }
  } else {
    await persistNewMeal({
      id: crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}`,
      family_id: appState.familyId,
      member_id: appState.currentMember.id,
      ...fields,
      photo_url: '',
      eaten_at: mergeDateKeepTime(new Date().toISOString(), dateValue)
    });
  }
}

async function persistNewMeal(meal) {
  appState.meals.unshift(meal);
  saveStoredAppData();
  renderAll();
  if (window.familyBitesDb?.isConfigured) {
    try {
      const savedMeal = await window.familyBitesDb.saveMeal(meal);
      appState.meals = appState.meals.map((item) => item.id === meal.id ? normalizeMeal(savedMeal) : item);
      saveStoredAppData();
      renderAll();
    } catch (error) {
      console.warn('Meal saved locally but Supabase write failed.', error);
    }
  }
}

async function handleDeleteMeal(mealId) {
  const meal = appState.meals.find((item) => item.id === mealId);
  if (!meal) return;
  if (!confirm(`Delete "${meal.food_name}"?`)) return;

  appState.meals = appState.meals.filter((item) => item.id !== mealId);
  saveStoredAppData();
  renderAll();
  if (window.familyBitesDb?.isConfigured) {
    try {
      await window.familyBitesDb.deleteMeal(mealId);
    } catch (error) {
      console.warn('Meal deleted locally but Supabase delete failed.', error);
    }
  }
}

async function handleLogAgain(foodName) {
  const source = getMemberMeals().find((item) => item.food_name === foodName);
  if (!source) return;
  await persistNewMeal({
    id: crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}`,
    family_id: appState.familyId,
    member_id: appState.currentMember.id,
    food_name: source.food_name,
    restaurant_name: source.restaurant_name || '',
    location_name: source.location_name || '',
    price: source.price ?? null,
    calories: source.calories ?? null,
    notes: source.notes || '',
    photo_url: source.photo_url || '',
    eaten_at: new Date().toISOString()
  });
}

async function handleRenameFavorite(foodName) {
  const newNameRaw = prompt(`Rename "${foodName}" to:`, foodName);
  const newName = newNameRaw ? newNameRaw.trim() : '';
  if (!newName || newName === foodName) return;

  const affected = getMemberMeals().filter((item) => item.food_name === foodName);
  affected.forEach((item) => { item.food_name = newName; });
  saveStoredAppData();
  renderAll();
  if (window.familyBitesDb?.isConfigured) {
    for (const item of affected) {
      try {
        await window.familyBitesDb.updateMeal(item.id, { food_name: newName });
      } catch (error) {
        console.warn('Rename sync failed for one entry.', error);
      }
    }
  }
}

async function handleRemoveFavorite(foodName) {
  const affected = getMemberMeals().filter((item) => item.food_name === foodName);
  if (!affected.length) return;
  const label = affected.length === 1 ? '1 logged entry' : `${affected.length} logged entries`;
  if (!confirm(`Remove "${foodName}" and delete its ${label}?`)) return;

  const affectedIds = new Set(affected.map((item) => item.id));
  appState.meals = appState.meals.filter((item) => !affectedIds.has(item.id));
  saveStoredAppData();
  renderAll();
  if (window.familyBitesDb?.isConfigured) {
    for (const item of affected) {
      try {
        await window.familyBitesDb.deleteMeal(item.id);
      } catch (error) {
        console.warn('Delete sync failed for one entry.', error);
      }
    }
  }
}

function renderFavoriteFoods(meals) {
  const counts = {};
  meals.forEach((meal) => {
    if (!meal.food_name) return;
    counts[meal.food_name] = (counts[meal.food_name] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  document.getElementById('favoriteFoodList').innerHTML = top.map(([name, count]) => `
    <article class="meal-card">
      <span class="meal-emoji">${mealEmoji(name)}</span>
      <div>
        <h4>${escapeHtml(name)}</h4>
        <p>Logged ${count} time${count !== 1 ? 's' : ''}</p>
        <div class="meal-actions">
          <button type="button" data-log-again="${escapeAttr(name)}">➕ Log again</button>
          <button type="button" data-rename-fav="${escapeAttr(name)}">✏️ Rename</button>
          <button type="button" data-remove-fav="${escapeAttr(name)}">🗑 Remove</button>
        </div>
      </div>
      <strong>❤️</strong>
    </article>
  `).join('') || emptyState('Log meals to discover favorites.');
}

function renderMeals() {
  renderTimelineMemberFilter();
  syncTimelineFilterInputs();
  const meals = getTimelineMeals();
  const averageHealth = meals.length
    ? Math.round(meals.reduce((sumValue, meal) => sumValue + estimateMealHealthScore(meal), 0) / meals.length)
    : 0;

  document.getElementById('timelineMealCount').textContent = meals.length.toLocaleString();
  document.getElementById('timelineAverageHealth').textContent = `${averageHealth}/100`;

  document.getElementById('timelineList').innerHTML = meals.map((meal) => {
    const health = estimateMealHealthScore(meal);
    return `
      <article class="timeline-item">
        <div class="timeline-food-cell">
          ${meal.photo_url
            ? `<img class="timeline-food-photo" src="${escapeAttr(meal.photo_url)}" alt="${escapeAttr(meal.food_name)}">`
            : `<span class="timeline-food-emoji">${mealEmoji(meal.food_name)}</span>`}
          <div>
            <h4>${escapeHtml(meal.food_name)}</h4>
            <p>${escapeHtml(buildTimelineMeta(meal))}</p>
          </div>
        </div>
        <span class="timeline-date">${formatTimelineDate(meal.eaten_at)}</span>
        <span class="timeline-time">${formatTimelineTime(meal.eaten_at)}</span>
        <span class="timeline-restaurant">${escapeHtml(meal.restaurant_name || '—')}</span>
        <strong class="timeline-calories">${Number(meal.calories || 0).toLocaleString()} cal</strong>
        <span class="timeline-health timeline-health-${healthTone(health)}">${health}/100</span>
        <div class="meal-actions timeline-actions" aria-label="Actions for ${escapeAttr(meal.food_name)}">
          <button class="meal-edit-button" type="button" data-edit-meal="${escapeAttr(meal.id)}">✏️ Edit</button>
          <button class="meal-delete-button" type="button" data-delete-meal="${escapeAttr(meal.id)}">🗑 Delete</button>
        </div>
      </article>
    `;
  }).join('') || emptyState('No meals match the current filters.');
}

function renderTimelineMemberFilter() {
  const select = document.getElementById('timelineMemberFilter');
  if (!select) return;
  const realMembers = appState.members.filter((member) => member.id !== 'add');
  const options = [
    { value: 'current', label: `Current profile${appState.currentMember ? ` (${appState.currentMember.name})` : ''}` },
    { value: 'all', label: 'All family members' },
    ...realMembers.map((member) => ({ value: member.id, label: member.name }))
  ];
  const selected = timelineFilters.memberId;
  select.innerHTML = options.map((option) => `
    <option value="${escapeAttr(option.value)}"${option.value === selected ? ' selected' : ''}>${escapeHtml(option.label)}</option>
  `).join('');
}

function syncTimelineFilterInputs() {
  const setIfIdle = (id, value) => {
    const element = document.getElementById(id);
    if (element && document.activeElement !== element) element.value = value;
  };
  setIfIdle('timelineMemberFilter', timelineFilters.memberId);
  setIfIdle('timelineSearchFilter', timelineFilters.search);
  setIfIdle('timelineMealTypeFilter', timelineFilters.mealType);
  setIfIdle('timelineDateFilter', timelineFilters.dateRange);
  setIfIdle('timelineHealthFilter', timelineFilters.health);
}

function handleTimelineFilterChange() {
  timelineFilters = {
    memberId: document.getElementById('timelineMemberFilter').value,
    search: document.getElementById('timelineSearchFilter').value.trim().toLowerCase(),
    mealType: document.getElementById('timelineMealTypeFilter').value,
    dateRange: document.getElementById('timelineDateFilter').value,
    health: document.getElementById('timelineHealthFilter').value
  };
  renderMeals();
}

function getTimelineMeals() {
  const now = Date.now();
  return appState.meals
    .filter((meal) => matchesTimelineMemberFilter(meal))
    .filter((meal) => matchesTimelineSearchFilter(meal))
    .filter((meal) => matchesTimelineMealTypeFilter(meal))
    .filter((meal) => matchesTimelineDateFilter(meal, now))
    .filter((meal) => matchesTimelineHealthFilter(meal))
    .sort((a, b) => new Date(b.eaten_at || b.created_at) - new Date(a.eaten_at || a.created_at));
}

function matchesTimelineMemberFilter(meal) {
  if (timelineFilters.memberId === 'all') return true;
  const selectedMember = timelineFilters.memberId === 'current'
    ? appState.currentMember
    : appState.members.find((member) => member.id === timelineFilters.memberId);
  if (!selectedMember) return true;
  return meal.member_id === selectedMember.id || meal.member_name === selectedMember.name;
}

function matchesTimelineSearchFilter(meal) {
  if (!timelineFilters.search) return true;
  return [
    meal.food_name,
    meal.restaurant_name,
    meal.location_name,
    notesWithoutMealType(meal.notes)
  ].filter(Boolean).join(' ').toLowerCase().includes(timelineFilters.search);
}

function matchesTimelineMealTypeFilter(meal) {
  if (timelineFilters.mealType === 'all') return true;
  return getMealType(meal) === timelineFilters.mealType;
}

function matchesTimelineDateFilter(meal, now) {
  if (timelineFilters.dateRange === 'all') return true;
  const days = Number(timelineFilters.dateRange) || 0;
  if (!days) return true;
  const cutoff = now - (days * 24 * 60 * 60 * 1000);
  return new Date(meal.eaten_at || meal.created_at).getTime() >= cutoff;
}

function matchesTimelineHealthFilter(meal) {
  if (timelineFilters.health === 'all') return true;
  const score = estimateMealHealthScore(meal);
  if (timelineFilters.health === 'excellent') return score >= 80;
  if (timelineFilters.health === 'good') return score >= 65 && score < 80;
  if (timelineFilters.health === 'fair') return score >= 45 && score < 65;
  if (timelineFilters.health === 'low') return score < 45;
  return true;
}

function buildTimelineMeta(meal) {
  const parts = [];
  const memberName = appState.members.find((member) => member.id === meal.member_id)?.name || meal.member_name;
  if (timelineFilters.memberId === 'all' && memberName) parts.push(memberName);
  parts.push(getMealTypeLabel(meal) || 'Meal');
  return parts.join(' · ');
}

function mealTemplate(meal, withActions = false) {
  const health = estimateMealHealthScore(meal);
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
        <h4>${escapeHtml(meal.food_name)}</h4>
        <span class="meal-health-pill meal-health-pill-${healthTone(health)}">${health}/100</span>
        <p>${escapeHtml(mealDisplayMeta(meal))}</p>${actions}
      </div>
      <strong>${Number(meal.calories || 0).toLocaleString()} cal</strong>
    </article>
  `;
}

function mealDisplayMeta(meal) {
  const label = getMealTypeLabel(meal) || meal.restaurant_name || 'Family meal';
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(meal.eaten_at));
  return `${label} · ${time}`;
}

function getMealTypeLabel(meal) {
  const storedType = getMealType(meal);
  return storedType
    ? storedType.charAt(0).toUpperCase() + storedType.slice(1)
    : '';
}

function getMealType(meal) {
  return String(meal?.notes || '').match(/\[\[meal_type:([^\]]+)\]\]/i)?.[1]?.toLowerCase() || '';
}

function buildDashboardMealGroups(meals) {
  const groups = new Map();
  meals.forEach((meal) => {
    const type = getMealType(meal) || 'other';
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type).push(meal);
  });
  return Array.from(groups.entries()).map(([type, items]) => `
    <section class="dashboard-meal-group">
      <header class="dashboard-meal-group-header">
        <strong>${dashboardMealTypeLabel(type)}</strong>
        <span>${items.length} item${items.length === 1 ? '' : 's'} · ${sum(items, 'calories').toLocaleString()} cal</span>
      </header>
      ${items.map((meal) => mealTemplate(meal, true)).join('')}
    </section>
  `).join('');
}

function compareDashboardMealOrder(left, right) {
  const typeDelta = dashboardMealTypePriority(right) - dashboardMealTypePriority(left);
  if (typeDelta !== 0) return typeDelta;
  return new Date(right.eaten_at || right.created_at) - new Date(left.eaten_at || left.created_at);
}

function dashboardMealTypePriority(meal) {
  const priorities = {
    dinner: 60,
    lunch: 50,
    brunch: 40,
    breakfast: 30,
    snack: 20,
    dessert: 10,
    other: 0
  };
  return priorities[getMealType(meal)] ?? priorities.other;
}

function dashboardMealTypeLabel(type) {
  const labels = {
    breakfast: 'Breakfast',
    brunch: 'Brunch',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    dessert: 'Dessert',
    other: 'Other'
  };
  return labels[type] || 'Other';
}

function notesWithoutMealType(notes) {
  return String(notes || '').replace(/\s*\[\[meal_type:[^\]]+\]\]\s*/ig, ' ').trim();
}

function notesWithMealType(notes, mealType) {
  const cleanNotes = notesWithoutMealType(notes);
  return `${cleanNotes}${cleanNotes ? ' ' : ''}[[meal_type:${mealType}]]`;
}

function formatTimelineDate(value) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(value));
}

function formatTimelineTime(value) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
    .format(new Date(value));
}

function getMemberHealthProfile(member) {
  if (!member) return {};
  return appState.profileMeasurements[member.id] || {};
}

function estimateMealHealthScore(meal, memberOverride) {
  const member = memberOverride || appState.members.find((item) => item.id === meal.member_id) || appState.currentMember;
  const profile = getMemberHealthProfile(member);
  const searchText = foodSearchText(meal);
  const calories = Number(meal.calories) || 0;
  let score = 58;

  if (calories > 0) {
    if (calories <= 650) score += 12;
    else if (calories <= 900) score += 5;
    else if (calories >= 1200) score -= 12;
    else score -= 4;
  }

  const positiveWords = ['salad', 'vegetable', 'broccoli', 'greens', 'fruit', 'berry', 'fish', 'salmon', 'egg', 'tofu', 'yogurt', 'oat', 'bean', 'avocado', 'nuts', 'grill', 'grilled'];
  const cautionWords = ['fries', 'fried', 'pizza', 'burger', 'soda', 'cake', 'dessert', 'ice cream', 'chips', 'bacon', 'ramen', 'crispy'];

  score += positiveWords.filter((word) => searchText.includes(word)).length * 5;
  score -= cautionWords.filter((word) => searchText.includes(word)).length * 5;

  const mealType = getMealType(meal);
  if (mealType === 'dessert') score -= 8;
  if (mealType === 'snack' && calories > 450) score -= 6;

  const focus = profile.health_focus || 'balanced';
  if (focus === 'blood-sugar') {
    score -= ['soda', 'cake', 'ice cream', 'soft serve', 'frappe', 'sweet', 'bread', 'rice'].filter((word) => searchText.includes(word)).length * 5;
    score += ['egg', 'tofu', 'salad', 'vegetable', 'nuts', 'fish', 'chicken', 'yogurt'].filter((word) => searchText.includes(word)).length * 3;
  }
  if (focus === 'heart-health') {
    score -= ['fried', 'fries', 'bacon', 'burger', 'pizza', 'ramen', 'crispy'].filter((word) => searchText.includes(word)).length * 4;
    score += ['fish', 'salad', 'oat', 'bean', 'avocado', 'nuts', 'olive'].filter((word) => searchText.includes(word)).length * 3;
  }
  if (focus === 'low-sodium') {
    score -= ['ramen', 'bacon', 'chips', 'soup', 'sauce', 'soy', 'burger', 'pizza'].filter((word) => searchText.includes(word)).length * 4;
    score += ['fruit', 'salad', 'vegetable', 'rice', 'grilled'].filter((word) => searchText.includes(word)).length * 2;
  }
  if (focus === 'higher-protein') {
    score += ['chicken', 'beef', 'fish', 'egg', 'tofu', 'yogurt', 'protein', 'bean'].filter((word) => searchText.includes(word)).length * 4;
    if (mealType === 'dessert') score -= 4;
  }
  if (focus === 'kid-growth') {
    score += ['milk', 'yogurt', 'egg', 'fruit', 'chicken', 'fish', 'tofu'].filter((word) => searchText.includes(word)).length * 3;
  }

  const alerts = String(profile.food_alerts || '').toLowerCase();
  if (alerts.includes('nut') && ['nut', 'walnut', 'almond', 'peanut'].some((word) => searchText.includes(word))) score -= 22;
  if (alerts.includes('dairy') && ['milk', 'latte', 'cheese', 'yogurt', 'ice cream', 'soft serve'].some((word) => searchText.includes(word))) score -= 18;
  if (alerts.includes('gluten') && ['bread', 'baguette', 'pasta', 'noodle', 'pizza', 'cake'].some((word) => searchText.includes(word))) score -= 18;
  if (alerts.includes('shellfish') && ['shrimp', 'prawn', 'crab', 'lobster'].some((word) => searchText.includes(word))) score -= 22;
  if (alerts.includes('sugar') && ['soda', 'cake', 'sweet', 'ice cream', 'soft serve', 'dessert'].some((word) => searchText.includes(word))) score -= 12;

  return clampScore(score);
}

function buildProfileRecommendation(member) {
  const profile = getMemberHealthProfile(member);
  const focus = profile.health_focus || 'balanced';
  const alerts = String(profile.food_alerts || '').trim();
  if (alerts) {
    return { icon: '⚠️', title: 'Check meal ingredients', copy: `Keep an eye on: ${alerts}. Update details if a meal needs a closer look.` };
  }
  if (focus === 'blood-sugar') return { icon: '🥗', title: 'Support steadier energy', copy: 'Favor protein, fiber, and fewer sugary add-ons in the next meal.' };
  if (focus === 'heart-health') return { icon: '🫀', title: 'Go lighter on fried foods', copy: 'Lean proteins, vegetables, and less heavy sauce fit this profile better.' };
  if (focus === 'low-sodium') return { icon: '🧂', title: 'Watch salty extras', copy: 'Sauces, soups, and processed snacks can push sodium up fast.' };
  if (focus === 'higher-protein') return { icon: '💪', title: 'Anchor meals with protein', copy: 'Eggs, fish, chicken, tofu, and yogurt will improve the daily balance.' };
  if (focus === 'kid-growth') return { icon: '🥛', title: 'Build growth-friendly meals', copy: 'Aim for protein, fruit, and calcium-rich foods through the day.' };
  return null;
}

function healthTone(score) {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 45) return 'fair';
  return 'low';
}

function renderFavorites() {
  const cards = appState.favorites.map((restaurant) => `
    <article class="restaurant-card">
      <span class="restaurant-emoji">${restaurantEmoji(restaurant.name)}</span>
      <div>
        <h4>${escapeHtml(restaurant.name)}</h4>
        <p>${escapeHtml(restaurant.notes || restaurant.address || 'Family favorite')}</p>
        <p>${escapeHtml(restaurant.phone || 'Phone not saved')}</p>
      </div>
      <button type="button" data-order-again="${escapeAttr(restaurant.name)}">Order Again</button>
    </article>
  `).join('');

  document.getElementById('favoriteGrid').innerHTML = cards;
}

function renderOrderMenu() {
  document.getElementById('orderGrid').innerHTML = menuItems.map((item) => `
    <article class="order-menu-card">
      <img src="${escapeAttr(item.photo)}" alt="${escapeAttr(item.name)}">
      <div>
        <h4>${escapeHtml(item.name)}</h4>
        <p>${escapeHtml(item.detail)}</p>
      </div>
      <button type="button" data-add-cart="${escapeAttr(item.id)}">Order</button>
    </article>
  `).join('');
}

function renderCart() {
  const cartList = document.getElementById('cartList');
  const sendButton = document.getElementById('sendCartButton');
  if (!cartList || !sendButton) return;

  cartList.innerHTML = appState.cart.map((item) => `
    <article class="cart-item">
      <span>${escapeHtml(item.emoji || '🍽️')}</span>
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.member_name || 'Family')}</small>
      </div>
      <button type="button" data-remove-cart="${escapeAttr(item.cart_id)}" aria-label="Remove ${escapeAttr(item.name)}">×</button>
    </article>
  `).join('') || '<p class="muted">No foods in cart yet.</p>';

  sendButton.disabled = appState.cart.length === 0;
  sendButton.textContent = appState.cart.length
    ? `Done · Send ${appState.cart.length} to Chef`
    : 'Done · Send to Chef';
}

function renderChefInterface() {
  const activeOrders = appState.chefOrders.filter((order) => order.status !== 'done');
  document.getElementById('chefOrderList').innerHTML = activeOrders.map((order) => `
    <article class="chef-order-card ${order.photo ? 'has-photo' : ''}">
      <span>${escapeHtml(order.emoji || '🍽️')}</span>
      ${order.photo ? `<img src="${escapeAttr(order.photo)}" alt="${escapeAttr(order.food_name)}">` : ''}
      <div>
        <h4>${escapeHtml(order.food_name)}</h4>
        <p>${escapeHtml(order.detail || 'Family order')}</p>
        <small>${escapeHtml(order.member_name || 'Family')} · ${formatDate(order.created_at)}</small>
      </div>
      <button type="button" data-complete-order="${escapeAttr(order.id)}">Done</button>
    </article>
  `).join('') || emptyChefState('No food orders sent yet.');

  document.getElementById('chefVoiceList').innerHTML = appState.voiceNotes.map((note) => `
    <article class="chef-voice-card">
      <div>
        <h4>${escapeHtml(note.member_name || 'Family')} voice note</h4>
        <small>${formatDate(note.created_at)}</small>
      </div>
      <audio controls src="${escapeAttr(note.audio_url)}"></audio>
    </article>
  `).join('') || emptyChefState('No voice notes yet.');
}

function addToCart(menuItemId) {
  const item = menuItems.find((entry) => entry.id === menuItemId);
  const member = appState.currentMember || appState.members[0];
  if (!item) return;

  appState.cart.push({
    cart_id: crypto.randomUUID ? crypto.randomUUID() : `cart-${Date.now()}`,
    menu_item_id: item.id,
    name: item.name,
    detail: item.detail,
    emoji: item.emoji,
    photo: item.photo,
    member_id: member.id,
    member_name: member.name,
    added_at: new Date().toISOString()
  });
  saveStoredAppData();
  renderCart();
}

function removeFromCart(cartId) {
  appState.cart = appState.cart.filter((item) => item.cart_id !== cartId);
  saveStoredAppData();
  renderCart();
}

function sendCartToChef() {
  if (!appState.cart.length) return;

  const now = new Date().toISOString();
  const batchId = crypto.randomUUID ? crypto.randomUUID() : `batch-${Date.now()}`;
  const orders = appState.cart.map((item) => ({
    id: crypto.randomUUID ? crypto.randomUUID() : `order-${Date.now()}-${item.menu_item_id}`,
    batch_id: batchId,
    food_name: item.name,
    detail: item.detail,
    emoji: item.emoji,
    photo: item.photo,
    member_id: item.member_id,
    member_name: item.member_name,
    status: 'sent',
    created_at: now
  }));

  appState.chefOrders = [...orders, ...appState.chefOrders];
  appState.cart = [];
  saveStoredAppData();
  renderCart();
  renderChefInterface();
  showPage('chef');
}

function completeChefOrder(orderId) {
  appState.chefOrders = appState.chefOrders.map((order) => (
    order.id === orderId ? { ...order, status: 'done' } : order
  ));
  saveStoredAppData();
  renderChefInterface();
}

async function toggleVoiceRecording() {
  const button = document.getElementById('voiceRecordButton');
  if (voiceRecorder?.state === 'recording') {
    voiceRecorder.stop();
    button.textContent = 'Record Voice';
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    alert('Voice recording is not supported in this browser.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    voiceChunks = [];
    voiceRecorder = new MediaRecorder(stream);
    voiceRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size) voiceChunks.push(event.data);
    });
    voiceRecorder.addEventListener('stop', () => {
      stream.getTracks().forEach((track) => track.stop());
      saveVoiceNote(new Blob(voiceChunks, { type: voiceRecorder.mimeType || 'audio/webm' }));
    });
    voiceRecorder.start();
    button.textContent = 'Stop Recording';
  } catch (error) {
    console.warn('Microphone unavailable.', error);
    alert('Microphone access was blocked or unavailable.');
  }
}

function saveVoiceNote(blob) {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const member = appState.currentMember || appState.members[0];
    appState.voiceNotes.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `voice-${Date.now()}`,
      member_id: member.id,
      member_name: member.name,
      audio_url: String(reader.result || ''),
      created_at: new Date().toISOString()
    });
    saveStoredAppData();
    renderChefInterface();
    showPage('chef');
  });
  reader.readAsDataURL(blob);
}

function renderReport() {
  const member = appState.currentMember || appState.members[0];
  if (!member) return;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const inThisWeek = (meal) => new Date(meal.eaten_at || meal.created_at).getTime() >= weekAgo;
  const meals = getMemberMeals().filter(inThisWeek);
  const calories = sum(meals, 'calories');
  const spend = sum(meals, 'price');
  const favoriteRestaurant = mostCommon(meals.map((meal) => meal.restaurant_name).filter(Boolean));
  const favoriteFood = mostCommon(meals.map((meal) => meal.food_name).filter(Boolean));

  document.getElementById('reportMeals').textContent = meals.length.toString();
  document.getElementById('reportCalories').textContent = calories.toLocaleString();
  document.getElementById('reportSpend').textContent = formatMoney(spend);
  document.getElementById('reportRestaurant').textContent = favoriteRestaurant || '-';
  document.getElementById('reportFood').textContent = favoriteFood || '-';
  document.getElementById('reportFavoriteDish').textContent = favoriteFood || '-';
  document.getElementById('weeklyRecommendation').textContent = buildWeeklySummary(meals, calories, spend, favoriteFood);
  renderWeeklyDateRange();
  renderProfileWeeklyHealth(member, meals);
  renderMealBalance(meals);
  renderWeeklyCalories(meals);
  renderFoodVariety(meals);
}

function renderWeeklyDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  document.getElementById('weeklyDateRange').textContent = `${startLabel} – ${endLabel}`;
}

function renderMealBalance(meals) {
  const colors = { breakfast: '#f36b20', brunch: '#f59b24', lunch: '#ffb51f', dinner: '#79994b', snack: '#963b69', dessert: '#df6a7b', other: '#8d8177' };
  const labels = { breakfast: 'Breakfast', brunch: 'Brunch', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks', dessert: 'Dessert', other: 'Other' };
  const counts = {};
  meals.forEach((meal) => {
    const type = getMealType(meal) || 'other';
    counts[type] = (counts[type] || 0) + 1;
  });
  const total = meals.length;
  const entries = Object.keys(labels).filter((type) => counts[type]);
  let cursor = 0;
  const slices = entries.map((type) => {
    const start = cursor;
    cursor += (counts[type] / Math.max(total, 1)) * 100;
    return `${colors[type]} ${start}% ${cursor}%`;
  });
  const chart = document.getElementById('mealBalanceChart');
  chart.style.background = total ? `conic-gradient(${slices.join(', ')})` : 'conic-gradient(#eee8e1 0 100%)';
  chart.setAttribute('aria-label', total ? entries.map((type) => `${labels[type]} ${Math.round(counts[type] / total * 100)} percent`).join(', ') : 'No meal balance data');
  document.getElementById('mealBalanceTotal').textContent = total.toString();
  document.getElementById('mealBalanceLegend').innerHTML = total ? entries.map((type) => `
    <div class="meal-legend-item"><i style="background:${colors[type]}"></i><span>${labels[type]}</span><strong>${Math.round(counts[type] / total * 100)}%</strong></div>
  `).join('') : '<p class="muted">Add meals with a meal type to see your balance.</p>';
}

function renderWeeklyCalories(meals) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return { date, calories: 0 };
  });
  meals.forEach((meal) => {
    const mealDate = new Date(meal.eaten_at || meal.created_at);
    mealDate.setHours(0, 0, 0, 0);
    const day = days.find((item) => item.date.getTime() === mealDate.getTime());
    if (day) day.calories += Number(meal.calories) || 0;
  });
  const maxCalories = Math.max(...days.map((day) => day.calories), 1);
  document.getElementById('weeklyCalorieChart').innerHTML = days.map((day) => {
    const height = day.calories ? Math.max(8, Math.round(day.calories / maxCalories * 100)) : 2;
    return `<div class="weekly-bar-day"><strong>${day.calories ? Math.round(day.calories).toLocaleString() : '0'}</strong><div class="weekly-bar-track"><i class="weekly-bar" style="height:${height}%"></i></div><span>${day.date.toLocaleDateString('en-US', { weekday: 'short' })}</span></div>`;
  }).join('');
}

function renderFoodVariety(meals) {
  const groups = [
    { label: 'Protein', emoji: '🍗', words: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'egg', 'tofu', 'shrimp', 'protein'] },
    { label: 'Vegetables', emoji: '🥦', words: ['vegetable', 'salad', 'broccoli', 'spinach', 'tomato', 'carrot', 'greens', 'asparagus'] },
    { label: 'Fruit', emoji: '🍎', words: ['fruit', 'apple', 'banana', 'orange', 'berry', 'mango', 'grape', 'melon'] },
    { label: 'Carbs', emoji: '🍞', words: ['rice', 'bread', 'pasta', 'noodle', 'potato', 'pizza', 'taco', 'oat'] }
  ];
  document.getElementById('foodVarietyGrid').innerHTML = groups.map((group) => {
    const matches = meals.filter((meal) => group.words.some((word) => foodSearchText(meal).includes(word))).length;
    const score = Math.min(5, matches);
    const dots = Array.from({ length: 5 }, (_, index) => `<i class="${index < score ? 'active' : ''}"></i>`).join('');
    return `<article class="food-variety-item"><span class="food-variety-emoji">${group.emoji}</span><strong>${group.label}</strong><div class="variety-dots" aria-label="${score} out of 5">${dots}</div></article>`;
  }).join('');
}

function renderProfileWeeklyHealth(member, meals) {
  const stats = buildMemberWeeklyStats(member, meals, { alreadyFiltered: true });
  const avgCaloriesPerDay = stats.activeDays ? Math.round(stats.calories / Math.max(stats.activeDays, 1)) : 0;

  setText('weeklyHealthSnapshotTitle', `${member.name}'s Weekly Health Snapshot`);
  setText('weeklyHealthSnapshotSubtitle', 'Selected profile only');
  document.getElementById('familyWeeklyAverage').textContent = stats.avgHealth.toString();
  document.getElementById('familyWeeklyActive').textContent = stats.activeDays.toString();
  document.getElementById('familyWeeklySugary').textContent = stats.sugaryDrinks.toString();
  document.getElementById('familyWeeklyLate').textContent = stats.lateMeals.toString();
  document.getElementById('familyWeeklyHighlights').innerHTML = buildProfileWeeklyHighlights(stats, avgCaloriesPerDay);
  document.getElementById('familyWeeklyMembers').innerHTML = stats.mealCount ? `
    <article class="family-member-health">
      <div class="family-member-health-head">
        <span class="avatar">${avatarMarkup(stats.member)}</span>
        <div>
          <strong>${escapeHtml(stats.member.name)}</strong>
          <small>${stats.activeDays} active day${stats.activeDays === 1 ? '' : 's'} · ${stats.mealCount} meal${stats.mealCount === 1 ? '' : 's'}</small>
        </div>
        <span class="family-member-health-score ${healthTone(stats.avgHealth)}">${stats.avgHealth}/100</span>
      </div>
      <div class="family-member-metrics">
        <span><i>Calories</i><strong>${avgCaloriesPerDay.toLocaleString()}/day</strong></span>
        <span><i>Sugary drinks</i><strong>${stats.sugaryDrinks}</strong></span>
        <span><i>Late meals</i><strong>${stats.lateMeals}</strong></span>
      </div>
      <p>${escapeHtml(stats.note)}</p>
    </article>
  ` : '<p class="muted">No meals logged for this profile in the last 7 days.</p>';
}

function buildMemberWeeklyStats(member, mealPool, options = {}) {
  const meals = options.alreadyFiltered
    ? mealPool
    : mealPool.filter((meal) => mealBelongsToMember(meal, member, false));
  const activeDays = new Set(meals.map((meal) => mealDayKey(meal)).filter(Boolean)).size;
  const avgHealth = meals.length
    ? Math.round(meals.reduce((total, meal) => total + estimateMealHealthScore(meal, member), 0) / meals.length)
    : 0;
  const calories = sum(meals, 'calories');
  const sugaryDrinks = meals.filter(isSugaryDrinkMeal).length;
  const lateMeals = meals.filter(isLateMeal).length;
  const restaurantMeals = meals.filter((meal) => Boolean(String(meal.restaurant_name || '').trim())).length;
  return {
    member,
    meals,
    mealCount: meals.length,
    activeDays,
    avgHealth,
    calories,
    sugaryDrinks,
    lateMeals,
    restaurantMeals,
    note: buildMemberWeeklyNote({ mealCount: meals.length, activeDays, avgHealth, sugaryDrinks, lateMeals, restaurantMeals })
  };
}

function buildMemberWeeklyNote({ mealCount, activeDays, avgHealth, sugaryDrinks, lateMeals, restaurantMeals }) {
  if (!mealCount) return 'No meals logged this week yet.';
  if (sugaryDrinks >= 2) return `${sugaryDrinks} sugary drinks were logged this week.`;
  if (lateMeals >= 2) return `${lateMeals} meals were logged after 9pm this week.`;
  if (avgHealth >= 80) return `Strong meal balance across ${activeDays} active day${activeDays === 1 ? '' : 's'}.`;
  if (avgHealth < 60) return 'Meal quality trended low; lighter and less processed choices would help.';
  if (restaurantMeals >= Math.max(3, Math.ceil(mealCount * 0.6))) return 'Restaurant meals were frequent this week, so home meals could help with control.';
  if (activeDays <= 2) return `Only ${activeDays} active day${activeDays === 1 ? '' : 's'} were logged; more entries will sharpen the trend.`;
  return 'Steady week overall with room for a few more vegetables or protein-forward meals.';
}

function buildProfileWeeklyHighlights(stats, avgCaloriesPerDay) {
  if (!stats.mealCount) {
    return `
      <article>
        <span>Weekly view</span>
        <strong>Waiting for meals</strong>
        <p>Log a few meals for this profile and the weekly trend cards will fill in automatically.</p>
      </article>
    `;
  }

  const scoreLabel = stats.avgHealth >= 80 ? 'Strong balance' : stats.avgHealth >= 60 ? 'Good baseline' : 'Needs attention';
  const watchLabel = stats.sugaryDrinks >= 2
    ? `${stats.sugaryDrinks} sugary drink${stats.sugaryDrinks === 1 ? '' : 's'}`
    : stats.lateMeals >= 2
      ? `${stats.lateMeals} late meal${stats.lateMeals === 1 ? '' : 's'}`
      : stats.restaurantMeals >= Math.max(3, Math.ceil(stats.mealCount * 0.6))
        ? `${stats.restaurantMeals} restaurant meal${stats.restaurantMeals === 1 ? '' : 's'}`
        : 'No major flags';
  const watchCopy = stats.sugaryDrinks >= 2
    ? 'Sugary drinks were the clearest drag on the week.'
    : stats.lateMeals >= 2
      ? 'Late eating was the clearest pattern to tighten up.'
      : stats.restaurantMeals >= Math.max(3, Math.ceil(stats.mealCount * 0.6))
        ? 'Restaurant meals were frequent, so home meals could help with control.'
        : 'This profile stayed fairly steady without a big warning signal.';

  return `
    <article>
      <span>Weekly score</span>
      <strong>${scoreLabel}</strong>
      <p>${stats.avgHealth}/100 average health score across ${stats.mealCount} meal${stats.mealCount === 1 ? '' : 's'}.</p>
    </article>
    <article>
      <span>Main watchout</span>
      <strong>${watchLabel}</strong>
      <p>${watchCopy}</p>
    </article>
    <article>
      <span>Eating rhythm</span>
      <strong>${avgCaloriesPerDay.toLocaleString()} cal/day</strong>
      <p>${stats.activeDays} active day${stats.activeDays === 1 ? '' : 's'} were logged this week.</p>
    </article>
  `;
}

function buildWeeklySummary(meals, calories, spend, favoriteFood) {
  if (!meals.length) {
    return 'No meals logged in the last 7 days. Log a few meals and this report will summarize your real nutrition, habits, and spending.';
  }
  const name = appState.currentMember.name;
  const days = new Set(meals.map((meal) => new Date(meal.eaten_at || meal.created_at).toDateString())).size;
  const avgPerDay = Math.round(calories / Math.max(days, 1));
  const parts = [];
  parts.push(`${name} logged ${meals.length} meal${meals.length !== 1 ? 's' : ''} across ${days} day${days !== 1 ? 's' : ''} this week (${calories.toLocaleString()} calories, about ${avgPerDay.toLocaleString()} per active day).`);
  if (avgPerDay > 2400) {
    parts.push('That is above the 2,200 daily guide — try a lighter dinner or swap one snack for fruit.');
  } else if (avgPerDay > 0 && avgPerDay < 1400) {
    parts.push('That is on the light side — make sure breakfast is not being skipped.');
  } else {
    parts.push('Calorie balance looks steady — keep it up.');
  }
  if (favoriteFood) parts.push(`Most repeated dish: ${favoriteFood}.`);
  if (spend > 0) parts.push(`Food spending recorded this week: ${formatMoney(spend)}.`);
  return parts.join(' ');
}

function renderChat() {
  const member = appState.currentMember;
  document.getElementById('chatList').innerHTML = appState.chat.map((message) => {
    const isMine = message.member_id === member?.id || message.member_name === member?.name;
    return `
      <article class="chat-message ${isMine ? 'mine' : ''}">
        <strong>${escapeHtml(message.member_name || 'Family')}</strong>
        <span>${escapeHtml(message.message)}</span>
      </article>
    `;
  }).join('');
  const chatList = document.getElementById('chatList');
  chatList.scrollTop = chatList.scrollHeight;
}

function renderProfile() {
  const member = appState.currentMember || appState.members[0];
  document.getElementById('profileAvatarLarge').innerHTML = avatarMarkup(member);
  document.getElementById('profileNameLarge').textContent = member.name;
  const nameInput = document.getElementById('profileNameInput');
  if (document.activeElement !== nameInput) nameInput.value = member.name;
  const measurements = appState.profileMeasurements[member.id] || {};
  const heightInput = document.getElementById('profileHeight');
  const weightInput = document.getElementById('profileWeight');
  const ageInput = document.getElementById('profileAge');
  const sexInput = document.getElementById('profileSex');
  const activityInput = document.getElementById('profileActivity');
  const goalInput = document.getElementById('profileGoal');
  const healthFocusInput = document.getElementById('profileHealthFocus');
  const foodAlertsInput = document.getElementById('profileFoodAlerts');
  if (document.activeElement !== heightInput) heightInput.value = measurements.height_cm ?? member.height_cm ?? '';
  if (document.activeElement !== weightInput) weightInput.value = measurements.weight_kg ?? getMemberWeight(member) ?? '';
  if (document.activeElement !== ageInput) ageInput.value = measurements.age ?? '';
  if (document.activeElement !== sexInput) sexInput.value = measurements.sex || (member.name.toLowerCase().includes('dad') || member.name.toLowerCase().includes('papa') ? 'male' : 'female');
  if (document.activeElement !== activityInput) activityInput.value = String(measurements.activity || 1.55);
  if (document.activeElement !== goalInput) goalInput.value = measurements.goal || 'maintain';
  if (document.activeElement !== healthFocusInput) healthFocusInput.value = measurements.health_focus || 'balanced';
  if (document.activeElement !== foodAlertsInput) foodAlertsInput.value = measurements.food_alerts || '';
  document.getElementById('profileCalorieTarget').textContent = measurements.target_calories ? Number(measurements.target_calories).toLocaleString() : '—';
  document.getElementById('profileProteinTarget').textContent = measurements.protein_grams ? Number(measurements.protein_grams).toLocaleString() : '—';
  document.getElementById('profileWaterTarget').textContent = measurements.water_liters ? Number(measurements.water_liters).toFixed(1) : '—';
  document.getElementById('profileHealthSummary').textContent = buildProfileHealthSummary(measurements);
  renderAvatarPicker(member);
}

async function handleSaveProfileMeasurements() {
  const member = appState.currentMember;
  if (!member) return;
  const height = numberOrNull(document.getElementById('profileHeight').value);
  const weight = numberOrNull(document.getElementById('profileWeight').value);
  const age = numberOrNull(document.getElementById('profileAge').value);
  const sex = document.getElementById('profileSex').value;
  const activity = Number(document.getElementById('profileActivity').value);
  const goal = document.getElementById('profileGoal').value;
  const healthFocus = document.getElementById('profileHealthFocus').value;
  const foodAlerts = document.getElementById('profileFoodAlerts').value.trim();
  if (!height || !weight || !age || height < 50 || weight < 10 || age < 14) {
    alert('Enter a valid height, weight, and age.');
    return;
  }

  const bmr = (10 * weight) + (6.25 * height) - (5 * age) + (sex === 'male' ? 5 : -161);
  const adjustment = goal === 'lose' ? -400 : goal === 'gain' ? 300 : 0;
  const minimumCalories = sex === 'male' ? 1500 : 1200;
  const targetCalories = Math.max(minimumCalories, Math.round(((bmr * activity) + adjustment) / 50) * 50);
  const proteinMultiplier = goal === 'maintain' ? 1.2 : 1.6;
  const proteinGrams = Math.round(weight * proteinMultiplier);
  const waterLiters = Math.round(weight * 0.035 * 10) / 10;
  appState.profileMeasurements[member.id] = {
    height_cm: height,
    weight_kg: weight,
    age,
    sex,
    activity,
    goal,
    health_focus: healthFocus,
    food_alerts: foodAlerts,
    target_calories: targetCalories,
    protein_grams: proteinGrams,
    water_liters: waterLiters
  };
  member.height_cm = height;
  member.weight_kg = weight;
  member.target_calories = targetCalories;
  if (!appState.bioLogs[member.id]) appState.bioLogs[member.id] = {};
  appState.bioLogs[member.id][todayKey()] = {
    ...(appState.bioLogs[member.id][todayKey()] || {}),
    weight_kg: weight
  };
  saveStoredAppData();
  renderDashboard();
  renderProfile();

  const button = document.getElementById('saveProfileMeasurements');
  button.textContent = 'Saved ✓';
  setTimeout(() => { button.textContent = 'Save & Calculate'; }, 1600);

  await syncMemberToSupabase(member.id, { weight_kg: weight });
  await syncMemberToSupabase(member.id, { height_cm: height });
  await syncMemberToSupabase(member.id, { target_calories: targetCalories });
}

function buildProfileHealthSummary(measurements) {
  const focusLabels = {
    balanced: 'Balanced eating',
    'blood-sugar': 'Blood sugar support',
    'heart-health': 'Heart health',
    'low-sodium': 'Lower sodium',
    'higher-protein': 'Higher protein',
    'kid-growth': 'Kid growth'
  };
  const focus = focusLabels[measurements.health_focus || 'balanced'] || 'Balanced eating';
  const alerts = String(measurements.food_alerts || '').trim();
  return alerts
    ? `${focus} profile is active. Food alerts: ${alerts}.`
    : `${focus} profile is active.`;
}

async function handleSaveProfileName() {
  const member = appState.currentMember;
  const input = document.getElementById('profileNameInput');
  const newName = input.value.trim();
  if (!member || !newName || newName === member.name) return;

  member.name = newName;
  const matchingMember = appState.members.find((item) => item.id === member.id);
  if (matchingMember) matchingMember.name = newName;
  saveStoredAppData();
  updateProfileUi();
  renderProfiles();
  renderProfile();
  renderSettings();

  await syncMemberToSupabase(member.id, { name: newName });
}

async function syncMemberToSupabase(memberId, fields) {
  if (!window.familyBitesDb?.isConfigured || !appState.familyId) return;
  try {
    await window.familyBitesDb.updateMember(memberId, fields);
  } catch (error) {
    console.warn('Profile change saved locally but Supabase write failed.', error);
  }
}

async function saveMeal(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const photoUrl = document.getElementById('photoPreview').dataset.photoUrl || '';
  const mealDate = String(formData.get('meal_date') || '').trim();
  const mealTime = String(formData.get('meal_time') || '').trim();
  const meal = {
    id: crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}`,
    family_id: appState.familyId,
    member_id: appState.currentMember.id,
    food_name: formData.get('food_name').trim(),
    restaurant_name: formData.get('restaurant_name').trim(),
    location_name: formData.get('location_name').trim(),
    price: numberOrNull(formData.get('price')),
    calories: numberOrNull(formData.get('calories')),
    notes: notesWithMealType(formData.get('notes'), formData.get('meal_type')),
    photo_url: photoUrl,
    eaten_at: buildMealTimestamp(mealDate, mealTime)
  };

  if (!meal.food_name) return;

  appState.meals.unshift(meal);
  saveStoredAppData();
  form.reset();
  setMealFormDateTimeDefaults();
  resetPhotoPreview();
  showPage('dashboard');

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
}

function subscribeToFamilyChat() {
  if (!window.familyBitesDb?.subscribeChat) return;
  try {
    window.familyBitesDb.subscribeChat((row) => {
      // Own messages are already rendered locally when sent.
      if (row.member_id === appState.currentMember?.id) return;
      if (appState.chat.some((item) => item.id === row.id)) return;
      appState.chat.push(normalizeChat(row));
      saveStoredAppData();
      renderChat();
    });
  } catch (error) {
    console.warn('Live chat updates unavailable.', error);
  }
}

async function sendChat(event) {
  event.preventDefault();
  const input = document.getElementById('chatText');
  const messageText = input.value.trim();
  if (!messageText) return;

  const message = {
    id: crypto.randomUUID ? crypto.randomUUID() : `chat-${Date.now()}`,
    family_id: appState.familyId,
    member_id: appState.currentMember.id,
    member_name: appState.currentMember.name,
    message: messageText,
    created_at: new Date().toISOString()
  };

  appState.chat.push(message);
  saveStoredAppData();
  input.value = '';
  renderChat();

  if (window.familyBitesDb?.isConfigured) {
    try {
      const savedMessage = await window.familyBitesDb.sendChat({ ...message, member_name: message.member_name });
      appState.chat = appState.chat.map((item) => item.id === message.id ? normalizeChat(savedMessage) : item);
      saveStoredAppData();
      renderChat();
    } catch (error) {
      console.warn('Chat saved locally but Supabase write failed.', error);
    }
  }
}

function updateMealPreview() {
  const food = document.getElementById('foodName').value.trim();
  const mealType = document.getElementById('mealType').value;
  const restaurant = document.getElementById('restaurantName').value.trim();
  const calories = document.getElementById('calories').value.trim();
  const mealDate = document.getElementById('mealDate').value;
  const mealTime = document.getElementById('mealTime').value;
  const photoUrl = document.getElementById('photoPreview').dataset.photoUrl || '';
  const previewPhoto = document.getElementById('previewPhoto');
  document.getElementById('previewFood').textContent = food || 'New family bite';
  document.getElementById('previewMeta').textContent = [
    mealType ? mealType.charAt(0).toUpperCase() + mealType.slice(1) : 'Meal type not selected',
    restaurant || 'Restaurant not set',
    formatPreviewDateTime(mealDate, mealTime),
    calories ? `${calories} calories` : 'Calories pending'
  ].join(' · ');

  previewPhoto.classList.toggle('hidden', !photoUrl);
  if (photoUrl) previewPhoto.src = photoUrl;
}

async function handlePhotoChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    resetPhotoPreview();
    return;
  }

  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file.');
    event.target.value = '';
    resetPhotoPreview();
    return;
  }

  // Do not let the previous meal's AI result remain visible while a new
  // photo is being analyzed. Clearing the file input also allows the same
  // image to be selected again and rescanned.
  event.target.value = '';
  document.getElementById('foodName').value = '';
  document.getElementById('calories').value = '';
  updateMealPreview();

  try {
    const photoUrl = await resizeImageFile(file, 900, 0.82);
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.src = photoUrl;
    photoPreview.dataset.photoUrl = photoUrl;
    photoPreview.classList.remove('hidden');
    document.getElementById('photoIcon').classList.add('hidden');
    document.getElementById('photoTitle').textContent = 'Photo ready';
    document.getElementById('photoHint').textContent = 'AI is scanning the meal for calories…';
    updateMealPreview();
    await applyAiCalorieEstimate();
  } catch (error) {
    console.warn('Could not load food photo.', error);
    alert('Could not load that food photo. Please try another image.');
    event.target.value = '';
    resetPhotoPreview();
  }
}

function resetPhotoPreview() {
  const photoPreview = document.getElementById('photoPreview');
  const previewPhoto = document.getElementById('previewPhoto');
  photoPreview.removeAttribute('src');
  photoPreview.dataset.photoUrl = '';
  photoPreview.classList.add('hidden');
  previewPhoto.removeAttribute('src');
  previewPhoto.classList.add('hidden');
  document.getElementById('photoIcon').classList.remove('hidden');
  document.getElementById('photoTitle').textContent = 'Add a food photo';
  document.getElementById('photoHint').textContent = 'Choose where your photo comes from.';
  const estimateStatus = document.getElementById('calorieEstimate');
  estimateStatus.classList.remove('estimate-success', 'estimate-error');
  estimateStatus.textContent = 'Add a photo and AI will estimate the visible food and calories.';
}

function setMealFormDateTimeDefaults(date = new Date()) {
  const dateInput = document.getElementById('mealDate');
  const timeInput = document.getElementById('mealTime');
  if (dateInput) dateInput.value = dateKey(date);
  if (timeInput) timeInput.value = timeKey(date);
}

function buildMealTimestamp(dateValue, timeValue) {
  if (dateValue && timeValue) return new Date(`${dateValue}T${timeValue}`).toISOString();
  if (dateValue) return new Date(`${dateValue}T12:00`).toISOString();
  return new Date().toISOString();
}

function formatPreviewDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return 'Date and time not set';
  const previewDate = new Date(`${dateValue}T${timeValue}`);
  if (Number.isNaN(previewDate.getTime())) return 'Date and time not set';
  return `${formatTimelineDate(previewDate)} · ${formatTimelineTime(previewDate)}`;
}

async function applyAiCalorieEstimate() {
  const photoUrl = document.getElementById('photoPreview').dataset.photoUrl || '';
  await requestAiCalorieEstimate({
    imageUrl: photoUrl,
    foodName: document.getElementById('foodName').value.trim(),
    restaurantName: document.getElementById('restaurantName').value.trim(),
    mealType: document.getElementById('mealType').value,
    notes: document.getElementById('notes').value.trim(),
    statusElement: document.getElementById('calorieEstimate'),
    buttonElement: document.getElementById('aiEstimateCalories'),
    caloriesInput: document.getElementById('calories'),
    onSuccess: (estimate) => {
      const foodInput = document.getElementById('foodName');
      if (estimate.foods?.length) {
        foodInput.value = estimate.foods.map((food) => food.name).filter(Boolean).join(', ');
      }
      document.getElementById('photoHint').textContent = 'AI calorie estimate ready.';
      updateMealPreview();
    },
    onError: () => {
      document.getElementById('photoHint').textContent = 'Photo ready. AI scan could not finish.';
    }
  });
}

async function applyEditAiCalorieEstimate() {
  const meal = editingMealId ? appState.meals.find((item) => item.id === editingMealId) : null;
  const estimate = await requestAiCalorieEstimate({
    imageUrl: meal?.photo_url || '',
    foodName: document.getElementById('editFoodName').value.trim(),
    restaurantName: document.getElementById('editRestaurant').value.trim(),
    mealType: document.getElementById('editMealType').value,
    notes: document.getElementById('editNotes').value.trim(),
    statusElement: document.getElementById('editCalorieEstimate'),
    buttonElement: document.getElementById('editAiEstimateCalories'),
    caloriesInput: document.getElementById('editCalories')
  });
  if (estimate) lastEditEstimateSignature = getEditEstimateSignature();
}

function getEditEstimateSignature() {
  return JSON.stringify({
    foodName: document.getElementById('editFoodName').value.trim(),
    restaurantName: document.getElementById('editRestaurant').value.trim(),
    mealType: document.getElementById('editMealType').value,
    notes: document.getElementById('editNotes').value.trim()
  });
}

function clearAutoEditEstimate() {
  if (editEstimateDebounce) clearTimeout(editEstimateDebounce);
  editEstimateDebounce = null;
}

function scheduleAutoEditAiCalorieEstimate() {
  const meal = editingMealId ? appState.meals.find((item) => item.id === editingMealId) : null;
  if (!meal?.photo_url) return;
  const modal = document.getElementById('mealModal');
  if (modal.classList.contains('hidden')) return;
  const signature = getEditEstimateSignature();
  if (signature === lastEditEstimateSignature) return;
  clearAutoEditEstimate();
  editEstimateDebounce = setTimeout(() => {
    editEstimateDebounce = null;
    if (document.getElementById('mealModal').classList.contains('hidden')) return;
    const latestSignature = getEditEstimateSignature();
    if (latestSignature === lastEditEstimateSignature) return;
    applyEditAiCalorieEstimate();
  }, 900);
}

function buildEstimateDescription({ restaurantName, mealType, notes }) {
  const parts = [];
  if (mealType) parts.push(`meal type: ${mealType}`);
  if (restaurantName) parts.push(`restaurant: ${restaurantName}`);
  if (notes) parts.push(`user notes: ${notes}`);
  return parts.join(' | ');
}

async function requestAiCalorieEstimate({
  imageUrl,
  foodName,
  restaurantName,
  mealType,
  notes,
  statusElement,
  buttonElement,
  caloriesInput,
  onSuccess,
  onError
}) {
  if (!imageUrl) {
    statusElement.textContent = 'A saved food photo is required before AI can re-estimate calories.';
    statusElement.classList.remove('estimate-success');
    statusElement.classList.add('estimate-error');
    if (onError) onError();
    return;
  }

  const originalLabel = buttonElement.textContent;
  buttonElement.disabled = true;
  buttonElement.textContent = 'Scanning…';
  statusElement.classList.remove('estimate-success', 'estimate-error');
  statusElement.textContent = 'AI is comparing the photo with your updated meal details…';

  try {
    const response = await fetch('/.netlify/functions/estimate-calories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        food_name: foodName,
        description_context: buildEstimateDescription({ restaurantName, mealType, notes }),
        portion_size: 'regular'
      })
    });
    const rawResponse = await response.text();
    let estimate = null;
    try {
      estimate = rawResponse ? JSON.parse(rawResponse) : null;
    } catch (parseError) {
      estimate = null;
    }
    if (!response.ok) throw new Error(estimate?.error || 'AI scan is unavailable. Enter calories manually and try again later.');
    if (!estimate) throw new Error('AI scan is unavailable. Enter calories manually and try again later.');

    const calories = Math.max(0, Math.round(Number(estimate.total_calories) || 0));
    caloriesInput.value = String(calories);
    const foods = estimate.foods?.map((food) => `${food.name} ${food.calories} kcal`).join(' + ');
    statusElement.textContent = `${foods || 'Meal'} · about ${calories.toLocaleString()} kcal (${estimate.confidence} confidence). Please confirm before saving.`;
    statusElement.classList.add('estimate-success');
    if (onSuccess) onSuccess(estimate);
    return estimate;
  } catch (error) {
    statusElement.textContent = error.message || 'AI scan is unavailable. Enter calories manually and try again later.';
    statusElement.classList.add('estimate-error');
    if (onError) onError(error);
    return null;
  } finally {
    buttonElement.disabled = false;
    buttonElement.textContent = originalLabel;
  }
}

async function handleProfilePhotoChange(event) {
  const file = event.target.files?.[0];
  const member = appState.currentMember;
  if (!file || !member) return;

  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file.');
    event.target.value = '';
    return;
  }

  try {
    let photoUrl = await resizeImageFile(file, 640, 0.84);
    if (window.familyBitesDb?.isConfigured) {
      try {
        const uploadedUrl = await window.familyBitesDb.uploadAvatar(photoUrl);
        if (uploadedUrl) photoUrl = uploadedUrl;
      } catch (uploadError) {
        console.warn('Avatar upload to storage failed, keeping local copy.', uploadError);
      }
    }
    applyMemberPhoto(member, photoUrl);
    event.target.value = '';
  } catch (error) {
    console.warn('Could not read profile photo.', error);
    alert('Could not load that profile photo. Please try another image.');
    event.target.value = '';
  }
}

function chooseProfileAvatar(photoUrl) {
  const member = appState.currentMember;
  if (!member || !photoUrl) return;
  applyMemberPhoto(member, photoUrl);
}

function applyMemberPhoto(member, photoUrl) {
  member.photo = photoUrl;
  const matchingMember = appState.members.find((item) => item.id === member.id);
  if (matchingMember) matchingMember.photo = photoUrl;
  saveProfilePhoto(member.id, photoUrl);
  renderProfiles();
  updateProfileUi();
  renderProfile();
  // Data URLs stay local-only; storage URLs and preset asset paths sync for the whole family.
  if (!photoUrl.startsWith('data:')) {
    syncMemberToSupabase(member.id, { photo_url: photoUrl });
  }
}

function renderAvatarPicker(member) {
  const picker = document.getElementById('avatarPicker');
  picker.innerHTML = avatarOptions.map((option) => {
    const photoUrl = option.url;
    return `
      <button class="${member.photo === photoUrl ? 'active' : ''}" type="button" data-avatar-url="${escapeAttr(photoUrl)}" aria-label="Choose ${escapeAttr(option.label)} avatar">
        <img src="${escapeAttr(photoUrl)}" alt="">
      </button>
    `;
  }).join('');
}

function getMemberMeals() {
  const member = appState.currentMember;
  if (!member) return [];
  return appState.meals
    .filter((meal) => mealBelongsToMember(meal, member, true))
    .sort((a, b) => new Date(b.eaten_at || b.created_at) - new Date(a.eaten_at || a.created_at));
}

function mealBelongsToMember(meal, member, includeUnassigned = false) {
  if (!meal || !member) return false;
  if (meal.member_id && meal.member_id === member.id) return true;
  if (meal.member_name && meal.member_name === member.name) return true;
  return includeUnassigned && !meal.member_id && !meal.member_name;
}

function mealDayKey(meal) {
  const value = meal?.eaten_at || meal?.created_at;
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toDateString();
}

function isLateMeal(meal) {
  const value = meal?.eaten_at || meal?.created_at;
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const hours = date.getHours();
  return hours >= 21 || hours <= 4;
}

function isSugaryDrinkMeal(meal) {
  const text = foodSearchText(meal);
  const keywords = ['soda', 'cola', 'frappe', 'milk tea', 'boba', 'bubble tea', 'sweet tea', 'shake', 'slush', 'juice', 'smoothie', 'mocha', 'sweet coffee'];
  return keywords.some((word) => text.includes(word));
}

function normalizeMember(member) {
  return {
    id: member.id,
    name: member.name,
    avatar: member.avatar || '👤',
    photo_url: member.photo_url || '',
    photo: member.photo_url || member.photo || defaultProfilePhoto(member),
    role: member.role || 'Family member',
    weight_kg: member.weight_kg ?? null,
    height_cm: member.height_cm ?? null,
    target_calories: member.target_calories ?? null
  };
}

function avatarMarkup(member) {
  return member?.photo
    ? `<img src="${escapeAttr(member.photo)}" alt="">`
    : escapeHtml(member?.avatar || '👤');
}

function defaultProfilePhoto(member) {
  if (member.id === 'add' || member.name === 'Add Member') return '';
  const map = {
    dad: 'assets/avatars/dad.jpg',
    mom: 'assets/avatars/mom.jpg',
    rithyna: 'assets/avatars/mom.jpg',
    daughter: 'assets/avatars/emily.jpg',
    emily: 'assets/avatars/emily.jpg',
    son: 'assets/avatars/james.jpg',
    james: 'assets/avatars/james.jpg',
    grandma: 'assets/avatars/sophia.jpg',
    sophia: 'assets/avatars/sophia.jpg',
    chef: 'assets/avatars/chef.jpg'
  };
  const idKey = String(member.id || '').toLowerCase();
  const nameKey = String(member.name || '').toLowerCase();
  return map[idKey] || map[nameKey] || 'assets/avatars/dad.jpg';
}

function applyStoredProfilePhotos() {
  const storedPhotos = getStoredProfilePhotos();
  appState.members = appState.members.map((member) => ({
    ...member,
    photo: savedOrDefaultProfilePhoto(member, storedPhotos[member.id])
  }));
  if (appState.currentMember) {
    const updatedMember = appState.members.find((member) => member.id === appState.currentMember.id);
    if (updatedMember) appState.currentMember = updatedMember;
  }
}

function savedOrDefaultProfilePhoto(member, savedPhoto) {
  // A photo synced to the family database wins over anything saved on this device.
  if (member.photo_url) return member.photo_url;
  if (savedPhoto && !savedPhoto.includes('dicebear.com')) return savedPhoto;
  if (member.photo && !member.photo.includes('dicebear.com')) return member.photo;
  return defaultProfilePhoto(member);
}

function applyStoredAppData() {
  const storedMembers = getStoredJson(localMembersStorageKey, []).map(normalizeMember);
  const storedMeals = getStoredJson(localMealsStorageKey, []).map(normalizeMeal);
  const storedChat = getStoredJson(localChatStorageKey, []).map(normalizeChat);
  const storedOrders = getStoredJson(chefOrdersStorageKey, []);
  const storedCart = getStoredJson(chefCartStorageKey, []);
  const storedVoiceNotes = getStoredJson(chefVoiceStorageKey, []);
  const storedBioLogs = getStoredJson(bioLogsStorageKey, {});
  const storedProfileMeasurements = getStoredJson(profileMeasurementsStorageKey, {});
  if (storedMembers.length) appState.members = mergeMembers(storedMembers, appState.members);
  if (Object.keys(storedBioLogs).length) appState.bioLogs = storedBioLogs;
  if (Object.keys(storedProfileMeasurements).length) appState.profileMeasurements = storedProfileMeasurements;
  if (storedMeals.length) appState.meals = mergeRecords(storedMeals, appState.meals);
  if (storedChat.length) appState.chat = mergeRecords(storedChat, appState.chat);
  if (storedOrders.length) appState.chefOrders = storedOrders;
  if (storedCart.length) appState.cart = storedCart;
  if (storedVoiceNotes.length) appState.voiceNotes = storedVoiceNotes;
}

function saveStoredAppData() {
  setStoredJson(localMembersStorageKey, appState.members);
  setStoredJson(localMealsStorageKey, appState.meals);
  setStoredJson(localChatStorageKey, appState.chat);
  setStoredJson(chefOrdersStorageKey, appState.chefOrders);
  setStoredJson(chefCartStorageKey, appState.cart);
  setStoredJson(chefVoiceStorageKey, appState.voiceNotes);
  setStoredJson(bioLogsStorageKey, appState.bioLogs);
  setStoredJson(profileMeasurementsStorageKey, appState.profileMeasurements);
}

function mergeMembers(primary, fallback) {
  const byId = new Map();
  [...fallback, ...primary].forEach((member) => {
    if (!member?.id) return;
    byId.set(member.id, normalizeMember(member));
  });
  const members = Array.from(byId.values());
  const addMember = members.find((member) => member.id === 'add' || member.name === 'Add Member');
  return [
    ...members.filter((member) => member.id !== 'add' && member.name !== 'Add Member'),
    addMember || fallback.find((member) => member.id === 'add') || { id: 'add', name: 'Add Member', avatar: '＋', role: 'Invite family', photo: '' }
  ];
}

function isSeededDefaultMember(member) {
  if (!member || member.id === 'add' || member.name === 'Add Member') return false;
  return seededDefaultMemberIds.has(String(member.id || '').toLowerCase())
    || seededDefaultMemberNames.has(String(member.name || '').toLowerCase());
}

function getVisibleMembers() {
  const addMember = appState.members.find((member) => member.id === 'add' || member.name === 'Add Member');
  const realMembers = appState.members.filter((member) => member.id !== 'add' && member.name !== 'Add Member');
  const hasCustomFamily = realMembers.some((member) => !isSeededDefaultMember(member));
  return hasCustomFamily
    ? [...realMembers.filter((member) => !isSeededDefaultMember(member)), addMember].filter(Boolean)
    : appState.members;
}

function getDefaultMember() {
  return getVisibleMembers().find((member) => member.id !== 'add' && member.name !== 'Add Member')
    || appState.members.find((member) => member.id !== 'add' && member.name !== 'Add Member')
    || null;
}

function mergeRecords(primary, fallback) {
  const seen = new Set();
  return [...primary, ...fallback].filter((item) => {
    const key = item.id || `${item.member_id || item.member_name || 'family'}-${item.food_name || item.message || ''}-${item.eaten_at || item.created_at || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getStoredProfilePhotos() {
  return getStoredJson(profilePhotoStorageKey, {});
}

function saveProfilePhoto(memberId, photoUrl) {
  try {
    const storedPhotos = getStoredProfilePhotos();
    storedPhotos[memberId] = photoUrl;
    localStorage.setItem(profilePhotoStorageKey, JSON.stringify(storedPhotos));
  } catch (error) {
    console.warn('Could not save profile photo locally.', error);
    alert('Profile photo updated for this session, but the browser could not save it permanently.');
  }
}

function getStoredJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch (error) {
    console.warn(`Could not read ${key}.`, error);
    return fallback;
  }
}

function setStoredJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save ${key}.`, error);
    alert('Saved for this session, but this browser could not store all data permanently. Try using a smaller photo.');
  }
}

function resizeImageFile(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('error', () => reject(reader.error));
    reader.addEventListener('load', () => {
      const image = new Image();
      image.addEventListener('error', () => reject(new Error('Image could not be loaded.')));
      image.addEventListener('load', () => {
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      });
      image.src = String(reader.result || '');
    });
    reader.readAsDataURL(file);
  });
}

function normalizeMeal(meal) {
  return {
    ...meal,
    food_name: meal.food_name || meal.name || 'Meal',
    notes: meal.notes || meal.description || '',
    photo_url: meal.photo_url || '',
    eaten_at: meal.eaten_at || meal.created_at || new Date().toISOString()
  };
}

function normalizeChat(message) {
  const member = appState.members.find((item) => item.id === message.member_id);
  return {
    ...message,
    member_name: message.member_name || member?.name || 'Family',
    created_at: message.created_at || new Date().toISOString()
  };
}

function isToday(meal) {
  return new Date(meal.eaten_at || meal.created_at).toDateString() === new Date().toDateString();
}

function isYesterday(meal) {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return new Date(meal.eaten_at || meal.created_at).toDateString() === yesterday.toDateString();
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function timeKey(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function todayKey() {
  return dateKey(new Date());
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function mostCommon(values) {
  const counts = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

function formatMoney(value) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(value || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function numberOrNull(value) {
  return value === '' || value === null ? null : Number(value);
}

function mealEmoji(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('pizza')) return '🍕';
  if (lower.includes('sushi') || lower.includes('salmon')) return '🍣';
  if (lower.includes('rice')) return '🍚';
  if (lower.includes('noodle')) return '🍜';
  if (lower.includes('fruit') || lower.includes('mango')) return '🥭';
  return '🍽️';
}

function restaurantEmoji(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('pizza')) return '🍕';
  if (lower.includes('sushi')) return '🍣';
  if (lower.includes('kitchen')) return '🥘';
  return '🍽️';
}

function emptyState(message) {
  return `<article class="meal-card"><span class="meal-emoji">🍽️</span><div><h4>${message}</h4><p>FamilyBites is ready when you are.</p></div></article>`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

function emptyChefState(message) {
  return `<article class="chef-order-card"><span>🍽️</span><div><h4>${message}</h4><p>Ready when the family orders.</p></div></article>`;
}

function orderAgain(restaurantName) {
  document.getElementById('restaurantName').value = restaurantName;
  showPage('snap');
}

function openAddMemberModal() {
  document.getElementById('newMemberName').value = '';
  document.getElementById('newMemberRole').value = '';
  document.getElementById('addMemberModal').classList.remove('hidden');
  document.getElementById('newMemberName').focus();
}

function closeAddMemberModal() {
  document.getElementById('addMemberModal').classList.add('hidden');
}

async function handleConfirmAddMember() {
  const name = document.getElementById('newMemberName').value.trim();
  const role = document.getElementById('newMemberRole').value.trim();
  if (!name) {
    document.getElementById('newMemberName').focus();
    return;
  }

  const avatarMap = ['👦', '👧', '👨', '👩', '👵', '👴', '🧑'];
  const avatar = avatarMap[appState.members.length % avatarMap.length] || '🧑';
  const newMember = {
    id: `member-${Date.now()}`,
    name,
    avatar,
    role: role || 'Family member',
    photo: ''
  };

  const addIndex = appState.members.findIndex((m) => m.id === 'add');
  if (addIndex >= 0) {
    appState.members.splice(addIndex, 0, newMember);
  } else {
    appState.members.push(newMember);
  }

  saveStoredAppData();
  closeAddMemberModal();
  renderProfiles();
  renderSettings();

  if (window.familyBitesDb?.isConfigured && appState.familyId) {
    try {
      const { data } = await window.familyBitesDb.client
        .from('members')
        .insert({ family_id: appState.familyId, name: newMember.name, avatar: newMember.avatar, role: newMember.role })
        .select()
        .single();
      if (data) newMember.id = data.id;
    } catch (error) {
      console.warn('Member saved locally but Supabase write failed.', error);
    }
  }
}

function removeMember(memberId) {
  const member = appState.members.find((m) => m.id === memberId);
  if (!member) return;
  if (member.id === appState.currentMember?.id) {
    alert('You cannot remove the currently active profile. Switch profiles first.');
    return;
  }
  if (!confirm(`Remove ${member.name} from this family?`)) return;
  appState.members = appState.members.filter((m) => m.id !== memberId);
  appState.meals = appState.meals.filter((m) => m.member_id !== memberId);
  saveStoredAppData();
  renderProfiles();
  renderSettings();
}

function renderSettings() {
  const el = document.getElementById('settingsContent');
  if (!el) return;

  const realMembers = appState.members.filter((m) => m.id !== 'add');
  el.innerHTML = `
    <div class="settings-section">
      <p class="eyebrow">Family Members</p>
      <h3>${realMembers.length} member${realMembers.length !== 1 ? 's' : ''}</h3>
      <div class="settings-member-list">
        ${realMembers.map((m) => `
          <div class="settings-member-row">
            <div class="mini-avatar">${avatarMarkup(m)}</div>
            <div class="settings-member-info">
              <strong>${escapeHtml(m.name)}</strong>
              <small>${escapeHtml(m.role || 'Family member')}</small>
            </div>
            ${m.id === appState.currentMember?.id
              ? '<span class="you-badge">You</span>'
              : `<button class="small-danger-btn" data-remove-member="${escapeAttr(m.id)}">Remove</button>`
            }
          </div>
        `).join('')}
      </div>
      <button class="primary-button" data-action="add-member">+ Add Member</button>
    </div>

    <div class="settings-section">
      <p class="eyebrow">Navigation</p>
      <h3>Quick links</h3>
      <div class="settings-nav-grid">
        <button class="settings-nav-btn" data-page="snap">📷 Snap Food</button>
        <button class="settings-nav-btn" data-page="order">🧑‍🍳 Chef Menu</button>
        <button class="settings-nav-btn" data-page="weekly">📊 Weekly Report</button>
        <button class="settings-nav-btn" data-page="timeline">📅 Timeline</button>
        <button class="settings-nav-btn" data-page="favorites">❤️ Favorites</button>
        <button class="settings-nav-btn" data-page="profile">👤 Profile</button>
      </div>
    </div>

    <div class="settings-section danger-zone">
      <p class="eyebrow">Data</p>
      <h3>Clear all local data</h3>
      <p>Removes all meals, chat messages, orders, and cart saved in this browser. This cannot be undone.</p>
      <button class="danger-button" data-action="clear-all-data">🗑️ Clear All Data</button>
    </div>

    <div class="settings-section app-version-card">
      <p class="eyebrow">Release</p>
      <h3>${APP_VERSION}</h3>
      <p>Build date: ${APP_BUILD_DATE}</p>
    </div>
  `;
}
