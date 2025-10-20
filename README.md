# WildWright

A mobile app for Pathfinder 1e druids to track and manage their wild shape forms.

## Tech Stack

- **Framework:** React Native + Expo SDK 51
- **Language:** TypeScript (strict mode)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** Expo Router
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **State Management:** Zustand + TanStack Query
- **Offline Support:** TanStack Query with AsyncStorage persistence

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

See [docs/FOLDER_STRUCTURE.md](./docs/FOLDER_STRUCTURE.md) for detailed project structure.

## Development Phases

See [docs/MILESTONES.md](./docs/MILESTONES.md) for development roadmap.

## Documentation

- [Database Schema](./docs/DATABASE_SCHEMA.sql)
- [TypeScript Types](./docs/TYPES.ts)
- [Full Project Schema](./docs/PROJECT_SCHEMA.md)
- [Current Phase](./docs/CURRENT_PHASE.md)

## License

Private - Phoenix Games
