(function initFamilyBitesSupabase() {
  const url = window.FAMILYBITES_SUPABASE_URL || 'https://mjnigheggxtythytsqle.supabase.co';
  const anonKey = window.FAMILYBITES_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbmlnaGVnZ3h0eXRoeXRzcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzYwMDcsImV4cCI6MjA5NTY1MjAwN30.mh1psePuKeQ8SH5uita7BsUKd6wd5IwHVVlDmJCMA0Q';
  const familyName = window.FAMILYBITES_FAMILY_NAME || 'FamilyBites Demo Family';

  const hasClient = Boolean(window.supabase?.createClient);
  const isConfigured = Boolean(hasClient && url && anonKey && !url.includes('YOUR_') && !anonKey.includes('YOUR_'));
  const client = isConfigured ? window.supabase.createClient(url, anonKey) : null;

  window.familyBitesDb = {
    client,
    familyId: null,
    isConfigured,
    async ensureFamily() {
      if (!client) return null;

      const { data: existingFamily, error: findError } = await client
        .from('families')
        .select('*')
        .eq('name', familyName)
        .maybeSingle();

      if (findError) throw findError;
      if (existingFamily) {
        this.familyId = existingFamily.id;
        await seedMembers(this.familyId);
        return existingFamily;
      }

      const { data: createdFamily, error: createError } = await client
        .from('families')
        .insert({ name: familyName })
        .select()
        .single();

      if (createError) throw createError;
      this.familyId = createdFamily.id;
      await seedMembers(this.familyId);
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
    async getChat() {
      if (!client || !this.familyId) return [];
      const { data, error } = await client
        .from('family_chat')
        .select('*')
        .eq('family_id', this.familyId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    async sendChat(message) {
      if (!client || !this.familyId) return message;
      const { data, error } = await client
        .from('family_chat')
        .insert({
          family_id: this.familyId,
          member_id: message.member_id,
          member_name: message.member_name || null,
          message: message.message
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async uploadMealPhoto(dataUrl) {
      if (!client) return null;
      const blob = await (await fetch(dataUrl)).blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      const path = `meals/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await client.storage.from('meal-photos').upload(path, blob, { contentType: blob.type });
      if (error) throw error;
      const { data } = client.storage.from('meal-photos').getPublicUrl(path);
      return data?.publicUrl || null;
    },
    subscribeChat(onMessage) {
      if (!client || !this.familyId) return null;
      return client
        .channel('family-chat')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'family_chat',
          filter: `family_id=eq.${this.familyId}`
        }, (payload) => onMessage(payload.new))
        .subscribe();
    }
  };

  async function seedMembers(familyId) {
    const { data: existing, error: findError } = await client
      .from('members')
      .select('id')
      .eq('family_id', familyId)
      .limit(1);

    if (findError) throw findError;
    if (existing?.length) return;

    const starterMembers = [
      { family_id: familyId, name: 'Dad', avatar: '👨', role: 'Family Admin' },
      { family_id: familyId, name: 'Rithyna', avatar: '👩', role: 'Meal Planner' }
    ];

    const { error: insertError } = await client.from('members').insert(starterMembers);
    if (insertError) throw insertError;
  }
})();
