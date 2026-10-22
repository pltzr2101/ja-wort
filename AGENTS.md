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
