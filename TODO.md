# WildWright App - Todo List for Next Session

**Last Updated:** 2025-10-29
**Current Score:** A- (87/100)
**Target Score:** A++ (95+/100)

---

## 🎉 Completed This Session (2025-10-29)

### Phase 1: Critical Architecture Refactor ✅ COMPLETE
- [x] Remove dead code (tabs folder, playsheet-mock)
- [x] Create CharacterContext for global state
- [x] Refactor home.tsx to use React Query hooks
- [x] Refactor forms.tsx to use React Query hooks
- [x] Refactor library.tsx to use React Query hooks
- [x] Refactor create-form wizard to use hooks
- [x] Fix all `any` types in main screens
- [x] Remove ~225 lines of duplicate data fetching code

### Phase 2: Architecture & Code Quality ✅ 80% COMPLETE
- [x] Set up React Query with QueryClientProvider
- [x] Install and configure react-error-boundary
- [x] Create ErrorFallback component
- [x] Create AppErrorBoundary wrapper
- [x] Integrate error boundary into root layout
- [x] Create .env.example for Firebase config
- [x] Verify .gitignore protects sensitive files
- [x] Add JSDoc documentation to characters.service.ts
- [x] Add JSDoc documentation to wildShapeForms.service.ts
- [x] Add JSDoc documentation to CharacterContext

**Commits Made:** 8 clean, well-documented commits
**Score Progress:** B+ (83) → A- (87) = **+4 points!**

---

## 🎯 Priority Tasks for Next Session

### Phase 2: Finish Remaining Items (Optional - 20% left)

#### 2.5 JSDoc Documentation - Additional Files (Optional)
- [ ] Document wildShapeTemplates.service.ts
- [ ] Document useCharacters.ts hook
- [ ] Document useWildShapeForms.ts hook
- [ ] Document useWildShapeTemplates.ts hook
- [ ] Document pf1e/compute.ts key functions
- [ ] Add JSDoc to error handling utilities (if created)

**Estimated Time:** 1-2 hours
**Impact:** Improved developer experience, better IntelliSense

---

### Phase 3: UX/UI Improvements (HIGH PRIORITY - Start Here!)

#### 3.1 Add "Learn Form" to Details View ⭐ HIGH VALUE
**Priority:** 🔴 HIGH
**Estimated Time:** 30-45 minutes
**Impact:** Major UX improvement - users frustrated by current flow

**Tasks:**
- [ ] Update DetailsPreview component to accept `source` prop ('library' | 'my-forms')
- [ ] Add `onLearnForm` callback prop to DetailsPreview
- [ ] Add "Learn This Form" button in modal footer (library only)
- [ ] Check if form already learned before showing button
- [ ] Verify EDL requirements before allowing learn
- [ ] Show success toast after learning
- [ ] Test complete flow: Library → Details → Learn → Forms

**Acceptance Criteria:**
- User can learn forms directly from details modal
- Context-appropriate buttons (Learn vs Edit based on source)
- EDL requirements validated
- Form appears in "My Forms" immediately after learning

---

#### 3.2 Add Loading States & Skeleton Screens ⭐ HIGH VALUE
**Priority:** 🔴 HIGH
**Estimated Time:** 1-2 hours
**Impact:** Makes app feel much more responsive

**Tasks:**
- [ ] Create base Skeleton component (src/components/ui/Skeleton.tsx)
- [ ] Create FormCardSkeleton component
- [ ] Create CharacterHeaderSkeleton component
- [ ] Create TemplateCardSkeleton component
- [ ] Add skeleton to home.tsx while character loads
- [ ] Add skeleton to forms.tsx while forms load
- [ ] Add skeleton to library.tsx while templates load
- [ ] Replace ActivityIndicator spinners with skeletons
- [ ] Test loading states look good

**Acceptance Criteria:**
- No blank screens during loading
- Skeleton layouts match actual content
- Smooth transition from skeleton to content
- Loading feels fast and responsive

---

#### 3.3 Add Search & Better Filtering to Library ⭐ MEDIUM VALUE
**Priority:** 🟡 MEDIUM
**Estimated Time:** 2-3 hours
**Impact:** Improves library browsing significantly

**Tasks:**
- [ ] Create SearchBar component (src/components/ui/SearchBar.tsx)
- [ ] Add search bar to library.tsx header
- [ ] Implement search by name (case-insensitive)
- [ ] Debounce search input (300ms delay)
- [ ] Add "Sort By" dropdown (Name A-Z, Name Z-A, CR, Size)
- [ ] Add filter by CR range
- [ ] Add filter by EDL requirement
- [ ] Add "Show Learned" / "Hide Learned" toggle
- [ ] Add "✓ Learned" badge to already-learned forms
- [ ] Persist filter settings in AsyncStorage
- [ ] Add "Clear Filters" button
- [ ] Test with large number of forms (performance)

**Acceptance Criteria:**
- Search works instantly
- Multiple filters can be combined
- Filter state persists across sessions
- Clear visual feedback for learned forms
- Performance good with 100+ forms

---

#### 3.4 Add Character Switching UI 🟢 NICE-TO-HAVE
**Priority:** 🟢 LOW
**Estimated Time:** 1 hour
**Impact:** Convenience feature

**Tasks:**
- [ ] Add "Switch Character" button to home screen header
- [ ] Create character selection modal
- [ ] Show all user's characters in modal
- [ ] Highlight currently selected character
- [ ] Use CharacterContext's switchCharacter() function
- [ ] Show loading state during switch
- [ ] Show success toast after switch
- [ ] Test switching updates all screens

**Acceptance Criteria:**
- Can switch characters without logging out
- Switch is fast (<1 second)
- Data refreshes correctly
- Current character clearly indicated

---

#### 3.5 Confirmation & Undo for Delete 🟢 NICE-TO-HAVE
**Priority:** 🟢 LOW
**Estimated Time:** 1-2 hours
**Impact:** Polish / safety feature

**Tasks:**
- [ ] Verify delete confirmation exists (audit said it does ✓)
- [ ] Add undo toast after delete (5 second window)
- [ ] Keep deleted item in memory during undo window
- [ ] Restore if "Undo" clicked
- [ ] Permanently delete after timeout
- [ ] Test undo functionality works
- [ ] Add confirmation for "Forget Form" action

---

### Phase 5: Testing (RECOMMENDED - Do After Phase 3)

#### 5.1 Expand Unit Tests for PF1e Engine ⭐ HIGH VALUE
**Priority:** 🟡 MEDIUM
**Estimated Time:** 2-3 hours
**Impact:** Confidence in game mechanics calculations

**Tasks:**
- [ ] Expand src/pf1e/__tests__/compute.test.ts
- [ ] Test computeWildShape with various form sizes
- [ ] Test stat modifier calculations (all 6 stats)
- [ ] Test attack bonus calculations
- [ ] Test AC calculations with different sizes
- [ ] Test each special ability type
- [ ] Test edge cases (stat limits, size changes)
- [ ] Aim for 90%+ coverage of pf1e/ folder

---

#### 5.2 Add Service Tests
**Priority:** 🟡 MEDIUM
**Estimated Time:** 3-4 hours

**Tasks:**
- [ ] Create src/services/__tests__/ folder
- [ ] Test characters.service.ts (CRUD operations)
- [ ] Test wildShapeForms.service.ts (CRUD operations)
- [ ] Mock Firestore for all service tests
- [ ] Test error handling scenarios
- [ ] Aim for 70%+ coverage of services/

---

## 📋 Technical Debt / Future Enhancements

### Small Improvements (Quick Wins)
- [ ] Add haptic feedback on key actions (use expo-haptics)
- [ ] Add micro-animations to UI interactions
- [ ] Improve toast notifications (icons, better styling)
- [ ] Add loading indicators to buttons during async operations

### Medium Improvements
- [ ] Enable Firestore offline persistence
- [ ] Add NetInfo listener for offline indicator
- [ ] Add TypeScript strict mode (if not already enabled)
- [ ] Search remaining `any` types in components folder

### Larger Features (Future)
- [ ] Build comparison feature (compare multiple forms)
- [ ] Add character export/import (JSON)
- [ ] Add onboarding tutorial for first-time users
- [ ] Add in-app help/tooltips
- [ ] Set up error tracking (Sentry or similar)
- [ ] Add analytics (optional - only if needed)

---

## 🎯 Recommended Next Session Plan

### Session Goal: **Phase 3 - UX Improvements** (Target: +2 points → A = 89/100)

**Time Budget:** 3-4 hours

1. **Start:** 3.2 Loading States & Skeleton Screens (1-2 hours)
   - High visual impact
   - Makes app feel much faster
   - Foundational for good UX

2. **Then:** 3.1 Add "Learn Form" to Details (30-45 min)
   - Addresses user pain point
   - Quick win with high value
   - Completes a frustrating user flow

3. **If Time:** 3.3 Search & Filtering (2-3 hours)
   - Significant improvement to library
   - Makes app more usable with many forms

4. **Wrap Up:** Commit all changes, update roadmap

**Expected Outcome:**
- Users get better loading experience
- Library browsing improved
- Major pain points addressed
- Score: A- (87) → A (89-90)

---

## 📝 Notes for Next Session

### Remember to:
- [ ] Start each major feature with TodoWrite to track tasks
- [ ] Commit frequently (after each major feature)
- [ ] Update IMPROVEMENT_ROADMAP.md with progress
- [ ] Test each feature thoroughly before committing
- [ ] Add JSDoc to any new public functions
- [ ] Keep type safety (no `any` types!)

### Context to Remember:
- CharacterContext is in `src/contexts/CharacterContext.tsx`
- All screens now use React Query hooks (consistent pattern)
- Error boundary is integrated and working
- Services are in `src/services/` and fully documented
- Hooks are in `src/hooks/`
- UI components are in `src/components/ui/`

### Useful Commands:
```bash
# Type check
npx tsc --noEmit

# Run tests
npm test

# Check git status
git status

# View recent commits
git log --oneline -10
```

---

## 🎉 Progress Tracker

**Phase 1:** ✅ COMPLETE (100%)
**Phase 2:** ⏳ 80% COMPLETE
**Phase 3:** ⏸️ NOT STARTED (0%)
**Phase 4:** ⏸️ NOT STARTED (0%)
**Phase 5:** ⏸️ NOT STARTED (0%)
**Phase 6:** ⏸️ NOT STARTED (0%)
**Phase 7:** ⏸️ NOT STARTED (0%)

**Current Score:** A- (87/100)
**Target Score:** A++ (95+/100)
**Remaining:** +8 points to go!

---

**Good luck with the next session! 🚀**
