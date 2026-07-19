what: PWA voice recorder for a film production propmaster to record and organize prop/scene audio
main-page-purpose: recording + listing recordings only; new recordings auto-dated today
settings-purpose: facade to a setup page where propmaster uploads existing audio files and sets recording dates manually to prepare a specific film scene
name: Apropos (capital A)

decisions:
- storage: IndexedDB (audio blobs unsuitable for localStorage; offline persistence)
- routing: react-router-dom added despite simple app (user chose over state toggle)
- no ports/adapters: user requested KISS/DRY for this simple app
- no tests: user opted out
- theme: recording-red accent (record-button metaphor); follows system light/dark
- icons: all original hand-written SVG (Icon.tsx + favicon.svg); no licensed/third-party assets (legal constraint)
- pwa updates: silent background auto-update, no user prompt/toast (removed PWABadge)
- deploy: GitHub Pages via Actions; repo is nico-i/apropo -> served at /apropo/
- layout: record button bottom-of-screen (thumb reach); settings button top-right

manual-setup-step: GitHub repo Settings -> Pages -> Source = "GitHub Actions" (required once before first deploy)
open-questions: none
