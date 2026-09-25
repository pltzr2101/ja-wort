# JaWort – Hochzeits-Website

Eine passwortgeschuetzte, modulare Hochzeits-Website als **einzelner Docker-Container**.
Entwickelt fuer einfaches Deployment auf einem Proxmox-LXC ueber Portainer.

- Oeffentliche Seite mit Galerie, Countdown, Ablauf, Karte und RSVP-Formular
- **Gaeste-Gate**: gemeinsames Passwort fuer Freunde & Familie
- **Admin-Bereich**: Bilder hochladen, Texte/Theme anpassen (Baukasten), Anmeldungen einsehen & als CSV exportieren
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

### 1. Image bauen & starten (docker compose)

```bash
GUEST_PASSWORD=mein-passwort ADMIN_PASSWORD=mein-admin-passwort docker compose up -d --build
```

Oder zuerst eine `.env`-Datei anlegen (siehe `.env.example`) und dann:

```bash
docker compose up -d --build
```

### 2. Portainer (Stack)

In Portainer unter **Stacks → Add stack** den Inhalt von `docker-compose.yml`
einfuegen und die beiden Umgebungsvariablen setzen:

| Variable         | Pflicht | Beschreibung                                       |
| ---------------- | ------- | -------------------------------------------------- |
| `GUEST_PASSWORD` | Ja      | Gemeinsames Passwort fuer Gaeste                   |
| `ADMIN_PASSWORD` | Ja      | Passwort fuer den Admin-Bereich                    |
| `SESSION_SECRET` | Nein    | Signierschluessel (wird sonst automatisch erzeugt) |

Das Volume `./data` enthaelt Datenbank, Bilder und ggf. den generierten
Signierschluessel – beim Container-Update bleiben alle Daten erhalten.

### 3. Cloudflare (optional, empfohlen)

1. Domain in Cloudflare anlegen, `A`-Record auf die oeffentliche IP des LXC zeigen lassen.
2. Proxy (orange Wolke) aktivieren – damit laeuft die Seite ueber HTTPS.
3. Optional: **Cloudflare Access** als zusaetzliche Schutzschicht vor dem Admin-Bereich.

---

## Bedienung

| URL      | Zweck                            |
| -------- | -------------------------------- |
| `/`      | Oeffentliche Seite (Gaeste-Gate) |
| `/gate`  | Anmeldung fuer Gaeste            |
| `/admin` | Admin-Bereich (eigenes Passwort) |

Im Admin-Bereich:

- **Anmeldungen** – Liste aller RSVPs + `CSV exportieren` (importierbar in Google Sheets/Excel)
- **Inhalte** – Theme, Texte, Ablauf, Karten-URL, FAQ, Sektionen an/aus
- **Galerie** – Bilder hochladen (JPG/PNG/WebP, max. 5 MB) und loeschen

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
lib/                  Datenbank, Auth, Session, Upload, Validierung, Themes
tests/                Vitest + Playwright Tests
data/                 Laufzeitdaten (SQLite + Uploads, nicht in Git)
```

---

## Continuous Integration (GitHub Actions)

- **`.github/workflows/ci.yml`** – Lint, Format, Tests und Build bei jedem Push/PR.
- **`.github/workflows/docker.yml`** – baut das Docker-Image und prueft so das Dockerfile.

Der Status ist im GitHub-Repository unter dem Reiter **Actions** einsehbar.
