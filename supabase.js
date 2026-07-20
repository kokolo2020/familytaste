(function initFamilyBitesSupabase() {
  const url = window.FAMILYBITES_SUPABASE_URL || 'https://mjnigheggxtythytsqle.supabase.co';
  const anonKey = window.FAMILYBITES_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbmlnaGVnZ3h0eXRoeXRzcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzYwMDcsImV4cCI6MjA5NTY1MjAwN30.mh1psePuKeQ8SH5uita7BsUKd6wd5IwHVVlDmJCMA0Q';
  const fallbackFamilyName = window.FAMILYBITES_FAMILY_NAME || 'FamilyTaste Family';
  const allowBootstrap = window.FAMILYBITES_ALLOW_FIRST_ADMIN_BOOTSTRAP !== 'false';
  const adminEmails = String(window.FAMILYBITES_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const productionAppUrl = window.FAMILYBITES_APP_URL || 'https://mymealmap1.netlify.app/';

  const hasClient = Boolean(window.supabase?.createClient);
  const isConfigured = Boolean(hasClient && url && anonKey && !url.includes('YOUR_') && !anonKey.includes('YOUR_'));
  const client = isConfigured ? window.supabase.createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    storage: window.localStorage
  }
}) : null;

  function authRedirectUrl() {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocalhost) return `${window.location.origin}${window.location.pathname}`;
    return productionAppUrl;
  }

  function directGoogleAuthUrl() {
    const redirectTo = encodeURIComponent(authRedirectUrl());
    return `${url}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}&prompt=select_account`;
  }

  function requireContext(db) {
    if (!db.authContext?.familyId) throw new Error('Google sign-in is required before loading family data.');
    return db.authContext;
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
      role: 'admin',
      member_id: null
    };
    const { data: createdMembership, error: membershipError } = await client
      .from('family_users')
      .insert(membershipPayload)
      .select('id, family_id, role, member_id, email')
      .single();
    if (membershipError) throw membershipError;

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
      .eq('id', createdMembership.id)
      .select('id, family_id, role, member_id, email')
      .single();
    if (linkedMembershipError) throw linkedMembershipError;

    return {
      ...linkedMembership,
      families: { name: createdFamily.name }
    };
  }

  window.familyBitesDb = {
    client,
    familyId: null,
    isConfigured,
    authContext: null,
    async getSession() {
      if (!client) return null;
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session || null;
    },
    onAuthStateChange(callback) {
      if (!client) return null;
      const { data } = client.auth.onAuthStateChange((_event, session) => callback(session));
      return data?.subscription || null;
    },
    async signInWithGoogle() {
      const fallbackUrl = directGoogleAuthUrl();
      if (!client) {
        window.location.assign(fallbackUrl);
        return true;
      }
      try {
        const { data, error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: authRedirectUrl(),
            queryParams: { prompt: 'select_account' },
            skipBrowserRedirect: true
          }
        });
        if (error) throw error;
        window.location.assign(data?.url || fallbackUrl);
      } catch (_error) {
        window.location.assign(fallbackUrl);
      }
      return true;
    },
    async signOut() {
      if (!client) return null;
      const { error } = await client.auth.signOut();
      if (error) throw error;
      this.familyId = null;
      this.authContext = null;
      return true;
    },
    async ensureUserContext() {
      if (!client) return null;
      const session = await this.getSession();
      const user = session?.user;

      if (!user) {
        this.familyId = null;
        this.authContext = null;
        return null;
      }

      const { data: memberships, error } = await client
        .from('family_users')
        .select('id, family_id, role, member_id, email, families(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);
      if (error) throw error;

      let membership = memberships?.[0] || null;
      if (!membership) membership = await bootstrapFirstFamily(this, user);

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
      this.authContext = {
        user,
        familyId: membership.family_id,
        role: membership.role || 'member',
        memberId: membership.member_id || null,
        email: user.email || membership.email || '',
        familyName: membership.families?.name || fallbackFamilyName
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
    mealSortPatch.onload = () => {
      const breakdownPatch = document.createElement('script');
      breakdownPatch.src = 'nutrition-breakdown-patch.js?v=20260719c';
      breakdownPatch.async = false;
      document.body.appendChild(breakdownPatch);
    };
    document.body.appendChild(mealSortPatch);
  };
  document.body.appendChild(mealDatePatch);
});
