# Chrono Lens

A modern photo album application built with Next.js and Firebase.

## Features

- Smart photo layout algorithms
- Digital mat boards with customizable colors
- Responsive slideshow with preloading
- Real-time Firebase sync
- HEIC image support and processing

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add your Firebase config to .env.local

# Start development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Frontend**: Next.js 15.4.6, React 19, TypeScript
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Styling**: Tailwind CSS

## Project Structure

```
src/
├── app/                 # Next.js pages
├── components/          # Shared components
├── features/           # Feature-specific code
├── shared/             # Shared utilities and hooks
└── types/              # TypeScript definitions
```

## Development

See [docs/](docs/) for detailed documentation.

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Lint code
npm run type-check   # TypeScript validation
```

## License

MIT
