const DEFAULT_SUPABASE_URL = 'https://mjnigheggxtythytsqle.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbmlnaGVnZ3h0eXRoeXRzcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzYwMDcsImV4cCI6MjA5NTY1MjAwN30.mh1psePuKeQ8SH5uita7BsUKd6wd5IwHVVlDmJCMA0Q';

async function requireAuthenticatedUser(event) {
  const authorization = String(
    event.headers?.authorization
    || event.headers?.Authorization
    || event.headers?.['x-mymealmap-authorization']
    || event.headers?.['X-MyMealMap-Authorization']
    || ''
  ).trim();
  if (!authorization.startsWith('Bearer ')) {
    return { error: { statusCode: 401, message: 'Sign in to use this feature.' } };
  }

  const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: authorization
      }
    });
    if (!response.ok) {
      return { error: { statusCode: 401, message: 'Your session expired. Sign in again to continue.' } };
    }
    return { user: await response.json() };
  } catch (error) {
    console.error('Session verification failed', error);
    return { error: { statusCode: 503, message: 'Could not verify your session. Please try again.' } };
  }
}

module.exports = { requireAuthenticatedUser };
