# MyMealMap1 Login Troubleshooting

Use this guide when `https://mymealmap1.netlify.app` has Google sign-in problems.

## What The Error Usually Means

If Google sign-in succeeds but the app returns to:

- `Continue with Google`
- `No family access yet`

then the problem is usually one of these:

- `family_memberships` has no active row for that user
- older auth code was deployed in `supabase.js` or `auth-callback.html`
- Google or Supabase redirect settings changed
- the browser is holding an old session or cached assets

## First Things To Check

1. Confirm the user signed in with the intended Google email.
2. Confirm the site is really `mymealmap1.netlify.app`.
3. Confirm the latest deploy is on Netlify site `mymealmap1`, not another project.
4. Check `family_memberships` for the signed-in user.
5. Confirm there is an `active` membership row for the correct family.
6. Check whether an older deploy changed auth files.
7. Try a hard refresh or private browsing window to rule out cache issues.

## SQL Checks

Check by email:

```sql
select id, family_id, user_id, email, role, status, created_at
from family_memberships
where email = 'YOUR_EMAIL_HERE'
order by created_at desc;
```

Check by user id:

```sql
select id, family_id, user_id, email, role, status, created_at
from family_memberships
where user_id = 'YOUR_USER_ID_HERE'
order by created_at desc;
```

## Healthy Result

The intended user should have:

- at least one row in `family_memberships`
- the correct `family_id`
- the correct `user_id`
- `status = 'active'`

## If No Row Returns

The Google login may be fine, but the account is not linked to a family.

Fix:

- insert or restore the correct `family_memberships` row
- make sure `status` is `active`

## If A Row Exists But Login Still Fails

Look at these next:

- wrong or older frontend auth code
- old cached browser assets
- incorrect redirect settings in Google or Supabase
- callback page not storing the session correctly

## Sensitive Auth Files

These files should be checked before and after deploys:

- `/Users/koko/familytaste/supabase.js`
- `/Users/koko/familytaste/auth-callback.html`

If login breaks after a UI update or rollback, compare these files first.

## Fast Browser Checks

- try private/incognito mode
- hard refresh the page
- fully sign out, then sign in again
- open the unique Netlify deploy URL instead of the cached production tab

## Netlify Checks

Confirm:

- the active site is `mymealmap1`
- the deploy you expect is the one currently live
- the deploy did not accidentally go to `vitaminscan` or another Netlify project

## Quick Diagnosis Rule

- `Continue with Google` again:
  usually session, callback, cache, or old deploy issue
- `No family access yet`:
  usually `family_memberships` lookup issue
- Google popup fails before returning:
  usually Google or Supabase auth configuration issue

## Safe Deploy Checklist

Before every deploy:

1. Check diff for `/Users/koko/familytaste/supabase.js`
2. Check diff for `/Users/koko/familytaste/auth-callback.html`
3. Check working rows in `family_memberships`
4. Confirm Netlify target is `mymealmap1`
5. Keep a stable-login restore point or git tag

