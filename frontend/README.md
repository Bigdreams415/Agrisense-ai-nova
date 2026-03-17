# AgriSense AI Frontend

Production frontend for AgriSense AI, built with React + TypeScript + Tailwind.

This app provides:
- Homepage marketing/entry experience
- Main in-app workspace for AI agriculture workflows
- Pest detection UI
- Yield prediction UI
- Smart irrigation recommendation UI
- Satellite vegetation analysis UI
- Chat assistant connected to backend
- Drone and sensor integration hooks

## Tech Stack

- React 19
- TypeScript
- Create React App (react-scripts)
- Tailwind CSS
- Framer Motion
- Leaflet (map and boundary drawing)

## Prerequisites

Install these first:
- Node.js 18 or 20 LTS
- npm 9+
- Running backend API (default expected at http://127.0.0.1:8000)

Check versions:

```bash
node -v
npm -v
```

## Quick Start (Local Development)

1. Install dependencies.

```bash
cd frontend
npm install
```

2. Create local environment file.

```bash
cp env.example .env
```

3. Add environment variables in `.env`.

```env
REACT_APP_BACKEND_URL=http://127.0.0.1:8000
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_WS_BASE_URL=ws://127.0.0.1:8000
```

4. Start development server.

```bash
npm start
```

5. Open in browser:

http://localhost:3000

## Backend Connection Notes

The frontend uses these environment variables:
- `REACT_APP_BACKEND_URL`: primary backend base URL
- `REACT_APP_API_URL`: fallback backend base URL
- `REACT_APP_WS_BASE_URL`: WebSocket base URL for streaming/sensor/drone flows

Default fallback in code is `http://127.0.0.1:8000` for HTTP requests.

If your backend is remote, update `.env` accordingly, for example:

```env
REACT_APP_BACKEND_URL=https://your-api-domain.com
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_WS_BASE_URL=wss://your-api-domain.com
```

## Available Scripts

### `npm start`
Runs the app in development mode with hot reload.

### `npm run build`
Creates an optimized production build in `build/`.

### `npm test`
Runs tests in watch mode.

### `npm run eject`
One-way operation to expose CRA internals.

## Production Build and Preview

Build:

```bash
npm run build
```

Preview locally:

```bash
npx serve -s build
```

## Deployment Notes (Vercel/Static Hosts)

- This app uses hash-based navigation (`#dashboard`, `#workspace`), so no special route rewrites are required for client-side routing.
- Set all required `REACT_APP_*` environment variables in your hosting dashboard.
- Ensure the backend allows CORS from your frontend domain.
- Build command: `npm run build`
- Output directory: `build`

## Frontend Folder Structure

```text
frontend/
├── .env
├── env.example
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── public/
│   ├── images/
│   ├── videos/
│   ├── index.html
│   └── manifest.json
└── src/
	 ├── App.tsx
	 ├── index.tsx
	 ├── pages/
	 │   ├── Homepage.tsx
	 │   └── MainApp.tsx
	 ├── components/
	 │   ├── common/
	 │   ├── Forms/
	 │   ├── homepage/
	 │   ├── Layout/
	 │   │   ├── Header/
	 │   │   └── Sidebar/
	 │   ├── Map/
	 │   ├── Pages/
	 │   │   ├── Dashboard/
	 │   │   ├── FarmAssistant/
	 │   │   ├── FarmManagement/
	 │   │   ├── Marketplace/
	 │   │   ├── Settings/
	 │   │   └── Workspace/
	 │   └── UI/
	 │       ├── Button/
	 │       ├── Card/
	 │       ├── LineChart/
	 │       └── Modal/
	 ├── contexts/
	 │   └── ThemeContext.tsx
	 ├── hooks/
	 │   ├── useCamera.ts
	 │   ├── useDrone.ts
	 │   ├── useHashRouter.ts
	 │   ├── useNotification.ts
	 │   ├── useSensors.ts
	 │   ├── useTheme.ts
	 │   └── useTypingAnimation.ts
	 ├── services/
	 │   └── api/
	 │       ├── analysisService.ts
	 │       ├── satellite.ts
	 │       ├── sensorService.ts
	 │       ├── constants.ts
	 │       └── types.ts
	 ├── styles/
	 │   ├── animations.css
	 │   └── globals.css
	 ├── types/
	 └── utils/
```

## App Navigation Overview

- Entry: `src/App.tsx`
- Homepage to App transition: `src/pages/Homepage.tsx` -> `src/pages/MainApp.tsx`
- Main in-app shell: sidebar + header + hash-route content rendering
- Hash routes rendered in `src/components/Pages/MainContent.tsx`:
  - `#dashboard`
  - `#farm-assistant`
  - `#farm-management`
  - `#settings`
  - default: workspace

## Common Issues and Fixes

1. UI loads but API calls fail:
	- Confirm backend is running and reachable.
	- Check `REACT_APP_BACKEND_URL` value.

2. WebSocket errors:
	- Use `wss://` for HTTPS deployments.
	- Verify `REACT_APP_WS_BASE_URL` is correct.

3. CORS errors in browser:
	- Add frontend domain to backend CORS allow list.

4. Build works locally but fails in cloud:
	- Re-check host environment variables.
	- Run `npm run build` locally before pushing.

## Recommended Developer Workflow

```bash
cd frontend
npm install
npm start
```

In a second terminal, run backend API (from project backend folder) so frontend features can connect to live endpoints.

