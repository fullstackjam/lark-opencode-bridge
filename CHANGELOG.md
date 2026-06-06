# Changelog

All notable changes to **@fullstackjam/lark-opencode-bridge** are documented here.
This project follows [Semantic Versioning](https://semver.org/).

This is a private fork of [YMaxwellHayes/lark-opencode-bridge](https://github.com/YMaxwellHayes/lark-opencode-bridge); upstream releases are listed below for traceability.

## [0.1.19] - 2026-06-07

### Changed
- **Setup wizard probes app config before walking the user through permission import.** Old behavior: every `lark-opencode-bridge run` first-time path opened a browser tab for permissions, copied the scopes JSON to the clipboard, then called `configure` (which always failed because scopes weren't imported yet) and opened a second browser tab for events. When the user reinstalls against an existing Feishu app that's already fully configured, all that noise was wasted. New: silently runs `configureBridgeApp` first; if all PATCHes succeed (scopes granted + app published), prints `✓ 应用权限、事件、回调已就绪，跳过权限导入步骤` and skips the guide entirely. Only walks through permission import on a fresh app where the configure PATCH actually fails.

### Fixed
- Stale `npm run bridge -- configure` hint in the configure-failure message now correctly suggests `lark-opencode-bridge configure`.

## [0.1.18] - 2026-06-06

### Changed
- **`start` waits for the bridge to actually register before declaring success or failure.** Old behavior: print "后台服务已启动 ✓", sleep 2.5s, check `processes.json` once, almost always print "⚠ bridge 进程未注册" because the daemon writes its pid only after opencode serve is up and the Lark WebSocket has connected (3–5s on a warm cache). New: poll `processes.json` every 500ms for up to 15s, then print either `✓ bridge 已就绪 (pid=N)` or `✗ 15 秒内 bridge 进程未注册` with diagnostic hints. `start` exits non-zero on the failure path, so it's now safely scriptable.

## [0.1.17] - 2026-06-06

### Fixed
- **`--version` was hardcoded `0.1.5`** — independent of what `package.json` said and never updated as upstream cut releases. `cli.ts` now references a build-time constant `__PKG_VERSION__` injected by tsup's `define`, so the published binary's version always tracks `package.json` (no more lying to `--version`).

## [0.1.16] - 2026-06-06

### Fixed
- **`start` daemon could not launch on scoped npm installs** — `bridgeBin()` computed the absolute path with `../../bin/...` from `dist/cli.js`, which overshoots one level for scoped packages and produced `/opt/homebrew/lib/node_modules/@fullstackjam/bin/lark-opencode-bridge.mjs` (missing the `lark-opencode-bridge` segment). Now tries `../bin/...` first (bundled layout) and falls back to `../../bin/...` (source layout used by `tsx` in dev).
- **`status` install hint pointed at the unscoped package name** — now suggests `npm i -g @fullstackjam/lark-opencode-bridge` instead of `lark-opencode-bridge`.

## [0.1.15] - 2026-06-06

### Docs
- `LICENSE` adds a second copyright line for `@fullstackjam/lark-opencode-bridge contributors`; the upstream line is preserved per MIT.

## [0.1.14] - 2026-06-06

### Docs
- Dropped the upstream "分享与交流 / Community" section from both READMEs (knowledge base, chat-group invite link, group QR all pointed at upstream's resources).
- `docs/img/feishu-group-qr.png` removed.
- `docs/img/quick-start.svg` (+ EN version) step-2 box now shows the scoped `@fullstackjam/lark-opencode-bridge` package name across three lines.
- `CHANGELOG.md` now distinguishes fork releases from inherited upstream history.

## [0.1.13] - 2026-06-06

### Changed
- **Renamed to `@fullstackjam/lark-opencode-bridge`** — repackaged under the fork's scope; the `opencode-bridge` bin alias was dropped to avoid colliding with the upstream package.
- Repository, bugs, and homepage URLs retargeted at `fullstackjam/lark-opencode-bridge`.

### Fixed
- **lark-cli reply child timeout** — a hung `lark-cli` reply child previously stalled the pipeline indefinitely with no log output (silent no-reply failure mode). It is now killed after 60s with the error surfaced. (`7c65030`)
- **larkProfile propagation** — the configured `larkProfile` was not threaded through every `lark-cli` invocation, breaking multi-profile setups. (`8a63f7b`)
- **Reply-spawn debug logging** — added structured debug entries around prompt completion and the reply spawn path, making the no-reply failure mode diagnosable. (`5adf2bc`)

### CI
- Tag-triggered release workflow (`.github/workflows/release.yml`): pushing a `v*` tag now runs typecheck + tests + build, verifies the tag matches `package.json`, publishes to npm with build provenance, and creates a GitHub Release with auto-generated notes. Replaces the previous local `scripts/release.mjs`.

---

## [0.1.12] - 2026-06-01

### Added
- **Windows background daemon** — `start` / `stop` / `restart` / `status` now work on Windows via a per-user **Task Scheduler** task (logon-triggered, auto-restart on crash), the equivalent of launchd on macOS and systemd `--user` on Linux. The bridge daemon is now supported on all three platforms; foreground `run` already was.

### Changed
- `resolveOnPath` uses `where` on Windows (`which` elsewhere) when resolving `lark-cli` / `opencode` for the service definition.
- `installService` now ensures the log directory exists up front on every platform, so first-run daemon stdout/stderr redirection never fails.
- CLI service-command descriptions and the post-`start` log hint are now Windows-aware (PowerShell `Get-Content` instead of `tail`).

### Docs
- README（中英文）平台支持说明更新为 macOS / Linux / Windows；重写「Windows 能用吗 / Does it work on Windows」FAQ。

## [0.1.11] - 2026-06-01

### Docs
- README（中英文）开头新增「分享与交流 / Community」区块：飞书知识库帮助文档链接、交流群一键加入超链接，以及群二维码（`docs/img/feishu-group-qr.png`）。

## [0.1.10] - 2026-05-29

### Added
- **Doc-comment ack reaction** — when the bot is @mentioned in a cloud-doc
  comment, it now adds a 🧑‍💻 `Typing` (敲代码) reaction to the triggering reply
  as soon as it starts working, and removes the reaction once the answer is
  posted back. This gives commenters a clear "working → done" signal.
  Reaction add/remove are best-effort and never block the reply flow.
  Implemented via `drive.v2.commentReaction.updateReaction`
  (`CommentFetcher.reactToReply`).

## [0.1.9] - 2026-05-28
- GitHub username change `rorschachachxd` → `YMaxwellHayes`.

## [0.1.8]
- English README references the English SVG diagram.

## [0.1.7]
- Ship `docs/img` inside the npm package.

## [0.1.6]
- Daemon, keepalive, registry, and shutdown fixes.

## [0.1.5]
- Updated product copy in README and npm description.

## [0.1.4]
- Complete in-chat slash-command docs in README.

## [0.1.3]
- Beginner step-by-step setup guide in README.

## [0.1.2]
- Daemon PATH fixes and README cleanup.

## [0.1.1]
- Auto-install latest lark-cli during app setup.

## [0.1.0]
- Initial release: Feishu/Lark bot for local opencode — QR setup, streaming
  cards, `/spawn` groups, doc comments & attachments.
