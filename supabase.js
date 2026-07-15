(function initFamilyBitesSupabase() {
  const url = window.FAMILYBITES_SUPABASE_URL || 'https://mjnigheggxtythytsqle.supabase.co';
  const anonKey = window.FAMILYBITES_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbmlnaGVnZ3h0eXRoeXRzcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzYwMDcsImV4cCI6MjA5NTY1MjAwN30.mh1psePuKeQ8SH5uita7BsUKd6wd5IwHVVlDmJCMA0Q';
  const authRedirectUrl = window.FAMILYBITES_AUTH_REDIRECT_URL || 'https://mymealmap1.netlify.app/';

  const hasClient = Boolean(window.supabase?.createClient);
  const isConfigured = Boolean(hasClient && url && anonKey && !url.includes('YOUR_') && !anonKey.includes('YOUR_'));
  const client = isConfigured ? window.supabase.createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }) : null;

  window.familyBitesDb = {
    client,
    familyId: null,
    isConfigured,
    async getSession() {
      if (!client) return null;
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data?.session || null;
    },
    async getAuthHeaders() {
      const session = await this.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('Your session expired. Sign in again to continue.');
      const authorization = `Bearer ${accessToken}`;
      return {
        Authorization: authorization,
        'X-MyMealMap-Authorization': authorization
      };
    },
    async sendOtp(email) {
      if (!client) throw new Error('Supabase auth is not configured.');
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: authRedirectUrl
        }
      });
      if (error) throw error;
    },
    async verifyOtp(email, token) {
      if (!client) throw new Error('Supabase auth is not configured.');
      const { error } = await client.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      if (error) throw error;
    },
    async signOut() {
      if (!client) return;
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
    onAuthStateChange(onSessionChange) {
      if (!client) return null;
      return client.auth.onAuthStateChange((_event, session) => onSessionChange(session));
    },
    async resolveFamilyMembership() {
      if (!client) return null;
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) throw userError;
      const user = userData?.user;
      if (!user) return null;
      const email = String(user.email || '').trim().toLowerCase();

      if (email) {
        const { error: claimError } = await client
          .from('family_memberships')
          .update({ user_id: user.id, status: 'active' })
          .is('user_id', null)
          .eq('email', email);
        if (claimError) throw claimError;
      }

      const { data, error } = await client
        .from('family_memberships')
        .select('id, family_id, email, role, status, families(id, name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true });
      if (error) throw error;

      const membership = data?.[0] || null;
      this.familyId = membership?.family_id || null;
      if (!membership) return null;

      await seedMembers(this.familyId, buildStarterMemberNameFromEmail(user.email));
      return {
        id: membership.id,
        family_id: membership.family_id,
        family_name: membership.families?.name || 'Family',
        email: membership.email,
        role: membership.role,
        status: membership.status
      };
    },
    async createFamilyForCurrentUser(name) {
      if (!client) throw new Error('Supabase auth is not configured.');
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) throw userError;
      const user = userData?.user;
      if (!user?.id || !user?.email) {
        throw new Error('You must sign in before creating a family.');
      }

      const { data: createdFamily, error: familyError } = await client
        .from('families')
        .insert({ name })
        .select()
        .single();
      if (familyError) throw familyError;

      const { error: membershipError } = await client
        .from('family_memberships')
        .insert({
          family_id: createdFamily.id,
          user_id: user.id,
          email: String(user.email).trim().toLowerCase(),
          role: 'owner',
          status: 'active'
        });
      if (membershipError) throw membershipError;

      this.familyId = createdFamily.id;
      await seedMembers(this.familyId, buildStarterMemberNameFromEmail(user.email));
      return createdFamily;
    },
    async getMembers() {
      if (!client || !this.familyId) return [];
      const { data, error } = await client
        .from('members')
        .select('*')
        .eq('family_id', this.familyId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    async saveMember(member) {
      if (!client || !this.familyId) return member;
      const payload = {
        family_id: this.familyId,
        name: member.name,
        avatar: member.avatar || '👤',
        role: member.role || 'Profile'
      };
      const { data, error } = await client
        .from('members')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async getMeals() {
      if (!client || !this.familyId) return [];
      const { data, error } = await client
        .from('food_entries')
        .select('*')
        .eq('family_id', this.familyId)
        .order('eaten_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async getSnapScans() {
      if (!client || !this.familyId) return [];
      const { data, error } = await client
        .from('snap_scans')
        .select('*')
        .eq('family_id', this.familyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async saveMeal(meal) {
      if (!client || !this.familyId) return meal;
      const payload = {
        family_id: this.familyId,
        member_id: meal.member_id,
        food_name: meal.food_name,
        restaurant_name: meal.restaurant_name || null,
        location_name: meal.location_name || null,
        price: meal.price,
        calories: meal.calories,
        protein_g: meal.protein_g ?? null,
        carbs_g: meal.carbs_g ?? null,
        fat_g: meal.fat_g ?? null,
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
    async saveSnapScan(scan) {
      if (!client || !this.familyId) return scan;
      const payload = {
        family_id: this.familyId,
        member_id: scan.member_id,
        food_name: scan.food_name || null,
        calories: scan.calories,
        notes: scan.notes || null,
        photo_url: scan.photo_url || null,
        ingredients: scan.ingredients || [],
        tags: scan.tags || [],
        confidence: scan.confidence || null,
        ai_note: scan.ai_note || null,
        foods: scan.foods || [],
        linked_meal_id: scan.linked_meal_id || null,
        created_at: scan.created_at
      };
      const { data, error } = await client
        .from('snap_scans')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async updateMeal(mealId, fields) {
      if (!client || !this.familyId) return null;
      const payload = { ...fields };
      if ('notes' in payload) {
        payload.description = payload.notes || null;
        delete payload.notes;
      }
      const { data, error } = await client
        .from('food_entries')
        .update(payload)
        .eq('id', mealId)
        .eq('family_id', this.familyId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async updateSnapScan(scanId, fields) {
      if (!client || !this.familyId) return null;
      const payload = { ...fields };
      if ('linked_meal_id' in payload && !payload.linked_meal_id) {
        payload.linked_meal_id = null;
      }
      const { data, error } = await client
        .from('snap_scans')
        .update(payload)
        .eq('id', scanId)
        .eq('family_id', this.familyId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async deleteMeal(mealId) {
      if (!client || !this.familyId) return;
      const { error } = await client
        .from('food_entries')
        .delete()
        .eq('id', mealId)
        .eq('family_id', this.familyId);
      if (error) throw error;
    },
    async deleteSnapScan(scanId) {
      if (!client || !this.familyId) return;
      const { error } = await client
        .from('snap_scans')
        .delete()
        .eq('id', scanId)
        .eq('family_id', this.familyId);
      if (error) throw error;
    },
    async getFavorites() {
      if (!client || !this.familyId) return [];
      const { data, error } = await client
        .from('favorite_restaurants')
        .select('*')
        .eq('family_id', this.familyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
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
    async uploadScanPhoto(dataUrl) {
      return this.uploadImage(dataUrl, 'scans');
    },
    async uploadAvatar(dataUrl) {
      return this.uploadImage(dataUrl, 'avatars');
    },
    async getBioLogs(logDate) {
      if (!client || !this.familyId) return [];
      const { data, error } = await client
        .from('bio_logs')
        .select('*')
        .eq('family_id', this.familyId)
        .eq('log_date', logDate);
      if (error) throw error;
      return data || [];
    },
    async saveBioLog(log) {
      if (!client) return null;
      const { data, error } = await client
        .from('bio_logs')
        .upsert(log, { onConflict: 'member_id,log_date' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async updateMember(memberId, fields) {
      if (!client || !this.familyId) return null;
      const { data, error } = await client
        .from('members')
        .update(fields)
        .eq('id', memberId)
        .eq('family_id', this.familyId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async deleteMember(memberId) {
      if (!client || !this.familyId) return;
      const { error } = await client
        .from('members')
        .delete()
        .eq('id', memberId)
        .eq('family_id', this.familyId);
      if (error) throw error;
    }
  };

  function buildStarterMemberNameFromEmail(email) {
    const localPart = String(email || '').split('@')[0] || '';
    const cleaned = localPart.replace(/[._-]+/g, ' ').trim();
    if (!cleaned) return 'My Profile';
    return cleaned
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ');
  }

  async function seedMembers(familyId, ownerName = 'My Profile') {
    const { data: existing, error: findError } = await client
      .from('members')
      .select('id')
      .eq('family_id', familyId)
      .limit(1);

    if (findError) throw findError;
    if (existing?.length) return;

    const starterMembers = [
      { family_id: familyId, name: ownerName, avatar: '👤', role: 'Personal profile' }
    ];

    const { error: insertError } = await client.from('members').insert(starterMembers);
    if (insertError) throw insertError;
  }
})();
