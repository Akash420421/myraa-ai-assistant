# MYRAA

MYRAA is a desktop AI assistant with a modular real-time 3D anime character system.

## Workspace contract

The repository is intentionally split into two top-level areas:

```text
MYRAA TO 3D/
├── myraa-ai-assistant/   Application and runtime-ready character assets
└── MYRAA 3d MODELS/     Raw source models and their original textures
```

Keep raw PMX files and original model packages in `MYRAA 3d MODELS`. The application must not load them directly. A model is staged into `myraa-ai-assistant/assets/characters/<character-id>`, then registered through `src/character/config/registry.ts`.

Model `1739444010509` (Evelyn) is the only active integration target. Complete and validate it before staging or registering the second model.

## Character controls

| Control | Action |
| --- | --- |
| `W A S D` | Smooth free camera orbit, including side and back views |
| `Q / E` | Zoom out / in |
| `L` | Lock or unlock the current view |
| `F` | Toggle eyes following the mouse |
| `R` | Reset the camera to the default front view |
| `1` | Front preset |
| `2` | Three-quarter preset |
| `3` | Side preset |
| `4` | Back preset |

The preview also exposes clickable **View lock**, **Eyes**, **Front**, **¾**, **Side**, and **Back** controls. While view lock is active, orbit, zoom, reset, and preset changes are intentionally blocked.

## Character architecture

The implementation under `src/character` is divided by responsibility:

- `core`: stage, render loop, model lifecycle, camera and system orchestration
- `loaders`: PMX parsing and staged texture resolution
- `materials`: anime shading, toon ramps, outlines and ambient occlusion
- `lighting`: body and camera-relative portrait lighting rigs
- `animation`: layered pose, idle, gaze and grant solving
- `face`: expressions, morphs, blinking and real-time lip sync
- `behaviour`: random natural actions and activity-aware direction
- `physics`: secondary motion for hair, clothing and accessories
- `config/characters`: all model-specific bones, morphs, materials and tuning

New characters should be added through configuration and staged assets rather than by hardcoding model details into the shared runtime.

## Development

Prerequisites: Node.js and npm.

```powershell
npm install
npm run dev
```

Open the standalone tuning harness at:

`http://localhost:5178/character-preview.html`

Use these checks before shipping character changes:

```powershell
npm run lint
npm run build
```

Set local API credentials in `.env`; never commit secrets.

The backend also maintains an internal public-API capability registry sourced
from `public-apis/public-apis`. See [`docs/API_HUB.md`](docs/API_HUB.md) for its
cache, provider states, discovery endpoints, and code-free adapter boundary.

## Cognitive runtime

The event-driven cognitive backend extends the existing application without
changing the UI or character system. Its architecture, safety boundaries,
feature flags, storage files, APIs, tests, and phased roadmap are documented in
[`docs/COGNITIVE_ARCHITECTURE.md`](docs/COGNITIVE_ARCHITECTURE.md).

```powershell
npm run test:cognition
npm run test:api-hub
npm run test:screen-vision
npm run test:python
npm run simulate:cognition
```
