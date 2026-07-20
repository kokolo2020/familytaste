const appState = {
  familyId: null,
  familyName: '',
  currentMember: null,
  currentPage: 'dashboard',
  authUser: null,
  currentUserEmail: '',
  authRole: 'guest',
  linkedMemberId: null,
  chatSubscription: null,
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
window.appState = appState;

const profilePhotoStorageKey = 'familyBites.profilePhotos';
const localMealsStorageKey = 'familyBites.meals.v2';
const localChatStorageKey = 'familyBites.chat.v2';
const chefOrdersStorageKey = 'familyBites.chefOrders';
const chefCartStorageKey = 'familyBites.chefCart';
const chefVoiceStorageKey = 'familyBites.chefVoiceNotes';
const bioLogsStorageKey = 'familyBites.bioLogs.v1';
const profileMeasurementsStorageKey = 'familyBites.profileMeasurements.v1';

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
let currentScanInsight = null;

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
  renderNavigation();
  bindEvents();
  renderAuthState(window.familyBitesDb?.isConfigured ? 'loading' : 'demo');
  if (window.familyBitesDb?.isConfigured) {
    window.familyBitesDb.onAuthStateChange(() => {
      hydrateFromSupabase();
    });
  }
  hydrateFromSupabase();
});

function isAdminUser() {
  return !window.familyBitesDb?.isConfigured || appState.authRole === 'admin';
}

function resetProtectedState() {
  if (appState.chatSubscription?.unsubscribe) {
    try {
      appState.chatSubscription.unsubscribe();
    } catch (error) {
      console.warn('Could not clean up chat subscription.', error);
    }
  }
  appState.chatSubscription = null;
  appState.authUser = null;
  appState.currentUserEmail = '';
  appState.authRole = 'guest';
  appState.familyId = null;
  appState.familyName = '';
  appState.currentMember = null;
  appState.linkedMemberId = null;
  appState.members = [];
  appState.meals = [];
  appState.chat = [];
  appState.chefOrders = [];
  appState.cart = [];
  appState.voiceNotes = [];
  appState.bioLogs = {};
  appState.profileMeasurements = {};
}

function renderAuthState(mode = 'signed-out') {
  const authCard = document.getElementById('landingAuthCard');
  const spotlight = document.getElementById('landingSpotlight');
  const profileDock = document.getElementById('profileDock');
  const signInButton = document.getElementById('googleSignInButton');
  const signOutButton = document.getElementById('signOutButton');
  if (!authCard || !spotlight || !profileDock || !signInButton || !signOutButton) return;

  const title = document.getElementById('authStatusTitle');
  const copy = document.getElementById('authStatusCopy');
  const meta = document.getElementById('authStatusMeta');
  const authDebugError = String(window.familyBitesAuthDebug?.error || '').trim();

  const showProfiles = mode === 'ready';
  spotlight.classList.toggle('hidden', !showProfiles);
  profileDock.classList.toggle('hidden', !showProfiles);
  authCard.classList.toggle('hidden', !window.familyBitesDb?.isConfigured && mode === 'demo');

  if (mode === 'demo') return;

  signInButton.classList.toggle('hidden', mode !== 'signed-out');
  signOutButton.classList.toggle('hidden', mode === 'signed-out' || mode === 'loading');

  if (mode === 'loading') {
    title.textContent = 'Checking access';
    copy.textContent = 'Loading your Google session and family permissions…';
    meta.textContent = authDebugError
      ? `Auth returned: ${authDebugError}`
      : 'The app will unlock after your family access is confirmed.';
    return;
  }

  if (mode === 'no-family') {
    title.textContent = 'No family access yet';
    copy.textContent = 'This Google account is signed in, but it is not linked to a FamilyTaste family.';
    meta.textContent = 'Ask a family admin to assign your account, or sign in with the admin account first.';
    return;
  }

  if (mode === 'ready') {
    title.textContent = appState.familyName || 'Family access ready';
    copy.textContent = isAdminUser()
      ? `Signed in as ${appState.currentUserEmail}. Admin can view and manage every family member.`
      : `Signed in as ${appState.currentUserEmail}. Only your assigned member profile is visible.`;
    meta.textContent = isAdminUser()
      ? 'Google login is active. Family member access is controlled by your admin role.'
      : 'Google login is active. Your member access is restricted by your family role.';
    return;
  }

  title.textContent = 'Continue with Google';
  copy.textContent = 'Sign in to load your family and member permissions.';
  meta.textContent = authDebugError
    ? `Auth returned: ${authDebugError}`
    : 'Only approved family accounts can open this space.';
}

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
      openMealModal(null, addMealTarget.dataset.addMeal);
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
  document.getElementById('profilePhotoInput').addEventListener('change', handleProfilePhotoChange);
  document.getElementById('voiceRecordButton').addEventListener('click', toggleVoiceRecording);
  document.getElementById('sendCartButton').addEventListener('click', sendCartToChef);
  document.getElementById('confirmAddMember').addEventListener('click', handleConfirmAddMember);
  document.getElementById('cancelAddMember').addEventListener('click', closeAddMemberModal);
  document.getElementById('saveProfileName').addEventListener('click', handleSaveProfileName);
  document.getElementById('saveProfileMeasurements').addEventListener('click', handleSaveProfileMeasurements);
  document.getElementById('saveBioStats').addEventListener('click', handleSaveBioStats);
  document.getElementById('googleSignInButton').addEventListener('click', async () => {
    if (!window.familyBitesDb?.signInWithGoogle) return;
    try {
      await window.familyBitesDb.signInWithGoogle();
    } catch (error) {
      console.warn('Google sign-in could not start.', error);
      alert('Google sign-in could not start. Check Supabase Google auth settings and try again.');
    }
  });
  document.getElementById('signOutButton').addEventListener('click', async () => {
    if (!window.familyBitesDb?.signOut) return;
    try {
      await window.familyBitesDb.signOut();
      await hydrateFromSupabase();
    } catch (error) {
      console.warn('Sign-out failed.', error);
      alert('Could not sign out right now. Please try again.');
    }
  });
  document.getElementById('saveMealEdit').addEventListener('click', handleSaveMealEdit);
  document.getElementById('cancelMealEdit').addEventListener('click', () => {
    document.getElementById('mealModal').classList.add('hidden');
  });
  document.getElementById('profileNameInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSaveProfileName();
  });

  ['foodName', 'mealType', 'restaurantName', 'calories'].forEach((id) => {
    document.getElementById(id).addEventListener('input', updateMealPreview);
  });
}

async function hydrateFromSupabase() {
  if (!window.familyBitesDb?.isConfigured) {
    applyStoredAppData();
    applyStoredProfilePhotos();
    selectMember(appState.members[0], { openDashboard: false });
    renderProfiles();
    renderSettings();
    return;
  }

  renderAuthState('loading');

  try {
    resetProtectedState();
    const context = await window.familyBitesDb.ensureUserContext();
    appState.authUser = context?.user || null;
    appState.currentUserEmail = context?.email || '';
    appState.authRole = context?.role || 'guest';
    appState.linkedMemberId = context?.memberId || null;
    appState.familyName = context?.familyName || '';
    appState.familyId = context?.familyId || null;

    if (!appState.authUser) {
      renderProfiles();
      renderSettings();
      renderAuthState('signed-out');
      return;
    }

    if (!appState.familyId) {
      renderProfiles();
      renderSettings();
      renderAuthState('no-family');
      return;
    }

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
      appState.members = members.map(normalizeMember);
      applyStoredProfilePhotos();
    }
    if (meals.length) appState.meals = mergeRecords(meals.map(normalizeMeal), appState.meals);
    if (favorites.length) appState.favorites = favorites;
    if (chat.length) appState.chat = mergeRecords(chat.map(normalizeChat), appState.chat);

    try {
      const bioLogs = await window.familyBitesDb.getBioLogs(todayKey());
      bioLogs.forEach((log) => {
        if (!appState.bioLogs[log.member_id]) appState.bioLogs[log.member_id] = {};
        appState.bioLogs[log.member_id][log.log_date] = {
          weight_kg: log.weight_kg,
          steps: log.steps,
          sugar_level: log.sugar_level
        };
      });
    } catch (bioError) {
      console.warn('Bio logs unavailable (table may not exist yet).', bioError);
    }

    subscribeToFamilyChat();
    renderAuthState('ready');
  } catch (error) {
    console.warn('Supabase auth-backed family loading failed.', error);
    renderAuthState(appState.authUser ? 'no-family' : 'signed-out');
  }

  renderProfiles();
  renderSettings();
  if (appState.members.length) {
    const defaultMember = appState.members.find((member) => member.id === appState.linkedMemberId) || appState.members[0];
    selectMember(defaultMember, { openDashboard: false });
  }
}

function renderProfiles() {
  const profileGrid = document.getElementById('profileGrid');
  const landingSpotlight = document.getElementById('landingSpotlight');
  if (!profileGrid || !landingSpotlight) return;

  const realMembers = appState.members.filter((member) => member.id !== 'add' && member.name !== 'Add Member');
  if (!realMembers.length) {
    landingSpotlight.innerHTML = '';
    profileGrid.innerHTML = '';
    return;
  }
  const featuredMember = appState.currentMember && realMembers.some((member) => member.id === appState.currentMember.id)
    ? appState.currentMember
    : realMembers[0];
  const selectableMembers = realMembers.filter((member) => member.id !== featuredMember?.id);

  landingSpotlight.innerHTML = featuredMember ? `
    <button class="landing-spotlight-card" type="button" data-member-id="${escapeAttr(featuredMember.id)}">
      <span class="landing-spotlight-avatar">${avatarMarkup(featuredMember)}</span>
      <span class="landing-spotlight-copy">
        <small>Current profile</small>
        <strong>${escapeHtml(featuredMember.name)}</strong>
        <span>${escapeHtml(featuredMember.role || 'Family member')}</span>
      </span>
      <span class="landing-spotlight-icon" aria-hidden="true">↗</span>
    </button>
  ` : '';

  profileGrid.innerHTML = selectableMembers.map((member) => `
    <button class="profile-card" type="button" data-member-id="${escapeAttr(member.id)}">
      <span class="avatar">${avatarMarkup(member)}</span>
      <strong>${escapeHtml(member.name)}</strong>
    </button>
  `).join('');

  [landingSpotlight, profileGrid].forEach((container) => container.querySelectorAll('[data-member-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const member = appState.members.find((item) => item.id === button.dataset.memberId);
      selectMember(member);
    });
  }));
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
    window.scrollTo(0, 0);
  } else {
    renderAll();
  }
}

function handleAction(action) {
  if (action === 'home') {
    document.getElementById('workspace').classList.add('hidden');
    document.getElementById('landing').classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  if (action === 'demo-dashboard') {
    selectMember(appState.currentMember || appState.members[0]);
  }

  if (action === 'add-member') {
    openAddMemberModal();
  }

  if (action === 'sign-out') {
    document.getElementById('signOutButton')?.click();
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
    selectMember(appState.members[0]);
  }
  if (!appState.currentMember) return;

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
  const spend = sum(todayMeals, 'price');
  const savedTargets = appState.profileMeasurements[appState.currentMember?.id] || {};
  const goal = Number(savedTargets.target_calories || appState.currentMember?.target_calories) || 2200;
  const progress = Math.min(Math.round((calories / goal) * 100), 100);

  document.getElementById('dashboardMealCount').textContent = `${todayMeals.length} meal${todayMeals.length === 1 ? '' : 's'}`;
  document.getElementById('dashboardCalorieCount').textContent = `${calories.toLocaleString()} cal`;

  document.getElementById('todayCalories').textContent = calories.toLocaleString();
  document.getElementById('todayMeals').textContent = todayMeals.length.toString();
  document.getElementById('todaySpend').textContent = formatMoney(spend);
  document.getElementById('calorieProgress').style.width = `${progress}%`;
  document.getElementById('calorieGoalLabel').textContent = `Goal ${goal.toLocaleString()} calories`;
  document.getElementById('mealSummary').textContent = todayMeals.length
    ? todayMeals.slice(0, 3).map((meal) => meal.food_name).join(', ')
    : 'No meals logged yet';
  document.getElementById('bioCalories').textContent = calories.toLocaleString();

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
  setText('summaryWeight', log.weight_kg ? Number(log.weight_kg).toLocaleString() : '--');
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
  renderDashboardNutrition(todayMeals, calories);

  const impacts = buildFoodBodyImpacts(todayMeals, calories);
  const impactList = document.getElementById('bodyImpactList');
  if (impactList) impactList.innerHTML = impacts.map(([name, score, icon, copy, position, foods]) => `
    
    <article
  class="impact-callout impact-${position}"
  data-part="${escapeAttr(name)}"
  data-score="${score}"
  data-copy="${escapeAttr(copy)}"
  tabindex="0"
>
  
      <span class="impact-callout-title">${icon} ${escapeHtml(name)}</span>
      <strong>${score}%</strong>
      ${foods.length ? `<div class="impact-food-mini-list">${foods.map((food) => `
        <div class="impact-food-mini">
          <span class="impact-food-mini-name">${escapeHtml(food.name)}</span>
          <span class="impact-food-mini-score meal-score-${escapeAttr(mealScoreTone(food.score))}">${food.score.toFixed(1)}</span>
        </div>
      `).join('')}</div>` : ''}
      <p title="${escapeAttr(copy)}">${escapeHtml(copy)}</p>
    </article>`).join('');

  const recommendations = buildRecommendations({ calories, calorieGoal, steps, glucose, mealCount, nutrition });
  const recommendationList = document.getElementById('aiRecommendationList');
  if (recommendationList) recommendationList.innerHTML = recommendations.map((item) => `
    <article class="recommendation-item">
      <span>${item.icon}</span><div><strong>${item.title}</strong><p>${item.copy}</p></div>
    </article>`).join('');
}

function renderDashboardNutrition(todayMeals, calories) {
  const macroEstimate = estimateMealMacros(todayMeals, calories);
  Object.entries(macroEstimate.percentages).forEach(([name, value]) => {
    const bar = document.getElementById(`${name}MacroBar`);
    if (bar) bar.style.width = `${value}%`;
    setText(`${name}MacroValue`, `${value}%`);
  });

  const donut = document.querySelector('#page-dashboard .nutrition-donut');
  if (donut) {
    donut.style.background = todayMeals.length
      ? `radial-gradient(circle at center, #fff 54%, transparent 56%), conic-gradient(#ffb32f 0 ${macroEstimate.percentages.carb}%, #89c95d ${macroEstimate.percentages.carb}% ${macroEstimate.percentages.carb + macroEstimate.percentages.protein}%, #f25732 ${macroEstimate.percentages.carb + macroEstimate.percentages.protein}% 100%)`
      : 'radial-gradient(circle at center, #fff 54%, transparent 56%), conic-gradient(#f0e8dc 0 100%)';
  }

  const dailyInsight = aggregateDailyScanInsight(todayMeals);
  setText('nutritionInsight', dailyInsight.summary);
  const vitaminList = document.getElementById('dashboardVitaminList');
  const mineralList = document.getElementById('dashboardMineralList');
  if (vitaminList) vitaminList.innerHTML = renderDashboardNutrientItems(dailyInsight.vitamins, 'No vitamin estimates yet.');
  if (mineralList) mineralList.innerHTML = renderDashboardNutrientItems(dailyInsight.minerals, 'No mineral estimates yet.');
}

function estimateMealMacros(todayMeals, calories) {
  if (!todayMeals.length || !calories) {
    return {
      percentages: { carb: 0, protein: 0, fat: 0 }
    };
  }

  const macroTotals = todayMeals.reduce((totals, meal) => {
    const savedInsight = getMealInsight(meal);
    if (savedInsight?.macros) {
      totals.carb += Number(savedInsight.macros.carbs_g) || 0;
      totals.protein += Number(savedInsight.macros.protein_g) || 0;
      totals.fat += Number(savedInsight.macros.fat_g) || 0;
      return totals;
    }
    const estimate = estimateMealMacroShare(meal);
    totals.carb += estimate.carb * 10;
    totals.protein += estimate.protein * 10;
    totals.fat += estimate.fat * 10;
    return totals;
  }, { carb: 0, protein: 0, fat: 0 });

  const total = macroTotals.carb + macroTotals.protein + macroTotals.fat || 1;
  const carb = Math.round(macroTotals.carb / total * 100);
  const protein = Math.round(macroTotals.protein / total * 100);
  return {
    percentages: {
      carb,
      protein,
      fat: Math.max(0, 100 - carb - protein)
    }
  };
}

function estimateMealMacroShare(meal) {
  const text = foodSearchText(meal);
  const scores = { carb: 1.5, protein: 1.1, fat: 0.9 };
  const applyBoost = (words, boost) => {
    if (words.some((word) => text.includes(word))) {
      scores.carb += boost.carb || 0;
      scores.protein += boost.protein || 0;
      scores.fat += boost.fat || 0;
    }
  };

  applyBoost(['rice', 'bread', 'toast', 'pasta', 'spaghetti', 'noodle', 'oat', 'cereal', 'potato', 'corn', 'wrap', 'pizza', 'bun'], { carb: 1.9, protein: 0.3, fat: 0.3 });
  applyBoost(['chicken', 'beef', 'pork', 'steak', 'fish', 'salmon', 'tuna', 'egg', 'tofu', 'shrimp', 'yogurt', 'milk', 'protein'], { carb: 0.2, protein: 2.2, fat: 0.5 });
  applyBoost(['avocado', 'olive', 'cheese', 'butter', 'cream', 'coconut', 'nuts', 'peanut', 'almond', 'walnut'], { carb: 0.2, protein: 0.3, fat: 2.2 });
  applyBoost(['fried', 'crispy', 'bacon', 'sausage', 'dessert', 'cake', 'cookie', 'ice cream', 'donut', 'pastry'], { carb: 0.9, protein: 0.1, fat: 1.8 });
  applyBoost(['salad', 'vegetable', 'broccoli', 'spinach', 'greens', 'tomato', 'cucumber', 'fruit', 'apple', 'banana', 'berry', 'orange', 'mango'], { carb: 0.7, protein: 0.2, fat: 0.1 });
  return scores;
}

function aggregateDailyScanInsight(todayMeals) {
  const nutrientBuckets = {
    vitamins: new Map(),
    minerals: new Map()
  };
  let mealsWithInsight = 0;
  let summarySource = '';

  todayMeals.forEach((meal) => {
    const insight = getMealInsight(meal);
    if (!insight) return;
    mealsWithInsight += 1;
    if (!summarySource && insight.summary) summarySource = insight.summary;
    ['vitamins', 'minerals'].forEach((group) => {
      (insight[group] || []).forEach((item) => {
        const key = String(item.name || '').trim().toLowerCase();
        if (!key) return;
        if (!nutrientBuckets[group].has(key)) {
          nutrientBuckets[group].set(key, {
            name: item.name,
            amount: item.amount,
            benefit: item.benefit,
            count: 0
          });
        }
        nutrientBuckets[group].get(key).count += 1;
      });
    });
  });

  const sortItems = (map) => Array.from(map.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 4);

  if (!mealsWithInsight) {
    return {
      summary: 'Scan a meal photo to unlock today’s vitamin and mineral estimate on the dashboard.',
      vitamins: [],
      minerals: []
    };
  }

  return {
    summary: mealsWithInsight === 1
      ? (summarySource || 'Today’s scan suggests a useful mix of vitamins and minerals.')
      : `Combined from ${mealsWithInsight} scanned meals today. Vitamins and minerals below are the strongest repeated estimates.`,
    vitamins: sortItems(nutrientBuckets.vitamins),
    minerals: sortItems(nutrientBuckets.minerals)
  };
}

function renderDashboardNutrientItems(items, emptyMessage) {
  if (!items.length) return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  return items.map((item) => `
    <article class="dashboard-nutrient-item">
      <strong>${escapeHtml(item.name)}${item.amount ? ` · ${escapeHtml(item.amount)}` : ''}</strong>
      ${item.benefit ? `<small>${escapeHtml(item.benefit)}</small>` : ''}
    </article>
  `).join('');
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
    const ratedMeals = matched
      .filter((meal) => meal.food_name)
      .map((meal) => ({ name: meal.food_name, score: getMealNutritionScore(meal) }));
    const foodList = ratedMeals.length
      ? `${ratedMeals.slice(0, 3).map((meal) => `${meal.name} (${meal.score.toFixed(1)})`).join(', ')}${ratedMeals.length > 3 ? `, +${ratedMeals.length - 3} more` : ''}`
      : 'No matching food logged';
    const copy = ratedMeals.length ? `${foodList} — ${system.benefit}.` : `${foodList} yet.`;
    return [system.name, score, system.icon, copy, system.position, ratedMeals.slice(0, 3)];
  });
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

  const remainingSteps = Math.max(10000 - steps, 0);
  items.push(steps >= 10000
    ? { icon: '👟', title: 'Movement goal reached', copy: 'Great work—gentle recovery and hydration are a good finish.' }
    : { icon: '🚶', title: 'Take a short walk', copy: `${remainingSteps.toLocaleString()} steps remain; even 10 minutes after a meal can help.` });
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

function renderBioInputs() {
  const member = appState.currentMember;
  if (!member) return;
  const log = getTodayBioLog();
  const fill = (id, value) => {
    const input = document.getElementById(id);
    if (document.activeElement !== input) input.value = value ?? '';
  };
  fill('bioWeight', log.weight_kg ?? member.weight_kg ?? '');
  fill('bioSteps', log.steps ?? '');
  fill('bioSugar', log.sugar_level ?? '');
}

async function handleSaveBioStats() {
  const member = appState.currentMember;
  if (!member) return;

  const log = {
    weight_kg: numberOrNull(document.getElementById('bioWeight').value),
    steps: numberOrNull(document.getElementById('bioSteps').value),
    sugar_level: numberOrNull(document.getElementById('bioSugar').value)
  };

  if (!appState.bioLogs[member.id]) appState.bioLogs[member.id] = {};
  appState.bioLogs[member.id][todayKey()] = log;
  if (log.weight_kg !== null) member.weight_kg = log.weight_kg;
  saveStoredAppData();

  const button = document.getElementById('saveBioStats');
  button.textContent = 'Saved ✓';
  setTimeout(() => { button.textContent = 'Save Bio Stats'; }, 1800);
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
  document.getElementById(elementId).innerHTML =
    meals.map((meal) => mealTemplate(meal, true)).join('') || emptyState(emptyMessage);
}

let editingMealId = null;

function openMealModal(mealId, defaultDay) {
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
  const meal = editingMealId ? appState.meals.find((item) => item.id === editingMealId) : null;
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
    notes: notesWithMealType(document.getElementById('editNotes').value, mealType, meal?.notes)
  };
  const dateValue = document.getElementById('editDate').value;
  document.getElementById('mealModal').classList.add('hidden');

  if (editingMealId) {
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
  const meals = getMemberMeals();
  document.getElementById('timelineList').innerHTML = meals.map((meal) => `
    <article class="timeline-item">
      <span class="timeline-date">${formatDate(meal.eaten_at)}</span>
      <div>
        <h4>${escapeHtml(meal.food_name)}</h4>
        <p>${escapeHtml(mealDisplayMeta(meal))} · ${escapeHtml(meal.location_name || 'No location')}</p>
        <div class="meal-actions timeline-actions" aria-label="Actions for ${escapeAttr(meal.food_name)}">
          <button class="meal-edit-button" type="button" data-edit-meal="${escapeAttr(meal.id)}">✏️ Edit</button>
          <button class="meal-delete-button" type="button" data-delete-meal="${escapeAttr(meal.id)}">🗑 Delete</button>
        </div>
      </div>
      <strong>${Number(meal.calories || 0).toLocaleString()} cal</strong>
    </article>
  `).join('') || emptyState('Your food timeline will appear here.');
}

function getMealNutritionScore(meal) {
  const explicitScore = Number(meal?.nutrition_score ?? meal?.score ?? meal?.health_score);
  if (Number.isFinite(explicitScore)) {
    return clampScore(explicitScore <= 10 ? explicitScore * 10 : explicitScore) / 10;
  }

  const text = foodSearchText(meal);
  let score = 5.4;

  const bonuses = [
    ['salad', 1.3], ['vegetable', 1.1], ['broccoli', 1], ['spinach', 1], ['lettuce', 0.7],
    ['greens', 0.7], ['cucumber', 0.6], ['tomato', 0.5], ['asparagus', 0.8], ['fruit', 0.8],
    ['apple', 0.7], ['banana', 0.6], ['berry', 0.8], ['mango', 0.6], ['salmon', 1.2],
    ['fish', 1], ['shrimp', 0.8], ['chicken', 0.7], ['egg', 0.4], ['tofu', 0.9],
    ['bean', 0.8], ['lentil', 0.8], ['oat', 0.8], ['yogurt', 0.5], ['tea', 0.2], ['water', 0.3]
  ];
  const penalties = [
    ['fried', 1.2], ['soft serve', 1.6], ['ice cream', 1.5], ['cake', 1.4], ['cookie', 1.1],
    ['soda', 1.5], ['burger', 1.2], ['fries', 1.3], ['pizza', 0.9], ['sausage', 1.1],
    ['bacon', 1.1], ['pork belly', 1.4], ['sweetened', 0.9], ['syrup', 0.9], ['milk tea', 1.1],
    ['beef steak', 0.6], ['steak', 0.4], ['chocolate', 0.7]
  ];

  bonuses.forEach(([term, value]) => {
    if (text.includes(term)) score += value;
  });
  penalties.forEach(([term, value]) => {
    if (text.includes(term)) score -= value;
  });

  if ((text.includes('chicken') || text.includes('fish') || text.includes('salmon') || text.includes('tofu') || text.includes('egg'))
    && (text.includes('vegetable') || text.includes('salad') || text.includes('broccoli') || text.includes('lettuce') || text.includes('greens'))) {
    score += 0.8;
  }

  const calories = Number(meal?.calories);
  if (Number.isFinite(calories)) {
    if (calories >= 250 && calories <= 700) score += 0.5;
    else if (calories >= 80 && calories < 250) score += 0.2;
    else if (calories > 700 && calories <= 900) score -= 0.8;
    else if (calories > 900) score -= 1.5;
    else if (calories > 0 && calories < 40 && !text.includes('tea') && !text.includes('coffee') && !text.includes('water')) score -= 0.3;
  }

  const mealType = getMealType(meal);
  if (mealType === 'dessert') score -= 0.9;
  else if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') score += 0.2;

  return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
}

function mealScoreTone(score) {
  if (score >= 8) return 'great';
  if (score >= 6) return 'good';
  if (score >= 4) return 'ok';
  return 'low';
}

function mealScoreIcon(score) {
  if (score >= 8) return '🟢';
  if (score >= 6) return '🟡';
  if (score >= 4) return '🟠';
  return '🔴';
}

function mealTemplate(meal, withActions = false) {
  const score = getMealNutritionScore(meal);
  const scoreTone = mealScoreTone(score);
  const actions = withActions ? `
        <div class="meal-actions" aria-label="Actions for ${escapeAttr(meal.food_name)}">
          <button class="meal-edit-button" type="button" data-edit-meal="${escapeAttr(meal.id)}">✏️ Edit</button>
          <button class="meal-delete-button" type="button" data-delete-meal="${escapeAttr(meal.id)}">🗑 Delete</button>
        </div>` : '';
  const insightSnippet = mealInsightSnippet(meal);
  return `
    <article class="meal-card ${meal.photo_url ? 'has-photo' : ''}">
      <span class="meal-emoji">${mealEmoji(meal.food_name)}</span>
      ${meal.photo_url ? `<img class="meal-photo" src="${escapeAttr(meal.photo_url)}" alt="${escapeAttr(meal.food_name)}">` : ''}
      <div>
        <div class="meal-title-row">
          <h4>${escapeHtml(meal.food_name)}</h4>
          <span class="meal-score-badge meal-score-${scoreTone}" title="Estimated nutrition score ${score.toFixed(1)} out of 10">${mealScoreIcon(score)} ${score.toFixed(1)}</span>
        </div>
        <p>${escapeHtml(mealDisplayMeta(meal))}</p>
        ${insightSnippet ? `<small class="meal-insight-snippet">${escapeHtml(insightSnippet)}</small>` : ''}${actions}
      </div>
      <strong>${Number(meal.calories || 0).toLocaleString()} cal</strong>
    </article>
  `;
}

function mealDisplayMeta(meal) {
  const storedType = getMealType(meal);
  const label = storedType
    ? storedType.charAt(0).toUpperCase() + storedType.slice(1)
    : meal.restaurant_name || 'Family meal';
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(meal.eaten_at));
  return `${label} · ${time}`;
}

function getMealType(meal) {
  return extractMealTag(meal?.notes, 'meal_type').toLowerCase();
}

function notesWithoutMealType(notes) {
  return removeMealTag(removeMealTag(notes, 'meal_type'), 'ai_insight');
}

function notesWithMealType(notes, mealType, existingNotes = '') {
  const cleanNotes = notesWithoutMealType(notes);
  const normalizedMealType = String(mealType || '').trim().toLowerCase();
  const encodedInsight = currentScanInsight
    ? encodeMealInsight(currentScanInsight)
    : extractMealTag(existingNotes, 'ai_insight');
  let value = cleanNotes;
  if (normalizedMealType) value = `${value}${value ? ' ' : ''}[[meal_type:${normalizedMealType}]]`;
  if (encodedInsight) value = `${value}${value ? ' ' : ''}[[ai_insight:${encodedInsight}]]`;
  return value.trim();
}

function extractMealTag(notes, tag) {
  const escapedTag = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(notes || '').match(new RegExp(`\\[\\[${escapedTag}:([\\s\\S]*?)\\]\\]`, 'i'))?.[1] || '';
}

function removeMealTag(notes, tag) {
  const escapedTag = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(notes || '').replace(new RegExp(`\\s*\\[\\[${escapedTag}:[\\s\\S]*?\\]\\]\\s*`, 'ig'), ' ').trim();
}

function encodeMealInsight(insight) {
  try {
    return encodeURIComponent(JSON.stringify(insight));
  } catch (error) {
    console.warn('Could not encode meal insight metadata.', error);
    return '';
  }
}

function getMealInsight(meal) {
  const rawInsight = extractMealTag(meal?.notes, 'ai_insight');
  if (!rawInsight) return null;
  try {
    return JSON.parse(decodeURIComponent(rawInsight));
  } catch (error) {
    console.warn('Could not decode saved meal insight metadata.', error);
    return null;
  }
}
window.getMealInsight = getMealInsight;

function mealInsightSnippet(meal) {
  const insight = getMealInsight(meal);
  if (!insight) return '';
  const topNutrients = [
    ...(insight.vitamins || []).slice(0, 2).map((item) => `${item.name} ${item.amount}`),
    ...(insight.minerals || []).slice(0, 1).map((item) => `${item.name} ${item.amount}`)
  ].filter(Boolean);
  return topNutrients.length ? `Insight: ${topNutrients.join(' · ')}` : insight.summary || '';
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
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const inThisWeek = (meal) => new Date(meal.eaten_at || meal.created_at).getTime() >= weekAgo;
  const meals = getMemberMeals().filter(inThisWeek);
  const familyMeals = appState.meals.filter(inThisWeek);
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
  document.getElementById('weeklyRecommendation').textContent = buildWeeklySummary(meals, familyMeals, calories, spend, favoriteFood);
  renderWeeklyDateRange();
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

function buildWeeklySummary(meals, familyMeals, calories, spend, favoriteFood) {
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
  const familyCount = familyMeals.length - meals.length;
  if (familyCount > 0) parts.push(`The rest of the family logged ${familyCount} more meal${familyCount !== 1 ? 's' : ''}.`);
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
  if (!member) return;
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
  if (document.activeElement !== heightInput) heightInput.value = measurements.height_cm ?? member.height_cm ?? '';
  if (document.activeElement !== weightInput) weightInput.value = measurements.weight_kg ?? member.weight_kg ?? '';
  if (document.activeElement !== ageInput) ageInput.value = measurements.age ?? '';
  if (document.activeElement !== sexInput) sexInput.value = measurements.sex || (member.name.toLowerCase().includes('dad') || member.name.toLowerCase().includes('papa') ? 'male' : 'female');
  if (document.activeElement !== activityInput) activityInput.value = String(measurements.activity || 1.55);
  if (document.activeElement !== goalInput) goalInput.value = measurements.goal || 'maintain';
  document.getElementById('profileCalorieTarget').textContent = measurements.target_calories ? Number(measurements.target_calories).toLocaleString() : '—';
  document.getElementById('profileProteinTarget').textContent = measurements.protein_grams ? Number(measurements.protein_grams).toLocaleString() : '—';
  document.getElementById('profileWaterTarget').textContent = measurements.water_liters ? Number(measurements.water_liters).toFixed(1) : '—';
  renderProfileNutrientBreakdown(member.id);
  renderAvatarPicker(member);
}

function renderProfileNutrientBreakdown(memberId) {
  const summary = document.getElementById('profileNutrientSummary');
  const vitaminList = document.getElementById('profileVitaminList');
  const mineralList = document.getElementById('profileMineralList');
  if (!summary || !vitaminList || !mineralList) return;

  const meals = (appState.meals || [])
    .filter((meal) => !memberId || meal.member_id === memberId)
    .slice()
    .sort((a, b) => new Date(b.eaten_at || b.created_at || 0).getTime() - new Date(a.eaten_at || a.created_at || 0).getTime())
    .slice(0, 12);

  const nutrientMap = {
    vitamins: new Map(),
    minerals: new Map()
  };
  let insightMealCount = 0;

  meals.forEach((meal) => {
    const insight = getMealInsight(meal);
    if (!insight) return;
    insightMealCount += 1;
    ['vitamins', 'minerals'].forEach((group) => {
      (insight[group] || []).forEach((item) => {
        const key = String(item.name || '').trim().toLowerCase();
        if (!key) return;
        if (!nutrientMap[group].has(key)) {
          nutrientMap[group].set(key, {
            name: item.name,
            amount: item.amount || '',
            benefit: item.benefit || '',
            count: 0
          });
        }
        nutrientMap[group].get(key).count += 1;
      });
    });
  });

  const rankItems = (map) => Array.from(map.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 6);

  const vitamins = rankItems(nutrientMap.vitamins);
  const minerals = rankItems(nutrientMap.minerals);

  if (!insightMealCount) {
    summary.textContent = 'Scan and save meals to see real vitamins and minerals here.';
    vitaminList.innerHTML = '<p class="muted">No vitamin breakdown yet.</p>';
    mineralList.innerHTML = '<p class="muted">No mineral breakdown yet.</p>';
    return;
  }

  summary.textContent = insightMealCount === 1
    ? 'Based on your latest AI-scanned meal.'
    : `Based on ${insightMealCount} recent AI-scanned meals for this profile.`;
  vitaminList.innerHTML = renderProfileNutrientItems(vitamins, 'No vitamin breakdown yet.');
  mineralList.innerHTML = renderProfileNutrientItems(minerals, 'No mineral breakdown yet.');
}

function renderProfileNutrientItems(items, emptyMessage) {
  if (!items.length) return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  return items.map((item) => `
    <article class="profile-nutrient-item">
      <strong>${escapeHtml(item.name)}${item.amount ? ` · ${escapeHtml(item.amount)}` : ''}</strong>
      ${item.benefit ? `<small>${escapeHtml(item.benefit)}</small>` : ''}
    </article>
  `).join('');
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

async function handleSaveProfileName() {
  const member = appState.currentMember;
  const input = document.getElementById('profileNameInput');
  const newName = input.value.trim();
  if (!member || !newName || newName === member.name) return;

  member.name = newName;
  const matchingMember = appState.members.find((item) => item.id === member.id);
  if (matchingMember) matchingMember.name = newName;
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
    eaten_at: new Date().toISOString()
  };

  if (!meal.food_name) return;

  appState.meals.unshift(meal);
  saveStoredAppData();
  form.reset();
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
    appState.chatSubscription = window.familyBitesDb.subscribeChat((row) => {
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
  const photoUrl = document.getElementById('photoPreview').dataset.photoUrl || '';
  const previewPhoto = document.getElementById('previewPhoto');
  document.getElementById('previewFood').textContent = food || 'New family bite';
  document.getElementById('previewMeta').textContent = [
    mealType ? mealType.charAt(0).toUpperCase() + mealType.slice(1) : 'Meal type not selected',
    restaurant || 'Restaurant not set',
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
  currentScanInsight = null;
  renderScanInsight(null);
  updateMealPreview();

  try {
    const photoUrl = await resizeImageFile(file, 900, 0.82);
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.src = photoUrl;
    photoPreview.dataset.photoUrl = photoUrl;
    photoPreview.classList.remove('hidden');
    document.getElementById('photoIcon').classList.add('hidden');
    document.getElementById('photoTitle').textContent = 'Photo ready';
    document.getElementById('photoHint').textContent = 'AI is scanning the meal for calories and nutrients…';
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
  estimateStatus.textContent = 'Add a photo and AI will estimate the visible food, calories, and nutrient insight.';
  currentScanInsight = null;
  renderScanInsight(null);
}

async function applyAiCalorieEstimate() {
  const photoUrl = document.getElementById('photoPreview').dataset.photoUrl || '';
  const status = document.getElementById('calorieEstimate');
  const button = document.getElementById('aiEstimateCalories');
  if (!photoUrl) {
    status.textContent = 'Upload or take a food photo first.';
    status.classList.add('estimate-error');
    return;
  }

  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = 'Scanning…';
  status.classList.remove('estimate-success', 'estimate-error');
  status.textContent = 'AI is identifying the food and estimating calories, vitamins, and nutrients…';

  try {
    const response = await fetch('/.netlify/functions/estimate-calories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: photoUrl,
        food_name: document.getElementById('foodName').value.trim(),
        portion_size: 'regular'
      })
    });
    const estimate = await response.json();
    if (!response.ok) throw new Error(estimate.error || 'AI calorie scan failed.');

    // Ignore an older scan if the user selected another photo while it ran.
    if (document.getElementById('photoPreview').dataset.photoUrl !== photoUrl) return;

    const calories = Math.max(0, Math.round(Number(estimate.total_calories) || 0));
    document.getElementById('calories').value = String(calories);
    const foodInput = document.getElementById('foodName');
    if (estimate.foods?.length) {
      foodInput.value = estimate.foods.map((food) => food.name).filter(Boolean).join(', ');
    }
    currentScanInsight = normalizeScanInsight(estimate.insight);
    renderScanInsight(currentScanInsight);
    const foods = estimate.foods?.map((food) => `${food.name} ${food.calories} kcal`).join(' + ');
    status.textContent = `${foods || 'Meal'} · about ${calories.toLocaleString()} kcal (${estimate.confidence} confidence). Please confirm before saving.`;
    status.classList.add('estimate-success');
    document.getElementById('photoHint').textContent = 'AI Insight is ready.';
    updateMealPreview();
  } catch (error) {
    currentScanInsight = null;
    renderScanInsight(null);
    status.textContent = error.message || 'AI scan is unavailable. Enter calories manually and try again later.';
    status.classList.add('estimate-error');
    document.getElementById('photoHint').textContent = 'Photo ready. AI scan could not finish.';
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}

function normalizeScanInsight(insight) {
  if (!insight || typeof insight !== 'object') return null;
  return {
    summary: String(insight.summary || 'AI estimated vitamins and nutrients for this dish.'),
    highlights: Array.isArray(insight.highlights) ? insight.highlights.slice(0, 4).map((item) => String(item)) : [],
    macros: {
      protein_g: Math.max(0, Math.round(Number(insight.macros?.protein_g) || 0)),
      carbs_g: Math.max(0, Math.round(Number(insight.macros?.carbs_g) || 0)),
      fat_g: Math.max(0, Math.round(Number(insight.macros?.fat_g) || 0)),
      fiber_g: Math.max(0, Math.round(Number(insight.macros?.fiber_g) || 0)),
      sugar_g: Math.max(0, Math.round(Number(insight.macros?.sugar_g) || 0))
    },
    vitamins: Array.isArray(insight.vitamins) ? insight.vitamins.slice(0, 4).map(normalizeMicronutrient) : [],
    minerals: Array.isArray(insight.minerals) ? insight.minerals.slice(0, 4).map(normalizeMicronutrient) : []
  };
}

function normalizeMicronutrient(item) {
  return {
    name: String(item?.name || 'Nutrient'),
    amount: String(item?.amount || ''),
    benefit: String(item?.benefit || '')
  };
}

function renderScanInsight(insight) {
  const section = document.getElementById('mealInsightSection');
  if (!section) return;
  if (!insight) {
    section.classList.add('hidden');
    document.getElementById('mealInsightSummary').textContent = 'Scan a dish to see estimated vitamins, minerals, and nutrient highlights.';
    document.getElementById('mealInsightHighlightList').innerHTML = '';
    document.getElementById('mealVitaminList').innerHTML = '';
    document.getElementById('mealMineralList').innerHTML = '';
    document.getElementById('insightProtein').textContent = '0g';
    document.getElementById('insightCarbs').textContent = '0g';
    document.getElementById('insightFat').textContent = '0g';
    document.getElementById('insightFiber').textContent = '0g';
    return;
  }

  section.classList.remove('hidden');
  document.getElementById('mealInsightSummary').textContent = insight.summary;
  document.getElementById('insightProtein').textContent = `${insight.macros.protein_g}g`;
  document.getElementById('insightCarbs').textContent = `${insight.macros.carbs_g}g`;
  document.getElementById('insightFat').textContent = `${insight.macros.fat_g}g`;
  document.getElementById('insightFiber').textContent = `${insight.macros.fiber_g}g`;
  document.getElementById('mealInsightHighlightList').innerHTML = insight.highlights
    .map((item) => `<span class="insight-chip">${escapeHtml(item)}</span>`)
    .join('');
  document.getElementById('mealVitaminList').innerHTML = renderMicronutrientList(insight.vitamins, 'No vitamin estimate yet.');
  document.getElementById('mealMineralList').innerHTML = renderMicronutrientList(insight.minerals, 'No mineral estimate yet.');
}

function renderMicronutrientList(items, emptyMessage) {
  if (!items.length) return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  return items.map((item) => `
    <article class="scan-insight-item">
      <strong>${escapeHtml(item.name)}${item.amount ? ` · ${escapeHtml(item.amount)}` : ''}</strong>
      ${item.benefit ? `<small>${escapeHtml(item.benefit)}</small>` : ''}
    </article>
  `).join('');
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
    .filter((meal) => !meal.member_id || meal.member_id === member.id || meal.member_name === member.name)
    .sort((a, b) => new Date(b.eaten_at || b.created_at) - new Date(a.eaten_at || a.created_at));
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
  const storedMeals = getStoredJson(localMealsStorageKey, []).map(normalizeMeal);
  const storedChat = getStoredJson(localChatStorageKey, []).map(normalizeChat);
  const storedOrders = getStoredJson(chefOrdersStorageKey, []);
  const storedCart = getStoredJson(chefCartStorageKey, []);
  const storedVoiceNotes = getStoredJson(chefVoiceStorageKey, []);
  const storedBioLogs = getStoredJson(bioLogsStorageKey, {});
  const storedProfileMeasurements = getStoredJson(profileMeasurementsStorageKey, {});
  if (Object.keys(storedBioLogs).length) appState.bioLogs = storedBioLogs;
  if (Object.keys(storedProfileMeasurements).length) appState.profileMeasurements = storedProfileMeasurements;
  if (storedMeals.length) appState.meals = mergeRecords(storedMeals, appState.meals);
  if (storedChat.length) appState.chat = mergeRecords(storedChat, appState.chat);
  if (storedOrders.length) appState.chefOrders = storedOrders;
  if (storedCart.length) appState.cart = storedCart;
  if (storedVoiceNotes.length) appState.voiceNotes = storedVoiceNotes;
}

function saveStoredAppData() {
  setStoredJson(localMealsStorageKey, appState.meals);
  setStoredJson(localChatStorageKey, appState.chat);
  setStoredJson(chefOrdersStorageKey, appState.chefOrders);
  setStoredJson(chefCartStorageKey, appState.cart);
  setStoredJson(chefVoiceStorageKey, appState.voiceNotes);
  setStoredJson(bioLogsStorageKey, appState.bioLogs);
  setStoredJson(profileMeasurementsStorageKey, appState.profileMeasurements);
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
  if (!isAdminUser()) {
    alert('Only admins can add family members.');
    return;
  }
  document.getElementById('newMemberName').value = '';
  document.getElementById('newMemberRole').value = '';
  document.getElementById('addMemberModal').classList.remove('hidden');
  document.getElementById('newMemberName').focus();
}

function closeAddMemberModal() {
  document.getElementById('addMemberModal').classList.add('hidden');
}

async function handleConfirmAddMember() {
  if (!isAdminUser()) return;
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

  appState.members.push(newMember);

  closeAddMemberModal();
  renderProfiles();
  renderSettings();

  if (window.familyBitesDb?.isConfigured && appState.familyId) {
    try {
      const data = await window.familyBitesDb.createMember(newMember);
      if (data) newMember.id = data.id;
    } catch (error) {
      console.warn('Member saved locally but Supabase write failed.', error);
    }
  }
}

function removeMember(memberId) {
  if (!isAdminUser()) {
    alert('Only admins can remove family members.');
    return;
  }
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
  if (window.familyBitesDb?.isConfigured && appState.familyId) {
    window.familyBitesDb.deleteMember(memberId).catch((error) => {
      console.warn('Member removed locally but Supabase delete failed.', error);
    });
  }
}

function renderSettings() {
  const el = document.getElementById('settingsContent');
  if (!el) return;

  const realMembers = appState.members.filter((m) => m.id !== 'add');
  const canManageMembers = isAdminUser();
  const accountSection = window.familyBitesDb?.isConfigured ? `
    <div class="settings-section">
      <p class="eyebrow">Account</p>
      <h3>${escapeHtml(appState.familyName || 'Family access')}</h3>
      <div class="settings-member-row">
        <div class="mini-avatar">${escapeHtml(isAdminUser() ? '🛡️' : '👤')}</div>
        <div class="settings-member-info">
          <strong>${escapeHtml(appState.currentUserEmail || 'Signed-in account')}</strong>
          <small>${escapeHtml(isAdminUser() ? 'Admin access: can view all family members.' : 'Member access: only your assigned profile is visible.')}</small>
        </div>
        <button class="secondary-button" data-action="sign-out" type="button">Sign out</button>
      </div>
    </div>
  ` : '';
  el.innerHTML = `
    ${accountSection}
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
              : canManageMembers
                ? `<button class="small-danger-btn" data-remove-member="${escapeAttr(m.id)}">Remove</button>`
                : ''
            }
          </div>
        `).join('')}
      </div>
      ${canManageMembers
        ? '<button class="primary-button" data-action="add-member">+ Add Member</button>'
        : '<p class="muted">Only the family admin can add or remove members.</p>'}
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
  `;
}
