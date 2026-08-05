# ChinaBridge — Self-Hosting Guide (Cloudflare + DigitalOcean)

Deploy ChinaBridge on your own domain with username/password login,
your own MySQL database, and free automatic HTTPS.

**What you need:**
- A domain from **Cloudflare** (~$10/year)
- A **DigitalOcean** Droplet, Ubuntu 24.04, 2 GB RAM (~$6/month)
- This project (download the full package from Kimi)

---

## 1. Create the server (DigitalOcean)

1. DigitalOcean → **Create → Droplets**
2. Choose: **Ubuntu 24.04 LTS**, **Basic**, **2 GB RAM / 1 vCPU**, region closest to your users
3. Add your SSH key (recommended) or use a root password
4. Create it, and note the **public IP address** (e.g. `203.0.113.10`)

## 2. Point your domain at the server (Cloudflare)

1. Cloudflare dashboard → your domain → **DNS → Records**
2. Add two **A records**:
   - Name `@` → your droplet IP
   - Name `www` → your droplet IP
3. Proxy status: **DNS only** (grey cloud) is simplest for the first setup —
   Caddy will get its own certificate. You can enable the orange cloud later.

## 3. Install Docker on the server

```bash
ssh root@YOUR_SERVER_IP

# Official one-liner for Ubuntu:
curl -fsSL https://get.docker.com | sh
```

## 4. Upload the project

From your computer (in the folder containing the project):

```bash
# Zip and copy the project to the server
scp -r ./app root@YOUR_SERVER_IP:/root/chinabridge
```

Or clone from GitHub if you pushed it there.

## 5. Configure

```bash
cd /root/chinabridge

# Create your environment file
cp deploy/.env.example .env
nano .env
```

Set:
- `APP_SECRET` — generate one: `openssl rand -hex 32`
- `MYSQL_PASSWORD` and `MYSQL_ROOT_PASSWORD` — your own strong passwords
- `OWNER_UNION_ID=local:admin` — keep this, then register the account
  named **admin** on the site and it will be the administrator

Edit the domain in the web-server config:

```bash
nano deploy/Caddyfile
# Replace both "yourdomain.com" lines with your real domain
```

## 6. Launch

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

First build takes 3–6 minutes. MySQL creates the database tables
automatically from `deploy/schema.sql` on first start.

Check that everything is running:

```bash
docker compose -f deploy/docker-compose.yml ps
docker compose -f deploy/docker-compose.yml logs -f app   # Ctrl+C to stop watching
```

## 7. Done — open your site

`https://yourdomain.com` — Caddy has already issued a free HTTPS
certificate. Register the account **admin** (or whatever you set in
`OWNER_UNION_ID`) — that account becomes the admin.

### Optional: seed sample events

```bash
docker compose -f deploy/docker-compose.yml exec app npx tsx db/seed.ts
```

---

## Useful commands

| Task | Command |
|---|---|
| Restart | `docker compose -f deploy/docker-compose.yml restart` |
| Update after code changes | `docker compose -f deploy/docker-compose.yml up -d --build` |
| Backup database | `docker compose -f deploy/docker-compose.yml exec mysql mysqldump -u root -p chinabridge > backup.sql` |
| View logs | `docker compose -f deploy/docker-compose.yml logs -f` |

## Notes

- **Login** is username + password (Kimi login only works on kimi.com).
  Users register at `/login` with a display name, username and password.
- **HTTPS** renews automatically via Caddy — nothing to maintain.
- **Data** lives in the `dbdata` Docker volume; `docker compose down`
  does not delete it (only `down -v` would).
- If Cloudflare's orange-cloud proxy is enabled, set SSL/TLS mode to
  **Full (strict)** in Cloudflare → SSL/TLS → Overview.
