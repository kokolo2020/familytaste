const FAMILY_NAME = 'Pich Family';
const systems = [
  { id: 'brain', icon: '🧠', name: 'Brain', score: 76, status: 'good', foods: 'Egg, salmon, green tea', suggestion: 'Add blueberries or walnuts to improve focus nutrients.' },
  { id: 'heart', icon: '❤️', name: 'Heart', score: 68, status: 'warn', foods: 'Fish, vegetables, avocado', suggestion: 'Choose grilled protein and reduce fried foods this week.' },
  { id: 'muscles', icon: '💪', name: 'Muscles', score: 84, status: 'good', foods: 'Chicken, egg, tofu', suggestion: 'Keep protein steady across breakfast, lunch, and dinner.' },
  { id: 'digestion', icon: '🌿', name: 'Digestion', score: 52, status: 'warn', foods: 'Rice, fruit, vegetables', suggestion: 'Add leafy greens, beans, or fruit for more fiber.' },
  { id: 'energy', icon: '⚡', name: 'Energy', score: 91, status: 'good', foods: 'Rice, noodles, fruit', suggestion: 'Balance carbs with protein to avoid afternoon crashes.' },
  { id: 'bones', icon: '🦴', name: 'Bones', score: 43, status: 'risk', foods: 'Milk, tofu, fish', suggestion: 'Add calcium-rich foods such as yogurt, tofu, or small fish.' }
];

const profiles = {
  admin: {
    role: 'Dad Admin',
    name: 'Papa',
    avatar: '👨',
    score: 87,
    note: 'Admin view · Everyone',
    title: 'Good morning, Papa',
    coach: 'The Pich Family is doing well with protein. Add one fruit and one leafy vegetable today to improve digestion and heart scores.'
  },
  member: {
    role: 'Family Member',
    name: 'Member',
    avatar: '🙂',
    score: 78,
    note: 'Member view · Your profile only',
    title: 'Good morning',
    coach: 'Your energy score is strong today. Add vegetables and water to improve balanced diet progress.'
  }
};

function $(id) { return document.getElementById(id); }

function showApp(mode = 'admin') {
  const profile = profiles[mode] || profiles.admin;
  $('authView').classList.add('hidden');
  $('appView').classList.remove('hidden');
  $('roleLabel').textContent = `${FAMILY_NAME} · ${profile.role}`;
  $('welcomeTitle').textContent = profile.title;
  $('visibilityNote').textContent = profile.note;
  $('wellnessScore').textContent = profile.score;
  $('signOut').textContent = profile.avatar;
  $('coachText').textContent = profile.coach;
  renderBodySystems();
}

function showAuth() {
  $('appView').classList.add('hidden');
  $('authView').classList.remove('hidden');
  closeSheet();
}

function renderBodySystems() {
  const root = $('bodySystems');
  root.innerHTML = systems.map(system => `
    <button class="system-chip ${system.status}" type="button" data-system="${system.id}">
      <b>${system.icon}</b>
      <span>${system.name}</span>
      <strong>${system.score}%</strong>
    </button>
  `).join('');
}

function openSystem(systemId) {
  const system = systems.find(item => item.id === systemId);
  if (!system) return;
  $('sheetKicker').textContent = 'AI Body Map';
  $('sheetTitle').textContent = `${system.icon} ${system.name}`;
  $('sheetScore').textContent = `${system.score}%`;
  $('sheetFoods').textContent = `Foods helping: ${system.foods}.`;
  $('sheetSuggestion').textContent = `Suggestion: ${system.suggestion}`;
  $('bodySheet').classList.remove('hidden');
}

function closeSheet() {
  $('bodySheet').classList.add('hidden');
}

function startGoogleLogin() {
  alert('Google login UI is ready. Supabase Auth connection is the next backend step.');
}

document.addEventListener('DOMContentLoaded', () => {
  $('googleSignIn')?.addEventListener('click', startGoogleLogin);
  $('demoAdmin')?.addEventListener('click', () => showApp('admin'));
  $('demoMember')?.addEventListener('click', () => showApp('member'));
  $('signOut')?.addEventListener('click', showAuth);
  $('closeSheet')?.addEventListener('click', closeSheet);
  document.body.addEventListener('click', event => {
    const target = event.target.closest('[data-system]');
    if (target) openSystem(target.dataset.system);
  });
});
