(function initFamilyBitesSupabase() {
  const url = window.FAMILYBITES_SUPABASE_URL || 'https://mjnigheggxtythytsqle.supabase.co';
  const anonKey = window.FAMILYBITES_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbmlnaGVnZ3h0eXRoeXRzcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzYwMDcsImV4cCI6MjA5NTY1MjAwN30.mh1psePuKeQ8SH5uita7BsUKd6wd5IwHVVlDmJCMA0Q';
  const fallbackFamilyName = window.FAMILYBITES_FAMILY_NAME || 'FamilyTaste Family';
  const allowBootstrap = window.FAMILYBITES_ALLOW_FIRST_ADMIN_BOOTSTRAP !== 'false';
  const adminEmails = String(window.FAMILYBITES_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const authPendingKey = 'familyBites.auth.pending';
  const cookieDomain = window.location.hostname.includes('.') ? `; domain=${window.location.hostname}` : '';

  const safeStorage = {
    getItem(key) {
      try {
        const value = window.localStorage?.getItem(key);
        if (value !== null && value !== undefined) return value;
      } catch (error) {
        console.warn('localStorage getItem failed, using cookie fallback.', error);
      }
      const match = document.cookie.match(new RegExp(`(?:^|; )${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : null;
    },
    setItem(key, value) {
      try {
        window.localStorage?.setItem(key, value);
        return;
      } catch (error) {
        console.warn('localStorage setItem failed, using cookie fallback.', error);
      }
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax${cookieDomain}`;
    },
    removeItem(key) {
      try {
        window.localStorage?.removeItem(key);
      } catch (error) {
        console.warn('localStorage removeItem failed, using cookie fallback.', error);
      }
      document.cookie = `${key}=; path=/; max-age=0; samesite=lax${cookieDomain}`;
    }
  };

  const hasClient = Boolean(window.supabase?.createClient);
  const isConfigured = Boolean(hasClient && url && anonKey && !url.includes('YOUR_') && !anonKey.includes('YOUR_'));
  const client = isConfigured ? window.supabase.createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: safeStorage
    }
  }) : null;

  function authRedirectUrl() {
    return `${window.location.origin}/auth-callback.html`;
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function markAuthPending() {
    try {
      safeStorage.setItem(authPendingKey, String(Date.now()));
    } catch (error) {
      console.warn('Could not persist auth pending marker.', error);
    }
  }

  function clearAuthPending() {
    try {
      safeStorage.removeItem(authPendingKey);
    } catch (error) {
      console.warn('Could not clear auth pending marker.', error);
    }
  }

  function hasRecentPendingAuth(maxAgeMs = 10 * 60 * 1000) {
    try {
      const value = safeStorage.getItem(authPendingKey);
      if (!value) return false;
      const timestamp = Number(value);
      return Number.isFinite(timestamp) && (Date.now() - timestamp) <= maxAgeMs;
    } catch (error) {
      console.warn('Could not read auth pending marker.', error);
      return false;
    }
  }

  function requireContext(db) {
    if (!db.authContext?.familyId) throw new Error('Google sign-in is required before loading family data.');
    return db.authContext;
  }

  function normalizeMembershipRecord(record) {
    if (!record) return null;
    const normalizedRole = record.role === 'owner' ? 'admin' : (record.role || 'member');
    return {
      id: record.id,
      family_id: record.family_id,
      role: normalizedRole,
      member_id: record.member_id || null,
      email: record.email || '',
      status: record.status || 'active'
    };
  }

  async function fetchFamilyName(familyId) {
    if (!familyId) return fallbackFamilyName;
    const { data, error } = await client
      .from('families')
      .select('name')
      .eq('id', familyId)
      .maybeSingle();
    if (error) {
      console.warn('Could not load family name.', error);
      return fallbackFamilyName;
    }
    return data?.name || fallbackFamilyName;
  }

  async function fetchMembershipForUser(userId, userEmail) {
    const normalizedEmail = String(userEmail || '').trim().toLowerCase();
    const membershipQueries = [
      () => client
        .from('family_memberships')
        .select('id, family_id, role, email, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1),
      () => client
        .from('family_users')
        .select('id, family_id, role, member_id, email')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
    ];

    let legacyLookupError = null;

    for (const runQuery of membershipQueries) {
      const { data, error } = await runQuery();
      if (!error && data?.[0]) return normalizeMembershipRecord(data[0]);
      if (!error) continue;
      legacyLookupError = error;
      const message = String(error.message || '').toLowerCase();
      const safeToFallback = error.code === 'PGRST205'
        || message.includes('relation')
        || message.includes('does not exist')
        || message.includes('column')
        || message.includes('schema cache');
      if (!safeToFallback) throw error;
    }

    if (normalizedEmail) {
      const { data, error } = await client
        .from('family_memberships')
        .select('id, family_id, role, email, status, user_id')
        .ilike('email', normalizedEmail)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1);
      if (error) throw error;

      const matchedMembership = data?.[0] || null;
      if (matchedMembership) {
        if (userId && matchedMembership.user_id !== userId) {
          const { data: relinkedMembership, error: relinkError } = await client
            .from('family_memberships')
            .update({ user_id: userId, email: normalizedEmail })
            .eq('id', matchedMembership.id)
            .select('id, family_id, role, email, status')
            .single();
          if (!relinkError) return normalizeMembershipRecord(relinkedMembership);
          console.warn('Could not relink family membership to current auth user. Continuing with email match.', relinkError);
        }
        return normalizeMembershipRecord(matchedMembership);
      }
    }

    if (legacyLookupError) {
      console.warn('Legacy family lookup unavailable; continuing with family_memberships-only auth.', legacyLookupError);
    }

    return null;
  }

  async function bootstrapFirstFamily(db, user) {
    if (!client || !allowBootstrap) return null;
    if (adminEmails.length && !adminEmails.includes(String(user.email || '').toLowerCase())) return null;

    const familyName = user.user_metadata?.family_name
      || (user.user_metadata?.full_name ? `${user.user_metadata.full_name.split(' ')[0]}'s Family` : fallbackFamilyName);
    const memberName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Family Admin';

    const { data: createdFamily, error: familyError } = await client
      .from('families')
      .insert({ name: familyName })
      .select()
      .single();
    if (familyError) throw familyError;

    const membershipPayload = {
      family_id: createdFamily.id,
      user_id: user.id,
      email: user.email || null,
      role: 'owner',
      status: 'active'
    };
    const { data: createdMembership, error: membershipError } = await client
      .from('family_memberships')
      .insert(membershipPayload)
      .select('id, family_id, role, email, status')
      .single();
    if (membershipError) {
      const fallbackPayload = {
        family_id: createdFamily.id,
        user_id: user.id,
        email: user.email || null,
        role: 'admin',
        member_id: null
      };
      const { data: fallbackMembership, error: fallbackError } = await client
        .from('family_users')
        .insert(fallbackPayload)
        .select('id, family_id, role, member_id, email')
        .single();
      if (fallbackError) throw fallbackError;

      const { data: createdMember, error: memberError } = await client
        .from('members')
        .insert({
          family_id: createdFamily.id,
          name: memberName,
          avatar: '👤',
          role: 'Family Admin'
        })
        .select()
        .single();
      if (memberError) throw memberError;

      const { data: linkedMembership, error: linkedMembershipError } = await client
        .from('family_users')
        .update({ member_id: createdMember.id })
        .eq('id', fallbackMembership.id)
        .select('id, family_id, role, member_id, email')
        .single();
      if (linkedMembershipError) throw linkedMembershipError;

      return normalizeMembershipRecord(linkedMembership);
    }

    return normalizeMembershipRecord(createdMembership);
  }

  async function ensureLegacyFamilyUser(user, membership) {
    if (!client || !user?.id || !membership?.family_id) return membership;

    const normalizedRole = membership.role === 'admin' ? 'admin' : 'member';
    const selectExisting = async () => {
      const { data, error } = await client
        .from('family_users')
        .select('id, family_id, role, member_id, email')
        .eq('family_id', membership.family_id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);
      if (error) {
        const message = String(error.message || '').toLowerCase();
        const safeToSkip = error.code === 'PGRST205'
          || message.includes('relation')
          || message.includes('does not exist')
          || message.includes('schema cache');
        if (safeToSkip) return null;
        throw error;
      }
      return data?.[0] || null;
    };

    const existing = await selectExisting();
    if (existing) {
      return {
        ...membership,
        member_id: membership.member_id || existing.member_id || null,
        email: membership.email || existing.email || user.email || ''
      };
    }

    const payload = {
      family_id: membership.family_id,
      user_id: user.id,
      member_id: membership.member_id || null,
      email: membership.email || user.email || null,
      role: normalizedRole
    };
    const { data, error } = await client
      .from('family_users')
      .insert(payload)
      .select('id, family_id, role, member_id, email')
      .single();
    if (error) {
      const duplicate = error.code === '23505' || String(error.message || '').toLowerCase().includes('duplicate');
      if (!duplicate) throw error;
      const retry = await selectExisting();
      if (retry) {
        return {
          ...membership,
          member_id: membership.member_id || retry.member_id || null,
          email: membership.email || retry.email || user.email || ''
        };
      }
      throw error;
    }

    return {
      ...membership,
      member_id: membership.member_id || data?.member_id || null,
      email: membership.email || data?.email || user.email || ''
    };
  }

  window.familyBitesDb = {
    client,
    familyId: null,
    isConfigured,
    authContext: null,
    async getSession() {
      if (!client) return null;
      let { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (!data.session && hasRecentPendingAuth()) {
        for (let attempt = 0; attempt < 8; attempt += 1) {
          await sleep(400);
          const retry = await client.auth.getSession();
          if (retry.error) throw retry.error;
          if (retry.data.session) {
            data = retry.data;
            break;
          }
        }
      }
      return data.session || null;
    },
    onAuthStateChange(callback) {
      if (!client) return null;
      const { data } = client.auth.onAuthStateChange((event, session) => {
        if (session?.user) clearAuthPending();
        callback(session, event);
      });
      return data?.subscription || null;
    },
    async signInWithGoogle() {
      if (!client) return null;
      markAuthPending();
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: authRedirectUrl(),
          queryParams: { prompt: 'select_account' }
        }
      });
      if (error) throw error;
      return true;
    },
    async signOut() {
      if (!client) return null;
      const { error } = await client.auth.signOut();
      if (error) throw error;
      clearAuthPending();
      this.familyId = null;
      this.authContext = null;
      return true;
    },
    async ensureUserContext() {
      if (!client) return null;
      const session = await this.getSession();
      const user = session?.user;

      if (!user) {
        if (!hasRecentPendingAuth(20 * 1000)) clearAuthPending();
        this.familyId = null;
        this.authContext = null;
        return null;
      }

      clearAuthPending();

      let membership = await fetchMembershipForUser(user.id, user.email);
      if (!membership) membership = await bootstrapFirstFamily(this, user);
      if (membership) {
        try {
          membership = await ensureLegacyFamilyUser(user, membership);
        } catch (error) {
          console.warn('Legacy family_users sync failed; continuing with family_memberships access.', error);
        }
      }

      if (!membership) {
        this.familyId = null;
        this.authContext = {
          user,
          familyId: null,
          role: 'member',
          memberId: null,
          email: user.email || '',
          familyName: ''
        };
        return this.authContext;
      }

      this.familyId = membership.family_id;
      const familyName = await fetchFamilyName(membership.family_id);
      this.authContext = {
        user,
        familyId: membership.family_id,
        role: membership.role || 'member',
        memberId: membership.member_id || null,
        email: user.email || membership.email || '',
        familyName
      };
      return this.authContext;
    },
    async getMembers() {
      const context = requireContext(this);
      let query = client
        .from('members')
        .select('*')
        .eq('family_id', context.familyId)
        .order('created_at', { ascending: true });
      if (context.role !== 'admin') {
        if (!context.memberId) return [];
        query = query.eq('id', context.memberId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async createMember(member) {
      const context = requireContext(this);
      if (context.role !== 'admin') throw new Error('Only admins can add family members.');
      const { data, error } = await client
        .from('members')
        .insert({
          family_id: context.familyId,
          name: member.name,
          avatar: member.avatar || '🧑',
          role: member.role || 'Family member'
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async deleteMember(memberId) {
      const context = requireContext(this);
      if (context.role !== 'admin') throw new Error('Only admins can remove family members.');
      const { error } = await client
        .from('members')
        .delete()
        .eq('id', memberId)
        .eq('family_id', context.familyId);
      if (error) throw error;
    },
    async getMeals() {
      const context = requireContext(this);
      let query = client
        .from('food_entries')
        .select('*')
        .eq('family_id', context.familyId)
        .order('eaten_at', { ascending: false });
      if (context.role !== 'admin') {
        if (!context.memberId) return [];
        query = query.eq('member_id', context.memberId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async saveMeal(meal) {
      const context = requireContext(this);
      const payload = {
        family_id: context.familyId,
        member_id: context.role === 'admin' ? meal.member_id : context.memberId,
        food_name: meal.food_name,
        restaurant_name: meal.restaurant_name || null,
        location_name: meal.location_name || null,
        price: meal.price,
        calories: meal.calories,
        protein_g: meal.protein_g ?? null,
        carbs_g: meal.carbs_g ?? null,
        fat_g: meal.fat_g ?? null,
        fiber_g: meal.fiber_g ?? null,
        sugar_g: meal.sugar_g ?? null,
        ai_health_score: meal.ai_health_score ?? null,
        ai_tags: Array.isArray(meal.ai_tags) ? meal.ai_tags : [],
        likely_ingredients: Array.isArray(meal.likely_ingredients) ? meal.likely_ingredients : [],
        ai_insight: meal.ai_insight || null,
        description: meal.notes || null,
        photo_url: meal.photo_url || null,
        eaten_at: meal.eaten_at
      };
      const { data, error } = await client
        .from('food_entries')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async updateMeal(mealId, fields) {
      const context = requireContext(this);
      const payload = { ...fields };
      if ('notes' in payload) {
        payload.description = payload.notes || null;
        delete payload.notes;
      }
      if ('ai_tags' in payload) {
        payload.ai_tags = Array.isArray(payload.ai_tags) ? payload.ai_tags : [];
      }
      if ('likely_ingredients' in payload) {
        payload.likely_ingredients = Array.isArray(payload.likely_ingredients) ? payload.likely_ingredients : [];
      }

      let query = client
        .from('food_entries')
        .update(payload)
        .eq('id', mealId)
        .eq('family_id', context.familyId);
      if (context.role !== 'admin') query = query.eq('member_id', context.memberId);

      const { data, error } = await query.select().single();
      if (error) throw error;
      return data;
    },
    async deleteMeal(mealId) {
      const context = requireContext(this);
      let query = client
        .from('food_entries')
        .delete()
        .eq('id', mealId)
        .eq('family_id', context.familyId);
      if (context.role !== 'admin') query = query.eq('member_id', context.memberId);
      const { error } = await query;
      if (error) throw error;
    },
    async getFavorites() {
      const context = requireContext(this);
      let query = client
        .from('favorite_restaurants')
        .select('*')
        .eq('family_id', context.familyId)
        .order('created_at', { ascending: false });
      if (context.role !== 'admin' && context.memberId) query = query.eq('member_id', context.memberId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async getChat() {
      const context = requireContext(this);
      const { data, error } = await client
        .from('family_chat')
        .select('*')
        .eq('family_id', context.familyId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    async sendChat(message) {
      const context = requireContext(this);
      const { data, error } = await client
        .from('family_chat')
        .insert({
          family_id: context.familyId,
          member_id: context.role === 'admin' ? message.member_id : context.memberId,
          member_name: message.member_name || null,
          message: message.message
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async uploadImage(dataUrl, folder) {
      if (!client) return null;
      const blob = await (await fetch(dataUrl)).blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await client.storage.from('family-media').upload(path, blob, { contentType: blob.type });
      if (error) throw error;
      const { data } = client.storage.from('family-media').getPublicUrl(path);
      return data?.publicUrl || null;
    },
    async uploadMealPhoto(dataUrl) {
      return this.uploadImage(dataUrl, 'meals');
    },
    async uploadAvatar(dataUrl) {
      return this.uploadImage(dataUrl, 'avatars');
    },
    async getBioLogs(logDate) {
      const context = requireContext(this);
      let query = client
        .from('bio_logs')
        .select('*')
        .eq('family_id', context.familyId)
        .eq('log_date', logDate);
      if (context.role !== 'admin' && context.memberId) query = query.eq('member_id', context.memberId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async saveBioLog(log) {
      const context = requireContext(this);
      const payload = {
        ...log,
        family_id: context.familyId,
        member_id: context.role === 'admin' ? log.member_id : context.memberId
      };
      const { data, error } = await client
        .from('bio_logs')
        .upsert(payload, { onConflict: 'member_id,log_date' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async saveBodyImpactSnapshot(snapshot) {
      const context = requireContext(this);
      const payload = {
        family_id: context.familyId,
        member_id: context.role === 'admin' ? snapshot.member_id : context.memberId,
        impact_date: snapshot.impact_date,
        total_calories: Number(snapshot.total_calories) || 0,
        body_health_score: Number(snapshot.body_health_score) || 0,
        nutrition_balance: Number(snapshot.nutrition_balance) || 0,
        meal_count: Number(snapshot.meal_count) || 0,
        impact_cards: Array.isArray(snapshot.impact_cards) ? snapshot.impact_cards : []
      };
      const { data, error } = await client
        .from('daily_body_impact')
        .upsert(payload, { onConflict: 'family_id,member_id,impact_date' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async updateMember(memberId, fields) {
      const context = requireContext(this);
      if (context.role !== 'admin' && memberId !== context.memberId) {
        throw new Error('You can only update your own profile.');
      }
      const { data, error } = await client
        .from('members')
        .update(fields)
        .eq('id', memberId)
        .eq('family_id', context.familyId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    subscribeChat(onMessage) {
      const context = this.authContext;
      if (!client || !context?.familyId) return null;
      return client
        .channel(`family-chat-${context.familyId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'family_chat',
          filter: `family_id=eq.${context.familyId}`
        }, (payload) => onMessage(payload.new))
        .subscribe();
    }
  };
})();

window.addEventListener('load', () => {
  const mealDatePatch = document.createElement('script');
  mealDatePatch.src = 'meal-date-patch.js?v=1';
  mealDatePatch.async = false;
  mealDatePatch.onload = () => {
    const mealSortPatch = document.createElement('script');
    mealSortPatch.src = 'meal-sort-patch.js?v=1';
    mealSortPatch.async = false;
    document.body.appendChild(mealSortPatch);
  };
  document.body.appendChild(mealDatePatch);
});
