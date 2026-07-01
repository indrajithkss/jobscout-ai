# JobScout AI – External Provider Setup Guide

This document walks you through registering and configuring the three real job API providers used by JobScout AI to discover live job listings from India.

---

## Overview

| Provider | Coverage | Free Tier | Key Variable(s) |
|----------|----------|-----------|-----------------|
| **JSearch** | LinkedIn · Indeed · Glassdoor (via RapidAPI) | 200 requests / month | `JSEARCH_API_KEY` or `RAPIDAPI_KEY` |
| **Jooble** | Naukri · Foundit · Shine · TimesJobs | Unlimited (rate-limited) | `JOOBLE_API_KEY` |
| **Adzuna** | Direct job board aggregator (India) | 50,000 calls / month | `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` |

Once all three providers are configured, the dashboard warning banner disappears and `real_provider_jobs` will be greater than zero.

---

## Provider 1 — JSearch (via RapidAPI)

### What it does
JSearch wraps LinkedIn, Indeed, and Glassdoor job listings into a single API. It is the highest-quality source for discovering international tech company listings that are posted in India.

### Registration
1. Go to: **https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch**
2. Click **"Subscribe to Test"**
3. Select the **Basic (Free)** plan — 200 requests/month, no credit card required
4. Navigate to: **My Apps → Add New App** → Create any app name
5. Copy the **X-RapidAPI-Key** from the App dashboard

### Free Tier Limits
- 200 requests / month
- Each scout scan uses ~5 requests (1 per search query)
- Suitable for testing and low-frequency automated scans

### Environment Variable
```env
# Primary key name (preferred)
JSEARCH_API_KEY=your_rapidapi_key_here

# Legacy fallback (also supported)
RAPIDAPI_KEY=your_rapidapi_key_here
```

> **Note:** JobScout supports both `JSEARCH_API_KEY` and `RAPIDAPI_KEY`. Either variable will activate JSearch. `JSEARCH_API_KEY` takes priority if both are set.

### Manual Test
```bash
curl --request GET \
  --url "https://jsearch.p.rapidapi.com/search?query=Full+Stack+Developer+India&page=1&num_pages=1" \
  --header "X-RapidAPI-Key: YOUR_KEY_HERE" \
  --header "X-RapidAPI-Host: jsearch.p.rapidapi.com"
```
Expected: JSON with a `data` array of job objects.

---

## Provider 2 — Jooble

### What it does
Jooble aggregates Indian job postings from Naukri, Foundit, TimesJobs, Shine, and hundreds of other regional job boards.

### Registration
1. Go to: **https://jooble.org/api/about**
2. Click **"Get API Key"**
3. Fill in your email and website/project description
4. Jooble will email you an API key within 1–2 business days

### Free Tier Limits
- **Unlimited requests** — rate limited per minute
- Results restricted to 20 jobs per request
- India-specific location filtering supported natively

### Environment Variable
```env
JOOBLE_API_KEY=your_jooble_key_here
```

### Manual Test
```bash
curl --request POST \
  --url "https://jooble.org/api/YOUR_KEY_HERE" \
  --header "Content-Type: application/json" \
  --data '{"keywords":"Full Stack Developer","location":"India","page":"1","resultonpage":"5"}'
```
Expected: JSON with a `jobs` array containing Indian job listings.

---

## Provider 3 — Adzuna India

### What it does
Adzuna is a direct job board with dedicated regional APIs including India (`/in/`). It provides rich job metadata including salary estimates, skills, and company information.

### Registration
1. Go to: **https://developer.adzuna.com/**
2. Click **"Register"** and create a free account
3. Navigate to: **Dashboard → Create App**
4. Give your app a name (e.g., `jobscout-ai`)
5. Copy both the **App ID** and **App Key** from the app dashboard

### Free Tier Limits
- **50,000 API calls / month** — very generous for job discovery
- Full India job board coverage via endpoint: `/api/jobs/in/search/1`
- Includes job salary data, skills, and company details

### Environment Variables
```env
ADZUNA_APP_ID=your_adzuna_app_id_here
ADZUNA_APP_KEY=your_adzuna_app_key_here
```

### Manual Test
```bash
curl "https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY&what=Full+Stack+Developer&where=India&results_per_page=5"
```
Expected: JSON with a `results` array of Adzuna India job listings.

---

## Configuring Environment Variables

Open the backend environment file:

```
jobscout-ai/backend/.env
```

Add your keys in the designated section:

```env
# ─── External Job Provider API Keys ─────────────────────────────────────────

# JSearch via RapidAPI (wraps LinkedIn, Glassdoor, Indeed)
# Registration: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
JSEARCH_API_KEY=your_rapidapi_key_here

# Jooble (aggregates Naukri, Foundit, TimesJobs, Shine)
# Registration: https://jooble.org/api/about
JOOBLE_API_KEY=your_jooble_key_here

# Adzuna India (direct job board aggregator)
# Registration: https://developer.adzuna.com/
ADZUNA_APP_ID=your_adzuna_app_id_here
ADZUNA_APP_KEY=your_adzuna_app_key_here
```

After editing `.env`, restart the backend server:

```bash
# Stop the running server (Ctrl+C) then:
npm run dev
```

---

## Verifying Provider Activation

### 1. Check startup logs
When the backend starts, it prints a provider configuration summary:

```
[JobScout] Provider Configuration:
  ✓ JSearch  – configured (JSEARCH_API_KEY)
  ✓ Jooble   – configured (JOOBLE_API_KEY)
  ✓ Adzuna   – configured (ADZUNA_APP_ID + ADZUNA_APP_KEY)
```

### 2. Check the diagnostics endpoint
```bash
GET http://localhost:5000/api/scout/diagnostics
```

Expected response when all keys are set:
```json
{
  "success": true,
  "providers": [
    { "provider": "JSearch", "configured": true, "healthy": true, "lastSuccessfulFetch": "2026-06-23T11:06:02.987Z" },
    { "provider": "Jooble",  "configured": true, "healthy": false, "lastSuccessfulFetch": null },
    { "provider": "Adzuna",  "configured": true, "healthy": false, "lastSuccessfulFetch": null }
  ]
}
```

### 3. Run a Scout Scan
Click **"Run Scout Scan"** on the dashboard. After the scan:
- `realJobsFound` should be greater than 0
- `fallbackJobs` should be 0 or near 0
- Job listings should contain real external apply links (linkedin.com, glassdoor.com, indeed.com, etc.)
- The dashboard warning banner should disappear

### 4. Dashboard Confirmation
Once all providers are configured, the yellow warning banner:
> *"Using fallback discovery because no external providers are configured."*

...will **no longer appear**.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `realJobsFound = 0` after scan | API keys missing or invalid | Check `.env` keys match registered app |
| JSearch returns 403 | RapidAPI key invalid or expired | Regenerate key at rapidapi.com |
| Jooble returns empty `jobs: []` | Role query too specific, or key not approved yet | Wait for Jooble email approval; broaden search query |
| Adzuna returns 401 | App ID/Key mismatch | Copy both App ID and App Key from developer.adzuna.com dashboard |
| Dashboard still shows warning after adding keys | Backend not restarted | Stop and restart `npm run dev` in backend directory |
