# deploy-check

## Purpose
The final checklist before going to the live environment (Production).

## Pre-Deployment Checklist
- [ ] **Config:** Are the API URLs and Keys in the `env.production` file correct?
- [ ] **Assets:** Are all assets optimized? (Images, fonts).
- [ ] **Database:** Have migration scripts (`dotnet ef database update`) been tested in Staging?
- [ ] **Security:** Do firewall (CORS) settings allow the production domain?
- [ ] **Analytics:** Are Google Analytics / PostHog IDs set for production?

## Deployment Steps
1.  **Build:**
    - Frontend: `npm run build` -> `./dist`
    - Backend: `dotnet publish -c Release` -> `./publish`
2.  **Database Migration:**
    - Run the migration script on the production database.
3.  **Release:**
    - Update the backend service (Zero-downtime deployment preferred).
    - Upload frontend static files to CDN/Host.
4.  **Smoke Test:**
    - Check the `/health` endpoint.
    - Open the home page, confirm the PWA manifest is loaded.
    - Start a game and see the WebSocket connection established (`101 Switching Protocols`).
