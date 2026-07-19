pwa-base-path: GitHub Pages serves at /apropo/; vite base set via GITHUB_PAGES env only (local stays /); do not hardcode base
pwa-virtual-types: virtual:pwa-register needs 'vite-plugin-pwa/client' ref in vite-env.d.ts (not /react)
mediarecorder-https: recording requires HTTPS or localhost; getUserMedia fails otherwise
object-urls: RecordingItem creates object URL from blob on play; revoke on unmount to avoid leaks
indexeddb-getall-strips-blob: getAllRecordings returns metadata only (blob deleted from copy); fetch blob separately via getRecordingBlob for playback
router-context: pages read recordings via useOutletContext<RecordingsContext>; single useRecordings instance lives in App Layout — do not call useRecordings per-page (would desync)
lint-unused-vars: eslint errors on unused destructured vars (e.g. _blob rest pattern); strip via delete on a copy instead
theme-red: accent is recording-red; --accent (#c62828 idle) vs --accent-strong (#e5322d recording pulse) kept distinct so active state reads
no-tests: user opted out of tests for this app; TDD spine intentionally skipped
git: never commit/push; user does manually
player-analyser-optional: createMediaElementSource can throw (Safari/webkit, or double-attach); wrap in try/catch and never block audio.play() on analyser — waveform is optional
player-play-errors: PlayerPage calls void player.toggle() (fire-and-forget); toggle must catch its own play() rejection and surface via state.error, else play button silently does nothing
player-strictmode-revoke: StrictMode double-invokes useAudioPlayer effect; async load() + shared urlRef/audioRef let cleanup revoke the object URL that the surviving Audio element still uses -> MEDIA_ERR_SRC_NOT_SUPPORTED ('no supported sources'). Fix: scope url/audio to local vars per effect run; revoke/null only if refs still equal the local instance
recorder-timeslice: MediaRecorder.start() with NO timeslice can deliver only the header chunk on Brave/Chromium -> ~110-byte unplayable blob -> 'no supported sources' on playback (the format string is fine; the blob is empty). Fix: start(1000) so dataavailable fires periodically; also reject blob.size===0 in stop()
diagnose-blob-size: 'no supported sources' with a correct MIME type => check stored blob.size FIRST; tiny size = recorder bug, not a decode/format bug
mp3-download: MediaRecorder only produces webm/opus; browsers have no MP3 encoder. Downloads re-encode on-device via src/mp3.ts (@breezystack/lamejs): decodeAudioData -> Int16 PCM -> Mp3Encoder (128kbps, blocks of 1152). NEVER just rename webm->mp3 (broken file). Stored blob stays webm; conversion happens only in saveRecording (download.ts). downloadFileName forced mimeType 'audio/mpeg' and strips any known audio extension from name to avoid memo.webm.mp3.
