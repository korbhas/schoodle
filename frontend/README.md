# Schoodle Frontend

Electron desktop application frontend built with React, Vite, and Tailwind CSS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
VITE_API_URL=http://localhost:3000/api
```

3. Run development server:
```bash
npm run dev
```

4. Run Electron app (in separate terminal):
```bash
npm run electron:dev
```

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run electron:dev` - Run Electron app with dev server
- `npm run electron:build` - Build Electron app
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── electron/          # Electron main process
├── src/
│   ├── components/    # React components
│   ├── contexts/      # React contexts (Auth, etc.)
│   ├── layouts/       # Layout components
│   ├── lib/           # Utilities and API client
│   ├── pages/         # Page components
│   └── main.jsx       # React entry point
├── index.html
└── vite.config.js
```

