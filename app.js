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
  bioLogs: {}
};

const profilePhotoStorageKey = 'familyBites.profilePhotos';
const localMealsStorageKey = 'familyBites.meals.v2';
const localChatStorageKey = 'familyBites.chat.v2';
const chefOrdersStorageKey = 'familyBites.chefOrders';
const chefCartStorageKey = 'familyBites.chefCart';
const chefVoiceStorageKey = 'familyBites.chefVoiceNotes';
const bioLogsStorageKey = 'familyBites.bioLogs.v1';

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

const mobileItems = navItems.filter((item) => ['dashboard', 'order', 'snap', 'chef', 'chat'].includes(item.page));

document.addEventListener('DOMContentLoaded', () => {
  applyStoredAppData();
  applyStoredProfilePhotos();
  renderProfiles();
  renderNavigation();
  bindEvents();
  hydrateFromSupabase();
});

function bindEvents() {
  document.body.addEventListener('click', (event) => {
    const pageTarget = event.target.closest('[data-page]');
    const actionTarget = event.target.closest('[data-action]');

    if (pageTarget) {
      if (pageTarget.closest('#landing')) {
        selectMember(appState.currentMember || appState.members[0]);
      }
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
  document.getElementById('mealPhoto').addEventListener('change', handlePhotoChange);
  document.getElementById('profilePhotoInput').addEventListener('change', handleProfilePhotoChange);
  document.getElementById('voiceRecordButton').addEventListener('click', toggleVoiceRecording);
  document.getElementById('sendCartButton').addEventListener('click', sendCartToChef);
  document.getElementById('confirmAddMember').addEventListener('click', handleConfirmAddMember);
  document.getElementById('cancelAddMember').addEventListener('click', closeAddMemberModal);
  document.getElementById('saveProfileName').addEventListener('click', handleSaveProfileName);
  document.getElementById('saveBioStats').addEventListener('click', handleSaveBioStats);
  document.getElementById('saveMealEdit').addEventListener('click', handleSaveMealEdit);
  document.getElementById('cancelMealEdit').addEventListener('click', () => {
    document.getElementById('mealModal').classList.add('hidden');
  });
  document.getElementById('profileNameInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSaveProfileName();
  });

  ['foodName', 'restaurantName', 'calories'].forEach((id) => {
    document.getElementById(id).addEventListener('input', updateMealPreview);
  });
}

async function hydrateFromSupabase() {
  if (!window.familyBitesDb?.isConfigured) {
    selectMember(appState.members[0], { openDashboard: false });
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
      appState.members = [...members.map(normalizeMember), appState.members.find((member) => member.id === 'add')];
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
  } catch (error) {
    console.warn('Supabase unavailable, using local demo data.', error);
  }

  saveStoredAppData();

  renderProfiles();
  selectMember(appState.members[0], { openDashboard: false });
}

function renderProfiles() {
  const profileGrid = document.getElementById('profileGrid');
  profileGrid.innerHTML = appState.members.map((member) => `
    <button class="profile-card" type="button" data-member-id="${escapeAttr(member.id)}">
      <span class="avatar">${avatarMarkup(member)}</span>
      <strong>${escapeHtml(member.name)}</strong>
    </button>
  `).join('');

  profileGrid.querySelectorAll('[data-member-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const member = appState.members.find((item) => item.id === button.dataset.memberId);
      selectMember(member);
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
    selectMember(appState.currentMember || appState.members[0]);
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
    selectMember(appState.members[0]);
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
  const goal = Number(appState.currentMember?.target_calories) || 2200;
  const progress = Math.min(Math.round((calories / goal) * 100), 100);

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
  renderFoodList('yesterdayFoodList', yesterdayMeals, 'Nothing was logged yesterday.');
  renderFavoriteFoods(memberMeals);
  renderBioInputs();
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
  document.getElementById('editRestaurant').value = meal?.restaurant_name || '';
  document.getElementById('editLocation').value = meal?.location_name || '';
  document.getElementById('editPrice').value = meal?.price ?? '';
  document.getElementById('editCalories').value = meal?.calories ?? '';
  document.getElementById('editNotes').value = meal?.notes || '';
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
  const foodName = document.getElementById('editFoodName').value.trim();
  if (!foodName) {
    document.getElementById('editFoodName').focus();
    return;
  }

  const fields = {
    food_name: foodName,
    restaurant_name: document.getElementById('editRestaurant').value.trim(),
    location_name: document.getElementById('editLocation').value.trim(),
    price: numberOrNull(document.getElementById('editPrice').value),
    calories: numberOrNull(document.getElementById('editCalories').value),
    notes: document.getElementById('editNotes').value.trim()
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
  const meals = getMemberMeals();
  document.getElementById('timelineList').innerHTML = meals.map((meal) => `
    <article class="timeline-item">
      <span class="timeline-date">${formatDate(meal.eaten_at)}</span>
      <div>
        <h4>${escapeHtml(meal.food_name)}</h4>
        <p>${escapeHtml(meal.restaurant_name || 'Family meal')} · ${escapeHtml(meal.location_name || 'No location')}</p>
      </div>
      <strong>${Number(meal.calories || 0).toLocaleString()} cal</strong>
    </article>
  `).join('') || emptyState('Your food timeline will appear here.');
}

function mealTemplate(meal, withActions = false) {
  const actions = withActions ? `
        <div class="meal-actions">
          <button type="button" data-edit-meal="${escapeAttr(meal.id)}">✏️ Edit</button>
          <button type="button" data-delete-meal="${escapeAttr(meal.id)}">🗑 Delete</button>
        </div>` : '';
  return `
    <article class="meal-card ${meal.photo_url ? 'has-photo' : ''}">
      <span class="meal-emoji">${mealEmoji(meal.food_name)}</span>
      ${meal.photo_url ? `<img class="meal-photo" src="${escapeAttr(meal.photo_url)}" alt="${escapeAttr(meal.food_name)}">` : ''}
      <div>
        <h4>${escapeHtml(meal.food_name)}</h4>
        <p>${escapeHtml(meal.restaurant_name || 'Family meal')} · ${escapeHtml(meal.notes || 'Saved to FamilyBites')}</p>${actions}
      </div>
      <strong>${Number(meal.calories || 0).toLocaleString()} cal</strong>
    </article>
  `;
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
  document.getElementById('weeklyRecommendation').textContent = buildWeeklySummary(meals, familyMeals, calories, spend, favoriteFood);
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
  document.getElementById('profileAvatarLarge').innerHTML = avatarMarkup(member);
  document.getElementById('profileNameLarge').textContent = member.name;
  const nameInput = document.getElementById('profileNameInput');
  if (document.activeElement !== nameInput) nameInput.value = member.name;
  renderAvatarPicker(member);
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
    notes: formData.get('notes').trim(),
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
  const restaurant = document.getElementById('restaurantName').value.trim();
  const calories = document.getElementById('calories').value.trim();
  const photoUrl = document.getElementById('photoPreview').dataset.photoUrl || '';
  const previewPhoto = document.getElementById('previewPhoto');
  document.getElementById('previewFood').textContent = food || 'New family bite';
  document.getElementById('previewMeta').textContent = [
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

  try {
    const photoUrl = await resizeImageFile(file, 900, 0.82);
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.src = photoUrl;
    photoPreview.dataset.photoUrl = photoUrl;
    photoPreview.classList.remove('hidden');
    document.getElementById('photoIcon').classList.add('hidden');
    document.getElementById('photoTitle').textContent = 'Photo ready';
    document.getElementById('photoHint').textContent = 'Tap again to replace it.';
    updateMealPreview();
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
  document.getElementById('photoTitle').textContent = 'Tap to snap or upload food';
  document.getElementById('photoHint').textContent = 'Your photo will appear in the meal preview.';
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
  if (Object.keys(storedBioLogs).length) appState.bioLogs = storedBioLogs;
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
  `;
}
