(function persistProfileMeasurementsAcrossReloads() {
  const measurementKey = 'familyBites.profileMeasurements.v1';
  const nameKey = 'familyBites.profileMeasurements.byName.v1';

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (error) {
      console.warn('Could not read saved profile data.', error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Could not save profile data.', error);
    }
  }

  function state() {
    try {
      return eval('appState');
    } catch (error) {
      return null;
    }
  }

  function fn(name) {
    try {
      return eval(name);
    } catch (error) {
      return null;
    }
  }

  function todayKeyValue() {
    const todayKey = fn('todayKey');
    if (typeof todayKey === 'function') return todayKey();
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function memberNameKey(member) {
    return String(member?.name || '').trim().toLowerCase();
  }

  function numberFromInput(id) {
    const element = document.getElementById(id);
    if (!element || element.value === '') return null;
    const value = Number(element.value);
    return Number.isFinite(value) ? value : null;
  }

  function currentMeasurementFromInputs() {
    const weight = numberFromInput('profileWeight');
    const height = numberFromInput('profileHeight');
    const age = numberFromInput('profileAge');
    const sex = document.getElementById('profileSex')?.value || 'male';
    const activity = Number(document.getElementById('profileActivity')?.value || 1.55);
    const goal = document.getElementById('profileGoal')?.value || 'maintain';
    const targetCalories = Number((document.getElementById('profileCalorieTarget')?.textContent || '').replace(/[^0-9.]/g, '')) || null;
    const proteinGrams = Number((document.getElementById('profileProteinTarget')?.textContent || '').replace(/[^0-9.]/g, '')) || null;
    const waterLiters = Number((document.getElementById('profileWaterTarget')?.textContent || '').replace(/[^0-9.]/g, '')) || null;

    if (!weight) return null;
    return {
      ...(height ? { height_cm: height } : {}),
      weight_kg: weight,
      ...(age ? { age } : {}),
      sex,
      activity,
      goal,
      ...(targetCalories ? { target_calories: targetCalories } : {}),
      ...(proteinGrams ? { protein_grams: proteinGrams } : {}),
      ...(waterLiters ? { water_liters: waterLiters } : {})
    };
  }

  function saveCurrentProfileMeasurement() {
    const app = state();
    const member = app?.currentMember;
    const measurement = currentMeasurementFromInputs();
    if (!member || !measurement) return;

    const byId = readJson(measurementKey, {});
    byId[member.id] = { ...(byId[member.id] || {}), ...measurement };
    writeJson(measurementKey, byId);

    const byName = readJson(nameKey, {});
    byName[memberNameKey(member)] = { ...(byName[memberNameKey(member)] || {}), ...measurement };
    writeJson(nameKey, byName);
  }

  function findSavedMeasurement(member) {
    if (!member) return null;
    const byId = readJson(measurementKey, {});
    const byName = readJson(nameKey, {});
    return byId[member.id] || byName[memberNameKey(member)] || null;
  }

  function applySavedMeasurement() {
    const app = state();
    const member = app?.currentMember;
    const measurement = findSavedMeasurement(member);
    if (!app || !member || !measurement) return;

    app.profileMeasurements[member.id] = {
      ...(app.profileMeasurements[member.id] || {}),
      ...measurement
    };
    if (measurement.weight_kg !== undefined) member.weight_kg = measurement.weight_kg;
    if (measurement.height_cm !== undefined) member.height_cm = measurement.height_cm;
    if (measurement.target_calories !== undefined) member.target_calories = measurement.target_calories;

    if (!app.bioLogs[member.id]) app.bioLogs[member.id] = {};
    app.bioLogs[member.id][todayKeyValue()] = {
      ...(app.bioLogs[member.id][todayKeyValue()] || {}),
      ...(measurement.weight_kg !== undefined ? { weight_kg: measurement.weight_kg } : {})
    };

    const profileWeight = document.getElementById('profileWeight');
    if (profileWeight && document.activeElement !== profileWeight && measurement.weight_kg !== undefined) profileWeight.value = measurement.weight_kg;
    const profileHeight = document.getElementById('profileHeight');
    if (profileHeight && document.activeElement !== profileHeight && measurement.height_cm !== undefined) profileHeight.value = measurement.height_cm;
    const bioWeight = document.getElementById('bioWeight');
    if (bioWeight && document.activeElement !== bioWeight && measurement.weight_kg !== undefined) bioWeight.value = measurement.weight_kg;
    const summaryWeight = document.getElementById('summaryWeight');
    if (summaryWeight && measurement.weight_kg !== undefined) summaryWeight.textContent = String(measurement.weight_kg);
  }

  document.addEventListener('click', (event) => {
    if (event.target?.id === 'saveProfileMeasurements') {
      setTimeout(() => {
        saveCurrentProfileMeasurement();
        applySavedMeasurement();
      }, 250);
    }
  }, true);

  document.addEventListener('input', (event) => {
    if (event.target?.id === 'profileWeight') saveCurrentProfileMeasurement();
  });

  function install() {
    applySavedMeasurement();
    setTimeout(applySavedMeasurement, 300);
    setTimeout(applySavedMeasurement, 1000);
    setTimeout(applySavedMeasurement, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
