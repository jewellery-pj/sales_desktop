# 29 Jewellery - Sales Desktop Application

A Windows desktop application for sales management built with Electron, React, and TypeScript.

## Features

- ✅ Employee login with staff_id and password
- ✅ Dark/Light theme support
- ✅ Multi-language support (English/Myanmar)
- ✅ Sales management (list, create)
- ✅ Profile management
- ✅ Modern UI with responsive design

## Tech Stack

- **Electron** - Desktop application framework
- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **i18next** - Internationalization
- **Axios** - API client

## Prerequisites

- Node.js v20 or higher
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Run in development mode
npm run dev

# In another terminal, run Electron
npm run electron:dev
```

## Build

```bash
# Build for Windows
npm run electron:build
```

The built application will be in the `release` folder.

## Configuration

Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://192.168.100.215:8000/api';
```

## Backend API

This application connects to the existing Sales Analytics backend at:
- Base URL: `http://192.168.100.215:8000/api`
- Login endpoint: `/employee-login`
- Sales endpoints: `/mobile/sales`

## Project Structure

```
sales-desktop-app/
├── electron/           # Electron main process
├── src/
│   ├── components/    # React components
│   ├── context/       # React contexts (Auth, Theme)
│   ├── i18n/          # Internationalization
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── styles/        # CSS files
│   └── types/         # TypeScript types
├── public/            # Static assets
└── package.json
```

## License

Copyright © 2026 29 Jewellery
