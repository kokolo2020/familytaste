(function rollbackNoGmailAuth() {
  function restoreLocalFamilyTasteFlow() {
    if (window.familyBitesDb) {
      window.familyBitesDb.isConfigured = false;
      window.familyBitesDb.authContext = null;
      window.familyBitesDb.familyId = null;
    }

    const authCard = document.getElementById('landingAuthCard');
    const signInButton = document.getElementById('googleSignInButton');
    const signOutButton = document.getElementById('signOutButton');
    const spotlight = document.getElementById('landingSpotlight');
    const profileDock = document.getElementById('profileDock');

    if (authCard) authCard.classList.add('hidden');
    if (signInButton) {
      signInButton.classList.add('hidden');
      signInButton.disabled = true;
    }
    if (signOutButton) signOutButton.classList.add('hidden');
    if (spotlight) spotlight.classList.remove('hidden');
    if (profileDock) profileDock.classList.remove('hidden');

    if (typeof appState !== 'undefined' && (!appState.members || !appState.members.length)) {
      appState.members = [
        { id: 'dad', name: 'Dad', avatar: '👨', role: 'Family Admin', photo: 'assets/avatars/dad.jpg' },
        { id: 'rithyna', name: 'Rithyna', avatar: '👩', role: 'Meal Planner', photo: 'assets/avatars/mom.jpg' },
        { id: 'add', name: 'Add Member', avatar: '＋', role: 'Invite family' }
      ];
    }

    try {
      if (typeof applyStoredAppData === 'function') applyStoredAppData();
      if (typeof applyStoredProfilePhotos === 'function') applyStoredProfilePhotos();
      if (typeof renderProfiles === 'function') renderProfiles();
      if (typeof renderSettings === 'function') renderSettings();
      if (typeof appState !== 'undefined' && appState.members?.length && typeof selectMember === 'function' && !appState.currentMember) {
        selectMember(appState.members[0], { openDashboard: false });
      }
      if (typeof renderAll === 'function') renderAll();
    } catch (error) {
      console.warn('FamilyTaste local rollback could not fully refresh the page.', error);
    }
  }

  window.renderAuthState = function renderAuthStateNoGmail() {
    restoreLocalFamilyTasteFlow();
  };

  window.hydrateFromSupabase = async function hydrateWithoutGmail() {
    restoreLocalFamilyTasteFlow();
  };

  document.addEventListener('DOMContentLoaded', () => {
    restoreLocalFamilyTasteFlow();
    setTimeout(restoreLocalFamilyTasteFlow, 50);
    setTimeout(restoreLocalFamilyTasteFlow, 300);
  });
})();