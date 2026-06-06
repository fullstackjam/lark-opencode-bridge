# Changelog

All notable changes to **@fullstackjam/lark-opencode-bridge** are documented here.
This project follows [Semantic Versioning](https://semver.org/).

This is a private fork of [YMaxwellHayes/lark-opencode-bridge](https://github.com/YMaxwellHayes/lark-opencode-bridge); upstream releases are listed below for traceability.

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
