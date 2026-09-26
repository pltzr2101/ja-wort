# JaWort – Hochzeits-Website

Eine passwortgeschuetzte, modulare Hochzeits-Website als **einzelner Docker-Container**.
Entwickelt fuer einfaches Deployment auf einem Proxmox-LXC ueber Portainer.

- Oeffentliche Seite mit Galerie, Countdown, Ablauf, Karte und RSVP-Formular
- **Gaeste-Gate**: gemeinsames Passwort fuer Freunde & Familie (per Konfiguration abschaltbar)
- **Admin-Bereich**: Bilder hochladen, Texte/Theme anpassen (Baukasten), Anmeldungen einsehen, bearbeiten & als CSV exportieren
- Keine externen Dienste, keine API-Keys – Daten liegen in einer eingebetteten SQLite-Datei

---

## Tech-Stack

| Bereich   | Technologie                                      |
| --------- | ------------------------------------------------ |
| Frontend  | Next.js 15 (App Router) + Tailwind CSS v4        |
| Backend   | Next.js Route Handlers (API)                     |
| Datenbank | SQLite (better-sqlite3, eingebettet)             |
| Auth      | Signierte httpOnly-Cookies, scrypt-Passwort-Hash |
| Karte     | OpenStreetMap / Google Maps iframe-Embed         |
| Tests     | Vitest (+ React Testing Library), Playwright     |

---

## Schnellstart (lokal)

Voraussetzung: **Node.js 22**.

```bash
npm install
cp .env.example .env        # Passwoerter eintragen
npm run dev                 # http://localhost:3000
```

---

## Deployment (Docker / Portainer)

Die App wird als vorgefertigtes Image aus der GitHub Container Registry (GHCR)
bezogen und per Portainer deployt. Es ist kein lokaler Build noetig.

1. **Voraussetzung:** Das Image liegt in GHCR: `ghcr.io/pltzr2101/ja-wort:latest`.

2. **GHCR-Sichtbarkeit (Pflichtschritt, nicht automatisierbar):** Nach dem ersten
   `publish.yml`-Lauf ist das Package **privat**. Entweder in GitHub unter
   _Profil → Packages → ja-wort → Package settings → Change visibility → Public_
   freigeben, **oder** in Portainer unter _Registries → Add registry → Custom_
   `ghcr.io` mit GitHub-Benutzername und PAT (Scope `read:packages`) hinterlegen.
   Ohne einen dieser Schritte liefert der Pull `unauthorized`.

3. **Portainer-Stack in 4 Schritten:**
   - _Stacks → Add stack → Name:_ `ja-wort`
   - _Build method:_ **Web editor**, YAML aus `docker-compose.yml` einfügen
   - _Environment variables:_ `GUEST_PASSWORD` (Pflicht, wenn das Gaeste-Gate aktiv
     ist), `GUEST_GATE_ENABLED` (optional, Default `true`; `false` macht Website,
     Bilder und RSVP-Formular oeffentlich – der Admin-Bereich bleibt geschuetzt),
     `ADMIN_PASSWORD` (Pflicht), `SESSION_SECRET` (optional, leer = wird automatisch
     erzeugt und in `./data` persistiert), `APP_PORT` (optional, Default `8095`)
   - _Deploy the stack_

4. **Port-Konflikt-Warnung:** Auf einem LXC, auf dem bereits Open WebUI läuft, ist
   Port **3000 belegt**. Der Host-Port wird über `APP_PORT` gesteuert (Default `8095`).

5. **HTTPS für den Login empfohlen:** Die Session-Cookies werden anhand des
   `X-Forwarded-Proto`-Headers (den Cloudflare setzt) mit dem `Secure`-Flag
   versehen. Hinter Cloudflare (orange Wolke, HTTPS) ist damit alles korrekt
   verschlüsselt. Bei direktem HTTP-Zugriff auf den LXC wird das `Secure`-Flag
   weggelassen, damit der Login auch dort funktioniert – dann werden die
   Passwörter allerdings **unverschlüsselt** übertragen.

   > ⚠️ **Empfehlung:** Verifiziere über die Cloudflare-Domain (HTTPS, orange
   > Wolke aktiv) oder einen HTTPS-Tunnel. Nur so sind Gäste- und
   > Admin-Passwort geschützt.

   Cloudflare-Einrichtung (einmalig): Domain anlegen, `A`-Record auf die
   öffentliche IP des LXC zeigen lassen, Proxy (orange Wolke) aktivieren.
   Optional: **Cloudflare Access** als zusätzliche Schutzschicht vor `/admin`.

6. **Persistenz:** Das **Named Volume `ja-wort-data`** enthält SQLite-Datenbank,
   Uploads und ggf. den generierten `SESSION_SECRET`. Daten bleiben bei
   Container-Updates erhalten. Alternativ als Bind-Mount:
   `- /srv/ja-wort/data:/app/data` mit vorherigem
   `mkdir -p /srv/ja-wort/data && chown 1001:1001 /srv/ja-wort/data`.

7. **Watchtower:** Auto-Update funktioniert nur, wenn das Label gesetzt ist
   **und** der laufende Watchtower mit `WATCHTOWER_LABEL_ENABLE=true` startet
   (`WATCHTOWER_POLL_INTERVAL=86400`, `WATCHTOWER_CLEANUP=true`, Socket-Mount
   `/var/run/docker.sock`). Watchtower ist nur ein **Filter**, kein
   Update-Auslöser — es aktualisiert **nur** den Tag `:latest`, nicht gepinnte
   Versionen.

8. **Backup vor Updates:**

   ```bash
   docker run --rm -v ja-wort-data:/d -v "$PWD":/b alpine tar czf /b/jawort-backup.tgz -C /d .
   ```

   Grund: Es gibt Datenbank-Migrationen – ein Backup stellt den Stand vor dem
   Update wieder her.

9. **Kein Doppelmanagement:** Entweder Watchtower **oder** Portainer-Redeploy für
   Updates nutzen; beides gemischt kann Container und Stack-Zustand
   auseinanderlaufen lassen.

10. **Lokale Entwicklung** bleibt unverändert über
    `npm install && cp .env.example .env && npm run dev`.

11. **Lokaler Docker-Build (optional):** Mit der Override-Datei kann lokal
    weiterhin gebaut werden, ohne den Registry-Flow zu stören:
    `docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build`.

---

## Bedienung

| URL      | Zweck                            |
| -------- | -------------------------------- |
| `/`      | Oeffentliche Seite (Gaeste-Gate) |
| `/gate`  | Anmeldung fuer Gaeste            |
| `/admin` | Admin-Bereich (eigenes Passwort) |

Im Admin-Bereich:

- **Anmeldungen** – Liste aller RSVPs + `CSV exportieren` (importierbar in Google Sheets/Excel); einzelne Anmeldungen per Stift-Button (✎) in einem Formular bearbeiten oder per rotem ✕ (mit Bestaetigung) loeschen
- **Inhalte** – Theme, Texte, Ablauf, Karten-URL, FAQ sowie Sektionen an/aus, per Pfeiltasten umsortieren und beliebig viele zusaetzliche „Bild“-Sektionen einfuegen; jede Bild-Sektion hat eigene Steuerung fuer Bildauswahl, Bildunterschrift, Bildfokus (object-position) und Darstellung (Zuschneiden/Komplett einpassen) – der Bildfokus (object-position) fuer das Titelbild sitzt im Feld „Bildfokus (Titelbild)“
- **Galerie** – Bilder hochladen (JPG/PNG/WebP, max. 5 MB), loeschen und per Drag & Drop umsortieren (das erste Bild ist das Titelbild)

---

## Entwicklung

```bash
npm run lint          # ESLint
npm run format        # Prettier (formatieren)
npm run format:check  # Prettier (pruefen)
npm test              # Vitest (Unit + Component)
npm run build         # Produktions-Build
npm run test:e2e      # Playwright (benoetigt laufenden Server)
```

### Projektstruktur

```
app/                  Next.js App Router (Seiten + API-Routen)
  (site)/             oeffentliche Seite (Gaete-Gate via Layout)
  gate/               Gaeste-Anmeldung
  admin/              Admin-Bereich
    (protected)/      geschuetzte Seiten (Dashboard, Inhalte, Galerie) – Guard via Layout
    login/            Admin-Anmeldung (bewusst ausserhalb des Guards, kein Redirect-Loop)
  api/                Route Handler (auth, rsvp, content, uploads)
components/           Sektionen + Formulare
content/default.ts    Standard-Inhalte + Sektionen (Baukasten-Quelle)
fonts/                Self-hosted Schriftdateien (woff2, per next/font/local eingebunden)
lib/                  Datenbank, Auth, Session, Upload, Validierung, Themes
tests/                Vitest + Playwright Tests
data/                 Laufzeitdaten (SQLite + Uploads, nicht in Git)
```

Die Schriften sind bewusst **self-hosted** (`app/layout.tsx` nutzt `next/font/local`
und liest die woff2-Dateien aus `fonts/`). So laeuft der Produktions-Build komplett
offline und deterministisch – `next/font/google` wuerde die Fonts erst beim Build
von fonts.googleapis.com laden und in isolierten CI-/Docker-Builds fehlschlagen.
Neue Schrift-Schnitte werden als woff2 unter `fonts/` abgelegt und in
`app/layout.tsx` referenziert.

---

## Continuous Integration (GitHub Actions)

- **`.github/workflows/ci.yml`** – Lint, Format, Tests und Build bei jedem Push/PR.
- **`.github/workflows/docker.yml`** – Dockerfile-Build-Check auf PR.
- **`.github/workflows/publish.yml`** – Image-Push nach GHCR auf `main` + Tags.

Der Status ist im GitHub-Repository unter dem Reiter **Actions** einsehbar.
