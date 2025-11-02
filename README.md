# 🐺 WildWright

**A comprehensive companion app for Pathfinder 1e Druids to master their Wild Shape abilities.**

WildWright streamlines the complex calculations and bookkeeping required for Wild Shape transformations, allowing you to focus on strategy and roleplay instead of math.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://wildwright-b4356.web.app)
[![License](https://img.shields.io/badge/license-Private-blue)](#)

---

## ✨ Features

### 🔮 Wild Shape Management
- **Form Library**: Pre-built templates for animals, elementals, plants, and magical beasts
- **Custom Forms**: Create and save your own wild shape forms
- **Favorites**: Quick access to your most-used transformations
- **Form Preview**: See complete stats before assuming a form

### 📊 Automatic Stat Calculation
- **Pathfinder 1e Accurate**: Implements Beast Shape I-IV, Elemental Body I-IV, and Plant Shape I-III rules
- **Size Modifiers**: Automatic AC, attack, and damage adjustments for size changes
- **Ability Score Changes**: STR/DEX/CON bonuses applied based on form and tier
- **Natural Armor**: Tier-based natural armor bonuses
- **Attack Bonuses**: Computed attack rolls with size, ability, and BAB modifiers

### ⚔️ Combat Stats
- **Natural Attacks**: View all attacks (bite, claw, slam, etc.) with bonuses and damage
- **Special Attack Traits**: See which attacks have grab, poison, rake, constrict, etc.
- **AC Breakdown**: Total, touch, and flat-footed AC with detailed modifiers
- **Hit Points**: Adjusted HP based on CON changes
- **Saving Throws**: Updated saves based on new ability scores

### 🎯 Special Abilities
- **Ability Descriptions**: Click any special ability to see its full rules text
- **Tier Restrictions**: Only abilities allowed by your spell tier are shown
- **Movement Types**: Land, fly, swim, climb, burrow speeds with maneuverability
- **Senses**: Darkvision, low-light vision, scent, tremorsense tracking

### 👤 Character Management
- **Multiple Characters**: Track different druids
- **Character Stats**: Store base stats, feats, and combat modifiers
- **Form History**: Remember which forms you've learned
- **Quick Switch**: Easily swap between characters

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet with custom theming
- **State Management**: React Context + TanStack Query

### Backend
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting (web deployment)
- **Real-time**: Firestore real-time listeners

### Game Logic
- **PF1e Engine**: Custom TypeScript implementation of Pathfinder 1e wild shape rules
- **Stat Computation**: Handles size changes, ability modifiers, natural armor, and special abilities
- **Attack Calculation**: Primary/secondary attacks, size-based damage scaling

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Firebase project (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wildwright.git
cd wildwright

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Start development server
npm start

# Run on web
npm run web

# Run on iOS (Mac only)
npm run ios

# Run on Android
npm run android
```

### Environment Setup

Create a `.env.local` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Copy your Firebase config to `.env.local`
5. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Seed the Form Library

Populate the library with pre-built wild shape forms:

```bash
npm run seed-library
```

---

## 📱 Deployment

### Web Deployment

```bash
# Build and deploy to Firebase Hosting
npm run deploy
```

### Mobile Deployment

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## 📂 Project Structure

```
wildwright/
├── src/
│   ├── app/              # Expo Router screens
│   │   ├── (app)/        # Main app screens (after auth)
│   │   ├── (auth)/       # Authentication screens
│   │   └── _layout.tsx   # Root layout
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (buttons, cards, etc.)
│   │   └── skeletons/   # Loading state components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── pf1e/            # Pathfinder 1e game logic
│   │   ├── beast.ts     # Beast Shape implementation
│   │   ├── elemental.ts # Elemental Body implementation
│   │   ├── plant.ts     # Plant Shape implementation
│   │   ├── compute.ts   # Main stat computation engine
│   │   └── tiers.ts     # Tier/size modifier tables
│   ├── services/        # Firebase service layer
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── scripts/             # Build and deployment scripts
│   ├── seedLibrary.ts   # Populate form library
│   └── seed-data/       # Form template JSON files
└── firebase.json        # Firebase configuration
```

---

## 🎮 Usage Guide

### Creating a Character

1. Launch the app and create an account
2. Tap "Create Character"
3. Enter your druid's base stats:
   - Ability scores (STR, DEX, CON, etc.)
   - Base HP, AC, BAB
   - Effective Druid Level (EDL)
   - Combat modifiers (attack/damage bonuses)

### Assuming a Wild Shape Form

1. Go to the **Library** tab to browse pre-built forms
2. Tap **Learn Form** to add it to your collection
3. Go to **Your Forms** tab to see your learned forms
4. Tap **Assume** on any form to transform
5. View your updated stats, attacks, and abilities
6. Tap **Revert Form** when done

### Creating Custom Forms

1. Go to **Your Forms** tab
2. Tap **Create Custom Form**
3. Enter form details:
   - Name, size, spell tier
   - Natural attacks (bite, claw, etc.)
   - Movement speeds
   - Special abilities
4. Save and assume the form

### Managing Favorites

- Star any form to add it to your **Favorites** on the home screen
- Quick-access your most-used transformations
- Tap any favorite to preview and assume

---

## 🧪 Development

### Running Tests

```bash
npm test
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Code Quality

```bash
# Type checking
npx tsc --noEmit

# Linting (if configured)
npm run lint
```

---

## 🐛 Known Issues

- Mobile theme uses dark brown background instead of parchment (planned fix)
- Form library requires manual re-seeding after data changes

---

## 🗺️ Roadmap

- [ ] Spell tracking and management
- [ ] Equipment and inventory system
- [ ] Party sharing and collaboration
- [ ] Offline mode improvements
- [ ] Export character sheets to PDF
- [ ] Integration with VTT platforms

---

## 📄 License

Private - Phoenix Games
© 2025 All Rights Reserved

---

## 🙏 Acknowledgments

- **Pathfinder 1e**: Paizo Publishing
- **d20pfsrd**: For comprehensive rule references
- **React Native Community**: For amazing open-source tools

---

## 📞 Support

For bug reports and feature requests, please open an issue on GitHub.

For questions and discussions, reach out to [your contact method].

---

**Built with ❤️ for Pathfinder druids everywhere**
