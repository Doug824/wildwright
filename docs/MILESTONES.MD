# WildWright Development Milestones

Extracted from PROJECT_SCHEMA.md Section 11

## Phase 1: Foundation (Week 1-2)
- [ ] Initialize Expo project with TypeScript
- [ ] Configure NativeWind, React Navigation
- [ ] Set up Supabase project, generate types
- [ ] Create database schema and migrations
- [ ] Implement authentication (email/password, magic link)
- [ ] Set up offline support (TanStack Query + AsyncStorage)
- [ ] Create base UI components library

## Phase 2: Character Management (Week 3)
- [ ] Build character creation wizard
- [ ] Implement base stats editor (ability scores, AC, HP, saves, BAB)
- [ ] Create skills editor
- [ ] Add effective druid level input
- [ ] Implement character CRUD operations
- [ ] Add character selection/switching

## Phase 3: Forms Library (Week 4)
- [ ] Seed PF1e template database (15-20 forms)
- [ ] Build template library screen with filters
- [ ] Implement form cloning from templates
- [ ] Create custom form editor
- [ ] Add image upload functionality
- [ ] Implement favorites system
- [ ] Build search and tag filtering

## Phase 4: Rules Engine (Week 5)
- [ ] Implement PF1e rules calculator
- [ ] Add size change logic
- [ ] Calculate ability score impacts
- [ ] Compute AC, CMB, CMD changes
- [ ] Handle natural attacks rendering
- [ ] Apply skill bonuses and penalties
- [ ] Add movement and senses logic
- [ ] Create stat comparison/delta display

## Phase 5: Swipe UX & Daily Uses (Week 6)
- [ ] Build swipeable card deck with Reanimated
- [ ] Create wild shape card component
- [ ] Implement daily uses counter (finite/infinite)
- [ ] Add long rest reset functionality
- [ ] Build dashboard with quick access
- [ ] Create "Assume Shape" flow
- [ ] Add undo/revert functionality

## Phase 6: Custom Templates (Week 7)
- [ ] Build custom template creator
- [ ] Implement template application to forms
- [ ] Add template library management
- [ ] Create celestial/fiendish/template examples
- [ ] Add multi-template stacking logic

## Phase 7: Polish & Testing (Week 8-9)
- [ ] Implement dark theme
- [ ] Add loading states and error handling
- [ ] Create onboarding flow
- [ ] Test offline functionality thoroughly
- [ ] Add form validation everywhere
- [ ] Performance optimization (FlatList, memoization)
- [ ] Accessibility pass (screen readers, touch targets)
- [ ] Bug fixes and edge cases

## Phase 8: Beta Release (Week 10)
- [ ] TestFlight/Play Internal setup
- [ ] Create landing page
- [ ] Write user documentation
- [ ] Beta testing with 5-10 users
- [ ] Collect and implement feedback
- [ ] Prepare for public release
