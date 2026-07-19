app: Apropos — PWA voice recorder for a film production propmaster
stack: Vite + React 19 + TypeScript, Bun package manager, vite-plugin-pwa
routing: react-router-dom v7, HashRouter (works under GitHub Pages subpath)
structure: flat, KISS/DRY, no ports/adapters (deliberate — simple app)
one-component-per-file: enforced; Icon.tsx is the exception (single icon component, multiple svg path defs)

src/db.ts: IndexedDB helpers (getAllRecordings, addRecording, removeRecording, getRecordingBlob); one store 'recordings' keyed by id; blob stored alongside metadata
src/recording.ts: Recording type + pure helpers (createId, formatDate, formatDuration, sortByNewest, defaultName)
src/hooks/useRecordings.ts: single source of recordings state; shared via router Outlet context (RecordingsContext exported from App.tsx)
src/hooks/useRecorder.ts: MediaRecorder state machine; returns {blob, mimeType, durationMs}
src/components/: Icon, RecordButton, RecordingList, RecordingItem
src/routes/HomePage.tsx: record + list only; new recordings dated Date.now()
src/routes/SettingsPage.tsx: propmaster setup facade — upload audio file + manual recording date to prep a film scene

data-flow: useRecordings (App Layout) -> Outlet context -> pages call add/remove -> db.ts -> IndexedDB
layout: header title left + settings button top-right; record button docked at bottom of main page (thumb reach); settings page top-right becomes back arrow
pwa: registerType autoUpdate; SW registered in main.tsx via registerSW({immediate:true}); no update toast/prompt (silent background update)
deploy: .github/workflows/deploy.yml -> GitHub Pages; build with GITHUB_PAGES=true sets vite base '/apropo/'
