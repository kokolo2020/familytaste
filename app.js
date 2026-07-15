const appState = {
  familyId: null,
  currentMember: null,
  currentPage: 'dashboard',
  auth: {
    status: 'loading',
    user: null,
    membership: null,
    pendingEmail: ''
  },
  members: getDefaultAppMembers(),
  meals: [],
  snapScans: [],
  favorites: getDefaultFavoriteRestaurants(),
  bioLogs: {},
  profileMeasurements: {},
  workoutHistory: {},
  savedWorkouts: {},
  workoutTab: 'explore',
  futureYou: {
    months: 6,
    path: 'steady',
    changes: [],
    intake: 100
  }
};

const profilePhotoStorageKey = 'familyBites.profilePhotos';
const localMealsStorageKey = 'familyBites.meals.v2';
const localSnapScansStorageKey = 'familyBites.snapScans.v1';
const localMembersStorageKey = 'familyBites.members.v1';
const bioLogsStorageKey = 'familyBites.bioLogs.v1';
const profileMeasurementsStorageKey = 'familyBites.profileMeasurements.v1';
const workoutHistoryStorageKey = 'familyBites.workoutHistory.v1';
const savedWorkoutsStorageKey = 'familyBites.savedWorkouts.v1';
const lastAuthUserStorageKey = 'familyBites.lastAuthUserId';
const pendingOtpEmailStorageKey = 'familyBites.pendingOtpEmail';
const legacyUiStateStorageKey = 'familyBites.uiState.v1';
const uiStateStorageKeyPrefix = 'familyBites.uiState.v2';
const sessionNoticeStorageKey = 'familyBites.sessionNotices';
const dailySummaryIntroStorageKey = 'familyBites.dailySummaryIntro';
const APP_VERSION = 'v1.15.1';
const APP_BUILD_DATE = '2026-07-15';
const seededDefaultMemberIds = new Set(['dad', 'rithyna', 'me']);
const seededDefaultMemberNames = new Set(['dad', 'rithyna', 'my profile']);
const snapTagCatalog = [
  'fried',
  'grilled',
  'steamed',
  'baked',
  'roasted',
  'stir-fried',
  'sweet drink',
  'dessert',
  'high protein',
  'high fiber',
  'processed',
  'creamy',
  'saucy',
  'plant-based likely',
  'contains dairy',
  'contains meat'
];

const micronutrientSignals = [
  {
    key: 'fiber',
    label: 'Fiber',
    badge: 'Fiber support',
    kind: 'support',
    words: ['vegetable', 'greens', 'salad', 'cabbage', 'broccoli', 'spinach', 'bean', 'oat', 'fruit', 'berry', 'apple', 'orange', 'pineapple', 'whole grain']
  },
  {
    key: 'calcium',
    label: 'Calcium',
    badge: 'Calcium support',
    kind: 'support',
    words: ['milk', 'latte', 'yogurt', 'cheese', 'tofu', 'salmon', 'sardine', 'leafy', 'greens', 'cabbage', 'almond']
  },
  {
    key: 'iron',
    label: 'Iron',
    badge: 'Iron support',
    kind: 'support',
    words: ['beef', 'pork', 'chicken', 'egg', 'spinach', 'greens', 'bean', 'lentil', 'tofu', 'fish', 'salmon']
  },
  {
    key: 'potassium',
    label: 'Potassium',
    badge: 'Potassium support',
    kind: 'support',
    words: ['banana', 'avocado', 'potato', 'sweet potato', 'bean', 'spinach', 'greens', 'yogurt', 'salmon', 'orange', 'coconut']
  },
  {
    key: 'vitamin-c',
    label: 'Vitamin C',
    badge: 'Vitamin C support',
    kind: 'support',
    words: ['orange', 'berry', 'pineapple', 'mango', 'tomato', 'broccoli', 'cabbage', 'greens', 'fruit', 'kiwi', 'lemon']
  },
  {
    key: 'vitamin-a',
    label: 'Vitamin A',
    badge: 'Vitamin A support',
    kind: 'support',
    words: ['carrot', 'pumpkin', 'mango', 'egg', 'spinach', 'leafy', 'greens', 'sweet potato', 'tomato']
  },
  {
    key: 'omega-3',
    label: 'Omega-3',
    badge: 'Omega-3 support',
    kind: 'support',
    words: ['salmon', 'sardine', 'tuna', 'fish', 'walnut', 'chia', 'flax']
  },
  {
    key: 'sodium',
    label: 'Sodium',
    badge: 'Sodium watch',
    kind: 'caution',
    words: ['ramen', 'soy', 'sauce', 'chips', 'bacon', 'sausage', 'ham', 'soup', 'burger', 'fries', 'processed', 'fish ball', 'fish balls']
  }
];

const bodyFoodSuggestionCatalog = {
  brain: [
    { name: 'Eggs with berries', why: 'Eggs and berries are commonly associated with choline and antioxidant food signals.' },
    { name: 'Salmon with leafy greens', why: 'A practical mix of omega-3-rich fish and colorful vegetables.' },
    { name: 'Oatmeal with walnuts and blueberries', why: 'Whole grains, walnuts, and berries add a varied plant-food signal.' }
  ],
  heart: [
    { name: 'Oatmeal with berries', why: 'Oats and berries are commonly associated with fiber-rich eating patterns.' },
    { name: 'Bean and avocado salad', why: 'Beans add fiber while avocado contributes unsaturated fats.' },
    { name: 'Salmon with leafy greens', why: 'Fish and greens provide a simple heart-friendly food pattern.' }
  ],
  muscles: [
    { name: 'Chicken and lentil bowl', why: 'Chicken and lentils provide familiar protein-building foods.' },
    { name: 'Tofu vegetable stir-fry', why: 'Tofu offers plant protein alongside colorful vegetables.' },
    { name: 'Greek yogurt with nuts', why: 'A quick protein-oriented option with texture and variety.' }
  ],
  digestion: [
    { name: 'Oatmeal with banana and chia', why: 'Oats, fruit, and seeds add several familiar fiber sources.' },
    { name: 'Bean and vegetable soup', why: 'Beans and vegetables create a simple fiber-rich combination.' },
    { name: 'Brown rice vegetable bowl', why: 'Whole grains and vegetables broaden today’s plant-food variety.' }
  ],
  energy: [
    { name: 'Banana oatmeal yogurt bowl', why: 'Fruit, oats, and yogurt combine carbohydrates with protein.' },
    { name: 'Egg and whole-grain toast', why: 'A simple mix of protein and carbohydrate foods.' },
    { name: 'Rice bowl with tofu and vegetables', why: 'A balanced plate pattern that includes energy and protein foods.' }
  ],
  bones: [
    { name: 'Yogurt with fruit and almonds', why: 'Yogurt and almonds are familiar calcium-associated foods.' },
    { name: 'Tofu and broccoli stir-fry', why: 'Tofu and green vegetables add plant-based calcium signals.' },
    { name: 'Sardines on whole-grain toast', why: 'Sardines are commonly associated with calcium and vitamin D foods.' }
  ],
  liver: [
    { name: 'Broccoli tofu bowl', why: 'Broccoli and tofu create a simple vegetable-forward meal.' },
    { name: 'Salmon with cabbage salad', why: 'Fish and cruciferous vegetables add varied whole-food signals.' },
    { name: 'Walnut berry oatmeal', why: 'Walnuts, berries, and oats broaden plant-food variety.' }
  ],
  eyes: [
    { name: 'Carrot spinach egg bowl', why: 'Carrots, spinach, and eggs are commonly linked with eye-supporting nutrients.' },
    { name: 'Salmon mango salad', why: 'Fish and orange-colored fruit add varied nutrient signals.' },
    { name: 'Pumpkin tofu curry', why: 'Pumpkin and tofu provide a colorful plant-forward option.' }
  ],
  joints: [
    { name: 'Salmon ginger rice bowl', why: 'Fish and ginger are commonly included in joint-friendly eating patterns.' },
    { name: 'Berry yogurt with walnuts', why: 'Berries and walnuts add colorful plant and fat signals.' },
    { name: 'Tuna olive salad', why: 'Fish, olives, and vegetables create a simple whole-food combination.' }
  ],
  skin: [
    { name: 'Avocado tomato salad', why: 'Avocado and tomato provide colorful fats and plant-food signals.' },
    { name: 'Berry yogurt bowl', why: 'Berries and yogurt add fruit, protein, and variety.' },
    { name: 'Salmon with mango salsa', why: 'Fish and colorful fruit create a varied plate.' }
  ],
  immunity: [
    { name: 'Orange berry yogurt bowl', why: 'Fruit and yogurt add vitamin-C-associated and fermented foods.' },
    { name: 'Garlic vegetable soup', why: 'A vegetable-forward soup can broaden today’s plant variety.' },
    { name: 'Ginger tofu greens', why: 'Ginger, tofu, and greens provide a simple varied combination.' }
  ],
  recovery: [
    { name: 'Chicken rice vegetable bowl', why: 'Protein, carbohydrate, and vegetables make a familiar recovery-oriented plate.' },
    { name: 'Salmon sweet potato plate', why: 'Fish and sweet potato pair protein with carbohydrate foods.' },
    { name: 'Tofu quinoa greens', why: 'A plant-based combination of protein foods and greens.' }
  ]
};

const avatarOptions = [
  { id: 'dad', label: 'Dad', url: 'assets/avatars/dad.jpg' },
  { id: 'rithyna', label: 'Rithyna', url: 'assets/avatars/mom.jpg' },
  { id: 'emily', label: 'Emily', url: 'assets/avatars/emily.jpg' },
  { id: 'james', label: 'James', url: 'assets/avatars/james.jpg' },
  { id: 'sophia', label: 'Sophia', url: 'assets/avatars/sophia.jpg' }
];
let dashboardHistoryRange = 'yesterday';
let snapScanDraft = createEmptySnapScanDraft();
let lastSnapEstimateSignature = '';
let latestSnapPhotoScanToken = 0;
let snapPhotoScanTimer = null;
let snapSaveInFlight = false;
let authSessionRecoveryPromise = null;
let activeSessionHydrationPromise = null;
let activeSessionHydrationUserId = '';
let profileOnboardingTimer = null;
let bodySuggestionOffsets = {};
let timelineFilters = {
  memberId: 'current',
  search: '',
  mealType: 'all',
  dateRange: 'all',
  health: 'all'
};

const navItems = [
  { page: 'dashboard', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5a1.5 1.5 0 0 1-1.5-1.5z"/></svg>', label: 'Home' },
  { page: 'timeline', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11A1.5 1.5 0 0 1 19 5v15.5H7.5A2.5 2.5 0 0 1 5 18V5a1.5 1.5 0 0 1 1.5-1.5Z"/><path d="M5 18a2.5 2.5 0 0 1 2.5-2.5H19M9 7.5h6M9 11h6"/></svg>', label: 'Diary' },
  { page: 'snap', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><rect x="7" y="8" width="10" height="8" rx="2"/><circle cx="12" cy="12" r="2.2"/></svg>', label: 'Scan' },
  { page: 'body', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="2.5"/><path d="M8.5 21v-6.5L7 12V8.5A2.5 2.5 0 0 1 9.5 6h5A2.5 2.5 0 0 1 17 8.5V12l-1.5 2.5V21M12 12v9"/></svg>', label: 'Body' },
  { page: 'settings', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>', label: 'More' }
];

const mobileItems = [...navItems];

const recipeCollections = [
  {
    id: 'fiber',
    title: 'High Fiber',
    subtitle: 'Support digestion and steady fullness',
    items: [
      { title: 'Berry Yogurt Power Bowl', calories: 320, badge: '10 min', image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80' },
      { title: 'Green Goddess Crunch Plate', calories: 385, badge: 'Fresh', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80' },
      { title: 'Apple Cinnamon Chia Oats', calories: 412, badge: 'Prep ahead', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=900&q=80' },
      { title: 'Hearty Lentil Chili', calories: 340, badge: 'Batch cook', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80' }
    ]
  },
  {
    id: 'protein',
    title: 'Protein Boost',
    subtitle: 'Easy meals to strengthen recovery and satiety',
    items: [
      { title: 'Chicken Veggie Rice Bowl', calories: 430, badge: 'Balanced', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80' },
      { title: 'Salmon Greens Plate', calories: 440, badge: 'Omega-3', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80' },
      { title: 'Tofu Sesame Stir Fry', calories: 360, badge: 'Plant protein', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80' },
      { title: 'Egg & Avocado Toast Duo', calories: 300, badge: 'Quick breakfast', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80' }
    ]
  },
  {
    id: 'light-dinner',
    title: 'Lighter Dinners',
    subtitle: 'Calmer evening meals with less heaviness',
    items: [
      { title: 'Chicken Soup With Greens', calories: 220, badge: 'Comfort', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80' },
      { title: 'Steamed Fish & Broccoli', calories: 295, badge: 'Gentle', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80' },
      { title: 'Turkey Lettuce Wraps', calories: 280, badge: 'Low carb', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=80' },
      { title: 'Tofu Miso Bowl', calories: 250, badge: 'Digestive', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80' }
    ]
  }
];

const workoutCollections = [
  {
    id: 'stretch-strengthen',
    title: 'Stretch & Strengthen',
    subtitle: 'Loosen stiff muscles while building everyday strength.',
    routines: [
      { id: 'core-reset', title: '6-Minute Core Reset', minutes: 6, type: 'Bodyweight', copy: 'Wake up the core with a short no-equipment routine.', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80' },
      { id: 'morning-mobility', title: '8-Minute Morning Mobility', minutes: 8, type: 'Stretch', copy: 'Open hips, back, and shoulders before the day starts.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    id: 'after-meal',
    title: 'After-Meal Movement',
    subtitle: 'Gentle routines that pair well with food logging.',
    routines: [
      { id: 'post-meal-walk', title: '10-Minute Post-Meal Walk', minutes: 10, type: 'Walking', copy: 'A simple walk to support digestion and steady energy.', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80' },
      { id: 'bloat-relief-flow', title: '5-Minute Bloat Relief Flow', minutes: 5, type: 'Mobility', copy: 'Breathing and twists to feel lighter after a heavy meal.', image: 'https://images.unsplash.com/photo-1518611012118-fb2f5c8d2f3d?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    id: 'anywhere',
    title: 'Anytime Routines',
    subtitle: 'Short routines you can do anywhere without equipment.',
    routines: [
      { id: 'energy-boost', title: '12-Minute Energy Boost', minutes: 12, type: 'All levels', copy: 'Easy movement to reset your energy without equipment.', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80' },
      { id: 'evening-stretch', title: '7-Minute Evening Stretch', minutes: 7, type: 'Recovery', copy: 'Wind down before bed or after dinner.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80' }
    ]
  }
];

const workoutTabs = [
  { id: 'explore', label: 'Explore', collectionId: 'stretch-strengthen' },
  { id: 'after-meal', label: 'After meals', collectionId: 'after-meal' },
  { id: 'anywhere', label: 'Anywhere', collectionId: 'anywhere' }
];

document.addEventListener('DOMContentLoaded', () => {
  renderProfiles();
  renderNavigation();
  bindEvents();
  setMealFormDateTimeDefaults();
  renderAuthState();
  bootstrapAuth();
});

function bindEvents() {
  document.body.addEventListener('click', (event) => {
    const pageTarget = event.target.closest('[data-page]');
    const actionTarget = event.target.closest('[data-action]');
    const workoutTabTarget = event.target.closest('[data-workout-tab]');
    const startWorkoutTarget = event.target.closest('[data-start-workout]');
    const completeWorkoutTarget = event.target.closest('[data-complete-workout]');
    const saveWorkoutTarget = event.target.closest('[data-toggle-save-workout]');
    const futureHorizonTarget = event.target.closest('[data-future-months]');
    const futurePathTarget = event.target.closest('[data-future-path]');
    const futureChangeTarget = event.target.closest('[data-future-change]');
    const futureIntakeTarget = event.target.closest('[data-future-intake]');
    const profileTitleTarget = event.target.closest('[data-profile-title]');
    const featuredAchievementTarget = event.target.closest('[data-feature-achievement]');
    const bodySuggestionAddTarget = event.target.closest('[data-body-suggestion-add]');
    const bodySuggestionRotateTarget = event.target.closest('[data-body-suggestion-rotate]');

    if (pageTarget) {
      showPage(pageTarget.dataset.page);
    }

    if (actionTarget) {
      handleAction(actionTarget.dataset.action);
    }

    if (workoutTabTarget) {
      appState.workoutTab = workoutTabTarget.dataset.workoutTab;
      renderWorkouts();
    }

    if (startWorkoutTarget) {
      handleStartWorkout(startWorkoutTarget.dataset.startWorkout);
    }

    if (completeWorkoutTarget) {
      handleCompleteWorkout(completeWorkoutTarget.dataset.completeWorkout);
    }

    if (saveWorkoutTarget) {
      handleToggleSaveWorkout(saveWorkoutTarget.dataset.toggleSaveWorkout);
    }

    if (futureHorizonTarget) {
      appState.futureYou.months = Number(futureHorizonTarget.dataset.futureMonths) || 6;
      renderFutureYou();
    }

    if (futurePathTarget) {
      appState.futureYou.path = futurePathTarget.dataset.futurePath;
      renderFutureYou();
    }

    if (futureChangeTarget) {
      toggleFutureChange(futureChangeTarget.dataset.futureChange);
    }

    if (futureIntakeTarget) {
      appState.futureYou.intake = Number(futureIntakeTarget.dataset.futureIntake) || 100;
      renderFutureYou();
    }

    if (profileTitleTarget) {
      handleSelectFoodTitle(profileTitleTarget.dataset.profileTitle);
    }

    if (featuredAchievementTarget) {
      handleToggleFeaturedAchievement(featuredAchievementTarget.dataset.featureAchievement);
    }

    if (bodySuggestionAddTarget) {
      handleAddBodyFoodSuggestion(bodySuggestionAddTarget.dataset.bodySuggestionAdd);
    }

    if (bodySuggestionRotateTarget) {
      rotateBodyFoodSuggestion(bodySuggestionRotateTarget.dataset.bodySuggestionRotate);
    }

    const avatarTarget = event.target.closest('[data-avatar-url]');
    if (avatarTarget) {
      chooseProfileAvatar(avatarTarget.dataset.avatarUrl);
    }

    const logRestaurantTarget = event.target.closest('[data-log-restaurant]');
    if (logRestaurantTarget) {
      logRestaurantVisit(logRestaurantTarget.dataset.logRestaurant);
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

    const addScanTarget = event.target.closest('[data-add-scan-meal]');
    if (addScanTarget) {
      handleAddScanToDiary(addScanTarget.dataset.addScanMeal);
    }

    const deleteScanTarget = event.target.closest('[data-delete-scan]');
    if (deleteScanTarget) {
      handleDeleteSnapScan(deleteScanTarget.dataset.deleteScan);
    }

    const addMealTarget = event.target.closest('[data-add-meal]');
    if (addMealTarget) {
      if (addMealTarget.dataset.addMeal === 'yesterday') {
        openMealModal(null, 'yesterday');
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

    const removeIngredientTarget = event.target.closest('[data-remove-scan-ingredient]');
    if (removeIngredientTarget) {
      removeSnapIngredient(removeIngredientTarget.dataset.removeScanIngredient);
    }

    const toggleTagTarget = event.target.closest('[data-toggle-scan-tag]');
    if (toggleTagTarget) {
      toggleSnapTag(toggleTagTarget.dataset.toggleScanTag);
    }

    const usdaFoodTarget = event.target.closest('[data-usda-food-id]');
    if (usdaFoodTarget) {
      selectUsdaFood(Number(usdaFoodTarget.dataset.usdaFoodId));
    }
  });

  document.getElementById('mealForm').addEventListener('submit', saveSnapScan);
  document.getElementById('mealPhotoUpload').addEventListener('change', handlePhotoChange);
  document.getElementById('mealPhotoCamera').addEventListener('change', handlePhotoChange);
  document.getElementById('aiEstimateCalories').addEventListener('click', applyAiCalorieEstimate);
  document.getElementById('addScanIngredient').addEventListener('click', handleAddSnapIngredient);
  document.getElementById('searchUsdaFoods').addEventListener('click', searchUsdaFoods);
  document.getElementById('usdaFoodQuery').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchUsdaFoods();
    }
  });
  document.getElementById('usdaServingGrams').addEventListener('input', applyUsdaServing);
  document.getElementById('clearSnapForm').addEventListener('click', resetSnapWorkspace);
  document.getElementById('editAiEstimateCalories').addEventListener('click', applyEditAiCalorieEstimate);
  document.getElementById('profilePhotoInput').addEventListener('change', handleProfilePhotoChange);
  document.getElementById('dailyShareHideNames')?.addEventListener('change', renderDailyShareCard);
  document.getElementById('confirmAddMember').addEventListener('click', handleConfirmAddMember);
  document.getElementById('cancelAddMember').addEventListener('click', closeAddMemberModal);
  document.getElementById('saveProfileOnboarding')?.addEventListener('click', handleSaveProfileOnboarding);
  document.getElementById('saveProfileName').addEventListener('click', handleSaveProfileName);
  document.getElementById('saveProfileMeasurements').addEventListener('click', handleSaveProfileMeasurements);
  document.getElementById('saveBioStats')?.addEventListener('click', handleSaveBioStats);
  document.getElementById('saveMealEdit').addEventListener('click', handleSaveMealEdit);
  document.getElementById('authEmailForm')?.addEventListener('submit', handleAuthEmailSubmit);
  document.getElementById('authVerifyForm')?.addEventListener('submit', handleAuthVerifySubmit);
  document.getElementById('authFamilyForm')?.addEventListener('submit', handleCreateFamilySubmit);
  document.getElementById('authResendButton')?.addEventListener('click', handleAuthResendOtp);
  document.getElementById('authChangeEmailButton')?.addEventListener('click', handleAuthChangeEmail);
  document.getElementById('authSignOutButton')?.addEventListener('click', handleAuthSignOut);
  document.addEventListener('visibilitychange', handleAppResumeSessionCheck);
  window.addEventListener('pageshow', handleAppResumeSessionCheck);
  document.getElementById('cancelMealEdit').addEventListener('click', () => {
    clearAutoEditEstimate();
    document.getElementById('mealModal').classList.add('hidden');
  });
  document.getElementById('profileNameInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSaveProfileName();
  });

  ['foodName', 'calories', 'mealDate', 'mealTime'].forEach((id) => {
    document.getElementById(id).addEventListener('input', updateMealPreview);
  });
  ['foodName', 'notes', 'restaurantName'].forEach((id) => {
    document.getElementById(id).addEventListener('input', updateSnapEstimateStatus);
  });
  document.getElementById('notes').addEventListener('input', updateMealPreview);
  document.getElementById('mealType').addEventListener('change', updateMealPreview);
  ['timelineMemberFilter', 'timelineMealTypeFilter', 'timelineDateFilter', 'timelineHealthFilter'].forEach((id) => {
    document.getElementById(id).addEventListener('change', handleTimelineFilterChange);
  });
  document.getElementById('timelineSearchFilter').addEventListener('input', handleTimelineFilterChange);
  document.getElementById('scanIngredientInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddSnapIngredient();
    }
  });
  ['editFoodName', 'editRestaurant', 'editNotes'].forEach((id) => {
    document.getElementById(id).addEventListener('input', scheduleAutoEditAiCalorieEstimate);
  });
  ['editMealType'].forEach((id) => {
    document.getElementById(id).addEventListener('change', scheduleAutoEditAiCalorieEstimate);
  });
}

function looksLikeUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || '').trim());
}

function getDefaultAppMembers() {
  return [
    { id: 'me', name: 'My Profile', avatar: '👤', role: 'Personal profile', photo: '' }
  ];
}

function getDefaultFavoriteRestaurants() {
  return [];
}

function resetFamilyState() {
  appState.familyId = null;
  appState.currentMember = null;
  appState.members = getDefaultAppMembers();
  appState.meals = [];
  appState.snapScans = [];
  appState.favorites = getDefaultFavoriteRestaurants();
  appState.bioLogs = {};
  appState.profileMeasurements = {};
  appState.workoutHistory = {};
  appState.savedWorkouts = {};
}

function clearLocalFamilyCache() {
  [
    'familyBites.chat.v2',
    localMealsStorageKey,
    localSnapScansStorageKey,
    localMembersStorageKey,
    'familyBites.chefOrders',
    'familyBites.chefCart',
    'familyBites.chefVoiceNotes',
    bioLogsStorageKey,
    profileMeasurementsStorageKey,
    workoutHistoryStorageKey,
    savedWorkoutsStorageKey,
    profilePhotoStorageKey,
    legacyUiStateStorageKey
  ].forEach((key) => localStorage.removeItem(key));
}

function getUiStateStorageKey() {
  const userId = String(appState.auth.user?.id || '').trim();
  return userId ? `${uiStateStorageKeyPrefix}.${userId}` : '';
}

function saveUiState() {
  try {
    const storageKey = getUiStateStorageKey();
    if (!storageKey) return;
    const workspaceVisible = !document.getElementById('workspace')?.classList.contains('hidden');
    localStorage.setItem(storageKey, JSON.stringify({
      memberId: appState.currentMember?.id || '',
      page: appState.currentPage || 'dashboard',
      workspaceVisible
    }));
  } catch (error) {
    console.warn('Could not save UI state.', error);
  }
}

function readUiState() {
  try {
    const storageKey = getUiStateStorageKey();
    if (!storageKey) return null;
    const scopedState = localStorage.getItem(storageKey);
    const legacyState = localStorage.getItem(legacyUiStateStorageKey);
    const raw = scopedState || legacyState;
    if (!raw) return null;
    if (!scopedState && legacyState) {
      localStorage.setItem(storageKey, legacyState);
      localStorage.removeItem(legacyUiStateStorageKey);
    }
    const parsed = JSON.parse(raw);
    return {
      memberId: String(parsed?.memberId || '').trim(),
      page: String(parsed?.page || 'dashboard').trim() || 'dashboard',
      workspaceVisible: Boolean(parsed?.workspaceVisible)
    };
  } catch (error) {
    console.warn('Could not read UI state.', error);
    return null;
  }
}

function restoreUiStateAfterAuth() {
  const savedState = readUiState();
  const landing = document.getElementById('landing');
  const workspace = document.getElementById('workspace');
  const savedMember = savedState?.memberId
    ? appState.members.find((member) => member.id === savedState.memberId && member.id !== 'add' && member.name !== 'Add Member' && member.name !== 'Add Profile')
    : null;
  const restoreMember = savedMember || getDefaultMember();

  if (!restoreMember) {
    appState.currentMember = null;
    workspace?.classList.add('hidden');
    landing?.classList.add('hidden');
    return false;
  }

  appState.currentMember = restoreMember;
  updateProfileUi();
  landing?.classList.add('hidden');
  workspace?.classList.remove('hidden');
  showPage(savedState?.page || 'dashboard');
  return true;
}

function syncBrowserUserScope(userId) {
  const storedUserId = localStorage.getItem(lastAuthUserStorageKey) || '';
  if (storedUserId && storedUserId !== userId) {
    clearLocalFamilyCache();
  }
  if (userId) localStorage.setItem(lastAuthUserStorageKey, userId);
}

function setAuthFeedback(message = '', tone = '') {
  const feedback = document.getElementById('authFeedback');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.className = `auth-feedback${tone ? ` ${tone}` : ''}`;
}

function renderAuthState() {
  const authGate = document.getElementById('authGate');
  const landing = document.getElementById('landing');
  const workspace = document.getElementById('workspace');
  const emailForm = document.getElementById('authEmailForm');
  const verifyForm = document.getElementById('authVerifyForm');
  const familyForm = document.getElementById('authFamilyForm');
  const title = document.getElementById('authTitle');
  const subtitle = document.getElementById('authSubtitle');
  const pendingEmail = document.getElementById('authPendingEmail');
  if (!authGate || !landing || !workspace || !emailForm || !verifyForm || !familyForm || !title || !subtitle) return;

  const state = appState.auth.status;
  const isReady = state === 'ready';
  authGate.classList.toggle('is-loading', state === 'loading');
  authGate.classList.toggle('hidden', isReady);
  document.getElementById('mobileNav')?.classList.toggle('hidden', !isReady);
  if (isReady) {
    if (!appState.currentMember) {
      const defaultMember = getDefaultMember();
      if (defaultMember) {
        appState.currentMember = defaultMember;
        updateProfileUi();
        landing.classList.add('hidden');
        workspace.classList.remove('hidden');
        showPage(appState.currentPage || 'dashboard');
      } else {
        workspace.classList.add('hidden');
        landing.classList.add('hidden');
      }
    }
    return;
  }

  landing.classList.add('hidden');
  workspace.classList.add('hidden');
  emailForm.classList.toggle('hidden', state !== 'signed_out');
  verifyForm.classList.toggle('hidden', state !== 'otp_sent');
  familyForm.classList.toggle('hidden', state !== 'needs_family');
  if (pendingEmail) pendingEmail.textContent = appState.auth.pendingEmail || '';

  if (state === 'loading') {
    title.textContent = 'Preparing your meal map';
    subtitle.textContent = 'Bringing your food story into focus.';
  } else if (state === 'signed_out') {
    title.textContent = 'Sign in with email';
    subtitle.textContent = 'Enter any email and we will send a one-time code.';
  } else if (state === 'otp_sent') {
    title.textContent = 'Check your email';
    subtitle.textContent = 'Enter the code from your email. If your email app opens the sign-in link here, that also works.';
  } else if (state === 'needs_family') {
    title.textContent = 'Create your meal map';
    subtitle.textContent = 'This email is signed in. Create your private meal space to continue.';
    const familyNameInput = document.getElementById('authFamilyNameInput');
    if (familyNameInput && !familyNameInput.value.trim()) {
      familyNameInput.value = buildSuggestedMealMapName(appState.auth.user?.email || appState.auth.pendingEmail || '');
    }
  }
}

function buildSuggestedMealMapName(email = '') {
  const localPart = String(email || '').split('@')[0] || '';
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'MyMealMap';
  const name = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
  return `${name}'s Meal Map`;
}

function formatAuthError(error) {
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('family_memberships')) {
    return 'Database setup is incomplete. Run the auth SQL migration first.';
  }
  if (message.includes('email rate limit exceeded')) {
    return 'Too many login emails were sent. Please wait and try again later.';
  }
  if (message.includes('security purposes')) {
    return 'Please wait about a minute before requesting another sign-in email.';
  }
  if (message.includes('invalid login credentials') || message.includes('token has expired') || message.includes('otp expired') || message.includes('token is invalid')) {
    return 'That code or sign-in link is invalid or expired. Request a new email and try again.';
  }
  if (message.includes('signup is disabled')) {
    return 'Email sign-in is not enabled in Supabase yet.';
  }
  return String(error?.message || 'Sign-in is unavailable right now. Please try again.');
}

async function getFunctionRequestHeaders(headers = {}) {
  if (activeSessionHydrationPromise) {
    await activeSessionHydrationPromise;
  }

  if (appState.auth.status !== 'ready') {
    const session = await window.familyBitesDb?.getSession?.();
    if (session) await handleActiveSession(session, { force: true });
  }

  const authHeaders = await window.familyBitesDb?.getAuthHeaders?.();
  if (!authHeaders?.Authorization) throw new Error('Your session expired. Sign in again to continue.');
  return { ...headers, ...authHeaders };
}

function readPendingOtpEmail() {
  return String(
    sessionStorage.getItem(pendingOtpEmailStorageKey)
    || localStorage.getItem(pendingOtpEmailStorageKey)
    || window.history.state?.pendingOtpEmail
    || ''
  ).trim().toLowerCase();
}

function savePendingOtpEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return;
  sessionStorage.setItem(pendingOtpEmailStorageKey, normalizedEmail);
  localStorage.setItem(pendingOtpEmailStorageKey, normalizedEmail);
  window.history.replaceState(
    { ...(window.history.state || {}), pendingOtpEmail: normalizedEmail },
    '',
    `${window.location.pathname}${window.location.search}#verify-code`
  );
}

function clearPendingOtpEmail() {
  sessionStorage.removeItem(pendingOtpEmailStorageKey);
  localStorage.removeItem(pendingOtpEmailStorageKey);
  const nextState = { ...(window.history.state || {}) };
  delete nextState.pendingOtpEmail;
  const nextUrl = window.location.hash === '#verify-code'
    ? `${window.location.pathname}${window.location.search}`
    : window.location.href;
  window.history.replaceState(nextState, '', nextUrl);
}

async function bootstrapAuth() {
  if (!window.familyBitesDb?.isConfigured) {
    appState.auth.status = 'signed_out';
    setAuthFeedback('Supabase auth is not configured for this build.', 'error');
    renderAuthState();
    return;
  }

  const storedPendingEmail = readPendingOtpEmail();
  if (storedPendingEmail) {
    appState.auth.pendingEmail = storedPendingEmail;
    appState.auth.status = 'otp_sent';
    renderAuthState();
  }

  window.familyBitesDb.onAuthStateChange((session) => {
    if (session) {
      handleActiveSession(session).catch((error) => {
        console.warn('Auth state change failed.', error);
        appState.auth.status = 'signed_out';
        renderAuthState();
        setAuthFeedback(formatAuthError(error), 'error');
      });
    } else {
      confirmSignedOutState().catch((error) => {
        console.warn('Sign-out confirmation failed.', error);
        handleSignedOutState();
      });
    }
  });

  try {
    const session = await window.familyBitesDb.getSession();
    if (session) {
      await handleActiveSession(session, { force: true });
    } else {
      handleSignedOutState();
    }
  } catch (error) {
    console.warn('Auth bootstrap failed.', error);
    appState.auth.status = 'signed_out';
    setAuthFeedback(formatAuthError(error), 'error');
    renderAuthState();
  }
}

async function handleActiveSession(session, options = {}) {
  const nextUserId = session?.user?.id || '';
  const sameReadyUser = !options.force
    && appState.auth.status === 'ready'
    && appState.auth.user?.id === nextUserId
    && appState.auth.membership;

  if (sameReadyUser) {
    appState.auth.user = session.user;
    setAuthFeedback('');
    return;
  }

  if (activeSessionHydrationPromise && activeSessionHydrationUserId === nextUserId) {
    return activeSessionHydrationPromise;
  }
  if (activeSessionHydrationPromise) {
    await activeSessionHydrationPromise.catch(() => {});
  }

  activeSessionHydrationUserId = nextUserId;
  activeSessionHydrationPromise = handleAuthenticatedSession(session).finally(() => {
    if (activeSessionHydrationUserId === nextUserId) {
      activeSessionHydrationPromise = null;
      activeSessionHydrationUserId = '';
    }
  });
  return activeSessionHydrationPromise;
}

async function confirmSignedOutState() {
  if (authSessionRecoveryPromise) return authSessionRecoveryPromise;
  authSessionRecoveryPromise = (async () => {
    try {
      const session = await window.familyBitesDb.getSession();
      if (session) {
        await handleActiveSession(session, { force: true });
        return true;
      }
      handleSignedOutState();
      return false;
    } finally {
      authSessionRecoveryPromise = null;
    }
  })();
  return authSessionRecoveryPromise;
}

async function handleAppResumeSessionCheck() {
  if (document.visibilityState && document.visibilityState !== 'visible') return;
  if (!window.familyBitesDb?.isConfigured) return;
  if (appState.auth.status === 'ready') return;
  try {
    const session = await window.familyBitesDb.getSession();
    if (session) {
      await handleActiveSession(session, { force: true });
    }
  } catch (error) {
    console.warn('Resume session check failed.', error);
  }
}

async function handleAuthenticatedSession(session) {
  appState.auth.user = session.user;
  appState.auth.pendingEmail = '';
  appState.auth.status = 'loading';
  clearPendingOtpEmail();
  renderAuthState();
  setAuthFeedback('');
  syncBrowserUserScope(session.user?.id || '');
  resetFamilyState();
  applyStoredAppData();
  applyStoredProfilePhotos();

  const membership = await window.familyBitesDb.resolveFamilyMembership();
  if (!membership) {
    appState.auth.membership = null;
    appState.auth.status = 'needs_family';
    renderAuthState();
    return;
  }

  appState.auth.membership = membership;
  await hydrateFamilyData();
  appState.auth.status = 'ready';
  restoreUiStateAfterAuth();
  renderProfiles();
  renderAuthState();
  if (!showDailySummaryIntro()) queueProfileOnboardingCheck();
}

function handleSignedOutState() {
  const pendingEmail = readPendingOtpEmail();
  appState.auth = {
    status: pendingEmail ? 'otp_sent' : 'signed_out',
    user: null,
    membership: null,
    pendingEmail
  };
  resetFamilyState();
  saveUiState();
  renderProfiles();
  setAuthFeedback(pendingEmail ? `Enter the code sent to ${pendingEmail}.` : '', pendingEmail ? 'success' : '');
  renderAuthState();
}

async function hydrateFamilyData() {
  if (!window.familyBitesDb?.isConfigured) return;

  try {
    appState.familyId = window.familyBitesDb.familyId;
    const [membersResult, mealsResult, snapScansResult, favoritesResult] = await Promise.allSettled([
      window.familyBitesDb.getMembers(),
      window.familyBitesDb.getMeals(),
      window.familyBitesDb.getSnapScans(),
      window.familyBitesDb.getFavorites()
    ]);

    [membersResult, mealsResult, snapScansResult, favoritesResult].forEach((result) => {
      if (result.status === 'rejected') console.warn('One Supabase table failed to load.', result.reason);
    });

    if (membersResult.status === 'fulfilled') {
      const normalizedMembers = membersResult.value.map(normalizeMember);
      const pendingMembers = appState.members.filter((member) => member.id === 'add' || isPendingLocalRecord(member));
      appState.members = mergeMembers(normalizedMembers, pendingMembers);
      applyStoredProfilePhotos();
      mergeProfileMeasurementsFromMembers(normalizedMembers);
    }
    if (mealsResult.status === 'fulfilled') {
      appState.meals = mergeRemoteRecords(mealsResult.value.map(normalizeMeal), appState.meals);
    }
    if (snapScansResult.status === 'fulfilled') {
      appState.snapScans = mergeRemoteRecords(snapScansResult.value.map(normalizeSnapScan), appState.snapScans);
    }
    if (favoritesResult.status === 'fulfilled') appState.favorites = favoritesResult.value;

    await backfillLocalMembersToSupabase();
    await backfillLocalMealsToSupabase();
    await backfillLocalSnapScansToSupabase();

    try {
      const bioLogs = await window.familyBitesDb.getBioLogs(todayKey());
      bioLogs.forEach((log) => {
        if (!appState.bioLogs[log.member_id]) appState.bioLogs[log.member_id] = {};
        const existingLog = appState.bioLogs[log.member_id][log.log_date] || {};
        appState.bioLogs[log.member_id][log.log_date] = {
          ...existingLog,
          weight_kg: log.weight_kg,
          steps: log.steps,
          sugar_level: log.sugar_level
        };
      });
    } catch (bioError) {
      console.warn('Bio logs unavailable (table may not exist yet).', bioError);
    }

  } catch (error) {
    console.warn('Supabase unavailable for family hydrate.', error);
    throw error;
  }

  saveStoredAppData();
}

async function backfillLocalMembersToSupabase() {
  if (!window.familyBitesDb?.isConfigured || !appState.familyId) return;
  const pendingMembers = appState.members.filter((member) => member.id !== 'add' && isPendingLocalRecord(member));
  for (const pendingMember of pendingMembers) {
    try {
      const previousId = pendingMember.id;
      const savedMember = normalizeMember(await window.familyBitesDb.saveMember(pendingMember));
      appState.members = appState.members.map((member) => member.id === previousId ? savedMember : member);
      appState.meals.forEach((meal) => {
        if (meal.member_id === previousId) meal.member_id = savedMember.id;
      });
      appState.snapScans.forEach((scan) => {
        if (scan.member_id === previousId) scan.member_id = savedMember.id;
      });
      if (appState.profileMeasurements[previousId]) {
        appState.profileMeasurements[savedMember.id] = appState.profileMeasurements[previousId];
        delete appState.profileMeasurements[previousId];
      }
      ['bioLogs', 'workoutHistory', 'savedWorkouts'].forEach((stateKey) => {
        if (!appState[stateKey][previousId]) return;
        appState[stateKey][savedMember.id] = appState[stateKey][previousId];
        delete appState[stateKey][previousId];
      });
      if (appState.currentMember?.id === previousId) appState.currentMember = savedMember;
    } catch (error) {
      console.warn('Pending local profile backfill failed.', error);
    }
  }
}

async function backfillLocalMealsToSupabase() {
  if (!window.familyBitesDb?.isConfigured || !appState.familyId) return;
  const pendingMeals = appState.meals.filter(isPendingLocalRecord);
  for (const pendingMeal of pendingMeals) {
    try {
      let photoUrl = pendingMeal.photo_url || '';
      if (photoUrl.startsWith('data:')) {
        const uploadedUrl = await window.familyBitesDb.uploadMealPhoto(photoUrl);
        if (uploadedUrl) photoUrl = uploadedUrl;
      }
      const savedMeal = normalizeMeal(await window.familyBitesDb.saveMeal({ ...pendingMeal, photo_url: photoUrl }));
      appState.meals = appState.meals.map((meal) => meal.id === pendingMeal.id ? savedMeal : meal);
      appState.snapScans.forEach((scan) => {
        if (scan.linked_meal_id === pendingMeal.id) scan.linked_meal_id = savedMeal.id;
      });
    } catch (error) {
      console.warn('Pending local meal backfill failed.', error);
    }
  }
}

async function backfillLocalSnapScansToSupabase() {
  if (!window.familyBitesDb?.isConfigured || !appState.familyId) return;
  const pendingScans = appState.snapScans.filter(isPendingLocalRecord);
  if (!pendingScans.length) return;

  let changed = false;
  for (const pendingScan of pendingScans) {
    try {
      let photoUrl = pendingScan.photo_url || '';
      if (photoUrl.startsWith('data:')) {
        try {
          const uploadedUrl = await window.familyBitesDb.uploadScanPhoto(photoUrl);
          if (uploadedUrl) photoUrl = uploadedUrl;
        } catch (uploadError) {
          console.warn('Pending local scan photo upload failed.', uploadError);
        }
      }

      const savedScan = await window.familyBitesDb.saveSnapScan({
        ...pendingScan,
        family_id: appState.familyId,
        photo_url: photoUrl
      });

      appState.snapScans = appState.snapScans.map((item) =>
        item.id === pendingScan.id ? normalizeSnapScan(savedScan) : item
      );
      changed = true;
    } catch (error) {
      console.warn('Pending local scan backfill failed.', error);
    }
  }

  if (changed) {
    saveStoredAppData();
    renderAll();
  }
}

function renderProfiles() {
  const currentProfile = document.getElementById('landingCurrentProfile');
  const profileGrid = document.getElementById('profileGrid');
  const visibleMembers = getVisibleMembers();
  const realMembers = visibleMembers.filter((member) => member.id !== 'add' && member.name !== 'Add Member' && member.name !== 'Add Profile');
  const featuredMember = realMembers.find((member) => member.id === appState.currentMember?.id) || realMembers[0] || null;

  if (currentProfile) {
    const featuredTitle = featuredMember ? buildFoodAchievementProfile(featuredMember).activeTitle : null;
    currentProfile.innerHTML = featuredMember ? `
      <button class="selector-current-card" type="button" data-open-member-id="${escapeAttr(featuredMember.id)}">
        <span class="selector-current-avatar">${avatarMarkup(featuredMember)}</span>
        <span class="selector-current-copy">
          <small>Current profile</small>
          <strong>${escapeHtml(featuredMember.name)}</strong>
          <span>${featuredTitle?.icon || '🍽️'} ${escapeHtml(featuredTitle?.title || featuredMember.role || 'Profile')}</span>
        </span>
        <span class="selector-current-arrow" aria-hidden="true">↗</span>
      </button>
    ` : '';
  }

  profileGrid.innerHTML = visibleMembers.map((member) => `
    <button class="profile-card ${featuredMember?.id === member.id ? 'is-active' : ''}" type="button" data-member-id="${escapeAttr(member.id)}">
      <span class="avatar">${avatarMarkup(member)}</span>
      <strong>${escapeHtml(member.name)}</strong>
      ${member.id === 'add' ? '' : `<small>${escapeHtml(buildFoodAchievementProfile(member).activeTitle.title)}</small>`}
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
      if (member.id === 'add' || member.name === 'Add Member' || member.name === 'Add Profile') {
        selectMember(member);
        return;
      }
      if (featuredMember?.id === member.id) {
        selectMember(member);
        return;
      }
      appState.currentMember = member;
      updateProfileUi();
      saveUiState();
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
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
    </button>
  `;
}

function resolveNavPage(pageName) {
  if (['settings', 'weekly', 'favorites', 'profile', 'recipes', 'workouts', 'future'].includes(pageName)) return 'settings';
  return pageName;
}

function selectMember(member, options = { openDashboard: true }) {
  if (!member) return;

  if (member.id === 'add' || member.name === 'Add Member' || member.name === 'Add Profile') {
    openAddMemberModal();
    return;
  }

  appState.currentMember = member;
  updateProfileUi();
  saveUiState();

  if (options.openDashboard) {
    document.getElementById('landing').classList.add('hidden');
    document.getElementById('workspace').classList.remove('hidden');
    showPage('dashboard');
    queueProfileOnboardingCheck();
  } else {
    renderAll();
    renderAuthState();
  }
}

function handleAction(action) {
  if (action === 'close-daily-summary') {
    closeDailySummaryIntro();
    return;
  }

  if (action === 'open-daily-share') {
    openDailyShareModal();
    return;
  }

  if (action === 'close-daily-share') {
    closeDailyShareModal();
    return;
  }

  if (action === 'share-daily-card') {
    shareDailyCard();
    return;
  }

  if (action === 'save-daily-share') {
    saveDailyShareCard();
    return;
  }

  if (action === 'open-weekly-video') {
    openWeeklyVideoModal();
    return;
  }

  if (action === 'close-weekly-video') {
    closeWeeklyVideoModal();
    return;
  }

  if (action === 'save-weekly-video') {
    saveWeeklyReplayVideo();
    return;
  }

  if (action === 'share-weekly-video') {
    shareWeeklyReplayVideo();
    return;
  }

  if (action === 'open-food-map-report') {
    openFoodMapReportModal();
    return;
  }

  if (action === 'close-food-map-report') {
    closeFoodMapReportModal();
    return;
  }

  if (action === 'download-food-map-report') {
    downloadFoodMapReport();
    return;
  }

  if (action === 'share-food-map-report') {
    shareFoodMapReport();
    return;
  }

  if (action === 'home') {
    if (appState.auth.status !== 'ready') return;
    showPage('dashboard');
  }

  if (action === 'demo-dashboard') {
    selectMember(appState.currentMember || getDefaultMember());
  }

  if (action === 'demo-weekly') {
    openDemoPage('weekly');
  }

  if (action === 'add-member') {
    openAddMemberModal();
  }

  if (action === 'clear-all-data') {
    if (!confirm('Clear all meals and saved app data in this browser? This cannot be undone.')) return;
    clearLocalFamilyCache();
    appState.meals = [];
    appState.snapScans = [];
    renderAll();
  }

  if (action === 'sign-out') {
    handleAuthSignOut();
  }
}

function parseProfileName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ')
  };
}

function getProfileIdentity(member = appState.currentMember) {
  if (!member) return { firstName: '', lastName: '' };
  const measurements = appState.profileMeasurements[member.id] || {};
  const parsedName = parseProfileName(member.name);
  return {
    firstName: String(measurements.first_name || member.first_name || parsedName.firstName || '').trim(),
    lastName: String(measurements.last_name || member.last_name || parsedName.lastName || '').trim()
  };
}

function profileNeedsOnboarding(member = appState.currentMember) {
  if (!member || member.id === 'add') return false;
  const measurements = appState.profileMeasurements[member.id] || {};
  const identity = getProfileIdentity(member);
  const height = Number(measurements.height_cm ?? member.height_cm);
  const weight = Number(measurements.weight_kg ?? member.weight_kg);
  const age = Number(measurements.age);
  const sex = String(measurements.sex || '').trim().toLowerCase();
  const activity = Number(measurements.activity || 0);
  const goal = String(measurements.goal || '').trim();
  const healthFocus = String(measurements.health_focus || '').trim();
  return !(
    identity.firstName
    && identity.lastName
    && height >= 50
    && age >= 14
    && weight >= 10
    && (sex === 'male' || sex === 'female')
    && activity > 0
    && goal
    && healthFocus
  );
}

function setProfileOnboardingFeedback(message = '', tone = '') {
  const feedback = document.getElementById('profileOnboardingFeedback');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.className = `auth-feedback${tone ? ` ${tone}` : ''}`;
}

function openProfileOnboardingModal(member = appState.currentMember) {
  if (!member) return;
  const measurements = appState.profileMeasurements[member.id] || {};
  const identity = getProfileIdentity(member);
  document.getElementById('onboardingFirstName').value = identity.firstName;
  document.getElementById('onboardingLastName').value = identity.lastName;
  document.getElementById('onboardingHeight').value = measurements.height_cm ?? member.height_cm ?? '';
  document.getElementById('onboardingAge').value = measurements.age ?? '';
  document.getElementById('onboardingWeight').value = measurements.weight_kg ?? member.weight_kg ?? '';
  document.getElementById('onboardingSex').value = measurements.sex || 'female';
  document.getElementById('onboardingActivity').value = String(measurements.activity || 1.55);
  document.getElementById('onboardingGoal').value = measurements.goal || 'maintain';
  document.getElementById('onboardingHealthFocus').value = measurements.health_focus || 'balanced';
  document.getElementById('onboardingFoodAlerts').value = measurements.food_alerts || '';
  setProfileOnboardingFeedback('');
  document.getElementById('profileOnboardingModal')?.classList.remove('hidden');
  document.getElementById('onboardingFirstName')?.focus();
}

function closeProfileOnboardingModal() {
  document.getElementById('profileOnboardingModal')?.classList.add('hidden');
  setProfileOnboardingFeedback('');
}

function queueProfileOnboardingCheck() {
  if (profileOnboardingTimer) clearTimeout(profileOnboardingTimer);
  profileOnboardingTimer = setTimeout(() => {
    profileOnboardingTimer = null;
    if (appState.auth.status !== 'ready') return;
    if (!profileNeedsOnboarding()) return;
    openProfileOnboardingModal();
  }, 120);
}

function showDailySummaryIntro() {
  const overlay = document.getElementById('dailySummaryIntro');
  const userId = appState.auth.user?.id || 'local';
  const seenKey = `${dailySummaryIntroStorageKey}:${userId}:${todayKey()}`;
  const todayMeals = getMemberMeals().filter(isToday);
  if (!overlay || !todayMeals.length || localStorage.getItem(seenKey)) return false;

  const colors = ['#d96b2b', '#d9a632', '#6d9b60', '#347966', '#b95343', '#ad7187', '#637fae', '#8e6fa0'];
  const grouped = new Map();
  todayMeals.forEach((meal) => {
    const name = String(meal.food_name || 'Saved dish').trim() || 'Saved dish';
    const key = name.toLowerCase();
    const current = grouped.get(key) || { name, calories: 0 };
    current.calories += Number(meal.calories) || 0;
    grouped.set(key, current);
  });
  const dishes = Array.from(grouped.values()).sort((left, right) => right.calories - left.calories);
  const totalCalories = dishes.reduce((total, dish) => total + dish.calories, 0);
  const divisor = totalCalories || dishes.length || 1;
  let cursor = 0;
  const slices = dishes.map((dish, index) => {
    const weight = totalCalories ? dish.calories : 1;
    const start = cursor;
    cursor += weight / divisor * 100;
    dish.color = colors[index % colors.length];
    dish.percent = Math.round(weight / divisor * 100);
    return `${dish.color} ${start}% ${cursor}%`;
  });

  const pie = document.getElementById('dailyCaloriePie');
  if (pie) pie.style.background = `conic-gradient(${slices.join(', ')})`;
  setText('dailySummaryTotalCalories', totalCalories.toLocaleString());
  setText('dailySummaryMealCount', `${dishes.length} dish${dishes.length === 1 ? '' : 'es'}`);
  const todayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date());
  setText('dailySummaryIntroSubtitle', `${todayLabel} · ${dishes.length} dish${dishes.length === 1 ? '' : 'es'} logged`);
  const legend = document.getElementById('dailySummaryDishLegend');
  if (legend) {
    const visibleDishes = dishes.slice(0, 5);
    legend.innerHTML = visibleDishes.map((dish) => `
      <article>
        <i style="--dish-color:${dish.color}"></i>
        <span>
          <strong>${escapeHtml(dish.name)}</strong>
          <small>${dish.percent}% of today</small>
          <em><u style="--dish-color:${dish.color};--dish-percent:${dish.percent}%"></u></em>
        </span>
        <b>${dish.calories.toLocaleString()} cal</b>
      </article>
    `).join('') + (dishes.length > visibleDishes.length ? `<p>+${dishes.length - visibleDishes.length} more dish${dishes.length - visibleDishes.length === 1 ? '' : 'es'}</p>` : '');
  }

  const hideToday = document.getElementById('dailySummaryHideToday');
  if (hideToday) hideToday.checked = false;
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('is-visible'));
  return true;
}

function closeDailySummaryIntro() {
  const overlay = document.getElementById('dailySummaryIntro');
  if (!overlay || overlay.classList.contains('hidden')) return;
  const hideToday = document.getElementById('dailySummaryHideToday');
  if (hideToday?.checked) {
    const userId = appState.auth.user?.id || 'local';
    localStorage.setItem(`${dailySummaryIntroStorageKey}:${userId}:${todayKey()}`, '1');
  }
  overlay.classList.remove('is-visible');
  setTimeout(() => overlay.classList.add('hidden'), 280);
  queueProfileOnboardingCheck();
}

const dailyShareColors = ['#ec6c22', '#e5a814', '#5e9d59', '#14806d', '#c95e4c', '#9c6a8d', '#5d7fae', '#8a6aa0'];

function getDailyShareData() {
  const meals = getMemberMeals().filter(isToday);
  const grouped = new Map();
  meals.forEach((meal) => {
    const name = String(meal.food_name || 'Saved dish').trim() || 'Saved dish';
    const key = name.toLowerCase();
    const current = grouped.get(key) || { name, calories: 0 };
    current.calories += Number(meal.calories) || 0;
    grouped.set(key, current);
  });
  const dishes = Array.from(grouped.values()).sort((left, right) => right.calories - left.calories);
  const calories = dishes.reduce((total, dish) => total + dish.calories, 0);
  const savedTargets = appState.profileMeasurements[appState.currentMember?.id] || {};
  const goal = Number(savedTargets.target_calories || appState.currentMember?.target_calories) || 2200;
  const scores = meals.map((meal) => analyzeMealQuality(meal).score);
  const foodScore = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : 0;
  const variety = new Set(meals.map((meal) => String(meal.food_name || '').trim().toLowerCase()).filter(Boolean)).size;
  const remaining = Math.max(goal - calories, 0);
  const over = Math.max(calories - goal, 0);
  const observation = over
    ? `${over.toLocaleString()} calories above today’s target. Tomorrow is a fresh map.`
    : foodScore >= 75
      ? 'A strong food-score day with room to keep the rhythm going.'
      : variety >= 5
        ? 'Plenty of variety shaped today’s food story.'
        : `${remaining.toLocaleString()} calories remained in today’s target.`;
  return { meals, dishes, calories, goal, foodScore, variety, observation };
}

function openDailyShareModal() {
  const data = getDailyShareData();
  if (!data.meals.length) {
    showAppNotice('Log at least one meal before sharing your day.', 'warning');
    return;
  }
  const namesToggle = document.getElementById('dailyShareHideNames');
  if (namesToggle) namesToggle.checked = false;
  setDailyShareFeedback('');
  document.getElementById('dailyShareModal')?.classList.remove('hidden');
  renderDailyShareCard();
}

function closeDailyShareModal() {
  document.getElementById('dailyShareModal')?.classList.add('hidden');
  setDailyShareFeedback('');
}

function setDailyShareFeedback(message, tone = '') {
  const feedback = document.getElementById('dailyShareFeedback');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.className = `daily-share-feedback${tone ? ` ${tone}` : ''}`;
}

function roundedCanvasRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function fillRoundedCanvasRect(context, x, y, width, height, radius, color) {
  roundedCanvasRect(context, x, y, width, height, radius);
  context.fillStyle = color;
  context.fill();
}

function drawCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  let consumed = 0;
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
      consumed += 1;
    } else if (lines.length < maxLines - 1) {
      lines.push(line);
      line = word;
      consumed += 1;
    }
  });
  if (line && lines.length < maxLines) lines.push(line);
  if (consumed < words.length && lines.length) {
    let last = lines[lines.length - 1];
    while (last && context.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last.trim()}…`;
  }
  lines.forEach((item, index) => context.fillText(item, x, y + (index * lineHeight)));
}

function drawDailyShareBrand(context) {
  context.save();
  context.translate(88, 82);
  context.fillStyle = '#17604a';
  context.beginPath();
  context.arc(38, 38, 38, Math.PI, 0);
  context.lineTo(67, 65);
  context.quadraticCurveTo(38, 100, 9, 65);
  context.closePath();
  context.fill();
  context.fillStyle = '#fffaf0';
  context.beginPath();
  context.arc(38, 38, 23, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#ef8b24';
  context.beginPath();
  context.ellipse(38, 38, 7, 15, .72, 0, Math.PI * 2);
  context.fill();
  context.restore();
  context.fillStyle = '#153e32';
  context.font = '700 45px Georgia, serif';
  context.fillText('MyMealMap', 182, 126);
  context.fillStyle = '#8a715d';
  context.font = '800 15px Arial, sans-serif';
  context.fillText('YOUR FOOD STORY, MAPPED.', 184, 154);
}

function renderDailyShareCard() {
  const canvas = document.getElementById('dailyShareCanvas');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;
  const data = getDailyShareData();
  const showNames = !document.getElementById('dailyShareHideNames')?.checked;
  const { dishes, calories, goal, foodScore, variety, observation } = data;
  const divisor = calories || dishes.length || 1;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#f7f1e7';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const glow = context.createRadialGradient(930, 80, 20, 930, 80, 360);
  glow.addColorStop(0, 'rgba(242,167,60,.25)');
  glow.addColorStop(1, 'rgba(242,167,60,0)');
  context.fillStyle = glow;
  context.fillRect(570, 0, 510, 430);
  drawDailyShareBrand(context);

  context.fillStyle = '#b85a26';
  context.font = '800 20px Arial, sans-serif';
  context.fillText('DAILY FOOD BRIEF', 88, 235);
  context.fillStyle = '#251b14';
  context.font = '700 70px Georgia, serif';
  context.fillText('Today’s food story', 88, 310);
  context.fillStyle = '#79695c';
  context.font = '400 24px Arial, sans-serif';
  const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  context.fillText(`${dateLabel}  ·  ${dishes.length} dish${dishes.length === 1 ? '' : 'es'} logged`, 90, 353);

  fillRoundedCanvasRect(context, 58, 390, 964, 615, 36, '#fffdf9');
  context.save();
  context.translate(320, 685);
  context.rotate(-Math.PI / 2);
  let angle = 0;
  dishes.forEach((dish, index) => {
    const slice = ((dish.calories || 1) / divisor) * Math.PI * 2;
    context.beginPath();
    context.strokeStyle = dailyShareColors[index % dailyShareColors.length];
    context.lineWidth = 100;
    context.arc(0, 0, 175, angle, angle + slice);
    context.stroke();
    angle += slice;
  });
  context.restore();
  context.textAlign = 'center';
  context.fillStyle = '#153e32';
  context.font = '700 52px Georgia, serif';
  context.fillText(calories.toLocaleString(), 320, 686);
  context.fillStyle = '#857467';
  context.font = '800 16px Arial, sans-serif';
  context.fillText('CALORIES', 320, 716);
  context.fillStyle = '#b55b2d';
  context.font = '800 17px Arial, sans-serif';
  context.fillText(`${Math.round((calories / goal) * 100)}% OF GOAL`, 320, 748);
  context.textAlign = 'left';

  const visibleDishes = dishes.slice(0, 5);
  visibleDishes.forEach((dish, index) => {
    const y = 465 + (index * 96);
    const percent = Math.round(((dish.calories || 1) / divisor) * 100);
    fillRoundedCanvasRect(context, 570, y, 400, 78, 18, '#f8f4ed');
    context.fillStyle = dailyShareColors[index % dailyShareColors.length];
    context.beginPath();
    context.arc(600, y + 39, 10, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#34271f';
    context.font = '700 22px Arial, sans-serif';
    drawCanvasText(context, showNames ? dish.name : `Dish ${index + 1}`, 626, y + 33, 225, 25, 1);
    context.fillStyle = '#8d7e72';
    context.font = '400 16px Arial, sans-serif';
    context.fillText(`${percent}% of today`, 626, y + 58);
    context.fillStyle = '#3f713e';
    context.font = '800 18px Arial, sans-serif';
    context.textAlign = 'right';
    context.fillText(`${dish.calories.toLocaleString()} cal`, 946, y + 43);
    context.textAlign = 'left';
  });
  if (dishes.length > visibleDishes.length) {
    context.fillStyle = '#8d7e72';
    context.font = '700 16px Arial, sans-serif';
    context.fillText(`+${dishes.length - visibleDishes.length} more dishes`, 584, 966);
  }

  [
    { label: 'DAILY GOAL', value: `${goal.toLocaleString()} cal` },
    { label: 'FOOD SCORE', value: `${foodScore}/100` },
    { label: 'VARIETY', value: `${variety} foods` }
  ].forEach((stat, index) => {
    const x = 58 + (index * 327);
    fillRoundedCanvasRect(context, x, 1040, 309, 116, 22, index === 1 ? '#e8f2e9' : '#fffdf9');
    context.fillStyle = '#927d6b';
    context.font = '800 14px Arial, sans-serif';
    context.fillText(stat.label, x + 24, 1075);
    context.fillStyle = '#173f33';
    context.font = '700 30px Georgia, serif';
    context.fillText(stat.value, x + 24, 1119);
  });

  fillRoundedCanvasRect(context, 58, 1185, 964, 105, 23, '#153f32');
  context.fillStyle = '#f2ad3d';
  context.font = '800 15px Arial, sans-serif';
  context.fillText('TODAY’S OBSERVATION', 86, 1222);
  context.fillStyle = '#f8f3e9';
  context.font = '400 21px Arial, sans-serif';
  drawCanvasText(context, observation, 86, 1256, 650, 26, 2);
  context.fillStyle = '#f2ad3d';
  context.font = '800 18px Arial, sans-serif';
  context.textAlign = 'right';
  context.fillText('mymealmap1.netlify.app', 990, 1257);
  context.textAlign = 'left';
}

function dailyShareCanvasBlob() {
  renderDailyShareCard();
  return new Promise((resolve, reject) => {
    document.getElementById('dailyShareCanvas')?.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not create the share image.'));
    }, 'image/png');
  });
}

async function shareDailyCard() {
  try {
    setDailyShareFeedback('Preparing your image…');
    const blob = await dailyShareCanvasBlob();
    const file = new File([blob], `mymealmap-${todayKey()}.png`, { type: 'image/png' });
    const data = getDailyShareData();
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'My MyMealMap food story',
        text: `Today’s food story: ${data.calories.toLocaleString()} calories, ${data.dishes.length} dishes, and a ${data.foodScore} food score.`,
        files: [file]
      });
      setDailyShareFeedback('Shared successfully.', 'success');
      return;
    }
    await saveDailyShareCard(blob);
    setDailyShareFeedback('Image saved. Add it to your preferred social app.', 'success');
  } catch (error) {
    if (error?.name === 'AbortError') {
      setDailyShareFeedback('Sharing canceled.');
      return;
    }
    console.error(error);
    setDailyShareFeedback('Could not share the image. Try Save image instead.', 'error');
  }
}

async function saveDailyShareCard(existingBlob) {
  try {
    setDailyShareFeedback('Preparing your image…');
    const blob = existingBlob instanceof Blob ? existingBlob : await dailyShareCanvasBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mymealmap-${todayKey()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDailyShareFeedback('Image saved.', 'success');
  } catch (error) {
    console.error(error);
    setDailyShareFeedback('Could not save the image on this device.', 'error');
  }
}

function calculateProfileTargets({ height, weight, age, sex, activity, goal }) {
  const bmr = (10 * weight) + (6.25 * height) - (5 * age) + (sex === 'male' ? 5 : -161);
  const adjustment = goal === 'lose' ? -400 : goal === 'gain' ? 300 : 0;
  const minimumCalories = sex === 'male' ? 1500 : 1200;
  const targetCalories = Math.max(minimumCalories, Math.round(((bmr * activity) + adjustment) / 50) * 50);
  const proteinMultiplier = goal === 'maintain' ? 1.2 : 1.6;
  const proteinGrams = Math.round(weight * proteinMultiplier);
  const waterLiters = Math.round(weight * 0.035 * 10) / 10;
  return {
    targetCalories,
    proteinGrams,
    waterLiters
  };
}

function showPage(pageName) {
  if (appState.auth.status !== 'ready') {
    renderAuthState();
    return;
  }
  if (!appState.currentMember) {
    selectMember(getDefaultMember());
  }

  appState.currentPage = pageName;
  document.querySelectorAll('.page').forEach((page) => page.classList.remove('active-page'));
  const page = document.getElementById(`page-${pageName}`);
  if (page) page.classList.add('active-page');

  const activeNavPage = resolveNavPage(pageName);
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.page === activeNavPage);
  });

  document.getElementById('pageTitle').textContent = page?.dataset.title || 'MyMealMap';
  document.getElementById('activeKicker').textContent = page?.dataset.kicker || 'MyMealMap';
  saveUiState();
  renderAll();
}

function openDemoPage(pageName) {
  if (appState.auth.status !== 'ready') return;
  selectMember(appState.currentMember || getDefaultMember(), { openDashboard: false });
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('workspace').classList.remove('hidden');
  showPage(pageName);
}

async function handleAuthEmailSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('authEmailInput');
  const email = String(input?.value || '').trim().toLowerCase();
  if (!email) {
    setAuthFeedback('Enter your email first.', 'error');
    return;
  }

  appState.auth.pendingEmail = email;
  appState.auth.status = 'otp_sent';
  savePendingOtpEmail(email);
  renderAuthState();
  setAuthFeedback('Sending your code…');
  document.getElementById('authOtpInput')?.focus();

  try {
    await window.familyBitesDb.sendOtp(email);
    setAuthFeedback(`Code sent to ${email}.`, 'success');
  } catch (error) {
    console.warn('OTP send failed.', error);
    const message = String(error?.message || '').toLowerCase();
    const codeMayAlreadyExist = message.includes('security purposes') || message.includes('rate limit');
    setAuthFeedback(
      codeMayAlreadyExist
        ? 'A code was already requested. Check your email or wait a minute before resending.'
        : `${formatAuthError(error)} If a code arrived, you can still enter it here.`,
      codeMayAlreadyExist ? 'success' : 'error'
    );
  }
}

async function handleAuthVerifySubmit(event) {
  event.preventDefault();
  const email = appState.auth.pendingEmail;
  const token = String(document.getElementById('authOtpInput')?.value || '').trim();
  if (!email || !token) {
    setAuthFeedback('Enter the code from your email.', 'error');
    return;
  }

  try {
    setAuthFeedback('Verifying code…');
    await window.familyBitesDb.verifyOtp(email, token);
    setAuthFeedback('Code verified. Signing you in…', 'success');
  } catch (error) {
    console.warn('OTP verification failed.', error);
    setAuthFeedback(formatAuthError(error), 'error');
  }
}

async function handleAuthResendOtp() {
  if (!appState.auth.pendingEmail) return;
  try {
    setAuthFeedback('Sending a new code…');
    await window.familyBitesDb.sendOtp(appState.auth.pendingEmail);
    setAuthFeedback(`New code sent to ${appState.auth.pendingEmail}.`, 'success');
  } catch (error) {
    console.warn('OTP resend failed.', error);
    setAuthFeedback(formatAuthError(error), 'error');
  }
}

function handleAuthChangeEmail() {
  appState.auth.status = 'signed_out';
  appState.auth.pendingEmail = '';
  clearPendingOtpEmail();
  const otpInput = document.getElementById('authOtpInput');
  if (otpInput) otpInput.value = '';
  setAuthFeedback('');
  renderAuthState();
  document.getElementById('authEmailInput')?.focus();
}

async function handleCreateFamilySubmit(event) {
  event.preventDefault();
  const input = document.getElementById('authFamilyNameInput');
  const familyName = String(input?.value || '').trim();
  if (!familyName) {
    setAuthFeedback('Enter a meal map name to continue.', 'error');
    return;
  }

  try {
    appState.auth.status = 'loading';
    renderAuthState();
    setAuthFeedback('Creating your meal map…');
    await window.familyBitesDb.createFamilyForCurrentUser(familyName);
    const session = await window.familyBitesDb.getSession();
    if (!session) throw new Error('Session missing after family creation.');
    await handleAuthenticatedSession(session);
    setAuthFeedback('');
  } catch (error) {
    console.warn('Meal map creation failed.', error);
    appState.auth.status = 'needs_family';
    renderAuthState();
    setAuthFeedback(formatAuthError(error), 'error');
  }
}

async function handleAuthSignOut() {
  try {
    await window.familyBitesDb.signOut();
  } catch (error) {
    console.warn('Sign out failed.', error);
  }
  clearLocalFamilyCache();
  localStorage.removeItem(lastAuthUserStorageKey);
  handleSignedOutState();
}

function openMealComposer(defaultDay = 'today') {
  resetSnapWorkspace(defaultDay);
  updateMealPreview();
  showPage('snap');
  document.getElementById('foodName').focus();
}

function resetSnapWorkspace(defaultDay = 'today') {
  const form = document.getElementById('mealForm');
  if (!form) return;
  form.reset();
  clearSnapScanDraft();
  document.getElementById('mealPhotoUpload').value = '';
  document.getElementById('mealPhotoCamera').value = '';
  document.getElementById('foodName').value = '';
  document.getElementById('notes').value = '';
  document.getElementById('restaurantName').value = '';
  const targetDate = defaultDay === 'yesterday'
    ? new Date(Date.now() - 24 * 60 * 60 * 1000)
    : new Date();
  setMealFormDateTimeDefaults(targetDate);
  resetPhotoPreview();
  updateMealPreview();
}

function createEmptySnapScanDraft() {
  return {
    ingredients: [],
    tags: [],
    confidence: '',
    note: '',
    foods: [],
    usda: {
      results: [],
      selected: null,
      grams: 100,
      status: '',
      requestId: 0
    }
  };
}

function normalizeScanLabel(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[|[\]]/g, '')
    .slice(0, 60);
}

function formatScanLabel(value) {
  return normalizeScanLabel(value)
    .split(' ')
    .map((word) => word ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : '')
    .join(' ');
}

function clearSnapScanDraft() {
  snapScanDraft = createEmptySnapScanDraft();
  lastSnapEstimateSignature = '';
  renderSnapInsights();
  renderSnapAnalysis();
  renderUsdaNutrition();
  updateSnapEstimateStatus();
}

function renderSnapInsights() {
  const panel = document.getElementById('scanInsightsPanel');
  const ingredientList = document.getElementById('scanIngredientList');
  const tagList = document.getElementById('scanTagList');
  const summary = document.getElementById('scanInsightsSummary');
  const hasInsights = snapScanDraft.ingredients.length || snapScanDraft.tags.length;

  panel.classList.toggle('hidden', !hasInsights);
  summary.textContent = snapScanDraft.confidence
    ? `${snapScanDraft.confidence} confidence`
    : hasInsights ? 'Ready to confirm' : 'No scan yet';

  ingredientList.innerHTML = snapScanDraft.ingredients.length
    ? snapScanDraft.ingredients.map((ingredient) => `
        <span class="scan-chip active">
          ${escapeHtml(formatScanLabel(ingredient))}
          <button type="button" data-remove-scan-ingredient="${escapeAttr(ingredient)}" aria-label="Remove ${escapeAttr(ingredient)}">×</button>
        </span>
      `).join('')
    : '<span class="muted">Scan first, then remove or add ingredients here.</span>';

  tagList.innerHTML = snapTagCatalog.map((tag) => {
    const isActive = snapScanDraft.tags.includes(tag);
    return `
      <button class="scan-chip ${isActive ? 'active' : ''}" type="button" data-toggle-scan-tag="${escapeAttr(tag)}">
        ${escapeHtml(formatScanLabel(tag))}
      </button>
    `;
  }).join('');
}

function renderSnapAnalysis() {
  const calories = Number(document.getElementById('calories')?.value || 0);
  const calorieValue = document.getElementById('scanCaloriesValue');
  const confidenceValue = document.getElementById('scanConfidenceValue');
  const ingredientCount = document.getElementById('scanIngredientsCount');
  const factPanel = document.getElementById('scanFactsPanel');
  const factList = document.getElementById('scanFactList');
  const aiNote = document.getElementById('scanAiNote');
  const previewFacts = document.getElementById('previewFacts');
  const facts = uniqueList([
    ...snapScanDraft.tags.map(formatScanLabel),
    ...(snapScanDraft.foods || []).map((food) => normalizeScanLabel(food.name)).filter(Boolean)
  ]).slice(0, 6);

  calorieValue.textContent = calories ? calories.toLocaleString() : '—';
  confidenceValue.textContent = snapScanDraft.confidence ? snapScanDraft.confidence : '—';
  ingredientCount.textContent = String(snapScanDraft.ingredients.length || 0);

  factPanel.classList.toggle('hidden', !(facts.length || snapScanDraft.note));
  factList.innerHTML = facts.length
    ? facts.map((fact) => `<span class="scan-chip active">${escapeHtml(fact)}</span>`).join('')
    : '<span class="muted">Scan a photo to surface quick facts.</span>';
  aiNote.textContent = snapScanDraft.note || '';

  previewFacts.innerHTML = [
    calories ? `<span class="scan-chip active">${calories.toLocaleString()} cal</span>` : '',
    snapScanDraft.confidence ? `<span class="scan-chip active">${escapeHtml(snapScanDraft.confidence)} confidence</span>` : '',
    ...facts.slice(0, 3).map((fact) => `<span class="scan-chip">${escapeHtml(fact)}</span>`)
  ].filter(Boolean).join('');

  const previewFood = document.getElementById('previewFood');
  if (previewFood) updateMealPreview();
}

function setSnapInsightsFromEstimate(estimate = {}) {
  const ingredientPool = [
    ...(estimate.likely_ingredients || []),
    ...((estimate.foods || []).flatMap((food) => String(food.name || '').split(',').map((item) => item.trim())))
  ];
  snapScanDraft = {
    ingredients: uniqueList(ingredientPool.map(normalizeScanLabel).filter(Boolean)).slice(0, 10),
    tags: uniqueList((estimate.meal_tags || []).map((tag) => normalizeScanLabel(tag).toLowerCase()).filter(Boolean))
      .filter((tag) => snapTagCatalog.includes(tag)),
    confidence: String(estimate.confidence || ''),
    note: String(estimate.note || '').trim(),
    foods: Array.isArray(estimate.foods) ? estimate.foods : [],
    usda: createEmptySnapScanDraft().usda
  };
  lastSnapEstimateSignature = getSnapEstimateSignature();
  renderSnapInsights();
  renderSnapAnalysis();
  updateSnapEstimateStatus();
}

function getUsdaSearchQuery() {
  const explicitQuery = document.getElementById('usdaFoodQuery')?.value.trim();
  if (explicitQuery) return explicitQuery;
  const firstAiFood = normalizeScanLabel(snapScanDraft.foods?.[0]?.name || '');
  return firstAiFood || document.getElementById('foodName')?.value.trim() || '';
}

async function searchUsdaFoods(options = {}) {
  const query = getUsdaSearchQuery();
  const status = document.getElementById('usdaSearchStatus');
  const button = document.getElementById('searchUsdaFoods');
  if (query.length < 2) {
    snapScanDraft.usda.status = 'Enter a food name before searching USDA.';
    renderUsdaNutrition();
    return;
  }

  const requestId = snapScanDraft.usda.requestId + 1;
  snapScanDraft.usda.requestId = requestId;
  snapScanDraft.usda.status = `Searching USDA for “${query}”…`;
  button.disabled = true;
  status.classList.remove('estimate-error');
  renderUsdaNutrition();

  try {
    const headers = await getFunctionRequestHeaders();
    const response = await fetch(`/.netlify/functions/usda-foods?query=${encodeURIComponent(query)}`, { headers });
    const result = await response.json();
    if (requestId !== snapScanDraft.usda.requestId) return;
    if (!response.ok) throw new Error(result?.error || 'USDA search is unavailable.');
    snapScanDraft.usda.results = Array.isArray(result.foods) ? result.foods : [];
    snapScanDraft.usda.status = snapScanDraft.usda.results.length
      ? 'Choose the closest match. Nutrients shown are per 100 g.'
      : `No USDA matches found for “${query}”. Try a simpler food name.`;
    if (options.automatic && snapScanDraft.usda.results.length === 1) {
      selectUsdaFood(snapScanDraft.usda.results[0].fdc_id);
      return;
    }
  } catch (error) {
    if (requestId !== snapScanDraft.usda.requestId) return;
    snapScanDraft.usda.results = [];
    snapScanDraft.usda.status = error.message || 'USDA search is unavailable.';
    status.classList.add('estimate-error');
  } finally {
    if (requestId === snapScanDraft.usda.requestId) button.disabled = false;
    renderUsdaNutrition();
  }
}

function renderUsdaNutrition() {
  const usda = snapScanDraft.usda || createEmptySnapScanDraft().usda;
  const queryInput = document.getElementById('usdaFoodQuery');
  const status = document.getElementById('usdaSearchStatus');
  const results = document.getElementById('usdaFoodResults');
  const selectedPanel = document.getElementById('usdaSelectedFood');
  if (!queryInput || !status || !results || !selectedPanel) return;

  if (!queryInput.value && snapScanDraft.foods?.[0]?.name) {
    queryInput.value = normalizeScanLabel(snapScanDraft.foods[0].name);
  }
  status.textContent = usda.status || 'Scan a photo or enter a food name, then search USDA.';
  results.innerHTML = (usda.results || []).map((food) => {
    const isSelected = food.fdc_id === usda.selected?.fdc_id;
    const brand = food.brand ? `<small>${escapeHtml(food.brand)}</small>` : '';
    return `
      <button class="usda-food-option${isSelected ? ' selected' : ''}" type="button" data-usda-food-id="${food.fdc_id}">
        <span><strong>${escapeHtml(food.description)}</strong>${brand}</span>
        <span><b>${formatUsdaNumber(food.calories, 0)} kcal</b><small>${escapeHtml(food.data_type || 'USDA')} · per 100 g</small></span>
      </button>
    `;
  }).join('');

  const food = usda.selected;
  selectedPanel.classList.toggle('hidden', !food);
  if (!food) return;
  document.getElementById('usdaSelectedName').textContent = food.description;
  document.getElementById('usdaSelectedMeta').textContent = [food.brand, food.data_type, `FDC ${food.fdc_id}`].filter(Boolean).join(' · ');
  document.getElementById('usdaServingGrams').value = String(usda.grams || 100);
  renderUsdaMacroSummary(food, usda.grams || 100);
}

function selectUsdaFood(fdcId) {
  const food = snapScanDraft.usda.results.find((item) => item.fdc_id === fdcId);
  if (!food) return;
  snapScanDraft.usda.selected = food;
  snapScanDraft.usda.grams = Number(food.serving_grams) || 100;
  snapScanDraft.usda.status = 'USDA match selected. Adjust the serving weight if needed.';
  document.getElementById('usdaServingGrams').value = String(snapScanDraft.usda.grams);
  applyUsdaServing();
}

function applyUsdaServing() {
  const food = snapScanDraft.usda?.selected;
  if (!food) return;
  const input = document.getElementById('usdaServingGrams');
  const grams = Math.min(3000, Math.max(1, Number(input?.value) || snapScanDraft.usda.grams || 100));
  snapScanDraft.usda.grams = grams;
  const nutrition = calculateUsdaNutrition(food, grams);
  document.getElementById('calories').value = String(Math.round(nutrition.calories || 0));
  renderUsdaMacroSummary(food, grams);
  renderSnapAnalysis();
  renderUsdaNutrition();
  updateMealPreview();
}

function calculateUsdaNutrition(food, grams) {
  const scale = (Number(grams) || 100) / 100;
  return {
    calories: scaleUsdaValue(food.calories, scale),
    protein_g: scaleUsdaValue(food.protein_g, scale),
    carbs_g: scaleUsdaValue(food.carbs_g, scale),
    fat_g: scaleUsdaValue(food.fat_g, scale),
    fiber_g: scaleUsdaValue(food.fiber_g, scale),
    sodium_mg: scaleUsdaValue(food.sodium_mg, scale)
  };
}

function scaleUsdaValue(value, scale) {
  return value === null || value === undefined ? null : Number(value) * scale;
}

function getSelectedUsdaNutrition() {
  const food = snapScanDraft.usda?.selected;
  if (!food) return null;
  return {
    ...calculateUsdaNutrition(food, snapScanDraft.usda.grams),
    fdc_id: food.fdc_id,
    description: food.description,
    grams: snapScanDraft.usda.grams
  };
}

function renderUsdaMacroSummary(food, grams) {
  const summary = document.getElementById('usdaMacroSummary');
  if (!summary) return;
  const nutrition = calculateUsdaNutrition(food, grams);
  summary.innerHTML = [
    ['Calories', formatUsdaNumber(nutrition.calories, 0), 'kcal'],
    ['Protein', formatUsdaNumber(nutrition.protein_g), 'g'],
    ['Carbs', formatUsdaNumber(nutrition.carbs_g), 'g'],
    ['Fat', formatUsdaNumber(nutrition.fat_g), 'g'],
    ['Fiber', formatUsdaNumber(nutrition.fiber_g), 'g'],
    ['Sodium', formatUsdaNumber(nutrition.sodium_mg, 0), 'mg']
  ].map(([label, value, unit]) => `<span><small>${label}</small><strong>${value}</strong><b>${unit}</b></span>`).join('');
}

function formatUsdaNumber(value, digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—';
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: digits });
}

function removeSnapIngredient(value) {
  const ingredient = normalizeScanLabel(value);
  if (!ingredient) return;
  snapScanDraft.ingredients = snapScanDraft.ingredients.filter((item) => item !== ingredient);
  renderSnapInsights();
  renderSnapAnalysis();
  updateSnapEstimateStatus();
}

function toggleSnapTag(value) {
  const tag = normalizeScanLabel(value).toLowerCase();
  if (!tag || !snapTagCatalog.includes(tag)) return;
  snapScanDraft.tags = snapScanDraft.tags.includes(tag)
    ? snapScanDraft.tags.filter((item) => item !== tag)
    : [...snapScanDraft.tags, tag];
  renderSnapInsights();
  renderSnapAnalysis();
  updateSnapEstimateStatus();
}

function handleAddSnapIngredient() {
  const input = document.getElementById('scanIngredientInput');
  const ingredient = normalizeScanLabel(input.value);
  if (!ingredient) {
    input.value = '';
    return;
  }
  snapScanDraft.ingredients = uniqueList([...snapScanDraft.ingredients, ingredient]).slice(0, 12);
  input.value = '';
  renderSnapInsights();
  renderSnapAnalysis();
  updateSnapEstimateStatus();
}

function getSnapEstimateSignature() {
  return JSON.stringify({
    foodName: document.getElementById('foodName')?.value.trim() || '',
    notes: document.getElementById('notes')?.value.trim() || '',
    ingredients: [...snapScanDraft.ingredients].sort(),
    tags: [...snapScanDraft.tags].sort()
  });
}

function snapEstimateNeedsRefresh() {
  const photoUrl = document.getElementById('photoPreview')?.dataset.photoUrl || '';
  if (!photoUrl || !lastSnapEstimateSignature) return false;
  return getSnapEstimateSignature() !== lastSnapEstimateSignature;
}

function updateSnapEstimateStatus() {
  const status = document.getElementById('calorieEstimate');
  if (!status) return;
  if (snapEstimateNeedsRefresh()) {
    status.classList.remove('estimate-success', 'estimate-error');
    status.textContent = 'Details changed. Rescan if you want AI to refine the calories with your updated ingredients and notes.';
  }
}

function renderAll() {
  renderDashboard();
  renderMeals();
  renderSnapAlbum();
  renderFavorites();
  renderReport();
  renderProfile();
  renderRecipes();
  renderWorkouts();
  renderFutureYou();
  renderSettings();
  renderSnapAnalysis();
  updateMealPreview();
}

function updateProfileUi() {
  const member = appState.currentMember;
  const foodTitle = buildFoodAchievementProfile(member).activeTitle;
  document.getElementById('navAvatar').innerHTML = avatarMarkup(member);
  document.getElementById('navName').textContent = member.name;
  const navSubtitle = document.querySelector('.nav-profile small');
  if (navSubtitle) navSubtitle.textContent = `${foodTitle.icon} ${foodTitle.title}`;
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
  renderHealthInsights(memberMeals, todayMeals, calories, goal);
}

function renderDashboardHistory(memberMeals, yesterdayMeals) {
  const historyCard = document.getElementById('dashboardHistoryCard');
  if (historyCard) historyCard.classList.toggle('hidden', !memberMeals.length);
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

function renderHealthInsights(memberMeals, todayMeals, calories, calorieGoal) {
  const log = getTodayBioLog();
  const steps = Number(log.steps) || 0;
  const glucose = Number(log.sugar_level) || 0;
  const mealCount = todayMeals.length;
  const calorieRatio = calorieGoal ? calories / calorieGoal : 0;
  const rawProgress = calorieGoal ? Math.round((calories / calorieGoal) * 100) : 0;
  const calorieScore = calories === 0 ? 35 : clampScore(100 - Math.abs(1 - calorieRatio) * 82);
  const activityScore = clampScore(38 + (steps / 10000) * 62);
  const glucoseScore = glucose ? clampScore(100 - Math.abs(glucose - 100) * 1.25) : 55;
  const mealVariety = new Set(todayMeals.map((meal) => meal.food_name?.toLowerCase()).filter(Boolean)).size;
  const nutrition = clampScore((calorieScore * .55) + Math.min(mealVariety * 10, 30) + (mealCount ? 15 : 0));
  const health = clampScore((nutrition * .35) + (activityScore * .35) + (glucoseScore * .3));
  const progress = calorieGoal ? clampScore((calories / calorieGoal) * 100) : 0;
  const overGoalCalories = calorieGoal ? Math.max(calories - calorieGoal, 0) : 0;
  const isOverGoal = overGoalCalories > 0;
  const remainingCalories = Math.max(calorieGoal - calories, 0);
  const compassProgress = calorieGoal ? Math.min(Math.round((calories / calorieGoal) * 100), 100) : 0;
  const mealScores = todayMeals.map((meal) => analyzeMealQuality(meal).score);
  const averageFoodScore = mealScores.length
    ? Math.round(mealScores.reduce((total, score) => total + score, 0) / mealScores.length)
    : null;
  const compassInsight = !mealCount
    ? 'Log your first meal to reveal your daily pattern.'
    : isOverGoal
      ? `Today is ${overGoalCalories.toLocaleString()} calories above your target. A simpler next choice can steady the day.`
      : averageFoodScore >= 75
        ? 'Your food choices are scoring well today. Keep the same rhythm for your next meal.'
        : mealCount > 1 && mealVariety <= 1
          ? 'Today is repeating one food. A different ingredient or food group would add variety.'
          : `${remainingCalories.toLocaleString()} calories remain, with room to make the next meal count.`;

  setText('dailyCompassCalories', calories.toLocaleString());
  setText('dailyCompassGoal', calorieGoal.toLocaleString());
  setText('dailyCompassRemaining', `${(isOverGoal ? overGoalCalories : remainingCalories).toLocaleString()} cal`);
  setText('dailyCompassRemainingLabel', isOverGoal ? 'Above today’s target' : 'Remaining today');
  setText('dailyCompassProgressCopy', !mealCount
    ? 'Your first meal starts today’s map.'
    : `${rawProgress}% of your daily target logged.`);
  setText('dailyCompassFoodScore', averageFoodScore === null ? '--' : averageFoodScore);
  setText('dailyCompassVariety', mealVariety);
  setText('dailyCompassDishes', mealCount);
  setText('dailyCompassInsight', compassInsight);
  setText('dailyCompassStatus', !mealCount ? 'Ready to begin' : isOverGoal ? 'Target passed' : compassProgress >= 75 ? 'Nearly there' : 'In progress');
  const compassBar = document.getElementById('dailyCompassBar');
  if (compassBar) compassBar.style.width = `${compassProgress}%`;
  const compassRing = document.querySelector('.daily-compass-ring');
  if (compassRing) compassRing.style.setProperty('--compass-progress', `${compassProgress * 3.6}deg`);
  const compass = document.getElementById('dailyCompass');
  if (compass) compass.classList.toggle('is-over-goal', isOverGoal);

  setText('dashboardDate', new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date()));
  setText('dashboardMemberName', appState.currentMember?.name || 'there');
  setText('summaryCalories', calories.toLocaleString());
  const currentWeight = getMemberWeight(appState.currentMember);
  setText('summaryWeight', currentWeight !== null && currentWeight !== undefined ? Number(currentWeight).toLocaleString() : '--');
  setText('summarySteps', steps.toLocaleString());
  setText('summaryGlucose', glucose ? Math.round(glucose).toLocaleString() : '--');
  setText('summaryCalorieProgress', `${rawProgress}%`);
  setText('summaryCalorieGoal', isOverGoal
    ? `${calories.toLocaleString()} / ${calorieGoal.toLocaleString()} cal · ${overGoalCalories.toLocaleString()} over`
    : `${calories.toLocaleString()} / ${calorieGoal.toLocaleString()} cal`);
  setText('summaryRingCalories', calories.toLocaleString());
  setText('nutritionDonutCalories', calories.toLocaleString());
  setText('summaryTip', !mealCount
    ? 'Log your first meal to start your daily analysis.'
    : isOverGoal
      ? `You’re ${overGoalCalories.toLocaleString()} calories over today’s goal. Keep the next meal lighter and add some movement or water.`
      : `You’re ${progress}% of the way to your daily calorie goal.`);
  const summaryBar = document.getElementById('summaryCalorieBar');
  if (summaryBar) summaryBar.style.width = `${progress}%`;
  const summaryRing = document.getElementById('summaryCalorieRing');
  if (summaryRing) summaryRing.style.setProperty('--ring-progress', `${progress * 3.6}deg`);
  const summaryCard = document.getElementById('dailySummaryCard');
  if (summaryCard) summaryCard.classList.toggle('is-over-goal', isOverGoal);
  if (summaryRing) summaryRing.classList.toggle('is-over-goal', isOverGoal);
  const tipCard = document.getElementById('summaryTipCard');
  if (tipCard) tipCard.classList.toggle('is-over-goal', isOverGoal);
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
  const aiInsightCards = buildDashboardAiInsightCards({
    todayMeals,
    calories,
    calorieGoal,
    nutrition,
    impacts,
    todaySignals: analyzeMealPatternSignals(todayMeals)
  });
  const impactList = document.getElementById('bodyImpactList');
  if (impactList) impactList.innerHTML = aiInsightCards.map((card) => `
    <article class="ai-insight-card ai-insight-card-${escapeAttr(card.tone || 'neutral')}">
      <div class="ai-insight-card-header">
        <span>${card.icon}</span>
        <strong>${escapeHtml(card.title)}</strong>
      </div>
      ${card.highlight ? `<p class="ai-insight-highlight">${escapeHtml(card.highlight)}</p>` : ''}
      <div class="ai-insight-list">
        ${card.items.map((item) => `<p>${escapeHtml(item)}</p>`).join('')}
      </div>
    </article>`).join('');

  const recommendations = buildRecommendations({
    memberMeals,
    todayMeals,
    calories,
    calorieGoal,
    steps,
    glucose,
    mealCount,
    nutrition
  });
  const recommendationList = document.getElementById('aiRecommendationList');
  if (recommendationList) recommendationList.innerHTML = recommendations.map((item) => `
    <article class="recommendation-item">
      <span>${item.icon}</span><div><strong>${item.title}</strong><p>${item.copy}</p></div>
    </article>`).join('');

  renderBodyInsightsPage({
    todayMeals,
    calories,
    calorieGoal,
    nutrition,
    impacts,
    recommendations,
    todaySignals: analyzeMealPatternSignals(todayMeals)
  });
}

function buildFoodBodyImpacts(todayMeals, totalCalories) {
  const systems = [
    { name: 'Brain', icon: '🧠', position: 'brain', words: ['coffee', 'latte', 'tea', 'nuts', 'walnut', 'fish', 'salmon', 'egg', 'berry', 'chocolate', 'cacao'], benefit: 'supports focus and steady brain fuel' },
    { name: 'Heart', icon: '🫀', position: 'heart', words: ['nuts', 'fish', 'salmon', 'avocado', 'olive', 'oat', 'bean', 'vegetable', 'salad', 'greens', 'cabbage', 'herb'], cautionWords: ['fried', 'fries', 'bacon', 'burger'], benefit: 'provides heart-supporting fats and fiber' },
    { name: 'Muscles', icon: '💪', position: 'muscles', words: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'egg', 'tofu', 'nuts', 'yogurt', 'milk', 'protein'], benefit: 'provides protein for muscle repair' },
    { name: 'Digestive System', icon: '🌙', position: 'digestion', words: ['vegetable', 'salad', 'fruit', 'berry', 'nuts', 'bean', 'oat', 'rice', 'noodle', 'ramen', 'taco', 'gyoza', 'kyosa', 'cabbage', 'pineapple', 'herb', 'greens'], cautionWords: ['fried', 'fries', 'soda'], benefit: 'moves through digestion for nutrient absorption' },
    { name: 'Energy', icon: '⚡', position: 'energy', words: [], cautionWords: ['soda', 'dessert'], benefit: 'supplies energy for the whole body', includeAll: true },
    { name: 'Bones', icon: '🦴', position: 'bones', words: ['milk', 'latte', 'cheese', 'yogurt', 'almond', 'tofu', 'fish', 'salmon', 'leafy', 'cabbage', 'greens'], benefit: 'can contribute calcium and bone nutrients' }
  ];

  return systems.map((system) => buildPrimaryImpact(system, todayMeals, totalCalories));
}

function buildDashboardAiInsightCards({ todayMeals, calories, calorieGoal, nutrition, impacts, todaySignals }) {
  if (!todayMeals.length) {
    return [{
      icon: '✨',
      title: 'Insights start after your first meal',
      highlight: 'Log a breakfast, lunch, or snack to unlock stronger AI guidance.',
      items: [
        'Top supports will show which systems your food helps most.',
        'Calorie drivers will spotlight what is pushing the day upward.',
        'Watch-outs will flag sugar, sodium, fiber, and meal balance.'
      ],
      tone: 'neutral'
    }];
  }

  const topSupports = impacts
    .filter((impact) => impact.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  const calorieDrivers = [...todayMeals]
    .sort((left, right) => (Number(right.calories) || 0) - (Number(left.calories) || 0))
    .slice(0, 3);

  const scoredMeals = todayMeals
    .map((meal) => ({ meal, analysis: analyzeMealQuality(meal) }))
    .sort((left, right) => right.analysis.score - left.analysis.score);
  const bestMeal = scoredMeals[0];
  const weakMeal = [...scoredMeals].reverse()[0];

  const micronutrientSummary = summarizeMicronutrients(todayMeals);
  const watchItems = [];
  if (calorieGoal && calories > calorieGoal) {
    watchItems.push(`${(calories - calorieGoal).toLocaleString()} calories over goal today.`);
  }
  if ((micronutrientSummary.sodium || 0) >= 2) {
    watchItems.push('Salt-heavy foods are stacking up today.');
  }
  if (todaySignals.sugaryDrinks >= 2) {
    watchItems.push(`${todaySignals.sugaryDrinks} sugary drinks were logged today.`);
  }
  if (!todaySignals.fiberMeals) {
    watchItems.push('Fiber is still missing from today’s meals.');
  }
  if (todaySignals.friedMeals >= 2) {
    watchItems.push('Multiple fried foods were logged today.');
  }
  if (!watchItems.length) {
    watchItems.push('No major red flags stand out right now.');
    if (nutrition >= 70) watchItems.push('Today’s balance is holding up reasonably well.');
  }

  return [
    {
      icon: '🌿',
      title: 'Strongest supports',
      highlight: topSupports.length ? `${topSupports[0].name} leads today at ${topSupports[0].score}%.` : 'No strong support signals yet.',
      items: topSupports.length
        ? topSupports.map((impact) => `${impact.icon} ${impact.name} ${impact.score}%`)
        : ['Log a few meals to show which body areas your food supports most.'],
      tone: 'support'
    },
    {
      icon: '🔥',
      title: 'Top calorie drivers',
      highlight: calorieDrivers.length ? `${calorieDrivers[0].food_name} is the biggest driver so far.` : 'No calorie drivers yet.',
      items: calorieDrivers.map((meal) => `${meal.food_name} · ${Number(meal.calories || 0).toLocaleString()} cal · ${estimateMealHealthScore(meal)}/100`),
      tone: 'neutral'
    },
    {
      icon: '🏅',
      title: 'Best meal choice',
      highlight: bestMeal ? `${bestMeal.meal.food_name} scored ${bestMeal.analysis.score}/100.` : 'No best meal yet.',
      items: bestMeal ? [
        bestMeal.analysis.reasons.length
          ? `Why it worked: ${bestMeal.analysis.reasons.join(', ')}.`
          : 'This meal had the strongest balance today.',
        bestMeal.analysis.swap
          ? `Keep in mind: ${bestMeal.analysis.swap}`
          : 'No obvious swap needed right now.'
      ] : ['Log meals to identify your best choice today.'],
      tone: 'support'
    },
    {
      icon: '⚠️',
      title: 'Watch today',
      highlight: weakMeal ? `${weakMeal.meal.food_name} needs the most attention at ${weakMeal.analysis.score}/100.` : 'No weak meal yet.',
      items: weakMeal ? [
        ...watchItems.slice(0, 2),
        weakMeal.analysis.swap || 'A lighter, simpler next meal would improve the day.'
      ] : watchItems.slice(0, 3),
      tone: watchItems[0] === 'No major red flags stand out right now.' ? 'neutral' : 'warning'
    }
  ];
}

function renderBodyInsightsPage({ todayMeals, calories, calorieGoal, nutrition, impacts, recommendations, todaySignals }) {
  const leftColumn = document.getElementById('bodyMapLeft');
  const rightColumn = document.getElementById('bodyMapRight');
  const focusCards = document.getElementById('bodyFocusCards');
  const actionList = document.getElementById('bodyActionList');
  const foodSuggestions = document.getElementById('bodyFoodSuggestions');
  const bodyFigure = document.querySelector('.body-map-figure');
  if (!leftColumn || !rightColumn || !focusCards || !actionList || !foodSuggestions) return;

  const member = appState.currentMember;
  const savedSex = String(appState.profileMeasurements[member?.id]?.sex || member?.sex || '').trim().toLowerCase();
  const inferredMale = /\b(dad|papa|father)\b/i.test(member?.name || '');
  if (bodyFigure) bodyFigure.dataset.avatarSex = savedSex === 'male' || (!savedSex && inferredMale) ? 'male' : 'female';

  const leftPositions = ['brain', 'liver', 'muscles', 'joints', 'immunity', 'energy'];
  const rightPositions = ['heart', 'eyes', 'digestion', 'skin', 'recovery', 'bones'];
  const orderedLeft = leftPositions.map((position) => impacts.find((impact) => impact.position === position)).filter(Boolean);
  const orderedRight = rightPositions.map((position) => impacts.find((impact) => impact.position === position)).filter(Boolean);
  const hasMeals = todayMeals.length > 0;

  leftColumn.innerHTML = orderedLeft.map(renderBodySystemCard).join('');
  rightColumn.innerHTML = orderedRight.map(renderBodySystemCard).join('');
  document.querySelectorAll('.body-system-card[data-body-system]').forEach((card) => {
    const position = card.dataset.bodySystem;
    card.addEventListener('mouseenter', () => setBodyMapSpotlightActive(position, true));
    card.addEventListener('mouseleave', () => setBodyMapSpotlightActive(position, false));
    card.addEventListener('focusin', () => setBodyMapSpotlightActive(position, true));
    card.addEventListener('focusout', () => setBodyMapSpotlightActive(position, false));
    card.addEventListener('click', () => card.focus({ preventScroll: true }));
  });

  const topImpact = [...impacts].sort((left, right) => right.score - left.score)[0];
  const zeroSystems = impacts.filter((impact) => impact.score === 0).slice(0, 2);
  const calorieDelta = calorieGoal ? calories - calorieGoal : 0;
  const focusItems = [
    {
      icon: topImpact?.icon || '🌿',
      label: 'Top support',
      value: hasMeals && topImpact ? `${topImpact.name} · ${bodySignalLabel(topImpact.score)}` : 'No signals yet',
      copy: hasMeals && topImpact ? topImpact.copy : 'Log meals to see your strongest body support.'
    },
    {
      icon: '⚠️',
      label: 'Watch-out',
      value: !hasMeals
        ? 'Waiting for meals'
        : calorieGoal && calorieDelta > 0 ? `${calorieDelta.toLocaleString()} cal over` : (todaySignals.friedMeals >= 2 ? 'Fried foods stacking' : 'No major red flags'),
      copy: !hasMeals
        ? 'Body watch-outs will appear after you log food today.'
        : calorieGoal && calorieDelta > 0
        ? 'Keep the next meal lighter and add water or movement.'
        : todaySignals.friedMeals >= 2
          ? 'Choose one simpler meal to steady digestion and energy.'
          : 'Your current food pattern looks fairly stable.'
    },
    {
      icon: '🧩',
      label: 'Still missing',
      value: !hasMeals ? 'Start with your first meal' : zeroSystems.length ? zeroSystems.map((impact) => impact.name).join(' + ') : 'Good system coverage',
      copy: !hasMeals
        ? 'The body map will fill in once today’s meals are logged.'
        : zeroSystems.length
        ? 'No matching food signal was found for these areas in today’s diary.'
        : 'Most body systems have at least one food signal today.'
    },
    {
      icon: '🎯',
      label: 'AI focus',
      value: nutrition >= 75 ? 'Protect your balance' : 'Improve the next meal',
      copy: recommendations[0]?.copy || 'Add one protein, one fiber source, and enough water.'
    }
  ];

  focusCards.innerHTML = focusItems.map((item) => `
    <article class="body-focus-card">
      <span>${item.icon}</span>
      <small>${escapeHtml(item.label)}</small>
      <strong>${escapeHtml(item.value)}</strong>
      <p>${escapeHtml(item.copy)}</p>
    </article>
  `).join('');

  renderBodyFoodSuggestions(impacts);

  actionList.innerHTML = recommendations.slice(0, 4).map((item) => `
    <article class="recommendation-item body-action-item">
      <span>${item.icon}</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.copy)}</p>
      </div>
    </article>
  `).join('');
}

function bodySignalLabel(score) {
  const value = clampScore(score || 0);
  if (!value) return 'No signal yet (0%)';
  if (value < 35) return `Building (${value}%)`;
  if (value < 70) return `Steady signal (${value}%)`;
  return `Strong signal (${value}%)`;
}

function getBodyFoodSuggestion(position) {
  const options = bodyFoodSuggestionCatalog[position] || [];
  if (!options.length) return null;
  const offset = bodySuggestionOffsets[position] || 0;
  return options[offset % options.length];
}

function renderBodyFoodSuggestions(impacts) {
  const container = document.getElementById('bodyFoodSuggestions');
  if (!container) return;
  const suggestions = [...impacts]
    .filter((impact) => bodyFoodSuggestionCatalog[impact.position]?.length)
    .sort((left, right) => left.score - right.score)
    .slice(0, 3)
    .map((impact) => ({ impact, suggestion: getBodyFoodSuggestion(impact.position) }))
    .filter((item) => item.suggestion);

  container.innerHTML = suggestions.map(({ impact, suggestion }) => `
    <article class="body-food-suggestion-card">
      <header>
        <span>${impact.icon}</span>
        <div><small>${escapeHtml(impact.name)} · ${escapeHtml(bodySignalLabel(impact.score))}</small><strong>${escapeHtml(suggestion.name)}</strong></div>
      </header>
      <p>${escapeHtml(suggestion.why)}</p>
      <footer>
        <button class="body-suggestion-add" data-body-suggestion-add="${escapeAttr(impact.position)}" type="button">＋ Add to diary</button>
        <button data-body-suggestion-rotate="${escapeAttr(impact.position)}" type="button">Another idea</button>
      </footer>
    </article>
  `).join('');
}

function handleAddBodyFoodSuggestion(position) {
  const suggestion = getBodyFoodSuggestion(position);
  if (!suggestion) return;
  openMealModal(null);
  const foodName = document.getElementById('editFoodName');
  if (foodName) {
    foodName.value = suggestion.name;
    foodName.focus();
  }
}

function rotateBodyFoodSuggestion(position) {
  const options = bodyFoodSuggestionCatalog[position] || [];
  if (!options.length) return;
  bodySuggestionOffsets[position] = ((bodySuggestionOffsets[position] || 0) + 1) % options.length;
  const todayMeals = getMemberMeals().filter(isToday);
  const calories = sum(todayMeals, 'calories');
  const impacts = [...buildFoodBodyImpacts(todayMeals, calories), ...buildSecondaryFoodBodyImpacts(todayMeals, calories)];
  renderBodyFoodSuggestions(impacts);
}

function renderBodySystemCard(impact) {
  const tone = impact.score >= 70 ? 'good' : impact.score >= 35 ? 'steady' : 'low';
  return `
    <article class="body-system-card body-system-card-${tone}" data-body-system="${escapeAttr(impact.position)}" data-body-score="${impact.score}" tabindex="0">
      <div class="body-system-card-header">
        <span>${impact.icon}</span>
        <div>
          <strong>${escapeHtml(impact.name)}</strong>
          <b class="body-signal-label">${escapeHtml(bodySignalLabel(impact.score))}</b>
        </div>
      </div>
      <p title="${escapeAttr(impact.copy)}">${escapeHtml(impact.copy)}</p>
    </article>
  `;
}

function setBodyMapSpotlightActive(position, active) {
  const figure = document.querySelector('.body-map-figure');
  const hotspot = figure?.querySelector(`[data-body-hotspot="${position}"]`);
  const card = document.querySelector(`.body-system-card[data-body-system="${position}"]`);
  const label = document.getElementById('bodyMapActiveLabel');
  if (!figure || !hotspot) return;

  figure.classList.toggle('is-inspecting', active);
  figure.dataset.activeSystem = active ? position : '';
  hotspot.classList.toggle('is-active', active);
  card?.classList.toggle('is-active', active);
  if (label) {
    label.textContent = active ? card?.querySelector('strong')?.textContent || '' : '';
    label.classList.toggle('is-active', active);
  }
}

function buildSecondaryFoodBodyImpacts(todayMeals, totalCalories) {
  const systems = [
    {
      name: 'Liver',
      icon: '🧽',
      position: 'liver',
      supportWords: ['coffee', 'tea', 'greens', 'broccoli', 'spinach', 'garlic', 'walnut', 'salmon', 'fish', 'tofu', 'berry', 'cabbage', 'herb'],
      cautionWords: ['fried', 'fries', 'soda', 'soft serve', 'dessert', 'bacon'],
      benefit: 'foods logged today include ingredients commonly associated with liver-supportive nutrients'
    },
    {
      name: 'Eyes',
      icon: '👁️',
      position: 'eyes',
      supportWords: ['carrot', 'spinach', 'leafy', 'egg', 'salmon', 'tuna', 'mango', 'orange', 'pumpkin', 'greens', 'cabbage'],
      cautionWords: ['soda', 'dessert'],
      benefit: 'foods logged today include nutrients often linked to eye support'
    },
    {
      name: 'Joints / Knees',
      icon: '🦵',
      position: 'joints',
      supportWords: ['salmon', 'tuna', 'fish', 'ginger', 'olive', 'berry', 'nuts', 'turmeric', 'yogurt', 'herb'],
      cautionWords: ['fried', 'burger', 'fries'],
      benefit: 'foods logged today include ingredients often associated with joint-friendly eating'
    },
    {
      name: 'Skin',
      icon: '✨',
      position: 'skin',
      supportWords: ['avocado', 'salmon', 'nuts', 'berry', 'tomato', 'yogurt', 'orange', 'mango', 'pineapple', 'cabbage', 'greens'],
      cautionWords: ['soda', 'dessert', 'frappe'],
      benefit: 'foods logged today include nutrients commonly linked to skin support'
    },
    {
      name: 'Immunity',
      icon: '🛡️',
      position: 'immunity',
      supportWords: ['orange', 'berry', 'fruit', 'yogurt', 'garlic', 'ginger', 'tea', 'vegetable', 'greens', 'pineapple', 'cabbage', 'herb'],
      cautionWords: ['soda'],
      benefit: 'foods logged today include ingredients often associated with immune support'
    },
    {
      name: 'Recovery',
      icon: '🔧',
      position: 'recovery',
      supportWords: ['chicken', 'fish', 'salmon', 'egg', 'tofu', 'yogurt', 'protein', 'milk', 'beef', 'pork', 'grilled'],
      cautionWords: ['dessert'],
      benefit: 'foods logged today include protein and recovery-oriented building blocks'
    }
  ];

  return systems.map((system) => buildSecondaryImpact(system, todayMeals, totalCalories));
}

function buildSecondaryImpact(system, meals, totalCalories) {
  const matchedMeals = meals.filter((meal) => countKeywordHits(foodSearchText(meal), system.supportWords) > 0);
  const matchedCalories = matchedMeals.reduce((total, meal) => total + (Number(meal.calories) || 0), 0);
  const supportHits = countUniqueKeywords(matchedMeals, system.supportWords);
  const cautionHits = meals.filter((meal) => system.cautionWords.some((word) => foodSearchText(meal).includes(word))).length;
  const avgHealth = matchedMeals.length
    ? matchedMeals.reduce((total, meal) => total + estimateMealHealthScore(meal), 0) / matchedMeals.length
    : 0;
  const baseScore = matchedMeals.length
    ? (Math.min(supportHits, 6) * 8)
      + (Math.min(matchedMeals.length, 3) * 8)
      + ((Math.min(matchedCalories, 650) / 650) * 18)
      + ((avgHealth / 100) * 14)
      - (cautionHits * 10)
    : 0;
  const score = clampScore(baseScore);
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

function buildPrimaryImpact(system, meals, totalCalories) {
  const matchedMeals = system.includeAll
    ? meals.filter((meal) => Number(meal.calories) > 0)
    : meals.filter((meal) => countKeywordHits(foodSearchText(meal), system.words) > 0);
  const matchedCalories = matchedMeals.reduce((total, meal) => total + (Number(meal.calories) || 0), 0);
  const keywordHits = system.includeAll
    ? Math.max(matchedMeals.length, Math.round(matchedCalories / 180))
    : countUniqueKeywords(matchedMeals, system.words);
  const cautionHits = (system.cautionWords || []).length
    ? meals.filter((meal) => system.cautionWords.some((word) => foodSearchText(meal).includes(word))).length
    : 0;
  const avgHealth = matchedMeals.length
    ? matchedMeals.reduce((total, meal) => total + estimateMealHealthScore(meal), 0) / matchedMeals.length
    : 0;
  const baseScore = system.includeAll
    ? (Math.min(totalCalories, 1200) / 1200) * 42
      + (Math.min(matchedMeals.length, 5) * 7)
      + ((avgHealth / 100) * 14)
      - (cautionHits * 8)
    : matchedMeals.length
      ? (Math.min(keywordHits, 7) * 8)
        + (Math.min(matchedMeals.length, 4) * 7)
        + ((Math.min(matchedCalories, 800) / 800) * 16)
        + ((avgHealth / 100) * 12)
        - (cautionHits * 10)
      : 0;
  const score = clampScore(baseScore);
  const names = matchedMeals.map((meal) => meal.food_name).filter(Boolean);
  const foodList = names.length ? names.join(', ') : 'No matching food logged';
  const copy = names.length ? `${foodList} — ${system.benefit}.` : `${foodList} yet.`;
  return { name: system.name, score, icon: system.icon, copy, position: system.position, compact: false };
}

function foodSearchText(meal) {
  return [
    meal.food_name,
    notesWithoutSystemMetadata(meal.notes),
    meal.restaurant_name,
    getMealIngredients(meal).join(' '),
    getMealScanTags(meal).join(' ')
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function countKeywordHits(text, words = []) {
  return words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

function countUniqueKeywords(meals, words = []) {
  const combinedText = meals.map((meal) => foodSearchText(meal)).join(' ');
  return new Set(words.filter((word) => combinedText.includes(word))).size;
}

function buildRecommendations({ memberMeals, todayMeals, calories, calorieGoal, steps, glucose, mealCount, nutrition }) {
  const items = [];
  const todaySignals = analyzeMealPatternSignals(todayMeals);
  const weekSignals = analyzeMealPatternSignals(memberMeals.filter((meal) => {
    const timestamp = new Date(meal.eaten_at || meal.created_at).getTime();
    return Number.isFinite(timestamp) && timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }));

  const calorieRecommendation = buildCalorieRecommendation(calories, calorieGoal, mealCount);
  if (calorieRecommendation) items.push(calorieRecommendation);

  const missingToday = buildMissingTodayRecommendation(todaySignals, mealCount);
  if (missingToday) items.push(missingToday);

  const recoveryMode = buildRecoveryRecommendation({
    todaySignals,
    calories,
    calorieGoal,
    steps,
    glucose
  });
  if (recoveryMode) items.push(recoveryMode);

  const patternAlert = buildPatternAlertRecommendation(weekSignals, todaySignals);
  if (patternAlert) items.push(patternAlert);

  const micronutrientRecommendation = buildMicronutrientRecommendation(todayMeals);
  if (micronutrientRecommendation) items.push(micronutrientRecommendation);

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

  if (nutrition < 65 && mealCount) {
    items.push({ icon: '🌈', title: 'Add more color', copy: 'A fruit or vegetable can improve today’s nutrition balance.' });
  }

  return dedupeRecommendations(items).slice(0, 5);
}

function buildCalorieRecommendation(calories, calorieGoal, mealCount) {
  if (!mealCount) {
    return { icon: '🥗', title: 'Start with a balanced meal', copy: 'Add protein, vegetables, and a steady-energy carbohydrate.' };
  }
  if (calories < calorieGoal * .55) {
    return {
      icon: '🍲',
      title: 'Fuel the rest of your day',
      copy: `You have about ${Math.max(calorieGoal - calories, 0).toLocaleString()} calories remaining toward your goal.`
    };
  }
  if (calories > calorieGoal) {
    return {
      icon: '🥬',
      title: 'You’re over today’s calorie goal',
      copy: `About ${(calories - calorieGoal).toLocaleString()} calories over. Favor vegetables, lean protein, water, and a lighter next meal.`
    };
  }
  return { icon: '✓', title: 'Calories are pacing well', copy: 'Your intake is tracking close to today’s energy target.' };
}

function analyzeMealPatternSignals(meals) {
  const proteinWords = ['chicken', 'beef', 'fish', 'salmon', 'egg', 'tofu', 'yogurt', 'protein', 'pork', 'bean', 'shrimp'];
  const fiberWords = ['vegetable', 'greens', 'salad', 'cabbage', 'fruit', 'berry', 'bean', 'oat', 'pineapple', 'broccoli', 'spinach'];
  const vegetableWords = ['vegetable', 'greens', 'salad', 'cabbage', 'broccoli', 'spinach', 'carrot', 'tomato'];
  const fruitWords = ['fruit', 'berry', 'pineapple', 'banana', 'apple', 'orange', 'mango', 'watermelon'];
  const friedWords = ['fried', 'fries', 'crispy'];
  const processedWords = ['fish ball', 'fish balls', 'sausage', 'nugget', 'bacon', 'ham', 'processed'];
  const hydrationWords = ['water', 'tea', 'sparkling water'];

  const stats = meals.reduce((totals, meal) => {
    const searchText = foodSearchText(meal);
    const mealType = getMealType(meal) || inferMealTypeFromTimestamp(meal.eaten_at || meal.created_at);
    const calories = Number(meal.calories) || 0;
    const dayKey = mealDayKey(meal);
    const hasAny = (words) => words.some((word) => searchText.includes(word));
    const hasProtein = hasAny(proteinWords);
    const hasFiber = hasAny(fiberWords);
    const hasVegetables = hasAny(vegetableWords);
    const hasFruit = hasAny(fruitWords);
    const isSugaryDrink = isSugaryDrinkMeal(meal);
    const isFried = hasAny(friedWords);
    const isProcessed = hasAny(processedWords);
    const isLate = isLateMeal(meal);
    const isDessert = mealType === 'dessert' || ['cake', 'pie', 'pastry', 'cookie', 'brownie', 'ice cream', 'soft serve', 'dessert'].some((word) => searchText.includes(word));
    const isHydrationFriendly = hasAny(hydrationWords);

    totals.mealCount += 1;
    totals.calories += calories;
    if (hasProtein) totals.proteinMeals += 1;
    if (hasFiber) totals.fiberMeals += 1;
    if (hasVegetables) totals.vegetableMeals += 1;
    if (hasFruit) totals.fruitMeals += 1;
    if (isSugaryDrink) totals.sugaryDrinks += 1;
    if (isFried) totals.friedMeals += 1;
    if (isProcessed) totals.processedMeals += 1;
    if (isLate) totals.lateMeals += 1;
    if (isDessert) totals.dessertMeals += 1;
    if (isHydrationFriendly) totals.hydrationFriendlyMeals += 1;
    if (!hasProtein && !hasFiber && ['rice', 'plain rice', 'steamed rice', 'white rice', 'bread', 'toast', 'baguette', 'noodle', 'pasta'].some((word) => searchText.includes(word))) {
      totals.plainStapleMeals += 1;
    }
    if (mealType === 'breakfast' || mealType === 'brunch') {
      totals.breakfastCount += 1;
      if (dayKey) {
        totals.breakfastDayMap[dayKey] = totals.breakfastDayMap[dayKey] || { hadProtein: false };
        if (hasProtein) totals.breakfastDayMap[dayKey].hadProtein = true;
      }
    }
    if (mealType === 'lunch') {
      totals.lunchCount += 1;
      if (dayKey) {
        totals.lunchDayMap[dayKey] = totals.lunchDayMap[dayKey] || { hadVegetablesOrFiber: false };
        if (hasVegetables || hasFiber) totals.lunchDayMap[dayKey].hadVegetablesOrFiber = true;
      }
    }
    if (mealType === 'snack' && calories >= 300 && !hasProtein) totals.heavySnackCount += 1;
    return totals;
  }, {
    mealCount: 0,
    calories: 0,
    proteinMeals: 0,
    fiberMeals: 0,
    vegetableMeals: 0,
    fruitMeals: 0,
    sugaryDrinks: 0,
    friedMeals: 0,
    processedMeals: 0,
    lateMeals: 0,
    dessertMeals: 0,
    hydrationFriendlyMeals: 0,
    plainStapleMeals: 0,
    breakfastCount: 0,
    lowProteinBreakfasts: 0,
    lunchCount: 0,
    lowVegLunches: 0,
    heavySnackCount: 0,
    breakfastDayMap: {},
    lunchDayMap: {}
  });

  const breakfastDays = Object.keys(stats.breakfastDayMap);
  const lunchDays = Object.keys(stats.lunchDayMap);
  stats.breakfastDayCount = breakfastDays.length;
  stats.lowProteinBreakfasts = breakfastDays.filter((day) => !stats.breakfastDayMap[day].hadProtein).length;
  stats.lunchDayCount = lunchDays.length;
  stats.lowVegLunches = lunchDays.filter((day) => !stats.lunchDayMap[day].hadVegetablesOrFiber).length;
  delete stats.breakfastDayMap;
  delete stats.lunchDayMap;
  return stats;
}

function buildMissingTodayRecommendation(signals, mealCount) {
  if (!mealCount) return null;
  if (!signals.proteinMeals) {
    return {
      icon: '💪',
      title: 'Protein is missing today',
      copy: 'Add eggs, fish, tofu, yogurt, beans, or chicken in the next meal for better fullness and recovery.'
    };
  }
  if (!signals.vegetableMeals && signals.fiberMeals < Math.max(1, Math.ceil(mealCount / 2))) {
    return {
      icon: '🥦',
      title: 'Fiber and vegetables are light',
      copy: 'A side of greens, cabbage, beans, or fruit would improve today’s wellness balance.'
    };
  }
  if (!signals.fruitMeals && signals.sugaryDrinks >= 1) {
    return {
      icon: '🍎',
      title: 'Swap sweetness for whole fruit',
      copy: 'You logged a sweet drink today. Fruit or unsweetened tea would give a steadier lift.'
    };
  }
  if (signals.plainStapleMeals >= 1 && signals.vegetableMeals < mealCount) {
    return {
      icon: '🍚',
      title: 'One meal needs more support',
      copy: 'A plain staple was logged today. Add protein or vegetables next time to make it more complete.'
    };
  }
  return null;
}

function buildRecoveryRecommendation({ todaySignals, calories, calorieGoal, steps, glucose }) {
  if (calories > calorieGoal + 250) {
    return {
      icon: '🌿',
      title: 'Recovery mode for the next meal',
      copy: 'Go lighter next: protein, vegetables, water, and a short walk will help reset the day.'
    };
  }
  if (todaySignals.sugaryDrinks >= 2) {
    return {
      icon: '🧃',
      title: 'Sugar load is climbing',
      copy: 'Pause sweet drinks for the rest of today. Water or unsweetened tea is the cleanest recovery move.'
    };
  }
  if (todaySignals.friedMeals >= 2 || todaySignals.processedMeals >= 2) {
    return {
      icon: '🍳',
      title: 'Balance out the heavier meals',
      copy: 'Choose grilled, steamed, or broth-based foods next, and add produce to smooth out the day.'
    };
  }
  if (todaySignals.lateMeals >= 1 && steps < 7000) {
    return {
      icon: '🌙',
      title: 'Late meal recovery',
      copy: 'Keep tonight lighter, hydrate well, and add a short walk if possible to support digestion.'
    };
  }
  if (glucose > 140) {
    return {
      icon: '🫛',
      title: 'Steady the next meal',
      copy: 'Build the next plate around protein and fiber, and skip another dessert or sweet drink for now.'
    };
  }
  return null;
}

function buildPatternAlertRecommendation(weekSignals, todaySignals = {}) {
  if (!weekSignals.mealCount) return null;
  if (weekSignals.sugaryDrinks >= 3) {
    return {
      icon: '⚠️',
      title: 'Pattern alert: sweet drinks',
      copy: `${weekSignals.sugaryDrinks} sugary drinks were logged in the last 7 days. Cutting one or two would improve energy and calories fast.`
    };
  }
  const morningPatternRatio = weekSignals.breakfastDayCount
    ? weekSignals.lowProteinBreakfasts / weekSignals.breakfastDayCount
    : 0;
  const lunchPatternRatio = weekSignals.lunchDayCount
    ? weekSignals.lowVegLunches / weekSignals.lunchDayCount
    : 0;
  const todayBreakfastRecovered = (todaySignals.breakfastDayCount || 0) > 0 && (todaySignals.lowProteinBreakfasts || 0) === 0;
  const todayLunchRecovered = (todaySignals.lunchDayCount || 0) > 0 && (todaySignals.lowVegLunches || 0) === 0;

  if (!todayBreakfastRecovered && weekSignals.lowProteinBreakfasts >= 2 && weekSignals.breakfastDayCount >= 3 && morningPatternRatio >= 0.5) {
    return {
      icon: '🍳',
      title: 'Pattern alert: low-protein mornings',
      copy: `${weekSignals.lowProteinBreakfasts} mornings were light on protein this week. Eggs, yogurt, tofu, or nuts would help.`
    };
  }
  if (!todayLunchRecovered && weekSignals.lowVegLunches >= 2 && weekSignals.lunchDayCount >= 3 && lunchPatternRatio >= 0.5) {
    return {
      icon: '🥗',
      title: 'Pattern alert: low-veg lunches',
      copy: `${weekSignals.lowVegLunches} lunch periods were missing vegetables or fiber this week. Adding one side could shift the trend.`
    };
  }
  if (weekSignals.lateMeals >= 3) {
    return {
      icon: '⏰',
      title: 'Pattern alert: late eating',
      copy: `${weekSignals.lateMeals} meals were logged late this week. An earlier dinner a few times could improve recovery.`
    };
  }
  if (weekSignals.processedMeals >= 3) {
    return {
      icon: '📦',
      title: 'Pattern alert: processed foods',
      copy: `${weekSignals.processedMeals} processed-style meals showed up this week. Swapping even one for a simpler meal would help.`
    };
  }
  return null;
}

function buildMicronutrientRecommendation(todayMeals) {
  if (!todayMeals.length) return null;
  const summary = summarizeMicronutrients(todayMeals);
  if (summary.sodium >= 2) {
    return {
      icon: '🧂',
      title: 'Sodium may be stacking up',
      copy: 'Sauces, soup, processed items, or fried foods may be pushing salt higher today. Water and simpler foods would help.'
    };
  }
  if (!summary.fiber) {
    return {
      icon: '🥬',
      title: 'Fiber support is still missing',
      copy: 'Whole fruit, beans, oats, greens, or vegetables would improve digestion and fullness.'
    };
  }
  if (!summary['vitamin-c']) {
    return {
      icon: '🍊',
      title: 'Vitamin C foods are light',
      copy: 'Fruit, tomatoes, cabbage, broccoli, or citrus would add a useful micronutrient lift today.'
    };
  }
  if (!summary.calcium) {
    return {
      icon: '🦴',
      title: 'Calcium support is low today',
      copy: 'Yogurt, milk, tofu, greens, or fish would help round out the day better.'
    };
  }
  if (!summary['omega-3']) {
    return {
      icon: '🐟',
      title: 'Omega-3 support is missing',
      copy: 'Fish, salmon, tuna, or walnuts would improve the nutrient mix for heart and brain support.'
    };
  }
  if ((summary.fiber || 0) >= 2 && (summary['vitamin-c'] || 0) >= 1 && (summary.iron || 0) >= 1) {
    return {
      icon: '🧬',
      title: 'Micronutrients look more balanced',
      copy: 'You already logged fiber, vitamin C, and iron-supportive foods today. That is a strong baseline to keep going.'
    };
  }
  return null;
}

function dedupeRecommendations(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.title}|${item.copy}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
    groupedMarkup || dashboardMealEmptyState(emptyMessage);
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

  const meal = editingMealId ? appState.meals.find((item) => item.id === editingMealId) : null;
  if (meal?.photo_url) {
    const signature = getEditEstimateSignature();
    if (signature !== lastEditEstimateSignature) {
      await applyEditAiCalorieEstimate();
    }
  }

  const fields = {
    food_name: foodName,
    restaurant_name: document.getElementById('editRestaurant').value.trim(),
    location_name: document.getElementById('editLocation').value.trim(),
    price: numberOrNull(document.getElementById('editPrice').value),
    calories: numberOrNull(document.getElementById('editCalories').value),
    notes: notesWithMealType(document.getElementById('editNotes').value, mealType, editingMealId ? {
      scanIngredients: getMealIngredients(appState.meals.find((item) => item.id === editingMealId)),
      scanTags: getMealScanTags(appState.meals.find((item) => item.id === editingMealId))
    } : {})
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
  const pendingMeal = normalizeMeal({ ...meal, _sync_status: 'pending' });
  appState.meals.unshift(pendingMeal);
  saveStoredAppData();
  renderAll();
  let finalMeal = pendingMeal;
  if (window.familyBitesDb?.isConfigured) {
    try {
      const savedMeal = await window.familyBitesDb.saveMeal(pendingMeal);
      finalMeal = normalizeMeal(savedMeal);
      appState.meals = appState.meals.map((item) => item.id === pendingMeal.id ? finalMeal : item);
      saveStoredAppData();
      renderAll();
    } catch (error) {
      console.warn('Meal saved locally but Supabase write failed.', error);
      showAppNotice('Meal saved on this device and will sync when the connection returns.', 'warning');
    }
  }
  return finalMeal;
}

async function handleDeleteMeal(mealId) {
  const meal = appState.meals.find((item) => item.id === mealId);
  if (!meal) return;
  if (!confirm(`Delete "${meal.food_name}"?`)) return;

  if (window.familyBitesDb?.isConfigured && looksLikeUuid(mealId)) {
    try {
      await window.familyBitesDb.deleteMeal(mealId);
    } catch (error) {
      console.warn('Meal delete failed.', error);
      showAppNotice('Could not delete this meal. Check your connection and try again.', 'error');
      return;
    }
  }
  appState.meals = appState.meals.filter((item) => item.id !== mealId);
  saveStoredAppData();
  renderAll();
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
    const analysis = analyzeMealQuality(meal);
    const health = analysis.score;
    const description = mealDescriptionSummary(meal);
    const compactReasons = analysis.reasons.slice(0, 1);
    const secondaryDetail = description || analysis.swap || '';
    const micronutrients = buildMicronutrientChips(analysis.micronutrientHighlights.slice(0, 2), 'timeline');
    const mobileImage = meal.photo_url
      ? `<img class="timeline-mobile-photo" src="${escapeAttr(meal.photo_url)}" alt="${escapeAttr(meal.food_name)}">`
      : `<span class="timeline-mobile-emoji">${mealEmoji(meal.food_name)}</span>`;
    return `
      <article class="timeline-item">
        <details class="timeline-mobile-card">
          <summary class="timeline-mobile-summary">
            ${mobileImage}
            <div class="timeline-mobile-copy">
              <h4>${escapeHtml(meal.food_name)}</h4>
              <span class="meal-health-pill meal-health-pill-${healthTone(health)}">${escapeHtml(analysis.label)} · ${health}/100</span>
              <p class="timeline-mobile-statline">${escapeHtml(timelineCompactStats(meal))}</p>
              <small class="timeline-mobile-submeta">${escapeHtml(timelineCompactSubmeta(meal))}</small>
            </div>
          </summary>
          <div class="timeline-mobile-extra">
            <div class="timeline-mobile-facts">
              <span>${escapeHtml(formatTimelineDate(meal.eaten_at))}</span>
              <span>${escapeHtml(meal.restaurant_name || getMealTypeLabel(meal) || 'Saved meal')}</span>
            </div>
            ${compactReasons.length ? `
              <div class="meal-health-reasons timeline-mobile-reasons" aria-label="Meal breakdown">
                ${compactReasons.map((reason) => `<span class="meal-reason-chip">${escapeHtml(reason)}</span>`).join('')}
              </div>` : ''}
            ${micronutrients}
            ${description ? `<small class="meal-description timeline-mobile-description">${escapeHtml(description)}</small>` : ''}
            ${analysis.swap ? `<small class="meal-description timeline-mobile-description timeline-mobile-swap"><span>Better choice:</span> ${escapeHtml(analysis.swap)}</small>` : ''}
            <div class="meal-actions timeline-actions timeline-mobile-actions" aria-label="Actions for ${escapeAttr(meal.food_name)}">
              <button class="meal-edit-button" type="button" data-edit-meal="${escapeAttr(meal.id)}">✏️ Edit</button>
              <button class="meal-delete-button" type="button" data-delete-meal="${escapeAttr(meal.id)}">🗑 Delete</button>
            </div>
          </div>
        </details>
        <div class="timeline-food-cell">
          ${meal.photo_url
            ? `<img class="timeline-food-photo" src="${escapeAttr(meal.photo_url)}" alt="${escapeAttr(meal.food_name)}">`
            : `<span class="timeline-food-emoji">${mealEmoji(meal.food_name)}</span>`}
          <div>
            <h4>${escapeHtml(meal.food_name)}</h4>
            <span class="meal-health-pill meal-health-pill-${healthTone(health)}">${escapeHtml(analysis.label)} · ${health}/100</span>
            ${compactReasons.length ? `
              <div class="meal-health-reasons timeline-health-reasons" aria-label="Meal breakdown">
                ${compactReasons.map((reason) => `<span class="meal-reason-chip">${escapeHtml(reason)}</span>`).join('')}
              </div>` : ''}
            ${micronutrients}
            <p>${escapeHtml(buildTimelineMeta(meal))}</p>
            ${secondaryDetail ? `<small class="meal-description timeline-meal-description">${escapeHtml(secondaryDetail)}</small>` : ''}
          </div>
        </div>
        <span class="timeline-date">${formatTimelineDate(meal.eaten_at)}</span>
        <span class="timeline-time">${formatTimelineTime(meal.eaten_at)}</span>
        <span class="timeline-restaurant">${escapeHtml(meal.restaurant_name || '—')}</span>
        <strong class="timeline-calories">${Number(meal.calories || 0).toLocaleString()} cal</strong>
        <span class="timeline-health timeline-health-${healthTone(health)}">${health}/100</span>
        <div class="meal-actions timeline-actions timeline-desktop-actions" aria-label="Actions for ${escapeAttr(meal.food_name)}">
          <button class="meal-edit-button" type="button" data-edit-meal="${escapeAttr(meal.id)}">✏️ Edit</button>
          <button class="meal-delete-button" type="button" data-delete-meal="${escapeAttr(meal.id)}">🗑 Delete</button>
        </div>
      </article>
    `;
  }).join('') || emptyState('No meals match the current filters.');
}

function getCurrentMemberSnapScans() {
  return appState.snapScans
    .filter((scan) => scan.member_id === appState.currentMember?.id)
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
}

function buildSnapDisplayName(scan) {
  if (scan.food_name && scan.food_name !== 'Scanned food') return scan.food_name;
  const firstFood = scan.foods?.find((food) => normalizeScanLabel(food?.name));
  if (firstFood) return normalizeScanLabel(firstFood.name);
  if (scan.ingredients?.length) return formatScanLabel(scan.ingredients.slice(0, 2).join(', '));
  return 'Scanned food';
}

function isSnapLinkedToMeal(scan) {
  return Boolean(scan?.linked_meal_id && appState.meals.some((meal) => meal.id === scan.linked_meal_id));
}

function renderSnapAlbum() {
  const list = document.getElementById('snapAlbumList');
  if (!list) return;
  const scans = getCurrentMemberSnapScans();
  list.innerHTML = scans.map((scan) => {
    const linked = isSnapLinkedToMeal(scan);
    const mealType = getMealType(scan);
    const cleanNotes = notesWithoutMealType(scan.notes);
    const facts = uniqueList([
      ...scan.tags.map(formatScanLabel),
      ...scan.ingredients.slice(0, 3).map(formatScanLabel)
    ]).slice(0, 5);
    return `
      <article class="snap-saved-card">
        ${scan.photo_url
          ? `<img class="snap-saved-photo" src="${escapeAttr(scan.photo_url)}" alt="${escapeAttr(buildSnapDisplayName(scan))}">`
          : `<div class="snap-saved-photo"></div>`}
        <div class="snap-saved-copy">
          <h4>${escapeHtml(buildSnapDisplayName(scan))}</h4>
          <div class="snap-saved-meta">
            <span>${Number(scan.calories || 0).toLocaleString()} cal</span>
            <span>${escapeHtml(mealType ? dashboardMealTypeLabel(mealType) : 'Type not set')}</span>
            <span>${escapeHtml(scan.confidence || 'AI scan')}</span>
            <span>${escapeHtml(formatTimelineDate(scan.created_at))}</span>
            <span>${escapeHtml(formatTimelineTime(scan.created_at))}</span>
          </div>
          <div class="scan-chip-list">
            ${facts.map((fact) => `<span class="scan-chip ${scan.tags.some((tag) => formatScanLabel(tag) === fact) ? 'active' : ''}">${escapeHtml(fact)}</span>`).join('')}
          </div>
          ${scan.ai_note ? `<small>${escapeHtml(scan.ai_note)}</small>` : ''}
          ${cleanNotes ? `<p>${escapeHtml(cleanNotes)}</p>` : ''}
          ${linked ? '<span class="snap-saved-status">Added to food diary</span>' : '<span class="snap-saved-status">Not in food diary yet</span>'}
        </div>
        <div class="snap-saved-actions">
          <button class="primary-button" type="button" data-add-scan-meal="${escapeAttr(scan.id)}" ${linked ? 'disabled' : ''}>${linked ? 'Saved to diary' : 'Add to food diary'}</button>
          <button class="secondary-button" type="button" data-delete-scan="${escapeAttr(scan.id)}">Delete</button>
        </div>
      </article>
    `;
  }).join('') || emptyState('No saved scans yet. Scan a photo to start your album.');
}

function renderTimelineMemberFilter() {
  const select = document.getElementById('timelineMemberFilter');
  if (!select) return;
  const realMembers = appState.members.filter((member) => member.id !== 'add');
  const options = [
    { value: 'current', label: `Current profile${appState.currentMember ? ` (${appState.currentMember.name})` : ''}` },
    { value: 'all', label: 'All profiles' },
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

function mealDescriptionSummary(meal) {
  const note = notesWithoutMealType(meal?.notes);
  if (note) return note;
  const ingredients = getMealIngredients(meal);
  if (!ingredients.length) return '';
  return `Ingredients: ${ingredients.slice(0, 4).join(', ')}`;
}

function buildDashboardMealExtra(meal, analysis, actions = '') {
  const note = notesWithoutMealType(meal?.notes);
  const ingredients = getMealIngredients(meal);
  const sections = [];
  const health = analysis.score;
  const reasons = analysis.reasons.length ? `
      <div class="meal-health-reasons meal-extra-reasons" aria-label="Meal breakdown">
        ${analysis.reasons.map((reason) => `<span class="meal-reason-chip">${escapeHtml(reason)}</span>`).join('')}
      </div>` : '';
  sections.push(`<h4 class="meal-extra-name">${escapeHtml(meal.food_name)}</h4>`);
  sections.push(`<span class="meal-health-pill meal-health-pill-${healthTone(health)}">${escapeHtml(analysis.label)} · ${health}/100</span>`);
  if (reasons) sections.push(reasons);
  if (note) {
    sections.push(`<small class="meal-description meal-extra-copy">${escapeHtml(note)}</small>`);
  }
  if (ingredients.length) {
    sections.push(`<small class="meal-description meal-extra-copy"><span>Ingredients:</span> ${escapeHtml(ingredients.join(', '))}</small>`);
  }
  if (analysis.micronutrients.length) {
    sections.push(`
      <div class="meal-extra-copy meal-extra-micronutrients">
        <span>Micronutrients:</span>
        ${buildMicronutrientChips(analysis.micronutrients, 'detail')}
      </div>`);
  }
  if (analysis.swap) {
    sections.push(`<small class="meal-health-swap meal-extra-copy"><span>Better choice:</span> ${escapeHtml(analysis.swap)}</small>`);
  }
  if (!sections.length && !actions) return '';
  return `
        <details class="meal-extra-details">
          <summary>Dish details</summary>
          <div class="meal-extra-panel">
            ${sections.join('')}
            ${actions}
          </div>
        </details>`;
}

function timelineCompactStats(meal) {
  return `${Number(meal.calories || 0).toLocaleString()} cal · ${formatTimelineTime(meal.eaten_at)}`;
}

function timelineCompactSubmeta(meal) {
  const parts = [getMealTypeLabel(meal) || 'Meal'];
  if (meal.restaurant_name) parts.push(meal.restaurant_name);
  return parts.join(' · ');
}

function mealTemplate(meal, withActions = false) {
  const analysis = analyzeMealQuality(meal);
  const actions = withActions ? `
        <div class="meal-actions" aria-label="Actions for ${escapeAttr(meal.food_name)}">
          <button class="meal-edit-button" type="button" data-edit-meal="${escapeAttr(meal.id)}">✏️ Edit</button>
          <button class="meal-delete-button" type="button" data-delete-meal="${escapeAttr(meal.id)}">🗑 Delete</button>
        </div>` : '';
  const extraDetails = buildDashboardMealExtra(meal, analysis, actions);
  return `
    <article class="meal-card dashboard-food-card ${meal.photo_url ? 'has-photo' : ''}">
      <div class="meal-card-summary">
        <div class="meal-card-media">
          ${meal.photo_url
            ? `<img class="meal-photo" src="${escapeAttr(meal.photo_url)}" alt="${escapeAttr(meal.food_name)}">`
            : `<span class="meal-emoji">${mealEmoji(meal.food_name)}</span>`}
        </div>
        <div class="meal-card-copy">
          <div class="meal-signal-line">
            <strong class="meal-calorie-pill">${Number(meal.calories || 0).toLocaleString()} cal</strong>
            <span class="meal-score-pill meal-score-pill-${healthTone(analysis.score)}" aria-label="Food balance score ${analysis.score} out of 100">
              <small>Food balance</small><b>${analysis.score}</b><i>/100</i>
            </span>
          </div>
          <p class="meal-compact-meta">${escapeHtml(mealDisplayMeta(meal))}</p>
          ${extraDetails}
        </div>
      </div>
    </article>
  `;
}

function mealDisplayMeta(meal) {
  const label = getMealTypeLabel(meal) || meal.restaurant_name || 'Saved meal';
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(meal.eaten_at));
  return `${label} · ${time}`;
}

function buildMicronutrientChips(signals = [], variant = 'dashboard') {
  if (!signals.length) return '';
  return `
    <div class="meal-micronutrient-row meal-micronutrient-row-${variant}" aria-label="Micronutrient signals">
      ${signals.map((signal) => `
        <span class="meal-micronutrient-chip meal-micronutrient-chip-${signal.kind}">
          ${escapeHtml(signal.badge)}
        </span>
      `).join('')}
    </div>`;
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
        <strong><i class="meal-type-icon" aria-hidden="true">${dashboardMealTypeIcon(type)}</i>${dashboardMealTypeLabel(type)}</strong>
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

function dashboardMealTypeIcon(type) {
  return {
    breakfast: '☀️',
    brunch: '🥐',
    lunch: '🥗',
    dinner: '🌙',
    snack: '🍎',
    dessert: '🍰',
    other: '🍽️'
  }[type] || '🍽️';
}

function notesWithoutMealType(notes) {
  return notesWithoutSystemMetadata(notes);
}

function notesWithoutSystemMetadata(notes) {
  return String(notes || '').replace(/\s*\[\[[a-z_]+:[^\]]+\]\]\s*/ig, ' ').replace(/\s+/g, ' ').trim();
}

function getNotesMetadataValue(notes, key) {
  return String(notes || '').match(new RegExp(`\\[\\[${key}:([^\\]]+)\\]\\]`, 'i'))?.[1] || '';
}

function decodeNotesMetadataList(value) {
  return value
    ? value.split(',').map((item) => decodeURIComponent(item).trim()).filter(Boolean)
    : [];
}

function encodeNotesMetadataList(values = []) {
  return uniqueList(values.map((item) => normalizeScanLabel(item)).filter(Boolean))
    .map((item) => encodeURIComponent(item))
    .join(',');
}

function getMealIngredients(meal) {
  return decodeNotesMetadataList(getNotesMetadataValue(meal?.notes, 'scan_ingredients'));
}

function getMealScanTags(meal) {
  return decodeNotesMetadataList(getNotesMetadataValue(meal?.notes, 'scan_tags'));
}

function notesWithMetadata(notes, { mealType, scanIngredients = [], scanTags = [], usdaFdcId = null, usdaGrams = null } = {}) {
  const cleanNotes = notesWithoutSystemMetadata(notes);
  const tokens = [];
  if (mealType) tokens.push(`[[meal_type:${mealType}]]`);
  if (scanIngredients.length) tokens.push(`[[scan_ingredients:${encodeNotesMetadataList(scanIngredients)}]]`);
  if (scanTags.length) tokens.push(`[[scan_tags:${encodeNotesMetadataList(scanTags)}]]`);
  if (usdaFdcId) tokens.push(`[[usda_fdc:${Number(usdaFdcId)}]]`);
  if (usdaGrams) tokens.push(`[[usda_grams:${Math.round(Number(usdaGrams))}]]`);
  return `${cleanNotes}${cleanNotes && tokens.length ? ' ' : ''}${tokens.join(' ')}`.trim();
}

function notesWithMealType(notes, mealType, metadata = {}) {
  return notesWithMetadata(notes, { mealType, ...metadata });
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

function detectMicronutrientSignals(searchText) {
  return micronutrientSignals
    .map((signal) => {
      const hits = signal.words.filter((word) => searchText.includes(word));
      return {
        ...signal,
        hitCount: new Set(hits).size
      };
    })
    .filter((signal) => signal.hitCount > 0)
    .sort((left, right) => {
      if (left.kind !== right.kind) return left.kind === 'support' ? -1 : 1;
      if (right.hitCount !== left.hitCount) return right.hitCount - left.hitCount;
      return left.label.localeCompare(right.label);
    });
}

function summarizeMicronutrients(meals = []) {
  return meals.reduce((totals, meal) => {
    detectMicronutrientSignals(foodSearchText(meal)).forEach((signal) => {
      totals[signal.key] = (totals[signal.key] || 0) + 1;
    });
    return totals;
  }, {});
}

function analyzeMealQuality(meal, memberOverride) {
  const member = memberOverride || appState.members.find((item) => item.id === meal.member_id) || appState.currentMember;
  const profile = getMemberHealthProfile(member);
  const searchText = foodSearchText(meal);
  const calories = Number(meal.calories) || 0;
  const mealType = getMealType(meal);
  const micronutrients = detectMicronutrientSignals(searchText);
  let score = 58;
  const reasonFlags = [];
  const hasAny = (words) => words.some((word) => searchText.includes(word));
  const countAny = (words) => words.filter((word) => searchText.includes(word)).length;

  const positiveWords = ['salad', 'vegetable', 'broccoli', 'greens', 'fruit', 'berry', 'fish', 'salmon', 'egg', 'tofu', 'yogurt', 'oat', 'bean', 'avocado', 'nuts', 'grill', 'grilled'];
  const cautionWords = ['fries', 'fried', 'pizza', 'burger', 'soda', 'cake', 'dessert', 'ice cream', 'chips', 'bacon', 'ramen', 'crispy', 'pie', 'pastry', 'cookie'];
  const proteinWords = ['chicken', 'beef', 'fish', 'salmon', 'egg', 'tofu', 'yogurt', 'protein', 'pork'];
  const fiberWords = ['vegetable', 'greens', 'salad', 'cabbage', 'fruit', 'berry', 'bean', 'oat', 'pineapple'];
  const gutWords = ['yogurt', 'kimchi', 'fermented', 'tea', 'greens', 'fruit', 'cabbage', 'bean', 'oat'];
  const processedWords = ['fish ball', 'fish balls', 'sausage', 'nugget', 'bacon', 'ham'];
  const sweetDrinkWords = ['smoothie', 'frappe', 'soda', 'juice', 'milk tea'];
  const dessertWords = ['cake', 'pie', 'pastry', 'cookie', 'brownie', 'ice cream', 'soft serve', 'dessert'];
  const plainStapleWords = ['rice', 'plain rice', 'steamed rice', 'white rice', 'bread', 'toast', 'baguette', 'noodle', 'pasta'];

  if (calories > 0) {
    if (calories <= 650) {
      score += 12;
      if (calories <= 450) reasonFlags.push('Lighter portion');
    } else if (calories <= 900) {
      score += 5;
      reasonFlags.push('Large portion');
    } else if (calories >= 1200) {
      score -= 12;
      reasonFlags.push('Very high calorie');
    } else {
      score -= 4;
      reasonFlags.push('High calorie');
    }
  }

  score += countAny(positiveWords) * 5;
  score -= countAny(cautionWords) * 5;

  if (hasAny(proteinWords)) reasonFlags.push('High protein');
  if (hasAny(fiberWords)) reasonFlags.push('Fiber support');
  if (hasAny(gutWords)) reasonFlags.push('Gut support');
  if (hasAny(['grilled', 'grill'])) reasonFlags.push('Grilled');
  if (hasAny(['fried', 'fries', 'crispy'])) reasonFlags.push('Fried');
  if (hasAny(sweetDrinkWords)) {
    reasonFlags.push('Sweet drink');
    score -= 4;
  }
  if (hasAny(dessertWords) || mealType === 'dessert') reasonFlags.push('Treat food');
  if (hasAny(plainStapleWords) && !hasAny(proteinWords) && !hasAny(fiberWords)) reasonFlags.push('Plain staple');
  if (hasAny(processedWords)) {
    reasonFlags.push('Processed');
    score -= 4;
  }

  score += micronutrients.filter((signal) => signal.kind === 'support').slice(0, 3).reduce((total, signal) => total + Math.min(signal.hitCount, 2) * 2, 0);
  score -= micronutrients.filter((signal) => signal.kind === 'caution').reduce((total, signal) => total + Math.min(signal.hitCount, 2) * 3, 0);

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
  if (focus === 'glp1-support') {
    if (calories > 550) score -= 8;
    if (mealType === 'snack' && calories > 250) score -= 5;
    score -= ['fried', 'fries', 'dessert', 'cake', 'soda', 'frappe'].filter((word) => searchText.includes(word)).length * 4;
    score += ['fish', 'egg', 'chicken', 'tofu', 'yogurt', 'protein', 'vegetable', 'greens', 'fruit', 'bean'].filter((word) => searchText.includes(word)).length * 3;
    if (hasAny(['protein', 'fish', 'egg', 'tofu', 'chicken'])) reasonFlags.push('Protein first');
    if (calories > 550) reasonFlags.push('Portion watch');
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

  const finalScore = clampScore(score);
  const prioritizedReasons = uniqueList([
    ...reasonFlags.filter((item) => ['High protein', 'Fiber support', 'Gut support', 'Protein first', 'Grilled', 'Lighter portion'].includes(item)),
    ...reasonFlags.filter((item) => ['Treat food', 'Plain staple', 'Fried', 'Sweet drink', 'Processed', 'Large portion', 'High calorie', 'Very high calorie', 'Portion watch'].includes(item))
  ]).slice(0, 3);
  const swap = buildMealSwapSuggestion({
    searchText,
    calories,
    mealType,
    focus,
    hasProtein: hasAny(proteinWords),
    hasFiber: hasAny(fiberWords),
    isDessertLike: hasAny(dessertWords) || mealType === 'dessert',
    isPlainStaple: hasAny(plainStapleWords) && !hasAny(proteinWords) && !hasAny(fiberWords),
    isProcessedLike: hasAny(processedWords)
  });
  return {
    score: finalScore,
    label: finalScore >= 85 ? 'Excellent' : finalScore >= 70 ? 'Good' : finalScore >= 50 ? 'Limit' : 'Heavy',
    reasons: prioritizedReasons,
    swap,
    micronutrients,
    micronutrientHighlights: micronutrients.filter((signal) => !prioritizedReasons.includes(signal.badge))
  };
}

function estimateMealHealthScore(meal, memberOverride) {
  return analyzeMealQuality(meal, memberOverride).score;
}

function buildMealSwapSuggestion({ searchText, calories, mealType, focus, hasProtein, hasFiber, isDessertLike, isPlainStaple, isProcessedLike }) {
  if (isDessertLike) return 'Share a smaller portion, or try yogurt with fruit next time.';
  if (isPlainStaple) return 'Pair it with egg, grilled chicken, tofu, or vegetables.';
  if (['fried', 'fries', 'crispy'].some((word) => searchText.includes(word))) return 'Go for grilled chicken, steamed fish, or a roasted version.';
  if (['smoothie', 'frappe', 'soda', 'juice', 'milk tea'].some((word) => searchText.includes(word))) return 'Choose unsweetened tea, sparkling water, or a smaller size.';
  if (calories > 850 && searchText.includes('rice')) return 'Try half rice with grilled protein and greens.';
  if (isProcessedLike) return 'Swap processed add-ons for egg, tofu, grilled chicken, or fresh fish.';
  if (!hasFiber && !hasProtein) return 'Add a protein and one vegetable side to round this out.';
  if (!hasFiber) return 'Add a vegetable side, fruit, or beans for better balance.';
  if (!hasProtein) return 'Add eggs, fish, tofu, or chicken for better fullness.';
  if (focus === 'glp1-support' && (calories > 550 || mealType === 'snack')) return 'Keep the portion smaller and start with protein first.';
  return '';
}

function uniqueList(items = []) {
  return [...new Set(items.filter(Boolean))];
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
  if (focus === 'glp1-support') return { icon: '💉', title: 'Smaller portions work better', copy: 'Prioritize protein, fiber, hydration, and lighter meal size through the day.' };
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
        <p>${escapeHtml(restaurant.notes || restaurant.address || 'Saved favorite')}</p>
        <p>${escapeHtml(restaurant.phone || 'Phone not saved')}</p>
      </div>
      <button type="button" data-log-restaurant="${escapeAttr(restaurant.name)}">Log a Visit</button>
    </article>
  `).join('');

  document.getElementById('favoriteGrid').innerHTML = cards;
}

function renderReport() {
  const member = appState.currentMember || appState.members[0];
  if (!member) return;
  const replay = buildWeeklyReplayData();
  const meals = replay.meals;
  const calories = sum(meals, 'calories');
  const spend = sum(meals, 'price');
  const favoriteRestaurant = mostCommon(meals.map((meal) => meal.restaurant_name).filter(Boolean));
  const favoriteFood = replay.repeatFavorite;

  document.getElementById('reportMeals').textContent = meals.length.toString();
  document.getElementById('reportCalories').textContent = calories.toLocaleString();
  document.getElementById('reportVariety').textContent = replay.variety.toString();
  document.getElementById('reportRestaurant').textContent = favoriteRestaurant || '-';
  document.getElementById('reportFood').textContent = favoriteFood || '-';
  document.getElementById('reportFavoriteDish').textContent = favoriteFood || '-';
  document.getElementById('weeklyRecommendation').textContent = buildWeeklySummary(meals, calories, spend, favoriteFood);
  renderWeeklyReplay(replay);
  renderProfileWeeklyHealth(member, meals);
  renderMealBalance(meals);
  renderWeeklyCalories(meals, replay.days);
  renderFoodVariety(meals);
}

function buildWeeklyReplayData() {
  const mealPool = getMemberMeals()
    .filter((meal) => Number.isFinite(new Date(meal.eaten_at || meal.created_at).getTime()))
    .sort((left, right) => new Date(right.eaten_at || right.created_at) - new Date(left.eaten_at || left.created_at));
  const recordedKeys = [...new Set(mealPool.map(mealDayKey).filter(Boolean))].slice(0, 7);
  const recordedKeySet = new Set(recordedKeys);
  const meals = mealPool.filter((meal) => recordedKeySet.has(mealDayKey(meal)));
  const dayMap = new Map(recordedKeys.map((key) => {
    const sourceMeal = mealPool.find((meal) => mealDayKey(meal) === key);
    const date = new Date(sourceMeal.eaten_at || sourceMeal.created_at);
    date.setHours(12, 0, 0, 0);
    return [key, { key, date, meals: [], calories: 0, score: 0 }];
  }));
  meals.forEach((meal) => {
    const day = dayMap.get(mealDayKey(meal));
    if (!day) return;
    day.meals.push(meal);
    day.calories += Number(meal.calories) || 0;
  });
  const days = Array.from(dayMap.values()).map((day) => ({
    ...day,
    score: day.meals.length ? Math.round(day.meals.reduce((total, meal) => total + analyzeMealQuality(meal).score, 0) / day.meals.length) : 0
  })).sort((left, right) => left.date - right.date);
  const names = meals.map((meal) => String(meal.food_name || 'Saved dish').trim()).filter(Boolean);
  const nameCounts = names.reduce((counts, name) => {
    const key = name.toLowerCase();
    const current = counts.get(key) || { name, count: 0 };
    current.count += 1;
    counts.set(key, current);
    return counts;
  }, new Map());
  const rankedNames = Array.from(nameCounts.values()).sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
  const repeatFavorite = rankedNames[0]?.name || '';
  const oneOffNames = new Set(rankedNames.filter((item) => item.count === 1).map((item) => item.name.toLowerCase()));
  const surpriseMeal = meals.find((meal) => oneOffNames.has(String(meal.food_name || '').trim().toLowerCase()));
  const scores = meals.map((meal) => analyzeMealQuality(meal).score);
  const foodScore = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : 0;
  const variety = nameCounts.size;
  const standoutDay = days.length ? [...days].sort((left, right) => right.calories - left.calories)[0] : null;
  const lightestDay = days.length > 1 ? [...days].sort((left, right) => left.calories - right.calories)[0] : null;
  const calorieMeals = meals.filter((meal) => Number(meal.calories) > 0);
  const highestCalorieMeal = [...calorieMeals].sort((left, right) => Number(right.calories) - Number(left.calories))[0] || null;
  const lowestCalorieMeal = [...calorieMeals].sort((left, right) => Number(left.calories) - Number(right.calories))[0] || null;
  const healthiestMeal = [...meals].sort((left, right) => analyzeMealQuality(right).score - analyzeMealQuality(left).score)[0] || null;
  const photoMeals = meals.filter((meal) => String(meal.photo_url || '').trim()).slice(0, 6);
  const bodySignals = [...buildFoodBodyImpacts(meals, sum(meals, 'calories')), ...buildSecondaryFoodBodyImpacts(meals, sum(meals, 'calories'))]
    .filter((impact) => impact.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
  const persona = buildWeeklyReplayPersona({ meals, days, variety, foodScore, repeatFavorite });
  const member = appState.currentMember;
  const savedSex = String(appState.profileMeasurements[member?.id]?.sex || member?.sex || '').trim().toLowerCase();
  const inferredMale = /\b(dad|papa|father)\b/i.test(member?.name || '');
  const bodySex = savedSex === 'male' || (!savedSex && inferredMale) ? 'male' : 'female';
  return { meals, days, calories: sum(meals, 'calories'), variety, foodScore, repeatFavorite, surpriseFood: surpriseMeal?.food_name || '', standoutDay, lightestDay, highestCalorieMeal, lowestCalorieMeal, healthiestMeal, photoMeals, bodySignals, bodySex, persona, videoImages: new Map() };
}

function buildWeeklyReplayPersona({ meals, days, variety, foodScore }) {
  if (!meals.length) return { title: 'The Week in Progress', emoji: '🍽️', copy: 'Log a few meals and your food character will appear.' };
  const varietyRatio = variety / Math.max(meals.length, 1);
  const mealTypes = meals.map(getMealType);
  const breakfastCount = mealTypes.filter((type) => type === 'breakfast' || type === 'brunch').length;
  const homeMeals = meals.filter((meal) => !String(meal.restaurant_name || '').trim()).length;
  if (foodScore >= 78 && variety >= 5) return { title: 'The Balanced Explorer', emoji: '🧭', copy: 'Strong food scores and plenty of different flavors shaped this replay.' };
  if (varietyRatio >= .78 && variety >= 5) return { title: 'The Flavor Collector', emoji: '🎨', copy: `${variety} different foods kept your week colorful and unpredictable.` };
  if (breakfastCount >= Math.max(3, Math.ceil(meals.length * .35))) return { title: 'The Morning Regular', emoji: '🌤️', copy: 'Breakfast gave this week its clearest and most dependable rhythm.' };
  if (homeMeals >= Math.max(5, Math.ceil(meals.length * .7))) return { title: 'The Home Table Hero', emoji: '🏡', copy: 'Most of this food story happened away from restaurant menus.' };
  if (days.length >= 6) return { title: 'The Rhythm Keeper', emoji: '🥁', copy: 'Consistent logging made this one of your clearest food stories yet.' };
  return { title: 'The Food Storyteller', emoji: '📖', copy: 'Your meals are starting to reveal a recognizable weekly pattern.' };
}

function replayDayLabel(day) {
  return day?.date?.toLocaleDateString('en-US', { weekday: 'short' }) || '-';
}

function renderWeeklyReplay(replay) {
  const name = getProfileIdentity().firstName || appState.currentMember?.name || 'Your';
  setText('weeklyReplayTitle', replay.meals.length ? `${name}’s week, plated.` : 'Your week, plated.');
  setText('weeklyReplayScore', replay.meals.length ? replay.foodScore : '--');
  setText('weeklyReplayEmoji', replay.persona.emoji);
  setText('weeklyReplayPersona', replay.persona.title);
  setText('weeklyReplayPersonaCopy', replay.persona.copy);
  if (replay.days.length) {
    const start = replay.days[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = replay.days.at(-1).date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setText('weeklyDateRange', `${start} – ${end} · latest ${replay.days.length} recorded day${replay.days.length === 1 ? '' : 's'}`);
  } else {
    setText('weeklyDateRange', 'Your next meal starts the replay');
  }
  setText('weeklyReplayCoverage', replay.days.length ? `${replay.days.length} recorded day${replay.days.length === 1 ? '' : 's'} · ${replay.meals.length} meals` : 'Waiting for records');
  const moments = [
    { icon: '🔥', label: 'Biggest plate day', value: replay.standoutDay ? replayDayLabel(replay.standoutDay) : '-', copy: replay.standoutDay ? `${Math.round(replay.standoutDay.calories).toLocaleString()} calories across ${replay.standoutDay.meals.length} meal${replay.standoutDay.meals.length === 1 ? '' : 's'}` : 'Waiting for meals' },
    { icon: '🔁', label: 'Repeat favorite', value: replay.repeatFavorite || '-', copy: replay.repeatFavorite ? 'The familiar face of this food story' : 'No repeat favorite yet' },
    { icon: '✨', label: 'Surprise guest', value: replay.surpriseFood || '-', copy: replay.surpriseFood ? 'Appeared once and made the replay' : 'More variety will reveal one' },
    { icon: '🌈', label: 'Flavor range', value: replay.variety ? `${replay.variety} foods` : '-', copy: replay.lightestDay ? `${replayDayLabel(replay.lightestDay)} was the lightest logged day` : 'Every different food adds color' }
  ];
  document.getElementById('weeklyReplayMoments').innerHTML = moments.map((moment, index) => `
    <article style="--replay-delay:${index * 70}ms"><span>${moment.icon}</span><small>${escapeHtml(moment.label)}</small><strong>${escapeHtml(moment.value)}</strong><p>${escapeHtml(moment.copy)}</p></article>
  `).join('');
  const maxCalories = Math.max(...replay.days.map((day) => day.calories), 1);
  document.getElementById('weeklyReplayTimeline').innerHTML = replay.days.length ? replay.days.map((day, index) => {
    const height = Math.max(12, Math.round(day.calories / maxCalories * 100));
    return `<article style="--replay-delay:${index * 55}ms"><strong>${replayDayLabel(day)}</strong><div><i style="height:${height}%"></i></div><b>${Math.round(day.calories).toLocaleString()}</b><small>${day.meals.length} meal${day.meals.length === 1 ? '' : 's'}</small></article>`;
  }).join('') : '<p class="muted">Log meals on a few days to watch your weekly rhythm appear.</p>';
}

const weeklyReplayVideoSceneDurations = [3200, 3800, 3600, 4000, 3500, 4300, 4300, 3300];
const weeklyReplayVideoDuration = weeklyReplayVideoSceneDurations.reduce((total, duration) => total + duration, 0);
let weeklyReplayPreviewFrame = 0;
let weeklyReplayVideoBlob = null;
let weeklyReplayVideoUrl = '';
let weeklyReplayVideoBusy = false;
let weeklyReplayVideoData = null;

function setWeeklyVideoFeedback(message, tone = '') {
  const feedback = document.getElementById('weeklyVideoFeedback');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.className = `daily-share-feedback${tone ? ` ${tone}` : ''}`;
}

function setWeeklyVideoBusy(isBusy) {
  weeklyReplayVideoBusy = isBusy;
  document.querySelectorAll('#weeklyVideoModal [data-action="save-weekly-video"], #weeklyVideoModal [data-action="share-weekly-video"]').forEach((button) => {
    button.disabled = isBusy;
  });
}

function openWeeklyVideoModal() {
  const replay = buildWeeklyReplayData();
  if (!replay.meals.length) {
    showAppNotice('Log at least one meal before creating a replay video.', 'warning');
    return;
  }
  weeklyReplayVideoData = replay;
  weeklyReplayVideoBlob = null;
  resetWeeklyVideoPlayer();
  setWeeklyVideoFeedback('Loading meal snapshots for your 30-second preview…');
  document.getElementById('weeklyVideoModal')?.classList.remove('hidden');
  startWeeklyReplayPreview(replay);
  prepareWeeklyReplayImages(replay).then(() => {
    if (weeklyReplayVideoData !== replay || document.getElementById('weeklyVideoModal')?.classList.contains('hidden')) return;
    setWeeklyVideoFeedback('Preview loops automatically. Creating the video takes about 30 seconds.');
    startWeeklyReplayPreview(replay);
  });
}

function closeWeeklyVideoModal() {
  if (weeklyReplayVideoBusy) return;
  cancelAnimationFrame(weeklyReplayPreviewFrame);
  resetWeeklyVideoPlayer();
  document.getElementById('weeklyVideoModal')?.classList.add('hidden');
  setWeeklyVideoFeedback('');
}

function loadWeeklyReplayImage(source) {
  return new Promise((resolve) => {
    if (!source) {
      resolve(null);
      return;
    }
    const image = new Image();
    if (!String(source).startsWith('data:') && !String(source).startsWith('blob:')) image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

async function prepareWeeklyReplayImages(replay) {
  if (replay.imagesReady) return replay;
  const highlightedMeals = [replay.highestCalorieMeal, replay.lowestCalorieMeal, replay.healthiestMeal, ...replay.photoMeals].filter(Boolean);
  const uniqueMeals = [...new Map(highlightedMeals.map((meal) => [meal.id || meal.photo_url || meal.food_name, meal])).values()];
  const bodySource = `assets/illustrations/body-${replay.bodySex === 'male' ? 'male' : 'female'}.png`;
  const [bodyImage] = await Promise.all([
    loadWeeklyReplayImage(bodySource),
    ...uniqueMeals.map(async (meal) => {
      if (!meal.photo_url) return;
      const image = await loadWeeklyReplayImage(meal.photo_url);
      if (image) replay.videoImages.set(meal.id || meal.photo_url, image);
    })
  ]);
  replay.bodyImage = bodyImage;
  replay.imagesReady = true;
  return replay;
}

function resetWeeklyVideoPlayer() {
  if (weeklyReplayVideoUrl) URL.revokeObjectURL(weeklyReplayVideoUrl);
  weeklyReplayVideoUrl = '';
  const player = document.getElementById('weeklyVideoPlayer');
  if (player) {
    player.pause();
    player.removeAttribute('src');
    player.load();
    player.classList.add('hidden');
  }
  document.getElementById('weeklyVideoCanvas')?.classList.remove('hidden');
  const saveButton = document.getElementById('weeklyVideoSaveButton');
  if (saveButton) saveButton.textContent = 'Create video';
}

function showWeeklyVideoPlayer(blob) {
  const player = document.getElementById('weeklyVideoPlayer');
  if (!player) return;
  if (weeklyReplayVideoUrl) URL.revokeObjectURL(weeklyReplayVideoUrl);
  weeklyReplayVideoUrl = URL.createObjectURL(blob);
  player.src = weeklyReplayVideoUrl;
  player.classList.remove('hidden');
  document.getElementById('weeklyVideoCanvas')?.classList.add('hidden');
  const saveButton = document.getElementById('weeklyVideoSaveButton');
  if (saveButton) saveButton.textContent = 'Save video';
  player.play().catch(() => {});
}

function weeklyVideoEase(value) {
  const bounded = Math.max(0, Math.min(1, value));
  return 1 - Math.pow(1 - bounded, 3);
}

function drawWeeklyVideoBrand(context, light = true) {
  context.save();
  context.translate(48, 55);
  context.fillStyle = light ? '#f5b642' : '#17604a';
  context.beginPath();
  context.arc(25, 25, 25, Math.PI, 0);
  context.lineTo(45, 44);
  context.quadraticCurveTo(25, 67, 5, 44);
  context.closePath();
  context.fill();
  context.fillStyle = light ? '#173f32' : '#fff8eb';
  context.beginPath();
  context.arc(25, 25, 14, 0, Math.PI * 2);
  context.fill();
  context.restore();
  context.fillStyle = light ? '#fffaf0' : '#173f32';
  context.font = '700 30px Georgia, serif';
  context.fillText('MyMealMap', 115, 92);
  context.font = '800 10px Arial, sans-serif';
  context.letterSpacing = '1px';
  context.fillText('YOUR FOOD STORY, MAPPED.', 116, 111);
  context.letterSpacing = '0px';
}

function drawWeeklyReplayProgress(context, elapsed) {
  const gap = 5;
  const width = (624 - (gap * (weeklyReplayVideoSceneDurations.length - 1))) / weeklyReplayVideoSceneDurations.length;
  let start = 0;
  weeklyReplayVideoSceneDurations.forEach((duration, index) => {
    const progress = Math.max(0, Math.min(1, (elapsed - start) / duration));
    fillRoundedCanvasRect(context, 48 + (index * (width + gap)), 28, width, 5, 3, 'rgba(255,255,255,.22)');
    if (progress) fillRoundedCanvasRect(context, 48 + (index * (width + gap)), 28, width * progress, 5, 3, '#f6bd4e');
    start += duration;
  });
}

function fillWeeklyVideoBackground(context, scene) {
  const gradient = scene === 1
    ? context.createLinearGradient(0, 0, 720, 1280)
    : context.createRadialGradient(600, 120, 20, 500, 350, 900);
  if (scene === 1) {
    gradient.addColorStop(0, '#f07a28');
    gradient.addColorStop(1, '#c64c25');
  } else if (scene === 2) {
    gradient.addColorStop(0, '#fffaf0');
    gradient.addColorStop(1, '#efe4d3');
  } else {
    gradient.addColorStop(0, '#2d6845');
    gradient.addColorStop(1, '#103b30');
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, 720, 1280);
}

function drawLegacyWeeklyReplayVideoFrame(replay, elapsed) {
  const canvas = document.getElementById('weeklyVideoCanvas');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;
  const safeElapsed = Math.max(0, Math.min(weeklyReplayVideoDuration - 1, elapsed));
  const scene = Math.min(3, Math.floor(safeElapsed / 3000));
  const localProgress = (safeElapsed % 3000) / 3000;
  const reveal = weeklyVideoEase(Math.min(localProgress * 2.4, 1));
  const memberName = getProfileIdentity().firstName || appState.currentMember?.name || 'Your';
  context.clearRect(0, 0, canvas.width, canvas.height);
  fillWeeklyVideoBackground(context, scene);
  context.save();
  context.globalAlpha = reveal;
  context.translate(0, (1 - reveal) * 28);
  drawWeeklyVideoBrand(context, scene !== 2);

  if (scene === 0) {
    context.fillStyle = '#f5ba49';
    context.font = '900 18px Arial, sans-serif';
    context.fillText('YOUR WEEKLY REPLAY', 52, 260);
    context.fillStyle = '#fffaf0';
    context.font = '700 86px Georgia, serif';
    context.fillText(`${memberName}’s week,`, 50, 365);
    context.fillText('plated.', 50, 455);
    context.fillStyle = '#cee0d7';
    context.font = '500 25px Arial, sans-serif';
    context.fillText(`${replay.days.length} recorded days · ${replay.meals.length} meals`, 52, 510);
    context.strokeStyle = 'rgba(255,255,255,.13)';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(590, 900, 255 * reveal, 0, Math.PI * 2);
    context.stroke();
    context.font = '110px Arial, sans-serif';
    context.fillText('🍽️', 290, 900);
    context.fillStyle = '#f5ba49';
    context.font = '800 17px Arial, sans-serif';
    context.fillText('A FOOD STORY MADE FROM YOUR REAL RECORDS', 52, 1165);
  } else if (scene === 1) {
    fillRoundedCanvasRect(context, 52, 225, 616, 820, 46, 'rgba(255,255,255,.12)');
    context.font = '160px Arial, sans-serif';
    context.textAlign = 'center';
    context.fillText(replay.persona.emoji, 360, 480);
    context.fillStyle = '#ffd7b5';
    context.font = '900 18px Arial, sans-serif';
    context.fillText('YOUR FOOD CHARACTER', 360, 580);
    context.fillStyle = '#fffaf0';
    context.font = '700 60px Georgia, serif';
    drawCanvasText(context, replay.persona.title, 360, 660, 540, 66, 2);
    context.fillStyle = '#fff0e4';
    context.font = '400 24px Arial, sans-serif';
    drawCanvasText(context, replay.persona.copy, 360, 820, 500, 34, 3);
    context.textAlign = 'left';
  } else if (scene === 2) {
    context.fillStyle = '#b85d2d';
    context.font = '900 18px Arial, sans-serif';
    context.fillText('SEVEN-DAY PLAYBACK', 52, 225);
    context.fillStyle = '#2c2018';
    context.font = '700 58px Georgia, serif';
    context.fillText('Your rhythm,', 52, 305);
    context.fillText('day by day.', 52, 370);
    const maxCalories = Math.max(...replay.days.map((day) => day.calories), 1);
    const barWidth = 66;
    const barGap = 22;
    replay.days.forEach((day, index) => {
      const x = 56 + (index * (barWidth + barGap));
      const targetHeight = Math.max(36, Math.round(day.calories / maxCalories * 390));
      const barReveal = weeklyVideoEase(Math.max(0, Math.min(1, (localProgress * 2.2) - (index * .09))));
      const height = targetHeight * barReveal;
      fillRoundedCanvasRect(context, x, 900 - height, barWidth, height, 13, index === replay.days.length - 1 ? '#17604a' : '#ef7a25');
      context.fillStyle = '#79685b';
      context.font = '800 15px Arial, sans-serif';
      context.textAlign = 'center';
      context.fillText(replayDayLabel(day), x + (barWidth / 2), 940);
      context.fillStyle = '#2f483d';
      context.font = '800 14px Arial, sans-serif';
      context.fillText(Math.round(day.calories).toLocaleString(), x + (barWidth / 2), 970);
    });
    context.textAlign = 'left';
    fillRoundedCanvasRect(context, 52, 1050, 616, 110, 24, '#173f32');
    context.fillStyle = '#f8c45c';
    context.font = '900 15px Arial, sans-serif';
    context.fillText('BIGGEST PLATE DAY', 82, 1090);
    context.fillStyle = '#fffaf0';
    context.font = '700 27px Georgia, serif';
    context.fillText(replay.standoutDay ? `${replayDayLabel(replay.standoutDay)} · ${Math.round(replay.standoutDay.calories).toLocaleString()} calories` : 'Still taking shape', 82, 1132);
  } else {
    context.fillStyle = '#f5ba49';
    context.font = '900 18px Arial, sans-serif';
    context.fillText('THE FINAL PLATE', 52, 220);
    context.fillStyle = '#fffaf0';
    context.font = '700 62px Georgia, serif';
    context.fillText('A week worth', 52, 300);
    context.fillText('remembering.', 52, 370);
    const stats = [
      { label: 'FOOD SCORE', value: `${replay.foodScore}/100` },
      { label: 'DIFFERENT FOODS', value: replay.variety.toString() },
      { label: 'CALORIES RECORDED', value: replay.calories.toLocaleString() },
      { label: 'REPEAT FAVORITE', value: replay.repeatFavorite || 'Still emerging' }
    ];
    stats.forEach((stat, index) => {
      const x = 52 + ((index % 2) * 318);
      const y = 455 + (Math.floor(index / 2) * 210);
      fillRoundedCanvasRect(context, x, y, 298, 180, 28, 'rgba(255,255,255,.09)');
      context.fillStyle = '#bcd2c8';
      context.font = '900 13px Arial, sans-serif';
      context.fillText(stat.label, x + 24, y + 45);
      context.fillStyle = '#fffaf0';
      context.font = index === 3 ? '700 25px Georgia, serif' : '700 42px Georgia, serif';
      drawCanvasText(context, stat.value, x + 24, y + 98, 250, 34, 2);
    });
    context.fillStyle = '#f5ba49';
    context.font = '900 17px Arial, sans-serif';
    context.fillText('MAP YOUR NEXT MEAL', 52, 1005);
    context.fillStyle = '#fffaf0';
    context.font = '700 35px Georgia, serif';
    context.fillText('mymealmap1.netlify.app', 52, 1055);
    context.fillStyle = '#bcd2c8';
    context.font = '400 18px Arial, sans-serif';
    context.fillText('Food-pattern insights only · Not medical advice', 52, 1110);
  }
  context.restore();
  drawWeeklyReplayProgress(context, safeElapsed);
}

function getWeeklyReplayVideoScene(elapsed) {
  let cursor = 0;
  for (let index = 0; index < weeklyReplayVideoSceneDurations.length; index += 1) {
    const duration = weeklyReplayVideoSceneDurations[index];
    if (elapsed < cursor + duration) return { index, progress: (elapsed - cursor) / duration };
    cursor += duration;
  }
  return { index: weeklyReplayVideoSceneDurations.length - 1, progress: 1 };
}

function weeklyReplayMealImage(replay, meal) {
  if (!meal) return null;
  return replay.videoImages?.get(meal.id || meal.photo_url) || null;
}

function drawWeeklyReplayImageCover(context, image, x, y, width, height, radius = 24) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.save();
  roundedCanvasRect(context, x, y, width, height, radius);
  context.clip();
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  const shade = context.createLinearGradient(0, y, 0, y + height);
  shade.addColorStop(.5, 'rgba(10,25,19,0)');
  shade.addColorStop(1, 'rgba(10,25,19,.7)');
  context.fillStyle = shade;
  context.fillRect(x, y, width, height);
  context.restore();
}

function weeklyReplayFoodEmoji(meal) {
  const text = foodSearchText(meal);
  if (/coffee|tea|latte/.test(text)) return '☕';
  if (/fruit|banana|apple|mango|berry|orange/.test(text)) return '🍓';
  if (/salad|vegetable|greens/.test(text)) return '🥗';
  if (/fish|salmon|tuna/.test(text)) return '🐟';
  if (/chicken|beef|pork/.test(text)) return '🍽️';
  if (/rice|noodle|pasta/.test(text)) return '🍜';
  return '🍴';
}

function drawWeeklyReplayMealVisual(context, replay, meal, x, y, width, height, accent = '#ef7624') {
  const image = weeklyReplayMealImage(replay, meal);
  if (image) {
    drawWeeklyReplayImageCover(context, image, x, y, width, height);
    return;
  }
  const gradient = context.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, accent);
  gradient.addColorStop(1, '#174c3c');
  fillRoundedCanvasRect(context, x, y, width, height, 24, gradient);
  context.fillStyle = 'rgba(255,255,255,.13)';
  context.beginPath();
  context.arc(x + width * .82, y + height * .18, width * .34, 0, Math.PI * 2);
  context.fill();
  context.font = `${Math.round(Math.min(width, height) * .3)}px Arial, sans-serif`;
  context.textAlign = 'center';
  context.fillStyle = '#fff';
  context.fillText(weeklyReplayFoodEmoji(meal), x + (width / 2), y + (height * .57));
  context.textAlign = 'left';
}

function drawWeeklyReplayMealCaption(context, meal, x, y, width, color = '#fffaf0') {
  context.fillStyle = color;
  context.font = '700 31px Georgia, serif';
  drawCanvasText(context, meal?.food_name || 'Saved meal', x, y, width, 36, 2);
}

function drawWeeklyReplayBodyFigure(context, replay, reveal) {
  const signals = replay.bodySignals || [];
  const figure = { x: 225, y: 350, width: 270, height: 570 };
  const positions = {
    brain: [.5, .06], eyes: [.5, .093], heart: [.55, .28], liver: [.42, .32], digestion: [.5, .43],
    muscles: [.28, .44], joints: [.4, .67], immunity: [.49, .35], energy: [.5, .52], skin: [.5, .43],
    recovery: [.35, .56], bones: [.63, .72]
  };
  const colors = ['#f7c64f', '#62d1a2', '#ff7f72'];
  context.save();
  const halo = context.createRadialGradient(360, 610, 30, 360, 610, 290);
  halo.addColorStop(0, 'rgba(255,255,255,.16)');
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = halo;
  context.fillRect(90, 330, 540, 620);

  if (replay.bodyImage) {
    context.globalAlpha = .28 + (.72 * reveal);
    context.drawImage(replay.bodyImage, figure.x, figure.y, figure.width, figure.height);
    context.globalAlpha = 1;
  } else {
    fillRoundedCanvasRect(context, 292, 455, 136, 350, 68, 'rgba(255,255,255,.16)');
    context.fillStyle = 'rgba(255,255,255,.22)';
    context.beginPath();
    context.arc(360, 405, 48, 0, Math.PI * 2);
    context.fill();
  }

  signals.forEach((signal, index) => {
    const [xRatio, yRatio] = positions[signal.position] || [.5, .45];
    const x = figure.x + (figure.width * xRatio);
    const y = figure.y + (figure.height * yRatio);
    const color = colors[index % colors.length];
    const pulse = 1 + (Math.sin((reveal * Math.PI * 4) + index) * .09);
    context.shadowColor = color;
    context.shadowBlur = 30 * reveal;
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, 15 * pulse * reveal, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    context.fillStyle = '#173f32';
    context.font = '900 12px Arial, sans-serif';
    context.textAlign = 'center';
    context.fillText(String(index + 1), x, y + 4);
  });

  signals.forEach((signal, index) => {
    const y = 950 + (index * 66);
    fillRoundedCanvasRect(context, 82, y, 556, 54, 18, 'rgba(255,255,255,.1)');
    context.fillStyle = colors[index % colors.length];
    context.beginPath();
    context.arc(109, y + 27, 12, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#173f32';
    context.font = '900 10px Arial, sans-serif';
    context.textAlign = 'center';
    context.fillText(String(index + 1), 109, y + 31);
    context.textAlign = 'left';
    context.fillStyle = '#fffaf0';
    context.font = '800 18px Arial, sans-serif';
    context.fillText(`${signal.icon} ${signal.name}`, 132, y + 23);
    context.fillStyle = '#bdd8cc';
    context.font = '700 13px Arial, sans-serif';
    context.fillText(`${signal.score}% food signal`, 132, y + 43);
  });
  context.restore();
}

function drawWeeklyReplayVideoFrame(replay, elapsed) {
  const canvas = document.getElementById('weeklyVideoCanvas');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;
  const safeElapsed = Math.max(0, Math.min(weeklyReplayVideoDuration - 1, elapsed));
  const sceneState = getWeeklyReplayVideoScene(safeElapsed);
  const scene = sceneState.index;
  const localProgress = sceneState.progress;
  const reveal = weeklyVideoEase(Math.min(localProgress * 2.3, 1));
  const memberName = getProfileIdentity().firstName || appState.currentMember?.name || 'Your';
  context.clearRect(0, 0, canvas.width, canvas.height);
  const backgrounds = [0, 0, 1, 2, 1, 2, 0, 0];
  fillWeeklyVideoBackground(context, backgrounds[scene]);
  context.save();
  context.globalAlpha = reveal;
  context.translate(0, (1 - reveal) * 24);
  drawWeeklyVideoBrand(context, backgrounds[scene] !== 2);

  if (scene === 0) {
    context.fillStyle = '#f5ba49';
    context.font = '900 18px Arial, sans-serif';
    context.fillText('YOUR 30-SECOND WEEKLY REPLAY', 52, 250);
    context.fillStyle = '#fffaf0';
    context.font = '700 84px Georgia, serif';
    context.fillText(`${memberName}’s week,`, 50, 360);
    context.fillText('plated.', 50, 450);
    context.fillStyle = '#c9ddd4';
    context.font = '500 25px Arial, sans-serif';
    context.fillText(`${replay.days.length} recorded days · ${replay.meals.length} meals · ${replay.variety} foods`, 52, 510);
    context.font = '130px Arial, sans-serif';
    context.fillText('🍽️', 290, 850);
    context.fillStyle = '#f5ba49';
    context.font = '800 17px Arial, sans-serif';
    context.fillText('REAL MEALS. ONE COLORFUL STORY.', 52, 1140);
  } else if (scene === 1) {
    context.fillStyle = '#f5ba49'; context.font = '900 17px Arial, sans-serif'; context.fillText('SNAPSHOTS FROM YOUR WEEK', 52, 205);
    context.fillStyle = '#fffaf0'; context.font = '700 55px Georgia, serif'; context.fillText('The plates that', 52, 275); context.fillText('made the story.', 52, 338);
    const collageMeals = [...replay.photoMeals, replay.highestCalorieMeal, replay.healthiestMeal].filter(Boolean).slice(0, 4);
    const slots = [[52,400,290,310],[362,400,306,205],[362,625,306,310],[52,730,290,205]];
    slots.forEach((slot, index) => {
      const meal = collageMeals[index] || replay.meals[index % replay.meals.length];
      const scale = weeklyVideoEase(Math.max(0, Math.min(1, (localProgress * 2) - (index * .12))));
      context.save(); context.translate(slot[0] + slot[2]/2, slot[1] + slot[3]/2); context.scale(scale, scale); context.translate(-(slot[0] + slot[2]/2), -(slot[1] + slot[3]/2));
      drawWeeklyReplayMealVisual(context, replay, meal, ...slot, ['#ef7624','#17604a','#e9a51b','#ce4f36'][index]);
      context.fillStyle = '#fff'; context.font = '800 15px Arial, sans-serif'; drawCanvasText(context, meal?.food_name || 'Saved meal', slot[0]+16, slot[1]+slot[3]-24, slot[2]-32, 18, 2); context.restore();
    });
  } else if (scene === 2) {
    const meal = replay.highestCalorieMeal;
    context.fillStyle = '#ffd5b6'; context.font = '900 17px Arial, sans-serif'; context.fillText('THE BIGGEST PLATE', 52, 205);
    context.fillStyle = '#fffaf0'; context.font = '700 59px Georgia, serif'; context.fillText('Highest-calorie', 52, 280); context.fillText('meal of the week.', 52, 345);
    drawWeeklyReplayMealVisual(context, replay, meal, 52, 405, 616, 500, '#ef7624');
    drawWeeklyReplayMealCaption(context, meal, 78, 830, 440);
    fillRoundedCanvasRect(context, 480, 815, 158, 70, 35, '#f7b941');
    context.fillStyle = '#173f32'; context.font = '900 24px Arial, sans-serif'; context.textAlign = 'center'; context.fillText(`${Number(meal?.calories || 0).toLocaleString()} cal`, 559, 858); context.textAlign = 'left';
    context.fillStyle = '#ffd5b6'; context.font = '500 19px Arial, sans-serif'; context.fillText('A highlight, not a judgment.', 52, 1035);
  } else if (scene === 3) {
    const cards = [{ meal: replay.lowestCalorieMeal, label: 'LIGHTEST MEAL', accent: '#1a806b' }, { meal: replay.healthiestMeal, label: 'STRONGEST FOOD SCORE', accent: '#ef7624' }];
    context.fillStyle = '#b85b2a'; context.font = '900 17px Arial, sans-serif'; context.fillText('TWO DIFFERENT WINS', 52, 200);
    context.fillStyle = '#2a2019'; context.font = '700 54px Georgia, serif'; context.fillText('Lightest plate.', 52, 275); context.fillText('Strongest balance.', 52, 335);
    cards.forEach((card, index) => {
      const y = 405 + (index * 370);
      drawWeeklyReplayMealVisual(context, replay, card.meal, 52, y, 240, 310, card.accent);
      context.fillStyle = '#a65d33'; context.font = '900 14px Arial, sans-serif'; context.fillText(card.label, 322, y + 45);
      context.fillStyle = '#2d2119'; context.font = '700 28px Georgia, serif'; drawCanvasText(context, card.meal?.food_name || 'Saved meal', 322, y + 94, 330, 34, 2);
      context.fillStyle = '#17604a'; context.font = '900 23px Arial, sans-serif';
      context.fillText(index ? `${analyzeMealQuality(card.meal || {}).score}/100 score` : `${Number(card.meal?.calories || 0).toLocaleString()} calories`, 322, y + 185);
    });
  } else if (scene === 4) {
    fillRoundedCanvasRect(context, 52, 220, 616, 820, 45, 'rgba(255,255,255,.12)');
    context.font = '145px Arial, sans-serif'; context.textAlign = 'center'; context.fillText(replay.persona.emoji, 360, 470);
    context.fillStyle = '#ffd5b6'; context.font = '900 17px Arial, sans-serif'; context.fillText('YOUR FOOD CHARACTER', 360, 555);
    context.fillStyle = '#fffaf0'; context.font = '700 56px Georgia, serif'; drawCanvasText(context, replay.persona.title, 360, 635, 530, 62, 2);
    context.fillStyle = '#fff0e4'; context.font = '400 22px Arial, sans-serif'; drawCanvasText(context, replay.persona.copy, 360, 785, 500, 31, 3);
    context.fillStyle = '#f8c04f'; context.font = '900 16px Arial, sans-serif'; context.fillText(`REPEAT FAVORITE · ${replay.repeatFavorite || 'STILL EMERGING'}`, 360, 955); context.textAlign = 'left';
  } else if (scene === 5) {
    context.fillStyle = '#b85d2d'; context.font = '900 17px Arial, sans-serif'; context.fillText('SEVEN-DAY PLAYBACK', 52, 205);
    context.fillStyle = '#2c2018'; context.font = '700 56px Georgia, serif'; context.fillText('Your rhythm,', 52, 278); context.fillText('day by day.', 52, 340);
    const maxCalories = Math.max(...replay.days.map((day) => day.calories), 1);
    const barWidth = 66; const barGap = 22;
    replay.days.forEach((day, index) => {
      const x = 56 + (index * (barWidth + barGap)); const targetHeight = Math.max(36, Math.round(day.calories / maxCalories * 440));
      const barReveal = weeklyVideoEase(Math.max(0, Math.min(1, (localProgress * 2) - (index * .08)))); const height = targetHeight * barReveal;
      fillRoundedCanvasRect(context, x, 900-height, barWidth, height, 13, index === replay.days.length-1 ? '#17604a' : '#ef7a25');
      context.textAlign='center'; context.fillStyle='#715f52'; context.font='800 15px Arial, sans-serif'; context.fillText(replayDayLabel(day),x+barWidth/2,940); context.fillStyle='#244c3d'; context.fillText(Math.round(day.calories).toLocaleString(),x+barWidth/2,972);
    }); context.textAlign='left';
    fillRoundedCanvasRect(context,52,1040,616,110,24,'#173f32'); context.fillStyle='#f8c45c'; context.font='900 15px Arial, sans-serif'; context.fillText('WEEK TOTAL',82,1080); context.fillStyle='#fffaf0'; context.font='700 31px Georgia, serif'; context.fillText(`${replay.calories.toLocaleString()} recorded calories`,82,1125);
  } else if (scene === 6) {
    context.fillStyle='#f5ba49'; context.font='900 17px Arial, sans-serif'; context.fillText('BODY MAP · FOOD SIGNALS',52,195);
    context.fillStyle='#fffaf0'; context.font='700 53px Georgia, serif'; context.fillText('Where your foods',52,265); context.fillText('showed up.',52,325);
    drawWeeklyReplayBodyFigure(context,replay,weeklyVideoEase(Math.min(localProgress*2,1)));
    context.fillStyle='#bcd6cb'; context.font='500 16px Arial, sans-serif'; context.fillText('Food-pattern highlights only · Not medical results',52,1165);
  } else {
    context.fillStyle='#f5ba49'; context.font='900 17px Arial, sans-serif'; context.fillText('THE FINAL PLATE',52,220);
    context.fillStyle='#fffaf0'; context.font='700 62px Georgia, serif'; context.fillText('A week worth',52,300); context.fillText('remembering.',52,370);
    const stats=[['FOOD SCORE',`${replay.foodScore}/100`],['DIFFERENT FOODS',replay.variety.toString()],['MEALS REPLAYED',replay.meals.length.toString()],['YOUR TITLE',replay.persona.title]];
    stats.forEach((stat,index)=>{const x=52+((index%2)*318);const y=455+(Math.floor(index/2)*210);fillRoundedCanvasRect(context,x,y,298,180,28,'rgba(255,255,255,.09)');context.fillStyle='#bcd2c8';context.font='900 13px Arial, sans-serif';context.fillText(stat[0],x+24,y+45);context.fillStyle='#fffaf0';context.font=index===3?'700 24px Georgia, serif':'700 42px Georgia, serif';drawCanvasText(context,stat[1],x+24,y+98,250,33,2);});
    context.fillStyle='#f5ba49';context.font='900 17px Arial, sans-serif';context.fillText('MAP YOUR NEXT MEAL',52,1005);context.fillStyle='#fffaf0';context.font='700 35px Georgia, serif';context.fillText('mymealmap1.netlify.app',52,1055);context.fillStyle='#bcd2c8';context.font='400 18px Arial, sans-serif';context.fillText('Your food story continues next week.',52,1110);
  }
  context.restore();
  drawWeeklyReplayProgress(context, safeElapsed);
}

function startWeeklyReplayPreview(replay = buildWeeklyReplayData()) {
  cancelAnimationFrame(weeklyReplayPreviewFrame);
  const startedAt = performance.now();
  const render = (now) => {
    drawWeeklyReplayVideoFrame(replay, (now - startedAt) % weeklyReplayVideoDuration);
    weeklyReplayPreviewFrame = requestAnimationFrame(render);
  };
  weeklyReplayPreviewFrame = requestAnimationFrame(render);
}

function getWeeklyReplayVideoMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  return [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ].find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

async function createWeeklyReplayVideo() {
  if (weeklyReplayVideoBlob) return weeklyReplayVideoBlob;
  if (weeklyReplayVideoBusy) throw new Error('Video generation is already running.');
  const canvas = document.getElementById('weeklyVideoCanvas');
  const mimeType = getWeeklyReplayVideoMimeType();
  if (!canvas?.captureStream || !mimeType) throw new Error('Video export is not supported by this browser.');
  const replay = weeklyReplayVideoData || buildWeeklyReplayData();
  cancelAnimationFrame(weeklyReplayPreviewFrame);
  setWeeklyVideoBusy(true);
  setWeeklyVideoFeedback('Preparing snapshots and creating your 30-second replay… Keep this screen open.');
  try {
    await prepareWeeklyReplayImages(replay);
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4000000 });
    const chunks = [];
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data?.size) chunks.push(event.data);
    });
    const stopped = new Promise((resolve, reject) => {
      recorder.addEventListener('stop', resolve, { once: true });
      recorder.addEventListener('error', () => reject(recorder.error || new Error('Video recording failed.')), { once: true });
    });
    recorder.start(500);
    const startedAt = performance.now();
    await new Promise((resolve) => {
      const render = (now) => {
        const elapsed = now - startedAt;
        drawWeeklyReplayVideoFrame(replay, elapsed);
        if (elapsed >= weeklyReplayVideoDuration) {
          resolve();
          return;
        }
        weeklyReplayPreviewFrame = requestAnimationFrame(render);
      };
      weeklyReplayPreviewFrame = requestAnimationFrame(render);
    });
    recorder.stop();
    await stopped;
    stream.getTracks().forEach((track) => track.stop());
    weeklyReplayVideoBlob = new Blob(chunks, { type: recorder.mimeType || mimeType });
    showWeeklyVideoPlayer(weeklyReplayVideoBlob);
    setWeeklyVideoFeedback('Your replay video is ready.', 'success');
    return weeklyReplayVideoBlob;
  } finally {
    setWeeklyVideoBusy(false);
    startWeeklyReplayPreview(replay);
  }
}

function weeklyReplayVideoFile(blob) {
  const isMp4 = blob.type.includes('mp4');
  return new File([blob], `mymealmap-weekly-replay.${isMp4 ? 'mp4' : 'webm'}`, { type: isMp4 ? 'video/mp4' : 'video/webm' });
}

async function saveWeeklyReplayVideo(existingBlob) {
  try {
    if (!(existingBlob instanceof Blob) && !weeklyReplayVideoBlob) {
      await createWeeklyReplayVideo();
      setWeeklyVideoFeedback('Video ready. Watch it here, then tap Save video or Create & share.', 'success');
      return;
    }
    const blob = existingBlob instanceof Blob ? existingBlob : weeklyReplayVideoBlob;
    const file = weeklyReplayVideoFile(blob);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setWeeklyVideoFeedback('Video saved to this device.', 'success');
  } catch (error) {
    console.error(error);
    setWeeklyVideoFeedback(error.message || 'Could not create the video on this device.', 'error');
  }
}

async function shareWeeklyReplayVideo() {
  try {
    const blob = await createWeeklyReplayVideo();
    const file = weeklyReplayVideoFile(blob);
    const replay = buildWeeklyReplayData();
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'My MyMealMap Weekly Replay',
        text: `${replay.persona.title}: ${replay.meals.length} meals, ${replay.variety} different foods, and a ${replay.foodScore}/100 food score.`,
        files: [file]
      });
      setWeeklyVideoFeedback('Replay shared successfully.', 'success');
      return;
    }
    await saveWeeklyReplayVideo(blob);
    setWeeklyVideoFeedback('Video saved. Add it to Facebook, Instagram, Telegram, or WhatsApp.', 'success');
  } catch (error) {
    if (error?.name === 'AbortError') {
      setWeeklyVideoFeedback('Sharing canceled.');
      return;
    }
    console.error(error);
    setWeeklyVideoFeedback(error.message || 'Could not share the replay video.', 'error');
  }
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

function renderWeeklyCalories(meals, replayDays = []) {
  const days = replayDays.length ? replayDays.map((day) => {
    const date = new Date(day.date);
    date.setHours(0, 0, 0, 0);
    return { date, calories: 0 };
  }) : Array.from({ length: 7 }, (_, index) => {
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
  setText('weeklyHealthSnapshotSubtitle', 'Your data only');
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
  parts.push(`${name} logged ${meals.length} meal${meals.length !== 1 ? 's' : ''} across ${days} recorded day${days !== 1 ? 's' : ''} (${calories.toLocaleString()} calories, about ${avgPerDay.toLocaleString()} per active day).`);
  parts.push('This replay reflects logged meals only, so missing entries can change the pattern.');
  if (favoriteFood) parts.push(`Most repeated dish: ${favoriteFood}.`);
  if (spend > 0) parts.push(`Food spending recorded this week: ${formatMoney(spend)}.`);
  return parts.join(' ');
}

function buildFoodAchievementProfile(member = appState.currentMember) {
  const meals = member
    ? appState.meals.filter((meal) => mealBelongsToMember(meal, member, true))
    : [];
  const dayStats = new Map();
  const uniqueFoods = new Set();
  const breakfastDays = new Set();
  const foodCounts = new Map();
  let snackCount = 0;
  let midnightCount = 0;
  let photoCount = 0;
  let usdaCount = 0;
  let homeMealCount = 0;

  meals.forEach((meal) => {
    const day = mealDayKey(meal);
    if (day) {
      const stats = dayStats.get(day) || { calories: 0, meals: 0, text: '' };
      stats.calories += Number(meal.calories) || 0;
      stats.meals += 1;
      stats.text += ` ${foodSearchText(meal)}`;
      dayStats.set(day, stats);
    }

    const foodName = String(meal.food_name || '').trim().toLowerCase();
    if (foodName) {
      uniqueFoods.add(foodName);
      foodCounts.set(foodName, (foodCounts.get(foodName) || 0) + 1);
    }

    const mealType = getMealType(meal) || inferMealTypeFromTimestamp(meal.eaten_at || meal.created_at);
    if (mealType === 'snack') snackCount += 1;
    if (mealType === 'breakfast' && day) breakfastDays.add(day);
    const mealDate = new Date(meal.eaten_at || meal.created_at);
    if (!Number.isNaN(mealDate.getTime()) && mealDate.getHours() <= 4) midnightCount += 1;
    if (meal.photo_url) photoCount += 1;
    if (getNotesMetadataValue(meal.notes, 'usda_fdc')) usdaCount += 1;
    if (!String(meal.restaurant_name || '').trim()) homeMealCount += 1;
  });

  const maxDayCalories = Math.round(Math.max(0, ...Array.from(dayStats.values(), (day) => day.calories)));
  const maxDayMeals = Math.max(0, ...Array.from(dayStats.values(), (day) => day.meals));
  const repeatCount = Math.max(0, ...foodCounts.values());
  const longestStreak = longestConsecutiveFoodLogStreak([...dayStats.keys()]);
  const rainbowCount = Math.max(0, ...Array.from(dayStats.values(), (day) => countFoodColorGroups(day.text)));

  const badge = (id, icon, name, title, description, current, target, progressLabel, options = {}) => ({
    id,
    icon,
    name,
    title,
    description,
    current,
    target,
    progressLabel,
    earned: current >= target,
    estimated: Boolean(options.estimated)
  });

  const achievements = [
    badge('first-bite', '🍴', 'First Bite', 'Food Rookie', 'Log your first meal.', meals.length, 1, `${Math.min(meals.length, 1)}/1 meal`),
    badge('big-day', '🔥', '2,500 Club', 'The Big Day Logger', 'Log an estimated 2,500 calories in one day.', maxDayCalories, 2500, `${Math.min(maxDayCalories, 2500).toLocaleString()}/2,500 kcal`, { estimated: true }),
    badge('buffet-boss', '👑', 'Buffet Boss', 'Buffet Boss', 'Log five meals or snacks in one day.', maxDayMeals, 5, `${Math.min(maxDayMeals, 5)}/5 in one day`),
    badge('snack-commander', '🍿', 'Snack Attack', 'Snack Commander', 'Log ten snacks across your diary.', snackCount, 10, `${Math.min(snackCount, 10)}/10 snacks`),
    badge('breakfast-champion', '☀️', 'Rise & Dine', 'Breakfast Champion', 'Log breakfast on five different days.', breakfastDays.size, 5, `${Math.min(breakfastDays.size, 5)}/5 days`),
    badge('midnight-muncher', '🌙', 'Midnight Muncher', 'Midnight Muncher', 'Log something between midnight and 4:59 AM.', midnightCount, 1, midnightCount ? 'Night snack spotted' : 'Waiting for midnight'),
    badge('flavor-explorer', '🌍', 'Flavor Explorer', 'The Flavor Explorer', 'Discover twenty different logged foods.', uniqueFoods.size, 20, `${Math.min(uniqueFoods.size, 20)}/20 foods`),
    badge('rainbow-collector', '🌈', 'Rainbow Plate', 'Rainbow Collector', 'Spot five food-color groups in one day.', rainbowCount, 5, `${Math.min(rainbowCount, 5)}/5 colors`),
    badge('camera-first', '📸', 'Camera Eats First', 'Camera Eats First', 'Save ten meals with a photo.', photoCount, 10, `${Math.min(photoCount, 10)}/10 photos`),
    badge('usda-expert', '🔎', 'USDA Expert', 'The USDA Expert', 'Log ten foods matched with USDA data.', usdaCount, 10, `${Math.min(usdaCount, 10)}/10 matches`),
    badge('diary-detective', '📔', 'Diary Detective', 'Diary Detective', 'Build a seven-day meal logging streak.', longestStreak, 7, `${Math.min(longestStreak, 7)}/7 day streak`),
    badge('family-chef', '🍳', 'Home Table Hero', 'The Family Chef', 'Log ten meals without a restaurant.', homeMealCount, 10, `${Math.min(homeMealCount, 10)}/10 home meals`),
    badge('same-again', '🔁', 'Same Again, Chef', 'The Family Favorite', 'Repeat one favorite food three times.', repeatCount, 3, `${Math.min(repeatCount, 3)}/3 repeats`)
  ];
  const earnedBeforeLegend = achievements.filter((item) => item.earned).length;
  achievements.push(badge('feast-legend', '🎉', 'Feast Mode Legend', 'Feast Mode Legend', 'Unlock eight other food achievements.', earnedBeforeLegend, 8, `${Math.min(earnedBeforeLegend, 8)}/8 badges`));

  const starterTitle = { id: 'starter', icon: '🍽️', title: 'Fresh Plate' };
  const unlockedTitles = [starterTitle, ...achievements.filter((item) => item.earned).map((item) => ({ id: item.id, icon: item.icon, title: item.title }))];
  const selectedId = appState.profileMeasurements[member?.id]?.selected_food_title || '';
  const selectedTitle = unlockedTitles.find((item) => item.id === selectedId);
  const activeTitle = selectedTitle || unlockedTitles[unlockedTitles.length - 1] || starterTitle;
  const earnedAchievements = achievements.filter((item) => item.earned);
  const savedFeaturedIds = appState.profileMeasurements[member?.id]?.featured_food_achievements;
  const featuredIds = Array.isArray(savedFeaturedIds)
    ? savedFeaturedIds.filter((id) => earnedAchievements.some((item) => item.id === id)).slice(-3)
    : earnedAchievements.slice(-3).reverse().map((item) => item.id);
  const featuredAchievements = featuredIds.map((id) => earnedAchievements.find((item) => item.id === id)).filter(Boolean);
  return { achievements, unlockedTitles, activeTitle, featuredAchievements, earnedCount: earnedAchievements.length };
}

function longestConsecutiveFoodLogStreak(dayKeys) {
  const timestamps = [...new Set(dayKeys)]
    .map((key) => {
      const day = new Date(key);
      return Number.isNaN(day.getTime()) ? NaN : Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
    })
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
  let longest = timestamps.length ? 1 : 0;
  let current = longest;
  for (let index = 1; index < timestamps.length; index += 1) {
    current = timestamps[index] - timestamps[index - 1] === 86400000 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

function countFoodColorGroups(text) {
  const groups = [
    ['red', 'tomato', 'strawberry', 'watermelon', 'cherry', 'pepper'],
    ['orange', 'orange', 'carrot', 'pumpkin', 'mango', 'sweet potato'],
    ['yellow', 'banana', 'corn', 'pineapple', 'lemon', 'egg'],
    ['green', 'broccoli', 'spinach', 'greens', 'avocado', 'cucumber', 'lettuce'],
    ['blue-purple', 'blueberry', 'grape', 'eggplant', 'beet', 'purple'],
    ['white-brown', 'rice', 'bread', 'oat', 'potato', 'mushroom', 'chicken', 'tofu']
  ];
  const normalized = String(text || '').toLowerCase();
  return groups.filter(([, ...keywords]) => keywords.some((keyword) => normalized.includes(keyword))).length;
}

function handleSelectFoodTitle(titleId) {
  const member = appState.currentMember;
  if (!member) return;
  const profile = buildFoodAchievementProfile(member);
  if (!profile.unlockedTitles.some((title) => title.id === titleId)) return;
  appState.profileMeasurements[member.id] = {
    ...(appState.profileMeasurements[member.id] || {}),
    selected_food_title: titleId
  };
  saveStoredAppData();
  updateProfileUi();
  renderProfiles();
  renderProfile();
}

function handleToggleFeaturedAchievement(achievementId) {
  const member = appState.currentMember;
  if (!member) return;
  const profile = buildFoodAchievementProfile(member);
  const achievement = profile.achievements.find((item) => item.id === achievementId && item.earned);
  if (!achievement) return;
  const currentIds = profile.featuredAchievements.map((item) => item.id);
  const nextIds = currentIds.includes(achievementId)
    ? currentIds.filter((id) => id !== achievementId)
    : [...currentIds, achievementId].slice(-3);
  appState.profileMeasurements[member.id] = {
    ...(appState.profileMeasurements[member.id] || {}),
    featured_food_achievements: nextIds
  };
  saveStoredAppData();
  renderProfile();
}

function renderProfileAchievements(member) {
  const container = document.getElementById('profileAchievements');
  if (!container) return;
  const profile = buildFoodAchievementProfile(member);
  document.getElementById('profileFoodTitle').textContent = `${profile.activeTitle.icon} ${profile.activeTitle.title}`;
  container.innerHTML = `
    <div class="achievement-heading">
      <div><p class="eyebrow">Food Trophy Cabinet</p><h4>${profile.earnedCount} of ${profile.achievements.length} unlocked</h4></div>
      <span>${profile.activeTitle.icon} Active title</span>
    </div>
    <div class="food-title-picker">
      <strong>Choose your title</strong>
      <div>${profile.unlockedTitles.map((title) => `<button class="${profile.activeTitle.id === title.id ? 'active' : ''}" type="button" data-profile-title="${escapeAttr(title.id)}">${title.icon} ${escapeHtml(title.title)}</button>`).join('')}</div>
    </div>
    <div class="featured-achievement-block">
      <strong>Favorite badges <small>Choose up to three</small></strong>
      ${profile.featuredAchievements.length ? `<div class="featured-achievement-row">${profile.featuredAchievements.map((achievement) => `<span>${achievement.icon}<b>${escapeHtml(achievement.name)}</b></span>`).join('')}</div>` : '<p>Unlock a badge, then pin it here.</p>'}
    </div>
    <details class="achievement-cabinet">
      <summary>View Trophy Cabinet <span>${profile.earnedCount}/${profile.achievements.length} earned</span></summary>
      <div class="achievement-grid">
        ${profile.achievements.map((achievement) => `
          <article class="achievement-card ${achievement.earned ? 'earned' : 'locked'}">
            <div class="achievement-icon">${achievement.earned ? achievement.icon : '🔒'}</div>
            <div><span>${achievement.earned ? 'Unlocked' : achievement.progressLabel}${achievement.estimated ? ' · estimated' : ''}</span><strong>${escapeHtml(achievement.name)}</strong><p>${escapeHtml(achievement.description)}</p></div>
            ${achievement.earned ? `<button class="achievement-pin ${profile.featuredAchievements.some((item) => item.id === achievement.id) ? 'active' : ''}" type="button" data-feature-achievement="${escapeAttr(achievement.id)}" aria-label="${profile.featuredAchievements.some((item) => item.id === achievement.id) ? 'Remove' : 'Add'} ${escapeAttr(achievement.name)} from favorite badges">★</button>` : ''}
            <div class="achievement-progress"><i style="width:${Math.min(100, Math.round((achievement.current / achievement.target) * 100))}%"></i></div>
          </article>`).join('')}
      </div>
    </details>
    <p class="achievement-note">Achievements celebrate diary activity, not health outcomes. Calories are estimates and are never treated as a target.</p>`;
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
  renderProfileAchievements(member);
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

  const { targetCalories, proteinGrams, waterLiters } = calculateProfileTargets({
    height,
    weight,
    age,
    sex,
    activity,
    goal
  });
  appState.profileMeasurements[member.id] = {
    ...(appState.profileMeasurements[member.id] || {}),
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
  member.age = age;
  member.sex = sex;
  member.activity = activity;
  member.goal = goal;
  member.health_focus = healthFocus;
  member.food_alerts = foodAlerts;
  member.target_calories = targetCalories;
  member.protein_grams = proteinGrams;
  member.water_liters = waterLiters;
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

  await syncMemberToSupabase(member.id, {
    first_name: getProfileIdentity(member).firstName,
    last_name: getProfileIdentity(member).lastName,
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
  });
}

async function handleSaveProfileOnboarding() {
  const member = appState.currentMember;
  if (!member) return;
  const firstName = document.getElementById('onboardingFirstName').value.trim();
  const lastName = document.getElementById('onboardingLastName').value.trim();
  const height = numberOrNull(document.getElementById('onboardingHeight').value);
  const age = numberOrNull(document.getElementById('onboardingAge').value);
  const weight = numberOrNull(document.getElementById('onboardingWeight').value);
  const sex = document.getElementById('onboardingSex').value;
  const activity = Number(document.getElementById('onboardingActivity').value);
  const goal = document.getElementById('onboardingGoal').value;
  const healthFocus = document.getElementById('onboardingHealthFocus').value;
  const foodAlerts = document.getElementById('onboardingFoodAlerts').value.trim();

  if (!firstName || !lastName) {
    setProfileOnboardingFeedback('Enter both first name and last name.', 'error');
    return;
  }
  if (!height || height < 50 || height > 260) {
    setProfileOnboardingFeedback('Enter a valid height in centimeters.', 'error');
    return;
  }
  if (!age || age < 14 || age > 100) {
    setProfileOnboardingFeedback('Enter a valid age.', 'error');
    return;
  }
  if (!weight || weight < 10 || weight > 400) {
    setProfileOnboardingFeedback('Enter a valid weight in kilograms.', 'error');
    return;
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const measurements = appState.profileMeasurements[member.id] || {};
  const { targetCalories, proteinGrams, waterLiters } = calculateProfileTargets({
    height,
    weight,
    age,
    sex,
    activity,
    goal
  });
  appState.profileMeasurements[member.id] = {
    ...measurements,
    first_name: firstName,
    last_name: lastName,
    height_cm: height,
    age,
    sex,
    activity,
    goal,
    health_focus: healthFocus,
    food_alerts: foodAlerts,
    weight_kg: weight,
    target_calories: targetCalories,
    protein_grams: proteinGrams,
    water_liters: waterLiters
  };
  member.name = fullName;
  member.first_name = firstName;
  member.last_name = lastName;
  member.height_cm = height;
  member.weight_kg = weight;
  member.age = age;
  member.sex = sex;
  member.activity = activity;
  member.goal = goal;
  member.health_focus = healthFocus;
  member.food_alerts = foodAlerts;
  member.target_calories = targetCalories;
  member.protein_grams = proteinGrams;
  member.water_liters = waterLiters;
  const matchingMember = appState.members.find((item) => item.id === member.id);
  if (matchingMember) {
    matchingMember.name = fullName;
    matchingMember.first_name = firstName;
    matchingMember.last_name = lastName;
    matchingMember.height_cm = height;
    matchingMember.weight_kg = weight;
    matchingMember.age = age;
    matchingMember.sex = sex;
    matchingMember.activity = activity;
    matchingMember.goal = goal;
    matchingMember.health_focus = healthFocus;
    matchingMember.food_alerts = foodAlerts;
    matchingMember.target_calories = targetCalories;
    matchingMember.protein_grams = proteinGrams;
    matchingMember.water_liters = waterLiters;
  }
  if (!appState.bioLogs[member.id]) appState.bioLogs[member.id] = {};
  appState.bioLogs[member.id][todayKey()] = {
    ...(appState.bioLogs[member.id][todayKey()] || {}),
    weight_kg: weight
  };

  saveStoredAppData();
  updateProfileUi();
  renderProfiles();
  renderProfile();
  renderDashboard();
  renderSettings();
  closeProfileOnboardingModal();

  await syncMemberToSupabase(member.id, {
    name: fullName,
    first_name: firstName,
    last_name: lastName,
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
  });
}

function buildProfileHealthSummary(measurements) {
  const focusLabels = {
    balanced: 'Balanced eating',
    'blood-sugar': 'Blood sugar support',
    'heart-health': 'Heart health',
    'low-sodium': 'Lower sodium',
    'higher-protein': 'Higher protein',
    'glp1-support': 'GLP-1 support',
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
  const parsedName = parseProfileName(newName);

  member.name = newName;
  member.first_name = parsedName.firstName;
  member.last_name = parsedName.lastName;
  const matchingMember = appState.members.find((item) => item.id === member.id);
  if (matchingMember) {
    matchingMember.name = newName;
    matchingMember.first_name = parsedName.firstName;
    matchingMember.last_name = parsedName.lastName;
  }
  appState.profileMeasurements[member.id] = {
    ...(appState.profileMeasurements[member.id] || {}),
    first_name: parsedName.firstName,
    last_name: parsedName.lastName
  };
  saveStoredAppData();
  updateProfileUi();
  renderProfiles();
  renderProfile();
  renderSettings();

  await syncMemberToSupabase(member.id, {
    name: newName,
    first_name: parsedName.firstName,
    last_name: parsedName.lastName
  });
}

async function syncMemberToSupabase(memberId, fields) {
  if (!window.familyBitesDb?.isConfigured || !appState.familyId) return;
  try {
    await window.familyBitesDb.updateMember(memberId, fields);
  } catch (error) {
    console.warn('Profile change saved locally but Supabase write failed.', error);
  }
}

async function saveSnapScan(event) {
  event.preventDefault();
  const photoUrl = document.getElementById('photoPreview').dataset.photoUrl || '';
  if (!photoUrl) return;
  if (snapSaveInFlight) return;
  snapSaveInFlight = true;
  const submitButton = event.currentTarget?.querySelector('button[type="submit"]');
  const submitLabel = submitButton?.textContent || '';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Saving meal...';
  }

  try {
    if (snapEstimateNeedsRefresh()) {
      await applyAiCalorieEstimate({ preserveFoodName: true });
    }
    let savedPhotoUrl = photoUrl;
    if (window.familyBitesDb?.isConfigured && photoUrl.startsWith('data:')) {
      try {
        const uploadedUrl = await window.familyBitesDb.uploadScanPhoto(photoUrl);
        if (uploadedUrl) savedPhotoUrl = uploadedUrl;
      } catch (uploadError) {
        console.warn('Scan photo upload failed, keeping local copy.', uploadError);
      }
    }

    const mealType = document.getElementById('mealType').value;
    const mealDate = document.getElementById('mealDate').value;
    const mealTime = document.getElementById('mealTime').value;
    const finalMealType = mealType || inferMealTypeFromTimestamp(buildMealTimestamp(mealDate, mealTime));
    const baseNotes = document.getElementById('notes').value.trim();
    const usdaNutrition = getSelectedUsdaNutrition();
    const meal = await persistNewMeal({
      id: crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}`,
      family_id: appState.familyId,
      member_id: appState.currentMember.id,
      food_name: document.getElementById('foodName').value.trim() || (snapScanDraft.foods?.[0]?.name || ''),
      restaurant_name: '',
      location_name: '',
      price: null,
      calories: numberOrNull(document.getElementById('calories').value),
      protein_g: usdaNutrition?.protein_g ?? null,
      carbs_g: usdaNutrition?.carbs_g ?? null,
      fat_g: usdaNutrition?.fat_g ?? null,
      notes: notesWithMealType(baseNotes || snapScanDraft.note || '', finalMealType, {
        scanIngredients: snapScanDraft.ingredients,
        scanTags: snapScanDraft.tags,
        usdaFdcId: usdaNutrition?.fdc_id,
        usdaGrams: usdaNutrition?.grams
      }),
      photo_url: savedPhotoUrl,
      eaten_at: buildMealTimestamp(mealDate, mealTime)
    });
    const scan = normalizeSnapScan({
      id: crypto.randomUUID ? crypto.randomUUID() : `scan-${Date.now()}`,
      family_id: appState.familyId,
      member_id: appState.currentMember.id,
      food_name: meal.food_name,
      calories: numberOrNull(document.getElementById('calories').value),
      notes: notesWithMealType(baseNotes, finalMealType),
      photo_url: savedPhotoUrl,
      ingredients: [...snapScanDraft.ingredients],
      tags: [...snapScanDraft.tags],
      confidence: snapScanDraft.confidence,
      ai_note: snapScanDraft.note,
      foods: [...snapScanDraft.foods],
      created_at: meal.eaten_at,
      linked_meal_id: meal.id,
      _sync_status: 'pending'
    });

    appState.snapScans.unshift(scan);
    saveStoredAppData();
    renderAll();
    if (window.familyBitesDb?.isConfigured) {
      try {
        const savedScan = await window.familyBitesDb.saveSnapScan(scan);
        appState.snapScans = appState.snapScans.map((item) => item.id === scan.id ? normalizeSnapScan(savedScan) : item);
        saveStoredAppData();
        renderAll();
      } catch (error) {
        console.warn('Scan saved locally but Supabase write failed.', error);
        showAppNotice('Scan saved on this device and will sync when the connection returns.', 'warning');
      }
    }
    resetSnapWorkspace();
  } finally {
    snapSaveInFlight = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitLabel;
    }
  }
}

function inferMealTypeFromTimestamp(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return 'other';
  const hour = date.getHours();
  if (hour >= 5 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 12) return 'brunch';
  if (hour >= 12 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 22) return 'dinner';
  return 'snack';
}

async function handleAddScanToDiary(scanId) {
  const scan = appState.snapScans.find((item) => item.id === scanId);
  if (!scan || isSnapLinkedToMeal(scan)) return;
  const mealType = getMealType(scan) || inferMealTypeFromTimestamp(scan.created_at);
  const savedMeal = await persistNewMeal({
    id: crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}`,
    family_id: appState.familyId,
    member_id: scan.member_id || appState.currentMember.id,
    food_name: buildSnapDisplayName(scan),
    restaurant_name: '',
    location_name: '',
    price: null,
    calories: numberOrNull(scan.calories),
    notes: notesWithMealType(notesWithoutMealType(scan.notes || '') || scan.ai_note || '', mealType, {
      scanIngredients: scan.ingredients,
      scanTags: scan.tags
    }),
    photo_url: scan.photo_url || '',
    eaten_at: scan.created_at || new Date().toISOString()
  });
  scan.linked_meal_id = savedMeal?.id || '';
  saveStoredAppData();
  renderAll();
  if (window.familyBitesDb?.isConfigured) {
    try {
      const updatedScan = await window.familyBitesDb.updateSnapScan(scan.id, { linked_meal_id: scan.linked_meal_id });
      if (updatedScan) {
        appState.snapScans = appState.snapScans.map((item) => item.id === scan.id ? normalizeSnapScan(updatedScan) : item);
        saveStoredAppData();
        renderAll();
      }
    } catch (error) {
      console.warn('Scan linked locally but Supabase write failed.', error);
    }
  }
}

async function handleDeleteSnapScan(scanId) {
  const scan = appState.snapScans.find((item) => item.id === scanId);
  if (!scan) return;
  if (!confirm(`Delete scan "${buildSnapDisplayName(scan)}"?`)) return;
  if (window.familyBitesDb?.isConfigured && looksLikeUuid(scanId)) {
    try {
      await window.familyBitesDb.deleteSnapScan(scanId);
    } catch (error) {
      console.warn('Scan delete failed.', error);
      showAppNotice('Could not delete this scan. Check your connection and try again.', 'error');
      return;
    }
  }
  appState.snapScans = appState.snapScans.filter((item) => item.id !== scanId);
  saveStoredAppData();
  renderAll();
}

function updateMealPreview() {
  const food = document.getElementById('foodName').value.trim();
  const calories = document.getElementById('calories').value.trim();
  const mealType = document.getElementById('mealType').value;
  const mealDate = document.getElementById('mealDate').value;
  const mealTime = document.getElementById('mealTime').value;
  const photoUrl = document.getElementById('photoPreview').dataset.photoUrl || '';
  const previewPhoto = document.getElementById('previewPhoto');
  const ingredientSummary = snapScanDraft.ingredients.length
    ? `${snapScanDraft.ingredients.length} possible ingredients`
    : 'Ingredients pending';
  document.getElementById('previewFood').textContent = food || 'Scan result';
  document.getElementById('previewMeta').textContent = [
    mealType ? dashboardMealTypeLabel(mealType) : 'Meal type not set',
    formatPreviewDateTime(mealDate, mealTime),
    calories ? `${Number(calories).toLocaleString()} calories` : 'Calories pending',
    ingredientSummary
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
  document.getElementById('notes').value = '';
  clearSnapScanDraft();
  updateMealPreview();

  try {
    const photoUrl = await resizeImageFile(file, 900, 0.82);
    const scanToken = ++latestSnapPhotoScanToken;
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.src = photoUrl;
    photoPreview.dataset.photoUrl = photoUrl;
    photoPreview.classList.remove('hidden');
    document.getElementById('photoIcon').classList.add('hidden');
    document.getElementById('photoTitle').textContent = 'Scanning photo...';
    document.getElementById('photoHint').textContent = 'AI is scanning the photo automatically. You can review and edit before saving.';
    const estimateStatus = document.getElementById('calorieEstimate');
    estimateStatus.classList.remove('estimate-success', 'estimate-error');
    estimateStatus.textContent = 'Photo ready. AI scan is starting automatically. Nothing is added to your food diary yet.';
    updateMealPreview();
    scheduleAutoSnapAiEstimate(scanToken);
  } catch (error) {
    console.warn('Could not load food photo.', error);
    alert('Could not load that food photo. Please try another image.');
    event.target.value = '';
    resetPhotoPreview();
  }
}

function resetPhotoPreview() {
  latestSnapPhotoScanToken += 1;
  if (snapPhotoScanTimer) {
    clearTimeout(snapPhotoScanTimer);
    snapPhotoScanTimer = null;
  }
  const photoPreview = document.getElementById('photoPreview');
  const previewPhoto = document.getElementById('previewPhoto');
  photoPreview.removeAttribute('src');
  photoPreview.dataset.photoUrl = '';
  photoPreview.classList.add('hidden');
  previewPhoto.removeAttribute('src');
  previewPhoto.classList.add('hidden');
  document.getElementById('photoIcon').classList.remove('hidden');
  document.getElementById('photoTitle').textContent = 'Add a food photo';
  document.getElementById('photoHint').textContent = 'Choose where your photo comes from. This only saves a scan unless you add it to the diary later.';
  const estimateStatus = document.getElementById('calorieEstimate');
  estimateStatus.classList.remove('estimate-success', 'estimate-error');
  estimateStatus.textContent = 'Add a photo and AI will scan automatically. Save the scan when you are ready.';
  document.getElementById('scanIngredientInput').value = '';
}

function scheduleAutoSnapAiEstimate(scanToken) {
  if (snapPhotoScanTimer) clearTimeout(snapPhotoScanTimer);
  snapPhotoScanTimer = setTimeout(() => {
    snapPhotoScanTimer = null;
    if (scanToken !== latestSnapPhotoScanToken) return;
    applyAiCalorieEstimate({ requestToken: scanToken });
  }, 120);
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

async function applyAiCalorieEstimate(options = {}) {
  const photoUrl = document.getElementById('photoPreview').dataset.photoUrl || '';
  const { preserveFoodName = false, requestToken = null } = options;
  await requestAiCalorieEstimate({
    imageUrl: photoUrl,
    foodName: document.getElementById('foodName').value.trim(),
    restaurantName: document.getElementById('restaurantName')?.value.trim() || '',
    mealType: document.getElementById('mealType')?.value || '',
    notes: document.getElementById('notes').value.trim(),
    scanIngredients: snapScanDraft.ingredients,
    scanTags: snapScanDraft.tags,
    statusElement: document.getElementById('calorieEstimate'),
    buttonElement: document.getElementById('aiEstimateCalories'),
    caloriesInput: document.getElementById('calories'),
    isStale: () => requestToken !== null && requestToken !== latestSnapPhotoScanToken,
    onSuccess: (estimate) => {
      const foodInput = document.getElementById('foodName');
      if (!preserveFoodName && estimate.foods?.length) {
        foodInput.value = estimate.foods.map((food) => food.name).filter(Boolean).join(', ');
      }
      setSnapInsightsFromEstimate(estimate);
      document.getElementById('photoTitle').textContent = 'Photo ready';
      document.getElementById('photoHint').textContent = 'AI estimate ready. Review the scan, save it, or add it to the diary later.';
      updateMealPreview();
      searchUsdaFoods({ automatic: true });
    },
    onError: () => {
      document.getElementById('photoTitle').textContent = 'Photo ready';
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
    scanIngredients: getMealIngredients(meal),
    scanTags: getMealScanTags(meal),
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

function buildEstimateDescription({ restaurantName, mealType, notes, scanIngredients = [], scanTags = [] }) {
  const parts = [];
  if (mealType) parts.push(`meal type: ${mealType}`);
  if (restaurantName) parts.push(`restaurant: ${restaurantName}`);
  if (notes) parts.push(`user notes: ${notes}`);
  if (scanIngredients.length) parts.push(`confirmed ingredients: ${scanIngredients.join(', ')}`);
  if (scanTags.length) parts.push(`confirmed tags: ${scanTags.join(', ')}`);
  return parts.join(' | ');
}

async function requestAiCalorieEstimate({
  imageUrl,
  foodName,
  restaurantName,
  mealType,
  notes,
  scanIngredients = [],
  scanTags = [],
  statusElement,
  buttonElement,
  caloriesInput,
  isStale,
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
    const headers = await getFunctionRequestHeaders({ 'Content-Type': 'application/json' });
    const response = await fetch('/.netlify/functions/estimate-calories', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        image_url: imageUrl,
        food_name: foodName,
        description_context: buildEstimateDescription({ restaurantName, mealType, notes, scanIngredients, scanTags }),
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
    if (isStale?.()) return null;

    const calories = Math.max(0, Math.round(Number(estimate.total_calories) || 0));
    caloriesInput.value = String(calories);
    const foods = estimate.foods?.map((food) => `${food.name} ${food.calories} kcal`).join(' + ');
    statusElement.textContent = `${foods || 'Meal'} · about ${calories.toLocaleString()} kcal (${estimate.confidence} confidence). Please confirm before saving.`;
    statusElement.classList.add('estimate-success');
    if (onSuccess) onSuccess(estimate);
    return estimate;
  } catch (error) {
    if (isStale?.()) return null;
    statusElement.textContent = error.message || 'AI scan is unavailable. Enter calories manually and try again later.';
    statusElement.classList.add('estimate-error');
    if (onError) onError(error);
    return null;
  } finally {
    if (!isStale?.()) {
      buttonElement.disabled = false;
      buttonElement.textContent = originalLabel;
    }
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
    role: member.role || 'Profile',
    first_name: member.first_name || '',
    last_name: member.last_name || '',
    weight_kg: member.weight_kg ?? null,
    height_cm: member.height_cm ?? null,
    age: member.age ?? null,
    sex: member.sex || '',
    activity: member.activity ?? null,
    goal: member.goal || '',
    health_focus: member.health_focus || '',
    food_alerts: member.food_alerts || '',
    target_calories: member.target_calories ?? null,
    protein_grams: member.protein_grams ?? null,
    water_liters: member.water_liters ?? null
  };
}

function mergeProfileMeasurementsFromMembers(members = []) {
  members.forEach((member) => {
    if (!member?.id || member.id === 'add') return;
    const existing = appState.profileMeasurements[member.id] || {};
    const parsedName = parseProfileName(member.name);
    appState.profileMeasurements[member.id] = {
      ...existing,
      first_name: member.first_name || existing.first_name || parsedName.firstName || '',
      last_name: member.last_name || existing.last_name || parsedName.lastName || '',
      height_cm: member.height_cm ?? existing.height_cm ?? null,
      weight_kg: member.weight_kg ?? existing.weight_kg ?? null,
      age: member.age ?? existing.age ?? null,
      sex: member.sex || existing.sex || '',
      activity: member.activity ?? existing.activity ?? null,
      goal: member.goal || existing.goal || '',
      health_focus: member.health_focus || existing.health_focus || '',
      food_alerts: member.food_alerts || existing.food_alerts || '',
      target_calories: member.target_calories ?? existing.target_calories ?? null,
      protein_grams: member.protein_grams ?? existing.protein_grams ?? null,
      water_liters: member.water_liters ?? existing.water_liters ?? null
    };
  });
}

function avatarMarkup(member) {
  return member?.photo
    ? `<img src="${escapeAttr(member.photo)}" alt="">`
    : escapeHtml(member?.avatar || '👤');
}

function defaultProfilePhoto(member) {
  if (member.id === 'add' || member.name === 'Add Member' || member.name === 'Add Profile') return '';
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
  return map[idKey] || map[nameKey] || '';
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
  try {
    localStorage.removeItem('familyBites.chat.v2');
    localStorage.removeItem('familyBites.chefOrders');
    localStorage.removeItem('familyBites.chefCart');
    localStorage.removeItem('familyBites.chefVoiceNotes');
  } catch (error) {
    console.warn('Could not remove retired feature caches.', error);
  }
  const storedMembers = getStoredJson(localMembersStorageKey, []).map(normalizeMember);
  const storedMeals = getStoredJson(localMealsStorageKey, []).map(normalizeMeal);
  const storedSnapScans = getStoredJson(localSnapScansStorageKey, []).map(normalizeSnapScan);
  const storedBioLogs = getStoredJson(bioLogsStorageKey, {});
  const storedProfileMeasurements = getStoredJson(profileMeasurementsStorageKey, {});
  const storedWorkoutHistory = getStoredJson(workoutHistoryStorageKey, {});
  const storedSavedWorkouts = getStoredJson(savedWorkoutsStorageKey, {});
  if (storedMembers.length) appState.members = mergeMembers(storedMembers, appState.members);
  if (Object.keys(storedBioLogs).length) appState.bioLogs = storedBioLogs;
  if (Object.keys(storedProfileMeasurements).length) appState.profileMeasurements = storedProfileMeasurements;
  if (Object.keys(storedWorkoutHistory).length) appState.workoutHistory = storedWorkoutHistory;
  if (Object.keys(storedSavedWorkouts).length) appState.savedWorkouts = storedSavedWorkouts;
  if (storedMeals.length) appState.meals = mergeRecords(storedMeals, appState.meals);
  if (storedSnapScans.length) appState.snapScans = mergeRecords(storedSnapScans, appState.snapScans);
}

function saveStoredAppData() {
  setStoredJson(localMembersStorageKey, appState.members);
  setStoredJson(localMealsStorageKey, appState.meals);
  setStoredJson(localSnapScansStorageKey, appState.snapScans);
  setStoredJson(bioLogsStorageKey, appState.bioLogs);
  setStoredJson(profileMeasurementsStorageKey, appState.profileMeasurements);
  setStoredJson(workoutHistoryStorageKey, appState.workoutHistory);
  setStoredJson(savedWorkoutsStorageKey, appState.savedWorkouts);
}

function mergeMembers(primary, fallback) {
  const byId = new Map();
  [...fallback, ...primary].forEach((member) => {
    if (!member?.id) return;
    byId.set(member.id, normalizeMember(member));
  });
  const members = Array.from(byId.values());
  const addMember = members.find((member) => member.id === 'add' || member.name === 'Add Member' || member.name === 'Add Profile');
  const realMembers = members.filter((member) => member.id !== 'add' && member.name !== 'Add Member' && member.name !== 'Add Profile');
  const hasPersistedProfiles = realMembers.some((member) => looksLikeUuid(member.id));
  const cleanedMembers = hasPersistedProfiles
    ? realMembers.filter((member) => !isSeededDefaultMember(member))
    : realMembers;
  return [
    ...cleanedMembers,
    addMember || fallback.find((member) => member.id === 'add') || { id: 'add', name: 'Add Profile', avatar: '＋', role: 'Create another profile', photo: '' }
  ];
}

function isSeededDefaultMember(member) {
  if (!member || member.id === 'add' || member.name === 'Add Member' || member.name === 'Add Profile') return false;
  const idKey = String(member.id || '').toLowerCase();
  const nameKey = String(member.name || '').toLowerCase();
  return seededDefaultMemberIds.has(idKey)
    || (!looksLikeUuid(member.id) && seededDefaultMemberNames.has(nameKey));
}

function getVisibleMembers() {
  const addMember = appState.members.find((member) => member.id === 'add' || member.name === 'Add Member' || member.name === 'Add Profile');
  const realMembers = appState.members.filter((member) => member.id !== 'add' && member.name !== 'Add Member' && member.name !== 'Add Profile');
  const hasCustomFamily = realMembers.some((member) => !isSeededDefaultMember(member));
  return hasCustomFamily
    ? [...realMembers.filter((member) => !isSeededDefaultMember(member)), addMember].filter(Boolean)
    : appState.members;
}

function getDefaultMember() {
  return getVisibleMembers().find((member) => member.id !== 'add' && member.name !== 'Add Member' && member.name !== 'Add Profile')
    || appState.members.find((member) => member.id !== 'add' && member.name !== 'Add Member' && member.name !== 'Add Profile')
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

function isPendingLocalRecord(record) {
  const id = String(record?.id || '');
  return Boolean(record && (record._sync_status === 'pending' || /^(member|meal|scan)-\d{10,}$/.test(id)));
}

function mergeRemoteRecords(remoteRecords, localRecords) {
  return mergeRecords(remoteRecords, localRecords.filter(isPendingLocalRecord));
}

function getStoredProfilePhotos() {
  return getStoredJson(profilePhotoStorageKey, {});
}

function getSessionNoticeKeys() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(sessionNoticeStorageKey) || '[]'));
  } catch (error) {
    return new Set();
  }
}

function rememberSessionNotice(key) {
  if (!key) return;
  try {
    const keys = getSessionNoticeKeys();
    keys.add(key);
    sessionStorage.setItem(sessionNoticeStorageKey, JSON.stringify([...keys]));
  } catch (error) {
    console.warn('Could not persist session notice state.', error);
  }
}

function hasSeenSessionNotice(key) {
  if (!key) return false;
  return getSessionNoticeKeys().has(key);
}

function showAppNotice(message, tone = 'info', options = {}) {
  const { onceKey = '', duration = 5200 } = options;
  if (onceKey && hasSeenSessionNotice(onceKey)) return;
  if (onceKey) rememberSessionNotice(onceKey);

  let region = document.getElementById('appNoticeRegion');
  if (!region) {
    region = document.createElement('div');
    region.id = 'appNoticeRegion';
    region.className = 'app-notice-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
  }

  const notice = document.createElement('div');
  notice.className = `app-notice app-notice-${tone}`;
  notice.textContent = message;
  region.appendChild(notice);

  requestAnimationFrame(() => notice.classList.add('visible'));

  const dismiss = () => {
    notice.classList.remove('visible');
    window.setTimeout(() => notice.remove(), 220);
  };

  window.setTimeout(dismiss, duration);
  notice.addEventListener('click', dismiss, { once: true });
}

function saveProfilePhoto(memberId, photoUrl) {
  try {
    const storedPhotos = getStoredProfilePhotos();
    storedPhotos[memberId] = photoUrl;
    localStorage.setItem(profilePhotoStorageKey, JSON.stringify(storedPhotos));
  } catch (error) {
    console.warn('Could not save profile photo locally.', error);
    showAppNotice('Profile photo updated for this session only. This browser could not save it permanently.', 'warning', { onceKey: 'profile-photo-storage-warning' });
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
    showAppNotice('Saved for this session only. This browser could not store all data permanently, so try a smaller photo.', 'warning', { onceKey: `storage-warning:${key}` });
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

function normalizeSnapScan(scan) {
  return {
    ...scan,
    id: scan.id || `scan-${Date.now()}`,
    food_name: scan.food_name || 'Scanned food',
    photo_url: scan.photo_url || '',
    calories: numberOrNull(scan.calories),
    notes: scan.notes || '',
    ingredients: Array.isArray(scan.ingredients) ? uniqueList(scan.ingredients.map(normalizeScanLabel).filter(Boolean)) : [],
    tags: Array.isArray(scan.tags) ? uniqueList(scan.tags.map((tag) => normalizeScanLabel(tag).toLowerCase()).filter(Boolean)) : [],
    confidence: scan.confidence || '',
    ai_note: scan.ai_note || '',
    foods: Array.isArray(scan.foods) ? scan.foods : [],
    created_at: scan.created_at || new Date().toISOString(),
    linked_meal_id: scan.linked_meal_id || ''
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

function dashboardMealEmptyState(message) {
  return `
    <article class="meal-card empty-meal-card">
      <span class="meal-emoji">🍽️</span>
      <div>
        <h4>${message}</h4>
        <p>Start by scanning a meal photo or adding your first entry.</p>
        <button class="secondary-button empty-state-action" data-page="snap" type="button">Add your first meal</button>
      </div>
    </article>
  `;
}

function emptyState(message) {
  return `<article class="meal-card"><span class="meal-emoji">🍽️</span><div><h4>${message}</h4><p>MyMealMap is ready when you are.</p></div></article>`;
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

function logRestaurantVisit(restaurantName) {
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
    role: role || 'Profile',
    photo: '',
    _sync_status: 'pending'
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
      const savedMember = normalizeMember(await window.familyBitesDb.saveMember(newMember));
      appState.members = appState.members.map((member) => member.id === newMember.id ? savedMember : member);
      saveStoredAppData();
      renderProfiles();
      renderSettings();
    } catch (error) {
      console.warn('Member saved locally but Supabase write failed.', error);
      showAppNotice('Profile saved on this device and will sync when the connection returns.', 'warning');
    }
  }
}

async function removeMember(memberId) {
  const member = appState.members.find((m) => m.id === memberId);
  if (!member) return;
  if (member.id === appState.currentMember?.id) {
    alert('You cannot remove the currently active profile. Switch profiles first.');
    return;
  }
  if (!confirm(`Remove ${member.name} from this app?`)) return;
  if (window.familyBitesDb?.isConfigured && appState.familyId && looksLikeUuid(memberId)) {
    try {
      await window.familyBitesDb.deleteMember(memberId);
    } catch (error) {
      console.warn('Profile delete failed.', error);
      showAppNotice('Could not remove this profile. Check your connection and try again.', 'error');
      return;
    }
  }
  appState.members = appState.members.filter((m) => m.id !== memberId);
  appState.meals = appState.meals.filter((m) => m.member_id !== memberId);
  appState.snapScans = appState.snapScans.filter((scan) => scan.member_id !== memberId);
  delete appState.profileMeasurements[memberId];
  delete appState.bioLogs[memberId];
  saveStoredAppData();
  renderProfiles();
  renderSettings();
}

const futureChangeOptions = [
  { id: 'protein-breakfast', icon: '🍳', label: 'Protein breakfast', copy: 'Start three mornings with a protein anchor.' },
  { id: 'colorful-side', icon: '🥦', label: 'Colorful side', copy: 'Add fruit or vegetables three times each week.' },
  { id: 'sweet-swap', icon: '🧊', label: 'Two drink swaps', copy: 'Trade two sweet drinks for an unsweetened favorite.' },
  { id: 'earlier-dinner', icon: '🌙', label: 'Earlier dinner', copy: 'Move three late meals into an earlier rhythm.' },
  { id: 'home-meal', icon: '🍳', label: 'One home meal', copy: 'Make one simple meal at home each week.' }
];

function toggleFutureChange(changeId) {
  if (!futureChangeOptions.some((item) => item.id === changeId)) return;
  const selected = appState.futureYou.changes;
  appState.futureYou.changes = selected.includes(changeId)
    ? selected.filter((id) => id !== changeId)
    : [...selected, changeId].slice(-3);
  renderFutureYou();
}

function getFutureMealHistory() {
  const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
  return getMemberMeals().filter((meal) => {
    const timestamp = new Date(meal.eaten_at || meal.created_at).getTime();
    return Number.isFinite(timestamp) && timestamp >= cutoff;
  });
}

function buildFutureYouSimulation() {
  const meals = getFutureMealHistory();
  const signals = analyzeMealPatternSignals(meals);
  const uniqueFoods = new Set(meals.map((meal) => normalizeScanLabel(meal.food_name).toLowerCase()).filter(Boolean));
  const activeDays = new Set(meals.map(mealDayKey).filter(Boolean));
  const timestamps = meals.map((meal) => new Date(meal.eaten_at || meal.created_at).getTime()).filter(Number.isFinite);
  const oldestTimestamp = timestamps.length ? Math.min(...timestamps) : Date.now();
  const observedDays = Math.max(7, Math.min(30, Math.ceil((Date.now() - oldestTimestamp) / 86400000) + 1));
  const mealCount = Math.max(signals.mealCount, 1);
  const months = appState.futureYou.months;
  const path = appState.futureYou.path;
  const selectedChanges = appState.futureYou.changes;
  const intake = appState.futureYou.intake || 100;
  const horizonBoost = months === 12 ? 1.3 : 1;
  const pathBoost = path === 'adventure' ? 16 : path === 'gentle' ? 8 : 0;

  const scores = {
    variety: meals.length ? Math.min(100, Math.round((uniqueFoods.size / 12) * 100)) : 8,
    balance: meals.length ? Math.round(((signals.proteinMeals + signals.fiberMeals) / (mealCount * 2)) * 100) : 8,
    rhythm: meals.length ? Math.round(100 - ((signals.lateMeals / mealCount) * 100)) : 20,
    consistency: meals.length ? Math.min(100, Math.round((activeDays.size / Math.min(observedDays, 14)) * 100)) : 6
  };

  if (path !== 'steady') {
    scores.variety += pathBoost * horizonBoost;
    scores.balance += pathBoost * .9 * horizonBoost;
    scores.rhythm += pathBoost * .7 * horizonBoost;
    scores.consistency += pathBoost * .6 * horizonBoost;
  }
  selectedChanges.forEach((change) => {
    if (change === 'protein-breakfast') scores.balance += 11 * horizonBoost;
    if (change === 'colorful-side') { scores.variety += 12 * horizonBoost; scores.balance += 8 * horizonBoost; }
    if (change === 'sweet-swap') scores.balance += 7 * horizonBoost;
    if (change === 'earlier-dinner') scores.rhythm += 15 * horizonBoost;
    if (change === 'home-meal') { scores.variety += 8 * horizonBoost; scores.consistency += 5 * horizonBoost; }
  });
  Object.keys(scores).forEach((key) => { scores[key] = clampScore(Math.round(scores[key])); });

  const weeklyLogs = meals.length ? (meals.length / observedDays) * 7 : 0;
  const projectedMemories = Math.round(weeklyLogs * months * 4.345);
  const confidence = meals.length >= 20 ? 'Trend-powered' : meals.length >= 8 ? 'Taking shape' : 'Early sketch';
  const strongestScore = Object.entries(scores).sort((left, right) => right[1] - left[1])[0]?.[0] || 'variety';
  const persona = buildFuturePersona({ scores, signals, strongestScore, path, selectedChanges, intake });

  return { meals, signals, scores, months, path, selectedChanges, intake, uniqueFoodCount: uniqueFoods.size, activeDayCount: activeDays.size, projectedMemories, confidence, persona };
}

function buildFuturePersona({ scores, signals, strongestScore, path, selectedChanges, intake }) {
  if (intake === 200) return { icon: '👑', title: 'The Buffet Legend', badge: 'Mega Feast energy', color: 'sunset' };
  if (intake === 150) return { icon: '🍕', title: 'The Feast Mode Foodie', badge: 'Extra plate power', color: 'gold' };
  if (path === 'adventure' || scores.variety >= 80) return { icon: '🌍', title: 'The Flavor Explorer', badge: 'Curious eater', color: 'sunset' };
  if (selectedChanges.includes('home-meal')) return { icon: '🍳', title: 'The Kitchen Regular', badge: 'Home-base energy', color: 'gold' };
  if (strongestScore === 'rhythm' && scores.rhythm >= 70) return { icon: '☀️', title: 'The Rhythm Keeper', badge: 'Steady days', color: 'sky' };
  if (signals.proteinMeals >= Math.max(2, signals.mealCount * .45) || strongestScore === 'balance') return { icon: '⚡', title: 'The Balanced Builder', badge: 'Plate architect', color: 'lime' };
  return { icon: '🌱', title: 'The Habit Starter', badge: 'Growing momentum', color: 'leaf' };
}

function buildFutureStory(simulation) {
  const name = String(appState.currentMember?.name || 'You').split(' ')[0];
  if (!simulation.meals.length) return `${name}, Future You is still a blank page. Log a few real meals and this story will begin learning your favorite flavors and routines.`;
  const horizon = simulation.months === 12 ? 'one year' : 'six months';
  const pathCopy = {
    steady: 'keeps your familiar food rhythm and becomes much better at remembering what actually works',
    gentle: 'builds a few easy rituals without giving up favorite foods',
    adventure: 'turns food logging into a year of new flavors, colorful plates, and small weekly experiments'
  };
  const changeCopy = simulation.selectedChanges.length
    ? ` Your ${simulation.selectedChanges.length} selected mini-quest${simulation.selectedChanges.length === 1 ? '' : 's'} add a little extra momentum.`
    : '';
  const feastCopy = simulation.intake === 200
    ? ' In this silly Mega Feast universe, the fridge has started calling you boss.'
    : simulation.intake === 150
      ? ' In Feast Mode, your grocery cart politely asks for backup.'
      : '';
  return `${name}, ${horizon} from now, Future You ${pathCopy[simulation.path]}.${changeCopy}${feastCopy}`;
}

function buildFutureMilestones(simulation) {
  const midpoint = simulation.months === 12 ? 'Month 6' : 'Month 3';
  const finalPoint = simulation.months === 12 ? 'Year 1' : 'Month 6';
  const selectedLabels = simulation.selectedChanges.map((id) => futureChangeOptions.find((item) => item.id === id)?.label).filter(Boolean);
  return [
    { label: 'Today', title: `${simulation.meals.length} meals in the trend`, copy: simulation.meals.length ? `${simulation.uniqueFoodCount} different foods are shaping this story.` : 'Your first meal starts the story.' },
    { label: midpoint, title: selectedLabels[0] || 'Your rhythm gets easier to see', copy: selectedLabels.length ? `${selectedLabels[0]} starts feeling like part of the routine.` : 'Future You notices which meals are worth repeating.' },
    { label: finalPoint, title: simulation.persona.title, copy: simulation.projectedMemories ? `Around ${simulation.projectedMemories} food memories could be waiting in your diary.` : 'A personal food story is ready to unfold.' }
  ];
}

function buildFeastModeContent(intake) {
  if (intake === 200) {
    return {
      title: 'Mega Feast Mode',
      icon: '👑',
      copy: 'Future You has become mayor of Buffet Town. Both hands approve this timeline.',
      body: 'assets/future/feast-200.webp',
      stats: [['Plate power', '2×'], ['Snack gravity', 'Legendary'], ['Fridge status', 'Needs backup']]
    };
  }
  if (intake === 150) {
    return {
      title: 'Feast Mode',
      icon: '🍕',
      copy: 'The portions got ambitious, the shirt got roomier, and Future You still found space for dessert.',
      body: 'assets/future/feast-150.webp',
      stats: [['Plate power', '1.5×'], ['Snack gravity', 'Strong'], ['Grocery cart', 'Very busy']]
    };
  }
  return {
    title: 'Original Recipe',
    icon: '🙂',
    copy: 'Your usual food rhythm, starring the current you. Turn the dial to enter a sillier universe.',
    body: '',
    stats: [['Plate power', '1×'], ['Snack gravity', 'Normal'], ['Fridge status', 'All good']]
  };
}

function futureFeastCharacterMarkup(simulation, feastMode) {
  if (!feastMode.body) {
    return `<div class="future-feast-current"><div>${avatarMarkup(appState.currentMember)}</div><span>Current You</span></div>`;
  }
  return `
    <div class="future-feast-character feast-${simulation.intake}">
      <img class="future-feast-body" src="${feastMode.body}" alt="Playful ${feastMode.title} cartoon body">
      <div class="future-feast-face">${avatarMarkup(appState.currentMember)}</div>
    </div>`;
}

function renderFutureYou() {
  const container = document.getElementById('futureYouContent');
  if (!container || !appState.currentMember) return;
  const simulation = buildFutureYouSimulation();
  const milestones = buildFutureMilestones(simulation);
  const feastMode = buildFeastModeContent(simulation.intake);
  const pathOptions = [
    { id: 'steady', icon: '🛤️', title: 'Keep my rhythm', copy: 'See where today’s habits could lead.' },
    { id: 'gentle', icon: '✨', title: 'One small shift', copy: 'Add a little structure, keep favorite foods.' },
    { id: 'adventure', icon: '🚀', title: 'Food adventure', copy: 'Try more variety and playful weekly quests.' }
  ];
  const scoreCards = [
    { key: 'variety', icon: '🌈', label: 'Flavor variety' },
    { key: 'balance', icon: '🥗', label: 'Plate balance' },
    { key: 'rhythm', icon: '🕰️', label: 'Meal rhythm' },
    { key: 'consistency', icon: '🔥', label: 'Diary momentum' }
  ];

  container.innerHTML = `
    <div class="future-you-screen future-theme-${simulation.persona.color}">
      <section class="future-hero">
        <div class="future-hero-copy">
          <p class="eyebrow">A playful look ahead</p><h3>Meet your Future You</h3>
          <p>Remix your current food habits and see the character your diary could unlock.</p>
          <div class="future-horizon-switch" aria-label="Choose simulation horizon">
            <button class="${simulation.months === 6 ? 'active' : ''}" data-future-months="6" type="button">6 months</button>
            <button class="${simulation.months === 12 ? 'active' : ''}" data-future-months="12" type="button">1 year</button>
          </div>
        </div>
        <div class="future-avatar-stage">
          <span class="future-orbit orbit-one">🥑</span><span class="future-orbit orbit-two">🍜</span><span class="future-orbit orbit-three">🍓</span>
          <div class="future-avatar">${avatarMarkup(appState.currentMember)}</div><div class="future-persona-icon">${simulation.persona.icon}</div>
          <strong>${escapeHtml(simulation.persona.title)}</strong><small>${escapeHtml(simulation.persona.badge)}</small>
        </div>
      </section>
      <section class="future-feast-section feast-level-${simulation.intake}">
        <div class="future-feast-copy">
          <p class="eyebrow">What if I eat more?</p>
          <h3>Turn up the feast dial</h3>
          <p>This is a funny AI-made avatar remix, not a body or health prediction.</p>
          <div class="future-intake-switch" aria-label="Choose a playful food level">
            <button class="${simulation.intake === 100 ? 'active' : ''}" data-future-intake="100" type="button"><b>100%</b><span>My usual</span></button>
            <button class="${simulation.intake === 150 ? 'active' : ''}" data-future-intake="150" type="button"><b>150%</b><span>Feast Mode</span></button>
            <button class="${simulation.intake === 200 ? 'active' : ''}" data-future-intake="200" type="button"><b>200%</b><span>Mega Feast</span></button>
          </div>
          <div class="future-feast-message"><span>${feastMode.icon}</span><div><strong>${feastMode.title}</strong><p>${feastMode.copy}</p></div></div>
          <div class="future-feast-stats">${feastMode.stats.map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`).join('')}</div>
        </div>
        <div class="future-feast-stage">${futureFeastCharacterMarkup(simulation, feastMode)}</div>
      </section>
      <section class="future-control-section">
        <div class="future-section-heading"><div><p class="eyebrow">Choose a storyline</p><h3>How does Future You get there?</h3></div><span>${simulation.confidence}</span></div>
        <div class="future-path-grid">${pathOptions.map((option) => `<button class="future-path-card${simulation.path === option.id ? ' active' : ''}" data-future-path="${option.id}" type="button"><span>${option.icon}</span><strong>${option.title}</strong><small>${option.copy}</small></button>`).join('')}</div>
      </section>
      <section class="future-story-card"><div><span>Message from ${simulation.months === 12 ? 'next year' : 'six months ahead'}</span><h3>${escapeHtml(simulation.persona.title)}</h3></div><p>“${escapeHtml(buildFutureStory(simulation))}”</p></section>
      <section class="future-score-section">
        <div class="future-section-heading"><div><p class="eyebrow">Your simulated vibe</p><h3>Habit energy</h3></div><small>Not a health score</small></div>
        <div class="future-score-grid">${scoreCards.map((card) => `<article class="future-score-card"><span>${card.icon}</span><small>${card.label}</small><strong>${simulation.scores[card.key]}</strong><i><em style="width:${simulation.scores[card.key]}%"></em></i></article>`).join('')}</div>
      </section>
      <section class="future-quest-section">
        <div class="future-section-heading"><div><p class="eyebrow">Tap to remix the future</p><h3>Pick up to three mini-quests</h3></div><span>${simulation.selectedChanges.length}/3 selected</span></div>
        <div class="future-quest-grid">${futureChangeOptions.map((quest) => `<button class="future-quest${simulation.selectedChanges.includes(quest.id) ? ' active' : ''}" data-future-change="${quest.id}" type="button"><span>${quest.icon}</span><strong>${quest.label}</strong><small>${quest.copy}</small><b>${simulation.selectedChanges.includes(quest.id) ? '✓ Added' : '+ Try it'}</b></button>`).join('')}</div>
      </section>
      <section class="future-timeline-section">
        <div class="future-section-heading"><div><p class="eyebrow">Your story arc</p><h3>Future food memories</h3></div></div>
        <div class="future-timeline">${milestones.map((milestone, index) => `<article><span>${index + 1}</span><div><small>${milestone.label}</small><strong>${escapeHtml(milestone.title)}</strong><p>${escapeHtml(milestone.copy)}</p></div></article>`).join('')}</div>
      </section>
      <p class="future-disclaimer">For fun and motivation only. Avatar changes are fictional AI illustrations, not predictions of body shape, weight, or health outcomes.</p>
    </div>`;
}

function renderSettings() {
  const el = document.getElementById('settingsContent');
  if (!el) return;

  const signedInEmail = appState.auth.user?.email || 'Not signed in';
  const familyName = appState.auth.membership?.family_name || 'Private meal space';
  el.innerHTML = `
    <div class="settings-section">
      <p class="eyebrow">Discover</p>
      <h3>Explore what’s next</h3>
      <p>Meet Future You, find meal ideas, or open a simple movement routine.</p>
      <div class="settings-discover-grid">
        <button class="settings-discover-card future-discover-card" data-page="future" type="button">
          <span class="settings-discover-icon">🔮</span>
          <strong>Future You</strong>
          <small>Turn your real food trends into a playful 6-month or 1-year story.</small>
        </button>
        <button class="settings-discover-card" data-page="recipes" type="button">
          <span class="settings-discover-icon">🥗</span>
          <strong>Recipes</strong>
          <small>High-fiber, protein, and lighter dinner ideas.</small>
        </button>
        <button class="settings-discover-card" data-page="workouts" type="button">
          <span class="settings-discover-icon">🏃</span>
          <strong>Workouts</strong>
          <small>Short routines for after meals, mobility, and personal movement.</small>
        </button>
      </div>
    </div>

    <div class="settings-section">
      <p class="eyebrow">Account</p>
      <h3>${escapeHtml(familyName)}</h3>
      <p>Signed in as ${escapeHtml(signedInEmail)}</p>
      <div class="settings-nav-grid">
        <button class="settings-nav-btn" data-page="profile">👤 Profile & goals</button>
      </div>
      <button class="secondary-button" data-action="sign-out">Sign out</button>
    </div>

    <div class="settings-section">
      <p class="eyebrow">Navigation</p>
      <h3>Quick links</h3>
      <div class="settings-nav-grid">
        <button class="settings-nav-btn" data-page="future">🔮 Future You</button>
        <button class="settings-nav-btn" data-page="recipes">🥗 Recipes</button>
        <button class="settings-nav-btn" data-page="workouts">🏃 Workouts</button>
        <button class="settings-nav-btn" data-page="snap">📷 Snap Food</button>
        <button class="settings-nav-btn" data-page="body">🧍 Body Map</button>
        <button class="settings-nav-btn" data-page="weekly">▶ Weekly Replay</button>
        <button class="settings-nav-btn" data-action="open-food-map-report">Food Map PDF</button>
        <button class="settings-nav-btn" data-page="timeline">📔 Diary</button>
        <button class="settings-nav-btn" data-page="favorites">❤️ Favorites</button>
        <button class="settings-nav-btn" data-page="profile">👤 Profile</button>
      </div>
    </div>

    <div class="settings-section danger-zone">
      <p class="eyebrow">Data</p>
      <h3>Clear all local data</h3>
      <p>Removes all meals and saved app data in this browser. This cannot be undone.</p>
      <button class="danger-button" data-action="clear-all-data">🗑️ Clear All Data</button>
    </div>

    <div class="settings-section app-version-card">
      <p class="eyebrow">Release</p>
      <h3>${APP_VERSION}</h3>
      <p>Build date: ${APP_BUILD_DATE}</p>
    </div>
  `;
}

function renderRecipes() {
  const el = document.getElementById('recipesContent');
  if (!el) return;

  const todayMeals = getMemberMeals().filter(isToday);
  const avgHealth = todayMeals.length
    ? Math.round(sum(todayMeals, 'health_score') / todayMeals.length)
    : 72;

  el.innerHTML = `
    <div class="discover-page-shell">
      <section class="dashboard-card discover-hero-card">
        <div class="section-title">
          <div>
            <p class="eyebrow">Guided ideas</p>
            <h3>Recipe options for your meal map</h3>
          </div>
        </div>
        <p class="panel-subtitle">Browse meal ideas that match the wellness direction of the app: more fiber, stronger protein balance, and calmer dinners.</p>
        <div class="discover-stat-row">
          <article class="discover-stat-card">
            <span>Collections</span>
            <strong>${recipeCollections.length}</strong>
            <small>Ready to browse</small>
          </article>
          <article class="discover-stat-card">
            <span>Today’s meals</span>
            <strong>${todayMeals.length}</strong>
            <small>Used for personalization</small>
          </article>
          <article class="discover-stat-card">
            <span>Average score</span>
            <strong>${avgHealth}/100</strong>
            <small>Current food quality</small>
          </article>
        </div>
      </section>

      ${recipeCollections.map((collection) => `
        <section class="recipe-collection-section">
          <div class="section-title">
            <div>
              <p class="eyebrow">${escapeHtml(collection.title)}</p>
              <h3>${escapeHtml(collection.subtitle)}</h3>
            </div>
          </div>
          <div class="recipe-rail">
            ${collection.items.map((item) => `
              <article class="recipe-card">
                <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)}">
                <div class="recipe-card-copy">
                  <div class="recipe-card-meta">
                    <span>${item.calories} cal</span>
                    <span>${escapeHtml(item.badge)}</span>
                  </div>
                  <h4>${escapeHtml(item.title)}</h4>
                  <p>${escapeHtml(collection.subtitle)}</p>
                </div>
              </article>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;
}

function getWorkoutCatalog() {
  return workoutCollections.flatMap((collection) =>
    collection.routines.map((routine) => ({
      ...routine,
      collectionId: collection.id,
      collectionTitle: collection.title
    }))
  );
}

function findWorkoutRoutine(routineId) {
  return getWorkoutCatalog().find((routine) => routine.id === routineId) || null;
}

function getMemberWorkoutHistory(memberId = appState.currentMember?.id) {
  if (!memberId) return {};
  if (!appState.workoutHistory[memberId]) appState.workoutHistory[memberId] = {};
  return appState.workoutHistory[memberId];
}

function getMemberSavedWorkoutIds(memberId = appState.currentMember?.id) {
  if (!memberId) return [];
  if (!Array.isArray(appState.savedWorkouts[memberId])) appState.savedWorkouts[memberId] = [];
  return appState.savedWorkouts[memberId];
}

function getWorkoutRecord(routineId, memberId = appState.currentMember?.id) {
  return getMemberWorkoutHistory(memberId)[routineId] || {};
}

function isWorkoutSaved(routineId, memberId = appState.currentMember?.id) {
  return getMemberSavedWorkoutIds(memberId).includes(routineId);
}

function getWorkoutWeeklyDoneCount(memberId = appState.currentMember?.id) {
  const history = Object.values(getMemberWorkoutHistory(memberId));
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return history.reduce((total, item) => {
    if (!item?.lastCompletedAt) return total;
    const timestamp = new Date(item.lastCompletedAt).getTime();
    if (!Number.isFinite(timestamp) || timestamp < cutoff) return total;
    return total + Math.max(Number(item.completedCount || 1), 1);
  }, 0);
}

function formatWorkoutStatus(record) {
  if (record?.startedAt && !record?.lastCompletedAt) return 'In progress';
  if (record?.lastCompletedAt) {
    const count = Number(record.completedCount || 0);
    return count > 1 ? `Done ${count} times` : 'Done once';
  }
  return 'Not started';
}

function handleStartWorkout(routineId) {
  const routine = findWorkoutRoutine(routineId);
  const member = appState.currentMember;
  if (!routine || !member) return;
  const history = getMemberWorkoutHistory(member.id);
  history[routineId] = {
    ...(history[routineId] || {}),
    startedAt: new Date().toISOString()
  };
  saveStoredAppData();
  renderWorkouts();
  showAppNotice(`${routine.title} started for ${member.name}.`, 'success');
}

function handleCompleteWorkout(routineId) {
  const routine = findWorkoutRoutine(routineId);
  const member = appState.currentMember;
  if (!routine || !member) return;
  const history = getMemberWorkoutHistory(member.id);
  const existing = history[routineId] || {};
  history[routineId] = {
    ...existing,
    startedAt: '',
    lastCompletedAt: new Date().toISOString(),
    completedCount: Number(existing.completedCount || 0) + 1
  };
  saveStoredAppData();
  renderWorkouts();
  showAppNotice(`${routine.title} marked done for ${member.name}.`, 'success');
}

function handleToggleSaveWorkout(routineId) {
  const routine = findWorkoutRoutine(routineId);
  const member = appState.currentMember;
  if (!routine || !member) return;
  const saved = getMemberSavedWorkoutIds(member.id);
  if (saved.includes(routineId)) {
    appState.savedWorkouts[member.id] = saved.filter((id) => id !== routineId);
  } else {
    appState.savedWorkouts[member.id] = [...saved, routineId];
  }
  saveStoredAppData();
  renderWorkouts();
}

function buildWorkoutSuggestions({ memberMeals, todayMeals, calorieGoal, steps }) {
  const todaySignals = analyzeMealPatternSignals(todayMeals);
  const weekSignals = analyzeMealPatternSignals(memberMeals.filter((meal) => {
    const timestamp = new Date(meal.eaten_at || meal.created_at).getTime();
    return Number.isFinite(timestamp) && timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }));
  const todayCalories = todaySignals.calories || sum(todayMeals, 'calories');
  const suggestions = [];

  if (todayCalories > calorieGoal || todaySignals.friedMeals || todaySignals.heavySnackCount) {
    suggestions.push({
      routineId: 'post-meal-walk',
      title: 'Best after today’s meals',
      copy: 'A short walk is the cleanest move after heavier, fried, or calorie-dense meals.'
    });
  }

  if (todaySignals.lateMeals || weekSignals.lateMeals >= 3) {
    suggestions.push({
      routineId: 'evening-stretch',
      title: 'Late-meal reset',
      copy: 'A gentle stretch works well when dinner runs late or the week has drifted later.'
    });
  }

  if (!todaySignals.fiberMeals || todaySignals.plainStapleMeals) {
    suggestions.push({
      routineId: 'bloat-relief-flow',
      title: 'Digestion support',
      copy: 'Meals look lighter on fiber or a bit plain today, so a short mobility flow is a useful follow-up.'
    });
  }

  if (steps < 4500) {
    suggestions.push({
      routineId: 'family-energy-boost',
      title: 'Low-movement day',
      copy: 'Step count is still light, so a quick routine can raise movement without adding friction.'
    });
  }

  if (!todaySignals.proteinMeals || weekSignals.lowProteinBreakfasts >= 2) {
    suggestions.push({
      routineId: 'core-reset',
      title: 'Steadier morning support',
      copy: 'Core and posture work is a good match when meals were lighter on protein and structure.'
    });
  }

  if (!suggestions.length) {
    suggestions.push({
      routineId: 'morning-mobility',
      title: 'Balanced day option',
      copy: 'Today looks fairly steady, so a simple mobility routine is enough to keep the momentum going.'
    });
  }

  const seen = new Set();
  return suggestions.filter((item) => {
    if (seen.has(item.routineId)) return false;
    seen.add(item.routineId);
    return true;
  }).slice(0, 3);
}

function renderWorkouts() {
  const el = document.getElementById('workoutsContent');
  if (!el) return;

  const memberMeals = getMemberMeals();
  const todayMeals = memberMeals.filter(isToday);
  const steps = Number(getTodayBioLog().steps || 0);
  const savedTargets = appState.profileMeasurements[appState.currentMember?.id] || {};
  const calorieGoal = Number(savedTargets.target_calories || appState.currentMember?.target_calories) || 2200;
  const activeTab = workoutTabs.find((tab) => tab.id === appState.workoutTab) || workoutTabs[0];
  const activeCollection = workoutCollections.find((collection) => collection.id === activeTab.collectionId) || workoutCollections[0];
  const heroRoutine = activeCollection.routines[0];
  const heroRecord = getWorkoutRecord(heroRoutine.id);
  const savedWorkoutCount = getMemberSavedWorkoutIds().length;
  const weeklyDoneCount = getWorkoutWeeklyDoneCount();
  const suggestions = buildWorkoutSuggestions({ memberMeals, todayMeals, calorieGoal, steps });

  el.innerHTML = `
    <div class="discover-page-shell">
      <section class="dashboard-card discover-hero-card">
        <div class="section-title">
          <div>
            <p class="eyebrow">Movement ideas</p>
            <h3>Workouts that fit this app</h3>
          </div>
        </div>
        <p class="panel-subtitle">Short routines keep the app focused on wellness, especially for post-meal walking, mobility, and family-friendly movement.</p>
        <div class="discover-stat-row">
          <article class="discover-stat-card">
            <span>Saved</span>
            <strong>${savedWorkoutCount}</strong>
            <small>Favorite routines</small>
          </article>
          <article class="discover-stat-card">
            <span>This week</span>
            <strong>${weeklyDoneCount}</strong>
            <small>Completed workouts</small>
          </article>
          <article class="discover-stat-card">
            <span>Today’s steps</span>
            <strong>${steps.toLocaleString()}</strong>
            <small>Movement so far</small>
          </article>
        </div>
        <div class="workout-tab-row" role="tablist" aria-label="Workout categories">
          ${workoutTabs.map((tab) => `
            <button class="workout-tab-button ${tab.id === activeTab.id ? 'active' : ''}" data-workout-tab="${tab.id}" type="button">
              ${escapeHtml(tab.label)}
            </button>
          `).join('')}
        </div>
      </section>

      <section class="workout-recommendation-grid">
        ${suggestions.map((item) => {
          const routine = findWorkoutRoutine(item.routineId);
          if (!routine) return '';
          return `
            <article class="dashboard-card workout-recommendation-card">
              <p class="eyebrow">${escapeHtml(item.title)}</p>
              <h4>${escapeHtml(routine.title)}</h4>
              <p>${escapeHtml(item.copy)}</p>
              <div class="workout-meta-row">
                <span>${routine.minutes} min</span>
                <span>${escapeHtml(routine.type)}</span>
                <span>${escapeHtml(formatWorkoutStatus(getWorkoutRecord(routine.id)))}</span>
              </div>
              <div class="workout-action-row">
                <button class="primary-button" data-complete-workout="${escapeAttr(routine.id)}" type="button">Done</button>
                <button class="secondary-button" data-start-workout="${escapeAttr(routine.id)}" type="button">Start</button>
              </div>
            </article>
          `;
        }).join('')}
      </section>

      <section class="dashboard-card workout-feature-card">
        <div class="workout-feature-media">
          <img src="${escapeAttr(heroRoutine.image)}" alt="${escapeAttr(heroRoutine.title)}">
        </div>
        <div class="workout-feature-copy">
          <p class="eyebrow">${escapeHtml(activeCollection.title)}</p>
          <h3>${escapeHtml(heroRoutine.title)}</h3>
          <div class="workout-meta-row">
            <span>${heroRoutine.minutes} min</span>
            <span>${escapeHtml(heroRoutine.type)}</span>
            <span>${escapeHtml(formatWorkoutStatus(heroRecord))}</span>
          </div>
          <p>${escapeHtml(heroRoutine.copy)}</p>
          <div class="workout-action-row">
            <button class="primary-button" data-complete-workout="${escapeAttr(heroRoutine.id)}" type="button">Done</button>
            <button class="secondary-button" data-start-workout="${escapeAttr(heroRoutine.id)}" type="button">Start</button>
            <button class="text-button ${isWorkoutSaved(heroRoutine.id) ? 'workout-save-button active' : 'workout-save-button'}" data-toggle-save-workout="${escapeAttr(heroRoutine.id)}" type="button">${isWorkoutSaved(heroRoutine.id) ? 'Saved' : 'Save routine'}</button>
          </div>
        </div>
      </section>

      <section class="workout-routine-grid">
        ${activeCollection.routines.map((routine) => `
          <article class="dashboard-card workout-routine-card">
            <img src="${escapeAttr(routine.image)}" alt="${escapeAttr(routine.title)}">
            <div class="workout-routine-copy">
              <div class="workout-meta-row">
                <span>${routine.minutes} min</span>
                <span>${escapeHtml(routine.type)}</span>
                <span>${escapeHtml(formatWorkoutStatus(getWorkoutRecord(routine.id)))}</span>
              </div>
              <h4>${escapeHtml(routine.title)}</h4>
              <p>${escapeHtml(routine.copy)}</p>
              <div class="workout-action-row">
                <button class="primary-button" data-complete-workout="${escapeAttr(routine.id)}" type="button">Done</button>
                <button class="secondary-button" data-start-workout="${escapeAttr(routine.id)}" type="button">Start</button>
                <button class="text-button ${isWorkoutSaved(routine.id) ? 'workout-save-button active' : 'workout-save-button'}" data-toggle-save-workout="${escapeAttr(routine.id)}" type="button">${isWorkoutSaved(routine.id) ? 'Saved' : 'Save routine'}</button>
              </div>
            </div>
          </article>
        `).join('')}
      </section>
    </div>
  `;
}
