# AGENTS.md

## Versionierung (SemVer + Conventional Commits)

Dieses Repo versioniert strikt nach [Semantic Versioning 2.0.0](https://semver.org).
**Wer Commits schreibt (Agent oder Mensch), entscheidet die Versionseinstufung
aus der Änderung — nach der folgenden Richtlinie.**

### Commits

Commit-Messages sind [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <kurze Beschreibung>
```

Relevante Types fürs Release-Bumping:

| Type                                              | Bump                                | Beispiele                         |
| ------------------------------------------------- | ----------------------------------- | --------------------------------- |
| `feat`                                            | **MINOR** (+0.x)                    | neue Sektion, neue Admin-Funktion |
| `fix`, `perf`                                     | **PATCH** (+0.x.y)                  | Bugfix, Security-Fix, Performance |
| `refactor`, `revert`                              | **PATCH** (kein Verhaltenswechsel!) | interne Umstrukturierung          |
| `docs`, `style`, `ci`, `chore`, `test`, `build`   | **kein Bump**                       | kein neues Release nötig          |
| jeder Type mit `!` oder Footer `BREAKING CHANGE:` | **MAJOR** (siehe 0.x-Regel unten)   | Bruch                             |

Beispiele: `fix: Rate-Limiter haerten`, `feat: RSVP-Anmeldungen bearbeiten`,
`feat(content)!: remove legacy story fields` + `BREAKING CHANGE: …`

### Einstufung (wann was?)

- **MAJOR** (ab 1.0.0): kompatible API-/DB-/Config-Änderungen:
  Route-Antworten/Request-Shapes brechen, Pflicht-Env ohne Default,
  DB-Migration die Deployments erfordert, entfernte Features.
  → _Solange die Major-Version `0` ist: Breaking-Änderungen erhöhen MINOR
  (SemVer-0.x-Sonderregel: „Anything MAY change"), das `!`/`BREAKING CHANGE:`
  markiert sie trotzdem als solche._
- **MINOR**: rückwärtskompatible Funktionserweiterungen.
- **PATCH**: Fehlerbehebungen, Sicherheits-Fixes, Refactors ohne
  sichtbare Verhaltensänderung, Doku/CI.

### Release-Ablauf (Agent-Aufgabe)

Nach einer Änderungseinheit, die ein Release rechtfertigt (Feature oder Fix
abgeschlossen, CI grün):

1. Stand bestimmen: `git describe --tags --abbrev=0` (letztes `v*`-Tag).
   Ohne vorhandenes Tag mit `v1.0.0` als Startpunkt beginnen.
2. Version nach der Tabelle oben schätzen.
3. Taggen und pushen:

```bash
git tag -a v1.1.0 -m "v1.1.0: <1-2 Sätze, was neu ist>"
git push origin v1.1.0
```

4. Taggen bewusst **bündeln** (z. B. pro abgeschlossenes Thema), nicht jeden
   einzelnen Fix — das letzte Tag ist die „zuletzt stabil"-Marke.

### Was das Tag in der CI auslöst

`v*`-Tags triggern `.github/workflows/publish.yml`; die Registry erhält dann
zusätzlich `:X.Y.Z` und `:X.Y` zu `latest` / `sha-<kurz>`. Watchtower zieht
`latest` bei Bedarf; `sha-<kurz>` zeigt den exakten Stand in Portainer.

## Entwicklung & Befehle

Node.js **26** (so laufen CI und Dockerfile; das README nennt noch 22 – veraltet).
Alle Befehle unten sind verifiziert:

```bash
npm ci               # Install
cp .env.example .env # Dev-Passwörter eintragen
npm run dev          # Dev-Server, http://localhost:3000
npm run lint         # ESLint
npm run format       # Prettier schreiben
npm run format:check # Prettier prüfen (CI-Check)
npm test             # Vitest (jsdom), tests/ außer tests/e2e
npm run build        # Produktions-Build
npm run test:e2e     # Playwright, braucht laufenen Server unter BASE_URL (Default http://localhost:3000)
```

CI (`.github/workflows/ci.yml`) führt bei jedem Push/PR `lint` → `format:check`
→ `test` → `build` aus, `docker.yml` zusätzlich das Image – vor dem Push müssen
alle grün sein.

### Stil & Gotchas

- `.prettierrc`: doppelte Anführungszeichen, `printWidth: 100`, `tabWidth: 2`.
  Ungeformter Code bricht `format:check` in CI → `npm run format` vor dem Commit.
- Bereits hochgeladene Bilder werden bewusst per `<img>` ausgeliefert, nicht
  `next/image` (das lädt serverseitig ohne Cookies und würde die Auth umgehen).
  Die ESLint-Regel `@next/next/no-img-element` ist deshalb deaktiviert – nicht
  „reparieren".
- Fonts sind self-hosted (`fonts/*.woff2` via `next/font/local` in
  `app/layout.tsx`); nie `next/font/google` verwenden, sonst bricht der
  Offline-Build in CI/Docker.
- `DATA_DIR` (Env, Default `./data`, siehe `lib/paths.ts`) bestimmt, wo
  SQLite-DB (`wedding.db`) und Uploads liegen. Er steht nicht in `.env.example`;
  `tests/setup.ts` setzt ihn auf ein Temp-Verzeichnis, Tests schreiben nie ins
  echte `./data`.
