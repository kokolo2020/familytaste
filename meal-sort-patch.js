(function restoreFamilyTasteProfileSelector() {
  function ensureProfilesVisible() {
    const authCard = document.getElementById('landingAuthCard');
    const signInButton = document.getElementById('googleSignInButton');
    const signOutButton = document.getElementById('signOutButton');
    const profileDock = document.getElementById('profileDock');
    const landingSpotlight = document.getElementById('landingSpotlight');
    const landing = document.getElementById('landing');
    const workspace = document.getElementById('workspace');

    if (authCard) authCard.classList.add('hidden');
    if (signInButton) signInButton.classList.add('hidden');
    if (signOutButton) signOutButton.classList.add('hidden');
    if (profileDock) profileDock.classList.remove('hidden');
    if (landingSpotlight) landingSpotlight.classList.remove('hidden');
    if (landing) landing.classList.remove('hidden');
    if (workspace && !document.querySelector('.active-page')) workspace.classList.add('hidden');

    if (typeof appState !== 'undefined' && (!appState.members || !appState.members.length)) {
      appState.members = [
        { id: 'rithyna', name: 'Thyna boy', avatar: 'T', role: 'Meal Planner', photo: 'assets/avatars/mom.jpg' },
        { id: 'dad', name: 'Papa', avatar: 'P', role: 'Family Admin', photo: 'assets/avatars/dad.jpg' },
        { id: 'thynith', name: 'Thynith', avatar: 'T', role: 'Family member', photo: 'assets/avatars/james.jpg' },
        { id: 'mama', name: 'MAMA', avatar: 'M', role: 'Family member', photo: 'assets/avatars/sophia.jpg' }
      ];
    }

    try {
      if (typeof applyStoredProfilePhotos === 'function') applyStoredProfilePhotos();
      if (typeof renderProfiles === 'function') renderProfiles();
      if (typeof renderSettings === 'function') renderSettings();
    } catch (error) {
      console.warn('Profile selector restore skipped one step.', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureProfilesVisible);
  } else {
    ensureProfilesVisible();
  }
  setTimeout(ensureProfilesVisible, 300);
  setTimeout(ensureProfilesVisible, 1000);
})();