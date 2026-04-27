# Google OAuth Setup Guide

To enable Google Sign-In for your blogging platform, follow these steps:

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Enter project name: `Aetherfield Blog`
4. Click **Create**

## Step 2: Enable the Google+ API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for **Google+ API**
3. Click on it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. If prompted to configure the OAuth consent screen:
   - Choose **External** user type
   - Click **Create**
   - Fill in the required fields:
     - **App name**: Aetherfield Blog
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click **Save and Continue**
   - Skip scopes (click **Save and Continue**)
   - Click **Save and Continue** on the summary page

4. Back to credentials creation:
   - **Application type**: Web application
   - **Name**: Aetherfield Blog Web Client
   - Under **Authorized redirect URIs**, add:
     ```
     https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback
     ```
     (Replace `[YOUR_SUPABASE_PROJECT_ID]` with your actual Supabase project ID)
   
   - Also add for local development:
     ```
     http://localhost:3000/auth/login
     http://localhost:3001/auth/login
     ```

5. Click **Create**
6. Copy the **Client ID** and **Client Secret** (you'll need these next)

## Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and click to expand
5. Toggle **Enabled** to ON
6. Paste your **Client ID** and **Client Secret** from Step 3
7. Click **Save**

## Step 5: Update Redirect URLs

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Add your production URL to **Redirect URLs**:
   ```
   https://yourdomain.com/auth/login
   ```
3. Also ensure `http://localhost:3000` and `http://localhost:3001` are included for local development

## Step 6: Test Google Sign-In

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page (`http://localhost:3000/auth/login`)
3. Click **"Continue with Google"**
4. You should be redirected to Google's sign-in page
5. After signing in, you'll be redirected back to your dashboard

## Troubleshooting

**Issue: "Redirect URI mismatch" error**
- Make sure your redirect URI in Google Cloud Console exactly matches your Supabase callback URL
- Check for trailing slashes and protocol (http vs https)

**Issue: "Google is not configured" error**
- Verify that Google provider is **Enabled** in Supabase
- Check that Client ID and Client Secret are correctly pasted

**Issue: OAuth callback not working**
- Ensure your redirect URL is added to Supabase **URL Configuration**
- Clear browser cookies and cache, then try again
- Check browser console for detailed error messages

## Environment Variables

No additional environment variables are needed. The OAuth configuration is handled entirely through Supabase dashboard.

## How It Works

1. User clicks "Continue with Google"
2. User is redirected to Google's sign-in page
3. After authentication, Google redirects back to `/auth/login?code=...`
4. The code is exchanged for a session automatically
5. User is synced to the `users` table with their Google profile name
6. User is redirected to the dashboard

Both email/password and Google OAuth users are merged into the same authentication system and use the same `users` table.
