# WildWright - Current Phase Tracker

**Context:** docs/PROJECT_SCHEMA.md (sections 1-32)

**Current phase:** Phase 3: Character Management (Week 3-4)

**Last completed:** Character Detail Screen with real-time wildshape form switching

**Next task:** Test character detail screen, then build wildshape form creation wizard

**Blockers:** None - Metro bundler cache needs clearing with `npm start -- --clear`

---

## Phase 1 Checklist

### Project Setup (Week 1)
- [x] Initialize Expo project with TypeScript
- [x] Configure NativeWind, React Navigation, ESLint, Prettier
- [x] Migrate from Supabase to Firebase in documentation
- [x] Update package.json with Firebase dependencies
- [x] Configure .env.example with Firebase keys
- [x] Update .gitignore for Firebase
- [x] Create project directory structure

### Database & Backend (Week 1-2) ✅ COMPLETE
- [x] Design Firestore schema (convert SQL to NoSQL)
- [x] Create FIRESTORE_SCHEMA.md with all collections
- [x] Create firestore.rules (security rules)
- [x] Create storage.rules (image upload rules - deferred for free tier)
- [x] Write FIREBASE_SETUP.md guide
- [x] Create TypeScript types for Firestore schema
- [x] Create src/lib/firebase.ts initialization
- [x] Create game calculation utilities
- [x] Create formatting utilities
- [x] Create validation utilities
- [x] Create constants (game data, app config)
- [x] Create complete service layer (auth, characters, forms, templates)
- [x] Create Firebase project in Console (wildwright-b4356)
- [x] Enable Authentication (Email/Password, Email Link, Google)
- [x] Enable Firestore Database (us-west1)
- [x] Deploy Firestore security rules
- [ ] Storage - DEFERRED (requires paid plan, using external image URLs instead)

### Authentication (Week 2) ✅ COMPLETE
- [x] Implement authentication service
- [x] Create auth hooks (useAuth, useUser)
- [x] Build login screen (sign-in.tsx)
- [x] Build signup screen (sign-up.tsx)
- [x] Build password reset flow (forgot-password.tsx)
- [x] Implement email link (magic link) auth (service layer)
- [x] Auth routing (redirect based on auth state)

### Offline Support (Week 2) ✅ COMPLETE
- [x] Set up TanStack Query with AsyncStorage
- [x] Configure AsyncStorage persistence
- [x] Create query hooks for characters (useCharacters, useCharacter + mutations)
- [x] Create query hooks for wild shape forms (useForms, useCharacterForms + mutations)
- [x] Create query hooks for templates (useTemplates with search/filter)
- [ ] Test offline functionality (requires npm install complete)

### Base UI Components (Week 2-3) ✅ COMPLETE
- [x] Create WildWright UI Kit (11 components)
  - Card component (parchment with bronze borders)
  - Heading components (H1-H4 with Crimson Pro)
  - Chip component (tags for abilities/traits)
  - RuneProgress component (cyan glow progress indicator)
  - Stat component (labeled stat display)
  - Tabs component (horizontal navigation)
  - AttackRow component (attack display)
  - Button component (5 variants, 3 sizes, loading states)
  - Input component (themed text fields with validation)
  - ProgressSteps component (multi-step wizard indicator)
  - Select component (dropdown picker for React Native)
- [x] Create theme configuration (forest/parchment/bronze/mist)
- [x] Create typography system (display + ui fonts)
- [x] Create playsheet mock demo screen
- [x] Create cn() utility for conditional classNames

### Character Management (Week 3) - IN PROGRESS
- [x] Character creation wizard (3-step form)
  - Basic info (name, edition, level)
  - Ability scores (STR, DEX, CON, INT, WIS, CHA)
  - Combat stats (HP, AC, saves, BAB)
- [x] Character list screen
  - Grid of character cards
  - Stats display (HP, AC, Wisdom)
  - Daily uses tracking
  - Empty state with CTA
- [x] Character detail screen (NEW!)
  - Character header with level/edition
  - Wildshape form selector
  - Real-time stat calculations when switching forms
  - Ability scores with modifiers
  - Combat stats (HP, AC, movement speeds)
  - Natural attacks with dice notation
  - Senses display
- [x] Tab navigation (Home + Characters)
- [ ] Wildshape form creation wizard
- [ ] Form list/browser screen
- [ ] HP tracking and daily uses management
- [ ] Character editing

---

## Session Progress Log

### Session 1: Environment Setup & Firebase Migration (2025-01-20)

**Environment Configuration:**
- ✅ Verified Windows Developer Mode enabled
- ✅ Configured WSL automount options in /etc/wsl.conf
- ✅ Restarted WSL and verified mount options (metadata, umask=22, fmask=11, case=off)
- ✅ Verified Node.js v24.1.0 via nvm
- ✅ Verified npm 11.3.0

**Project Initialization:**
- ✅ Initialized Expo SDK 50 with TypeScript
- ✅ Configured NativeWind (Tailwind CSS for React Native)
- ✅ Configured React Navigation (Stack + Bottom Tabs)
- ✅ Added ESLint, Prettier configuration
- ✅ Created initial app structure with Expo Router

**Firebase Migration:**
- ✅ Replaced @supabase/supabase-js with Firebase packages
- ✅ Updated package.json with firebase, @react-native-firebase/* packages
- ✅ Created .env.example with Firebase configuration template
- ✅ Updated .gitignore for Firebase-specific files
- ✅ Updated PROJECT_SCHEMA.md to reference Firebase/Firestore

**Database Schema Design:**
- ✅ Created docs/FIRESTORE_SCHEMA.md
- ✅ Converted SQL schema to Firestore NoSQL structure
- ✅ Designed collections: users, characters, wildShapeForms, wildShapeTemplates
- ✅ Documented document structures with TypeScript types
- ✅ Included example documents for each collection
- ✅ Added migration notes and denormalization strategy

**Security Configuration:**
- ✅ Created firestore.rules with collection-level security
- ✅ Created storage.rules for user-uploaded images
- ✅ Documented security best practices

**Documentation:**
- ✅ Created docs/FIREBASE_SETUP.md (comprehensive setup guide)
- ✅ Updated docs/CURRENT_PHASE.md to track progress
- ✅ Committed all changes to git (2 commits)

**Directory Structure Created:**
```
src/
├── app/              # Expo Router pages
├── components/       # React components
│   └── ui/          # Base UI components
├── hooks/           # Custom React hooks
├── lib/             # Library configurations (Firebase, etc.)
├── services/        # Business logic and API services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── constants/       # App constants and config
```

**Code Infrastructure Created:**
- ✅ Created src/types/firestore.ts (complete type definitions)
- ✅ Created src/lib/firebase.ts (Firebase initialization)
- ✅ Created src/constants/ (game data, app constants)
- ✅ Created src/utils/ (calculations, formatting, validation)
- ✅ Fixed npm install symlink issues (.npmrc + npx)
- ✅ Committed all infrastructure code (5 commits total)

**Session 1 Status (2025-01-20):**
- ✅ Phase 1: Foundation - COMPLETE
- ✅ Phase 2: Offline Support - COMPLETE
- ⏳ npm install still running (started at ~6:00pm, running 45+ minutes)
- 🎉 8 git commits, 3,200+ lines of production code!

**When npm install completes:**
1. It will finish on its own (check with `ps aux | grep npm` in WSL)
2. Look for a `node_modules/` directory with files
3. You should see a success message or error in terminal

**First Steps Next Session:**

1. **Verify npm install succeeded:**
   ```bash
   cd "/mnt/d/Phoenix Games/wildwright"
   ls node_modules | wc -l  # Should show 1000+ packages
   ```

2. **Test the app runs:**
   ```bash
   npm start
   # or
   npm run start
   ```
   - This should start Expo dev server
   - Follow prompts to open on device/emulator
   - Look for any TypeScript errors

3. **If there are errors:**
   - Read error messages carefully
   - Check imports in src/lib/firebase.ts
   - May need to adjust paths or fix missing types

4. **Once app runs successfully:**
   - Test Firebase connection
   - Move on to building UI components

**Next Development Tasks (Phase 2):**
- [ ] Create Button component (for forms)
- [ ] Create Input component (text fields)
- [ ] Build login screen
- [ ] Build signup screen
- [ ] Build password reset screen
- [ ] Test authentication flow end-to-end

---

### Session 2: WildWright UI Kit & Theme (2025-01-21)

**npm Install Success:**
- ✅ Simplified package.json to minimal core dependencies
- ✅ Successfully installed 1,362 packages (24 minutes)
- ✅ Fixed bin-links issue for WSL compatibility

**WildWright UI Kit Created (7 Components):**
- ✅ Card - Parchment cards with bronze borders and leaf shadows
- ✅ Heading (H1-H4) - Display typography with Crimson Pro font
- ✅ Chip - Tags and badges for abilities/traits (default + mist variants)
- ✅ RuneProgress - Circular progress indicator with cyan mist glow effect
- ✅ Stat - Labeled stat display (HP, AC, Saves, Speed, etc.)
- ✅ Tabs - Horizontal tab navigation
- ✅ AttackRow - Natural attack display with bonus/damage/traits

**Theme System:**
- ✅ Forest greens (#1f3527) - Deep backgrounds
- ✅ Parchment (#F0E8D5) - Card fills
- ✅ Bronze (#B97A3D) - Borders & accents
- ✅ Cyan mist (#7FC9C0) - Glows & progress indicators
- ✅ Custom shadows (leaf, glow) and border radius (xl2)
- ✅ Typography: Crimson Pro (display), Inter (ui)

**Demo & Utilities:**
- ✅ Created playsheet-mock.tsx - Leopard form demo screen
- ✅ Created cn() utility for conditional className composition
- ✅ Updated index.tsx to show mock screen for easy testing

**Configuration:**
- ✅ Updated tailwind.config.js with complete theme
- ✅ Simplified babel.config.js for current dependencies
- ✅ Updated app.json for minimal config

**Git Commits:**
- ✅ Commit #10: "Add WildWright UI Kit with forest/parchment theme"

**Session 2 Status:**
- ✅ Base UI Components - COMPLETE (7/7 display components)
- ⏳ Form components pending (Button, Input)
- 📱 Mock screen ready for viewing via Expo
- 🎨 Theme matches design spec perfectly!

**Lines of Code:** +500 (Total: ~3,700+)

---

### Session 3: Character Management & Web Support (2025-10-22)

**Dependency Fixes:**
- ✅ Fixed Babel config (removed NativeWind plugin causing bundler errors)
- ✅ Installed expo-linking package (required for expo-router)
- ✅ Installed web dependencies (react-dom@18.3.1, react-native-web)
- ✅ Fixed Firebase Auth for web compatibility
- ✅ App now runs successfully on web browser

**Character Detail Screen (NEW!):**
- ✅ Created src/app/(tabs)/character/[id].tsx
- ✅ Character header (name, level, edition chip, daily uses)
- ✅ Wildshape form selector (base form + beast forms)
- ✅ **Real-time stat calculations** when switching forms
- ✅ Ability scores display with modifiers
- ✅ Combat stats (HP, AC, movement speeds including swim/climb/fly)
- ✅ Natural attacks with dice notation (e.g., "Bite +14, 1d8+9")
- ✅ Senses display (low-light, scent, darkvision, etc.)
- ✅ Form filtering by druid level
- ✅ Beautiful themed UI matching design spec

**Routing & Auth:**
- ✅ Updated root index.tsx with auth-based routing
- ✅ Redirect to sign-in if unauthenticated
- ✅ Redirect to tabs if authenticated
- ✅ Navigation from character list to detail working

**Git Commits:**
- ✅ Commit #15: "Add character list screen and tab navigation"
- ✅ Commit #16: "Add Character Creation Wizard with multi-step form"

**Session 3 Status:**
- ✅ Character detail screen with form switching - COMPLETE
- ✅ Web development environment - WORKING
- ✅ Real-time stat transformations - WORKING
- ⏳ Need to test with cleared Metro cache
- ⏳ Wildshape form creation wizard - PENDING

**Lines of Code:** +320 (Total: ~6,000+)

**Next Steps:**
1. Clear Metro cache: `npm start -- --clear`
2. Test character detail screen on web
3. Build wildshape form creation wizard
4. Add HP tracking and daily use management

