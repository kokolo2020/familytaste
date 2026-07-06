(function patchMealDateDisplayAndEntryTime() {
  let selectedMealPhotos = [];

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  function datePrefix(date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (sameDay(date, today)) return '';
    if (sameDay(date, yesterday)) return 'Yesterday';

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function toLocalDateValue(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function toLocalTimeValue(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function localDateTimeToIso(dateValue, timeValue) {
    const now = new Date();
    const [year, month, day] = String(dateValue || toLocalDateValue(now)).split('-').map(Number);
    const [hour, minute] = String(timeValue || toLocalTimeValue(now)).split(':').map(Number);
    const date = new Date(year || now.getFullYear(), (month || now.getMonth() + 1) - 1, day || now.getDate(), hour || 0, minute || 0, 0, 0);
    return date.toISOString();
  }

  function installMealDisplayPatch() {
    if (typeof window.mealDisplayMeta !== 'function' && typeof mealDisplayMeta !== 'function') return false;

    window.mealDisplayMeta = function mealDisplayMetaWithDate(meal) {
      const storedType = String(meal?.notes || '').match(/\[\[meal_type:([^\]]+)\]\]/i)?.[1]?.toLowerCase() || '';
      const label = storedType
        ? storedType.charAt(0).toUpperCase() + storedType.slice(1)
        : meal.restaurant_name || 'Family meal';
      const mealDate = new Date(meal.eaten_at || meal.created_at || Date.now());
      const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(mealDate);
      const prefix = datePrefix(mealDate);

      return [prefix, label, time].filter(Boolean).join(' · ');
    };

    if (typeof window.renderAll === 'function') window.renderAll();
    return true;
  }

  function installDateTimeFields() {
    const form = document.getElementById('mealForm');
    const mealType = document.getElementById('mealType');
    if (!form || !mealType || document.getElementById('mealDate')) return Boolean(form && mealType);

    const now = new Date();
    const row = document.createElement('div');
    row.className = 'meal-date-time-row';
    row.innerHTML = `
      <label>Meal Date<input id="mealDate" name="meal_date" type="date" required></label>
      <label>Meal Time<input id="mealTime" name="meal_time" type="time" required></label>
    `;
    mealType.closest('label').insertAdjacentElement('afterend', row);
    document.getElementById('mealDate').value = toLocalDateValue(now);
    document.getElementById('mealTime').value = toLocalTimeValue(now);
    return true;
  }

  function installPhotoGalleryUi() {
    const upload = document.getElementById('mealPhotoUpload');
    const camera = document.getElementById('mealPhotoCamera');
    const drop = document.querySelector('.photo-drop');
    if (!upload || !camera || !drop) return false;
    if (drop.dataset.multiPhotoInstalled === 'true') return true;
    drop.dataset.multiPhotoInstalled = 'true';

    upload.multiple = true;
    camera.multiple = true;
    document.getElementById('photoHint').textContent = 'Add 2–5 photos per meal. The first photo is used for AI scan.';

    const gallery = document.createElement('div');
    gallery.id = 'mealPhotoGallery';
    gallery.className = 'meal-photo-gallery';
    drop.appendChild(gallery);

    const style = document.createElement('style');
    style.textContent = `
      .meal-photo-gallery{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px}
      .meal-photo-gallery img{width:54px;height:54px;object-fit:cover;border-radius:14px;border:2px solid rgba(255,255,255,.85);box-shadow:0 6px 14px rgba(0,0,0,.12)}
      .meal-photo-gallery span{display:grid;place-items:center;width:54px;height:54px;border-radius:14px;background:rgba(255,255,255,.8);font-size:12px;font-weight:900;color:#7a3e12}
      .meal-date-time-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      @media(max-width:520px){.meal-date-time-row{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);

    const handleMultiPhoto = async (event) => {
      const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/')).slice(0, 5);
      event.preventDefault();
      event.stopImmediatePropagation();
      event.target.value = '';

      if (!files.length) return;

      try {
        selectedMealPhotos = [];
        document.getElementById('foodName').value = '';
        document.getElementById('calories').value = '';
        document.getElementById('photoTitle').textContent = `Preparing ${files.length} photo${files.length > 1 ? 's' : ''}…`;
        document.getElementById('photoHint').textContent = 'Optimizing photos for upload…';

        for (const file of files) {
          selectedMealPhotos.push(await resizeImageFile(file, 900, 0.82));
        }

        renderSelectedPhotos();
        await applyAiCalorieEstimate();
      } catch (error) {
        console.warn('Could not load meal photos.', error);
        alert('Could not load those photos. Please try again.');
        resetSelectedPhotos();
      }
    };

    upload.addEventListener('change', handleMultiPhoto, true);
    camera.addEventListener('change', handleMultiPhoto, true);
    return true;
  }

  function renderSelectedPhotos() {
    const mainPhoto = selectedMealPhotos[0] || '';
    const preview = document.getElementById('photoPreview');
    const gallery = document.getElementById('mealPhotoGallery');
    if (!preview || !gallery) return;

    preview.src = mainPhoto;
    preview.dataset.photoUrl = mainPhoto;
    preview.classList.toggle('hidden', !mainPhoto);
    document.getElementById('photoIcon').classList.toggle('hidden', Boolean(mainPhoto));
    document.getElementById('photoTitle').textContent = `${selectedMealPhotos.length} photo${selectedMealPhotos.length > 1 ? 's' : ''} ready`;
    document.getElementById('photoHint').textContent = selectedMealPhotos.length > 1
      ? 'The first photo is the main photo. All selected photos will be saved.'
      : 'Photo ready. You can add more next time.';
    gallery.innerHTML = selectedMealPhotos.map((src, index) => `<img src="${src}" alt="Meal photo ${index + 1}">`).join('');

    if (typeof window.updateMealPreview === 'function') window.updateMealPreview();
  }

  function resetSelectedPhotos() {
    selectedMealPhotos = [];
    const gallery = document.getElementById('mealPhotoGallery');
    if (gallery) gallery.innerHTML = '';
    if (typeof resetPhotoPreview === 'function') resetPhotoPreview();
  }

  function resetDateTimeDefaults() {
    const now = new Date();
    const mealDate = document.getElementById('mealDate');
    const mealTime = document.getElementById('mealTime');
    if (mealDate) mealDate.value = toLocalDateValue(now);
    if (mealTime) mealTime.value = toLocalTimeValue(now);
  }

  function notesWithGallery(notes, urls) {
    const cleanUrls = (urls || []).filter(Boolean);
    if (cleanUrls.length <= 1) return notes;
    return `${notes || ''} [[photo_gallery:${encodeURIComponent(JSON.stringify(cleanUrls))}]]`;
  }

  function installSavePatch() {
    const form = document.getElementById('mealForm');
    if (!form || form.dataset.dateTimePatchInstalled === 'true') return Boolean(form);
    form.dataset.dateTimePatchInstalled = 'true';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const formData = new FormData(form);
      const photoUrl = selectedMealPhotos[0] || document.getElementById('photoPreview')?.dataset.photoUrl || '';
      const foodName = String(formData.get('food_name') || '').trim();
      if (!foodName) return;

      const baseNotes = notesWithMealType(formData.get('notes'), formData.get('meal_type'));
      const meal = {
        id: crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}`,
        family_id: appState.familyId,
        member_id: appState.currentMember.id,
        food_name: foodName,
        restaurant_name: String(formData.get('restaurant_name') || '').trim(),
        location_name: String(formData.get('location_name') || '').trim(),
        price: numberOrNull(formData.get('price')),
        calories: numberOrNull(formData.get('calories')),
        notes: baseNotes,
        photo_url: photoUrl,
        eaten_at: localDateTimeToIso(formData.get('meal_date'), formData.get('meal_time'))
      };

      appState.meals.unshift(meal);
      saveStoredAppData();
      form.reset();
      resetSelectedPhotos();
      resetDateTimeDefaults();
      showPage('dashboard');
      renderAll();

      if (window.familyBitesDb?.isConfigured) {
        try {
          const uploadedUrls = [];
          const photosToUpload = selectedMealPhotos.length ? selectedMealPhotos : (meal.photo_url ? [meal.photo_url] : []);
          for (const src of photosToUpload) {
            if (src && src.startsWith('data:')) {
              try {
                const uploadedUrl = await window.familyBitesDb.uploadMealPhoto(src);
                if (uploadedUrl) uploadedUrls.push(uploadedUrl);
              } catch (uploadError) {
                console.warn('One meal photo upload failed.', uploadError);
              }
            } else if (src) {
              uploadedUrls.push(src);
            }
          }

          if (uploadedUrls.length) {
            meal.photo_url = uploadedUrls[0];
            meal.notes = notesWithGallery(baseNotes, uploadedUrls);
          }

          const savedMeal = await window.familyBitesDb.saveMeal(meal);
          appState.meals = appState.meals.map((item) => item.id === meal.id ? normalizeMeal(savedMeal) : item);
          saveStoredAppData();
          renderAll();
        } catch (error) {
          console.warn('Meal saved locally but Supabase write failed.', error);
        }
      }
    }, true);

    return true;
  }

  function installAll() {
    const displayReady = installMealDisplayPatch();
    const fieldsReady = installDateTimeFields();
    const galleryReady = installPhotoGalleryUi();
    const saveReady = installSavePatch();
    return displayReady && fieldsReady && galleryReady && saveReady;
  }

  if (!installAll()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (installAll() || tries > 30) clearInterval(timer);
    }, 100);
  }
})();
