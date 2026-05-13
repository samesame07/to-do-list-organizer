# Organize Labs Todo

Static habit tracker / review dashboard for GitHub Pages.

## Files

- `index.html`
- `cloud-config.js`
- `styles.css`
- `script.js`
- `supabase-setup.sql`

## Publish On GitHub Pages

1. Create a new empty GitHub repository.
2. Open Terminal and run:

```bash
cd "/Users/inouekinari/Documents/New project/to do list"
git add .
git commit -m "Initial site"
git remote add origin https://github.com/YOUR_NAME/YOUR_REPO.git
git push -u origin main
```

3. On GitHub, open:

- `Settings`
- `Pages`
- `Build and deployment`
- `Source: Deploy from a branch`
- `Branch: main`
- `Folder: / (root)`

4. Wait a minute or two.

Your site URL will be:

```text
https://YOUR_NAME.github.io/YOUR_REPO/
```

## Cloud Sync

This app can now save data to a Supabase project that is tied to each user's account.

What syncs:

- current board state
- preserved boards

What stays local:

- sidebar open / closed preference

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Paste the contents of `supabase-setup.sql` and run it.
4. In `Authentication > Sign In / Providers`, enable Email.
5. In `Authentication > URL Configuration`, set:

- `Site URL`: your GitHub Pages URL  
  example: `https://YOUR_NAME.github.io/YOUR_REPO/`
- add the same URL to `Redirect URLs`

6. In `Project Settings > API`, copy:

- Project URL
- publishable key or anon key

7. Open your site and press `Cloud Setup`.
8. Paste the URL and key, then `Save Setup`.
9. Create an account or sign in.

After that, the current board and preserved boards will save to the signed-in account.

## Optional: Hardcode the Cloud Config

If you do not want to paste the Supabase URL and key on each device, you can put them directly in `cloud-config.js`:

```js
window.SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_PUBLIC_KEY",
};
```

This is okay because the public / anon key is meant for client-side use.  
Never put a Supabase service role key in this file.

## Important Note

This app still keeps a local copy in each browser's `localStorage`.

Without cloud sign-in:

- your friend can open and use the site
- your current checks and preserved boards will not automatically sync to their browser

With cloud sign-in:

- the signed-in user's board can be restored on other devices
- preserved boards can also come back with that account
