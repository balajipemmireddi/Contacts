# 🍅 Tomato Food Delivery App — Deployment Runbook

> **Purpose:** This document is a complete, battle-tested deployment guide.
> It is written so that both a **human** and an **AI assistant** can execute a full deployment from scratch with zero guesswork.
> Every error encountered during real deployment is documented here with its root cause and fix.

---

## 📐 Architecture Overview

```
[User Browser]
     │
     ├──► https://sitelive.in/food-del          ← React Frontend (Hostinger Shared Hosting)
     │         Apache + .htaccess (SPA routing)
     │
     └──► https://api.sitelive.in/api/...       ← Spring Boot Backend API
               │
               ▼
         [VPS: 52.140.52.144]  (user: gameon)
               │
         Docker Compose:
               ├── caddy      (ports 80 + 443, auto HTTPS via Let's Encrypt)
               │     └── reverse proxy ──► backend:8080
               ├── backend    (Spring Boot, port 8080 internal only)
               └── db         (PostgreSQL 15, port 5432 internal only)
```

---

## 🗂️ Project Structure

```
Food_Del/
├── .github/workflows/deploy.yml        # CI/CD: GitHub Actions
├── docker-compose.yml                  # Orchestrates backend + db + caddy on VPS
├── .env                                # Local dev overrides (NOT committed to git)
├── Backend/
│   └── Backend-Template/
│       ├── Dockerfile                  # Multi-stage Docker build for Spring Boot
│       ├── pom.xml                     # Maven build config (Java 17, Spring Boot 4)
│       └── src/main/resources/
│           └── application.properties  # Config driven by env vars (falls back to H2 locally)
└── Frontend/
    └── Frontend-Template/
        ├── .env.production             # Bakes API URL into production build
        ├── vite.config.js              # Sets base path + local dev proxy
        └── dist/                       # Built output — upload this to Hostinger
```

---

## ⚙️ Key Configuration Files (Exact Contents)

### 1. `docker-compose.yml` (VPS Root)
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./Backend/Backend-Template
      dockerfile: Dockerfile
    image: tomato-backend:latest
    container_name: tomato-backend
    environment:
      - DB_URL=jdbc:postgresql://db:5432/tomatodb
      - DB_DRIVER=org.postgresql.Driver
      - DB_USERNAME=tomato_user
      - DB_PASSWORD=tomato_password
      - DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect
      - FRONTEND_URL=https://sitelive.in        # ⚠️ MUST be https:// — CORS will break if http://
    depends_on:
      - db
    restart: always

  caddy:
    image: docker.io/library/caddy:latest
    container_name: tomato-caddy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    command: caddy reverse-proxy --from api.sitelive.in --to backend:8080
    volumes:
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - backend

  db:
    image: docker.io/library/postgres:15-alpine
    container_name: tomato-db
    environment:
      POSTGRES_DB: tomatodb
      POSTGRES_USER: tomato_user
      POSTGRES_PASSWORD: tomato_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

volumes:
  postgres_data:
  caddy_data:
  caddy_config:
```

### 2. `Backend/Backend-Template/Dockerfile`
```dockerfile
FROM docker.io/library/eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw    # Fix Windows CRLF line endings
RUN ./mvnw dependency:resolve
COPY src ./src
RUN ./mvnw package -DskipTests

FROM docker.io/library/eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 3. `Backend/Backend-Template/src/main/resources/application.properties`
```properties
spring.config.import=optional:file:.env[.properties]
spring.application.name=Tomato

spring.security.user.name=${SECURITY_USER:admin}
spring.security.user.password=${SECURITY_PASSWORD:admin}

# DB: defaults to H2 in-memory for local dev; overridden by env vars in Docker
spring.datasource.url=${DB_URL:jdbc:h2:mem:tomato_db}
spring.datasource.driverClassName=${DB_DRIVER:org.h2.Driver}
spring.datasource.username=${DB_USERNAME:sa}
spring.datasource.password=${DB_PASSWORD:}

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

server.port=8080
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=${DB_DIALECT:org.hibernate.dialect.H2Dialect}

jwt.secret=${JWT_SECRET:8w92k3n4b1l8j4g5g7k8n3h4j1k9s3b2n8g5j4k9t8n3h7f2k1s9g5n3h4j8k9}
jwt.expiration=${JWT_EXPIRATION:86400000}
frontend.url=${FRONTEND_URL:http://localhost:5173}
spring.mvc.throw-exception-if-no-handler-found=true
spring.web.resources.add-mappings=false
```

### 4. `Frontend/Frontend-Template/.env.production`
```env
VITE_API_URL=https://api.sitelive.in/api
```

### 5. `Frontend/Frontend-Template/vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/food-del/',           // Subfolder deploy on Hostinger
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',    // LOCAL DEV ONLY — not used in production
        changeOrigin: true
      }
    }
  }
})
```

### 6. `.github/workflows/deploy.yml`
```yaml
name: Deploy Application

on:
  push:
    branches:
      - main
  workflow_dispatch:            # Allow manual trigger from GitHub UI

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Copy files via scp
        uses: appleboy/scp-action@v0.1.4
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USERNAME }}
          password: ${{ secrets.SERVER_PASSWORD }}
          source: "."
          target: "/home/gameon/Food_Del"

      - name: Deploy with Docker Compose
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USERNAME }}
          password: ${{ secrets.SERVER_PASSWORD }}
          script: |
            cd /home/gameon/Food_Del
            echo ${{ secrets.SERVER_PASSWORD }} | sudo -S docker system prune -f
            echo ${{ secrets.SERVER_PASSWORD }} | sudo -S docker-compose up -d --build --remove-orphans
```

### 7. `public_html/food-del/.htaccess` (on Hostinger)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /food-del/

  # React Router SPA fallback — sends all unknown routes to index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /food-del/index.html [L]
</IfModule>
```

> ⚠️ **DO NOT add an API proxy rule** (`[P]` flag). Hostinger shared hosting does not support `mod_proxy`. The frontend calls `api.sitelive.in` directly — no proxy needed.

---

## 🔑 Credentials & Secrets

### GitHub Actions Secrets (Settings → Secrets → Actions)
| Secret Name | Value |
|---|---|
| `SERVER_IP` | `52.140.52.144` |
| `SERVER_USERNAME` | `gameon` |
| `SERVER_PASSWORD` | `Gameon@123$#$` |

### VPS SSH Access
```
Host: 52.140.52.144
User: gameon
Pass: Gameon@123$#$
Deploy path: /home/gameon/Food_Del
```

### Admin App Login (auto-seeded by DataSeeder.java on startup)
```
Email:    admin@tomato.com
Password: admin
```

### DNS Records on Hostinger/Domain provider
| Subdomain | Type | Points To |
|---|---|---|
| `api.sitelive.in` | A | `52.140.52.144` |
| `sitelive.in` | A | `145.79.28.98` (Hostinger shared) |

---

## 🔥 VPS Firewall / Cloud Security Group Setup

> This is one of the most commonly missed steps. Even if Docker containers are running and listening on ports 80/443, the **cloud provider's external firewall (e.g. Azure NSG)** may still be blocking those ports. You must open them at the cloud level too.

### For Azure VPS (52.140.52.144)
1. Go to **Azure Portal → Virtual Machines → `<your-vm>` → Networking**
2. Under **Inbound port rules**, add:

| Priority | Name | Port | Protocol | Action |
|---|---|---|---|---|
| 310 | Allow-HTTP | 80 | TCP | Allow |
| 320 | Allow-HTTPS | 443 | TCP | Allow |

3. Save. Changes take effect within ~30 seconds.

> ⚠️ **Do not confuse this with your home router port forwarding.** The backend runs on the Azure VPS — that's where the firewall rules must be set. Your home router is irrelevant for VPS deployments.

### How to verify ports are actually open (from outside)
```bash
# From any external machine (PowerShell on Windows)
Test-NetConnection -ComputerName 52.140.52.144 -Port 80
Test-NetConnection -ComputerName 52.140.52.144 -Port 443
# TcpTestSucceeded : True = port is open and a service is listening
# TcpTestSucceeded : False = either firewall is blocking OR no service is listening
```

Or use online tools:
- https://www.yougetsignal.com/tools/open-ports/
- https://portchecker.co/

### Why ports still show as "Closed" after router rules
Two separate layers control port access:
1. **Cloud/VPS firewall (Azure NSG)** — external network-level firewall
2. **The service itself** — a container/process must actually be LISTENING on that port

Both must be satisfied. If Docker containers are stopped, ports appear closed even if firewall allows them. If firewall blocks them, ports appear closed even if Docker is running.

---

## 🌐 Public IP — IPv4 vs IPv6 Gotcha

When checking your public IP, you may get an **IPv6 address** instead of IPv4. Port checking tools often don't support IPv6, giving false "closed" results.

```powershell
# Get IPv4 specifically
curl.exe -4 ifconfig.me
# Returns e.g.: 49.43.228.139  ← this is your real IPv4

# Get IPv6 (may be returned by default)
curl.exe ifconfig.me
# Returns e.g.: 2405:201:c038:b03e:98b7:d651:4215:942d  ← IPv6, use with caution
```

Always use the **IPv4 address** when testing port access with online tools. Paste it manually into the port checker if the auto-detect picks up IPv6.

---

## 🚀 Full Deployment Procedure (Step by Step)

### BACKEND DEPLOYMENT (VPS via GitHub Actions)

**Step 1 — Ensure GitHub Secrets are set**
Go to: `GitHub repo → Settings → Secrets and Variables → Actions`
Add: `SERVER_IP`, `SERVER_USERNAME`, `SERVER_PASSWORD` (values above)

**Step 2 — Push to `main` branch**
```bash
git add .
git commit -m "your message"
git push origin main
```
GitHub Actions will automatically:
1. SCP all code to `/home/gameon/Food_Del` on VPS
2. SSH in and run `docker-compose up -d --build --remove-orphans`

**Step 3 — Verify backend is live**
```bash
curl https://api.sitelive.in/api/menu
# Should return JSON array of menu items
```

**Step 4 — Manual deploy if CI/CD fails (SSH directly)**
```bash
ssh gameon@52.140.52.144
# password: Gameon@123$#$

cd /home/gameon/Food_Del
sudo docker system prune -f
sudo docker-compose up -d --build --remove-orphans

# Check container status
sudo docker ps

# Check logs if something's wrong
sudo docker logs tomato-backend
sudo docker logs tomato-caddy
sudo docker logs tomato-db
```

---

### FRONTEND DEPLOYMENT (Hostinger Manual Upload)

**Step 1 — Build the frontend**
```bash
cd Frontend/Frontend-Template
npm run build
```
Output goes to: `Frontend/Frontend-Template/dist/`

**Step 2 — Verify the API URL is baked in correctly**
```bash
# Run this in the project root (PowerShell)
Select-String -Path "Frontend\Frontend-Template\dist\assets\*.js" -Pattern "api.sitelive.in"
# Must show: https://api.sitelive.in/api
```

**Step 3 — Upload to Hostinger**
- Log in to: https://hpanel.hostinger.com
- Go to: `Hosting → sitelive.in → Manage → File Manager`
- Navigate to: `public_html/food-del/`
- Upload ALL contents of `dist/` folder (not the folder itself): `index.html` + `assets/`
- Replace any existing files

**Step 4 — Verify or create `.htaccess`**
Create or verify `/public_html/food-del/.htaccess` contains ONLY the SPA fallback (see config above). Delete any proxy rules.

**Step 5 — Test the frontend**
Open: https://sitelive.in/food-del
- Should load the Tomato app
- Navigating to `/food-del/menu` should work (SPA routing test)

---

## 🐛 Errors Encountered & Solutions

### ERROR 1 — Ports 80/443 closed even though router allowed them
**Symptom:** External port checker shows port 80/443 as closed for public IP.
**Root Cause:** Docker containers were not running. Open ports alone aren't enough — a service must be LISTENING on that port.
**Fix:** Start Docker Desktop → run `docker-compose up -d`

---

### ERROR 2 — `mvnw` permission denied / bad interpreter in Docker build
**Symptom:** Docker build fails with `./mvnw: /bin/sh^M: bad interpreter`
**Root Cause:** `mvnw` file was saved with Windows CRLF line endings (`\r\n`). Linux cannot execute it.
**Fix:** Added this line to Dockerfile before `chmod`:
```dockerfile
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
```

---

### ERROR 3 — Docker image pull fails: `docker.io/library/...`
**Symptom:** `docker-compose up` fails to pull images.
**Root Cause:** The Docker daemon on the VPS was Podman-compatible and needed fully qualified image names.
**Fix:** Use full image names in docker-compose.yml:
```yaml
image: docker.io/library/caddy:latest
image: docker.io/library/postgres:15-alpine
image: docker.io/library/eclipse-temurin:17-jdk-alpine
```

---

### ERROR 4 — `docker-compose` permission denied on VPS
**Symptom:** GitHub Actions SSH step fails with permission denied on `docker-compose`.
**Root Cause:** `gameon` user does not have passwordless sudo.
**Fix:** Pipe the password into sudo:
```bash
echo ${{ secrets.SERVER_PASSWORD }} | sudo -S docker-compose up -d --build
```

---

### ERROR 5 — CORS error: frontend blocked by backend
**Symptom:** Browser console shows `Access-Control-Allow-Origin` error when API is called. All API requests fail with HTTP 403 or CORS blocked.
**Root Cause:** `FRONTEND_URL` in `docker-compose.yml` was set to `http://sitelive.in` but the frontend is served over HTTPS (`https://sitelive.in`). The Spring Security `SecurityConfig.java` reads this env var and sets it as the **only allowed CORS origin**:
```java
@Value("${frontend.url}")
private String frontendUrl;

configuration.setAllowedOrigins(List.of(frontendUrl));  // Exact match — scheme matters!
```
HTTP and HTTPS are treated as **different origins**. A browser making a request from `https://sitelive.in` to `api.sitelive.in` sends `Origin: https://sitelive.in`. If the backend's allowed origin is only `http://sitelive.in`, CORS fails silently.

**Fix:** Changed env var in `docker-compose.yml`:
```yaml
- FRONTEND_URL=https://sitelive.in    # Must match EXACT scheme/domain the browser sends in Origin header
```

**CORS Checklist for future deployments:**
- [ ] `FRONTEND_URL` uses `https://` (never `http://` in production)
- [ ] No trailing slash on the URL (`https://sitelive.in` ✅ not `https://sitelive.in/` ❌)
- [ ] After changing, redeploy Docker containers so the new env var takes effect
- [ ] Test in browser DevTools → Network tab → check response headers for `Access-Control-Allow-Origin`

---

### ERROR 6 — Frontend spinner forever / `t.map is not a function`
**Symptom:** Menu page shows spinner indefinitely. Console error: `t.map is not a function`.
**Root Cause:** The `.htaccess` had a `[P]` proxy rule routing `/api/` calls to the VPS. Hostinger shared hosting does NOT support `mod_proxy`, so the proxy silently failed and returned an HTML error page instead of JSON. The frontend's `.map()` call crashed on the HTML string.
**Fix:** Remove the `[P]` proxy rule entirely. The production frontend build already calls `api.sitelive.in` directly (baked in at build time from `.env.production`).

---

### ERROR 7 — Caddy phantom container conflict with `--remove-orphans`
**Symptom:** On re-deploy, Caddy throws an error about already existing containers.
**Root Cause:** Old docker-compose definitions left orphan containers.
**Fix:** Always use `--remove-orphans` flag:
```bash
docker-compose up -d --build --remove-orphans
```

---

### ERROR 8 — `api.sitelive.in` failed to get SSL cert from Let's Encrypt
**Symptom:** `https://api.sitelive.in` shows SSL error or Caddy logs show cert challenge failure.
**Root Cause:** DNS record for `api.sitelive.in` was not pointing to the VPS IP, or ports 80/443 were not open when Let's Encrypt tried to verify.
**Fix:**
1. Verify DNS: `api.sitelive.in` → A record → `52.140.52.144`
2. Ensure VPS firewall/security group allows inbound TCP 80 + 443
3. Restart Caddy: `sudo docker restart tomato-caddy`
Caddy automatically provisions/renews SSL — no manual cert steps needed.

---

### ERROR 9 — Old frontend build still on Hostinger (wrong API URL)
**Symptom:** Frontend loads but all API calls go to `sitelive.in/food-del/api/...` (404) instead of `api.sitelive.in/api/...`
**Root Cause:** The `dist/` folder uploaded to Hostinger was from an old build that used the Vite dev-proxy relative path `/api`.
**Fix:**
1. Ensure `.env.production` has `VITE_API_URL=https://api.sitelive.in/api`
2. Run `npm run build` fresh
3. Verify with: `Select-String -Path "dist\assets\*.js" -Pattern "api.sitelive.in"`
4. Re-upload the entire `dist/` contents to Hostinger

---

## ✅ Verification Checklist (Run After Every Deploy)

```bash
# 1. DNS resolves correctly
Resolve-DnsName api.sitelive.in    # Must return 52.140.52.144

# 2. Backend API responds
curl https://api.sitelive.in/api/menu
# Must return JSON array

# 3. Docker containers are all running
ssh gameon@52.140.52.144
sudo docker ps
# Must show: tomato-backend, tomato-caddy, tomato-db all "Up"

# 4. Frontend loads
# Open in browser: https://sitelive.in/food-del
# Must show Tomato app with menu items

# 5. SPA routing works
# Open in browser: https://sitelive.in/food-del/menu
# Must NOT show a 404 (htaccess is working)

# 6. Admin login works
# URL: https://sitelive.in/food-del/login
# Email: admin@tomato.com | Password: admin
```

---

## 🏗️ Technology Stack Reference

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + Vite | 18 / Vite 8 |
| Frontend Hosting | Hostinger Shared (Apache) | — |
| Backend | Spring Boot | 4.0.3 |
| Backend Runtime | Java | 17 (Eclipse Temurin Alpine) |
| Database | PostgreSQL | 15 Alpine |
| Reverse Proxy / SSL | Caddy | Latest |
| Container Runtime | Docker / Docker Compose | — |
| CI/CD | GitHub Actions | — |
| VPS | Azure / Ubuntu | — |

---

## 📝 Notes for AI Agents Executing This

1. **Always check DNS before assuming network issues.** Run `Resolve-DnsName api.sitelive.in` — if it returns the right IP (`52.140.52.144`), the problem is on the server side.
2. **Always verify the built JS contains the right API URL** before uploading to Hostinger. Use `Select-String` or `grep` on the dist assets.
3. **`FRONTEND_URL` in docker-compose MUST use `https://`** — this is the CORS allowed origin. HTTP vs HTTPS mismatch = silent CORS failure. No trailing slash.
4. **Hostinger shared hosting does NOT support `mod_proxy`**. Never add `[P]` flags in `.htaccess`.
5. **Caddy handles SSL automatically.** Do not install certbot or any other SSL tool. Just ensure ports 80/443 are open at the Azure NSG level and DNS is correct.
6. **The `DataSeeder.java` runs on startup** and creates `admin@tomato.com` / `admin` if it doesn't exist yet. No manual DB seeding.
7. **To manually trigger CI/CD** without a code change: GitHub repo → Actions → "Deploy Application" → "Run workflow".
8. **Docker prune before rebuild** to avoid stale layers consuming disk: `sudo docker system prune -f`.
9. **Ports closed = two possible causes**: (a) Azure NSG / cloud firewall not configured, OR (b) Docker containers not running. Check both separately.
10. **When checking public IP, force IPv4**: use `curl.exe -4 ifconfig.me`. Online port checkers typically don't support IPv6 — always test with IPv4.
11. **CORS is enforced in `SecurityConfig.java`** via `setAllowedOrigins(List.of(frontendUrl))`. Only one origin is allowed — it must be an exact string match including scheme. If the frontend domain ever changes, update `FRONTEND_URL` in `docker-compose.yml` and redeploy.
12. **The VPS and your home router are completely separate.** Opening ports on your home router does nothing for the VPS. Always configure the Azure NSG for the VPS.
