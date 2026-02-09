# 📱 AGRX MOBILE UX AUDIT REPORT
## Comprehensive UI/UX Analysis & Coinbase Design System Integration

**Date:** February 9, 2026
**Platform:** React Native / Expo (iOS + Android + Web)
**App Version:** Manus 1.0
**Audit Scope:** Full app UI/UX + CDS chart integration

---

## 📊 SUMMARY SCORECARD

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Navigation & Information Architecture** | B+ (84/100) | 5-tab navigation with clear hierarchy, floating trade button |
| **Touch & Interaction Design** | C (68/100) | Good haptics, but spacing violations in swipe-to-confirm |
| **Visual Hierarchy & Layout** | B- (78/100) | Mostly consistent, mixed spacing patterns throughout |
| **Typography & Readability** | B (82/100) | Strong CDS typography adoption, minor contrast issues |
| **State Management & Feedback** | C+ (72/100) | Good skeletons, but inconsistent loading/error states |
| **Onboarding & First-Time UX** | B- (76/100) | Has onboarding, but could be more progressive |
| **Accessibility & Inclusivity** | C (65/100) | Basic labels present, missing screen reader optimization |
| **Performance Perception** | B+ (86/100) | Excellent animations, skeleton screens, haptic feedback |

### **Overall UX Score: B- (76/100)**

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. **Spacing System Violations**
**Location:** `components/ui/swipe-to-confirm.tsx:26`
**Issue:** Uses 2px padding (TRACK_PADDING) and non-grid values (52px, 56px)
**Impact:** Violates 4px/8pt grid system, creates visual inconsistency

**Recommendation:**
```typescript
// BEFORE (violation)
TRACK_PADDING = Spacing[1]; // 4px / 2 = 2px ❌
THUMB_SIZE = Size.button.lg.height; // 52px ❌

// AFTER (fixed)
TRACK_PADDING = Spacing[2]; // 8px ✅
THUMB_SIZE = 48; // 48px (12 * 4) ✅
```

### 2. **Missing Charts on Key Screens**
**Locations:**
- `app/(tabs)/index.tsx` (Home) - No portfolio performance chart
- `app/(tabs)/trade.tsx` - No price history chart when selecting stocks
- `app/asset/[id].tsx` - Using custom PriceChart instead of CDSLineChart

**Impact:** Inconsistent visualization, missing critical financial data
**Fix Priority:** HIGH - Trading app needs charts everywhere

**Recommendation:**
1. Replace custom `PriceChart` in `asset/[id].tsx` with `CDSLineChart`
2. Add `CDSSparkline` to Home portfolio hero section
3. Add `CDSLineChart` to Trade stock selection preview
4. Add `CDSBarChart` to portfolio sector allocation

### 3. **Hardcoded Color Values Instead of Theme**
**Locations:**
- `app/(tabs)/index.tsx:111-112` - `tintColor="rgb(0, 122, 255)"`
- `components/ui/share-card.tsx:68-91` - Entire palette hardcoded
- `components/ui/share-card-modal.tsx:90-192` - Multiple hardcoded colors

**Impact:** Breaks dark mode, inconsistent theming, maintenance nightmare

**Recommendation:**
```typescript
// BEFORE
tintColor="rgb(0, 122, 255)" ❌
backgroundColor="#FFFFFF" ❌

// AFTER
const colors = useColors();
tintColor={colors.primary} ✅
backgroundColor={colors.surface} ✅
```

### 4. **Touch Target Violations**
**Location:** `app/(tabs)/_layout.tsx:65-83` - Floating trade button
**Issue:** Width/height of 48px is acceptable, but positioned 12px from top (MT: -12)
**Impact:** May cause hit test issues, violates safe area expectations

---

## 🟡 HIGH PRIORITY (Fix Before Launch)

### 1. **Inconsistent Button Usage**
**Issue:** Mix of `CDSButton`, `AnimatedPressable`, and custom styled buttons
**Locations:**
- `app/onboarding.tsx` - Custom styled buttons
- `app/asset/[id].tsx:238,261,275,289` - `AnimatedPressable` with custom styles
- `app/price-alerts.tsx` - Custom styled buttons

**Recommendation:** Migrate all buttons to `CDSButton` with consistent variants (primary, secondary, tertiary, destructive)

### 2. **Missing Loading States**
**Locations:**
- `app/(tabs)/social.tsx:71` - No loading skeleton for social feed
- `app/(tabs)/markets.tsx:169` - Basic empty state, could use CDS variant

**Recommendation:** Add `StockListSkeleton` or create `SocialFeedSkeleton` component

### 3. **Inconsistent Padding Values**
**Locations:**
- `app/price-alerts.tsx:277,307` - Mixed `padding: 16` and `padding: 14`
- `components/layouts/empty-state-card.tsx:113` - `padding: 20` (non-grid)
- `components/ui/cds-stepper.tsx:116,118,120` - `padding: 8, 12, 10`

**Recommendation:** Standardize all padding to Spacing tokens:
```typescript
paddingHorizontal: Spacing[4]  // 16px
paddingVertical: Spacing[3]    // 12px
padding: Spacing[4]            // 16px
```

### 4. **Empty State Inconsistencies**
**Locations:**
- `app/(tabs)/social.tsx` - No empty state for "No social activity"
- `app/trade-history.tsx:507` - Basic empty, not using CDSEmptyState
- `app/notification-history.tsx:385` - Could use CDS variant

**Recommendation:** Create `CDSEmptyState` component with illustration + message + CTA pattern

### 5. **Missing Error Boundaries**
**Issue:** No error boundaries around data fetching screens
**Impact:** App crashes show raw React error screens instead of graceful fallback

**Recommendation:** Add error boundary wrapper to `ScreenContainer`

### 6. **Accessibility Gaps**
**Issues:**
- No `accessibilityLabel` on many `AnimatedPressable` components
- Missing `accessibilityRole` declarations
- No `accessibilityHint` for complex interactions (swipe, long-press)
- Chart components lack screen reader descriptions

**Recommendation:**
```typescript
<AnimatedPressable
  onPress={handleTrade}
  accessibilityLabel="Buy stock"
  accessibilityHint="Opens trading interface for selected stock"
  accessibilityRole="button"
/>
```

---

## 🟢 IMPROVEMENTS (Polish Items)

### 1. **Typography Hierarchy Refinement**
**Current:** Good usage of CDS typography (Title1, Subhead, Caption1, etc.)
**Opportunity:** Create semantic text variant for monetary values

```typescript
// Add to typography system
<MonoMoney value={1234.56} currency="EUR" size="lg" />
```

### 2. **Animation Consistency**
**Current:** Mix of Reanimated `FadeIn`, `FadeInDown` with custom spring configs
**Opportunity:** Consolidate to shared animation constants in `lib/animations.ts`

### 3. **Card Pattern Standardization**
**Current:** Mix of card styles across screens
**Recommendation:** Create `CDSCard` component with variants:
```typescript
<CDSCard variant="elevated | outlined | ghost" padding="md | lg">
```

### 4. **Input Field Consistency**
**Locations:** `SearchBarWithClear`, `AmountInput`, price alerts
**Opportunity:** Consolidate to `CDSInput` with unified validation pattern

### 5. **Better Success Feedback**
**Current:** `TradeSuccessScreen` exists but could be more celebratory
**Opportunity:** Add confetti animation (Reanimated particles) for successful trades > €100

---

## 💡 OPPORTUNITIES (Delight Features)

### 1. **Gesture-Based Navigation**
**Opportunity:** Swipe right on asset row to quick-add to watchlist
**Complexity:** Medium
**Impact:** High - power user efficiency

### 2. **Haptic Feedback Expansion**
**Current:** Good haptics on tab bar and button press
**Opportunity:** Add subtle haptic patterns to:
- Scroll snap to top
- Pull-to-refresh completion
- Price change alerts (different intensity for +1%, +5%, +10%)

### 3. **Contextual Tooltips**
**Opportunity:** First-time user tooltips for Pro features:
- "Tap to view detailed chart"
- "Swipe to see more analysis"
- "Long-press for quick actions"

### 4. **Smart Defaults**
**Opportunity:** Remember user's:
- Last selected time period on charts
- Preferred trade amount quick chips
- Simple/Pro mode preference per screen

### 5. **VoiceOver Descriptions for Charts**
**Opportunity:** Generate natural language summaries:
> "Portfolio up 2.3% today. Trending upward over past week with 3 positive days out of 5."

---

## 📱 SCREEN-BY-SCREEN BREAKDOWN

### **Home Screen** (`app/(tabs)/index.tsx`)
**Score:** B (80/100)

**✅ What Works:**
- Clean composition with extracted feature components
- Good use of RefreshControl with proper async handling
- Smart greeting based on time of day
- Well-organized sections (Portfolio, Watchlist, Trending, News)

**🔴 Issues:**
- Missing portfolio performance chart (sparkline exists but not displayed)
- Hardcoded refresh control color instead of theme

**🟡 Issues:**
- Could use skeleton states for individual sections

**Recommendations:**
1. Add `CDSSparkline` to `PortfolioHero` component
2. Replace `tintColor="rgb(0, 122, 255)"` with `colors.primary`
3. Add section-level skeletons for progressive loading

---

### **Markets Screen** (`app/(tabs)/markets.tsx`)
**Score:** B (81/100)

**✅ What Works:**
- Good search functionality
- Loading skeletons present
- Clear empty state

**🟡 Issues:**
- No market index charts (ATHEX, FTSE, etc.)
- Could use sector breakdown visualization

**Recommendations:**
1. Add index performance charts at top using `CDSSparkline`
2. Add sector filter with `CDSCard` chips

---

### **Trade Screen** (`app/(tabs)/trade.tsx`)
**Score:** B+ (85/100)

**✅ What Works:**
- Excellent two-step flow (picker → order sheet)
- Real-time validation with clear error messages
- `SwipeToConfirm` provides good friction for destructive actions
- Trade success celebration with share card

**🔴 Issues:**
- No price history chart when stock is selected
- Uses custom `AnimatedPressable` instead of `CDSButton` for close button

**🟡 Issues:**
- Could show mini sparkline in stock picker rows

**Recommendations:**
1. Add `CDSSparkline` to each stock row in picker
2. Add `CDSLineChart` showing 24h price history in order sheet
3. Migrate close button to `CDSButton` variant="icon"

---

### **Portfolio Screen** (`app/(tabs)/portfolio.tsx`)
**Score:** B- (78/100)

**✅ What Works:**
- Simple/Pro mode variants
- Good use of CDS typography

**🟡 Issues:**
- Custom card styling instead of `CDSCard`
- Sector allocation uses simple bar, could use `CDSBarChart`

**Recommendations:**
1. Replace custom card styles with `CDSCard` component
2. Upgrade sector allocation to `CDSBarChart` with animated bars

---

### **Social Screen** (`app/(tabs)/social.tsx`)
**Score:** C+ (73/100)

**✅ What Works:**
- Social feed concept with posts, comments, likes

**🔴 Issues:**
- **No loading state** for social feed
- **No empty state** for "No activity yet"
- Missing skeleton screens

**🟡 Issues:**
- Hardcoded padding values (`padding: 16` multiple times)

**Recommendations:**
1. Add `SocialFeedSkeleton` component
2. Add `CDSEmptyState` for "No social activity - be the first to post!"
3. Replace hardcoded padding with `Spacing[4]`

---

### **Asset Detail Screen** (`app/asset/[id].tsx`)
**Score:** B+ (86/100)

**✅ What Works:**
- Comprehensive information (price, chart, stats, news, sentiment)
- Good loading skeletons (`ChartSkeleton`, `NewsSkeleton`)
- Excellent sentiment visualization with three-way bar
- AI-powered sentiment from live news
- Proper back navigation and watchlist toggle

**🔴 Issues:**
- **Using custom `PriceChart` component instead of `CDSLineChart`**
- Hardcoded colors in period selector should use theme

**🟡 Issues:**
- Time period buttons use `AnimatedPressable` instead of chip variant

**Recommendations:**
1. **Replace custom `PriceChart` with `CDSLineChart`** (lines 45-99)
2. Use `CDSChip` or `AnimatedPressable` variant="chip" for period selector
3. Add accessibility labels to chart regions

---

### **Settings Screen** (`app/settings.tsx`)
**Score:** B (80/100)

**✅ What Works:**
- Clear settings organization
- Proper dark mode toggle

**🟡 Issues:**
- Custom View styling instead of `CDSCard`
- Could use grouped settings pattern

---

### **Price Alerts Screen** (`app/price-alerts.tsx`)
**Score:** B- (75/100)

**✅ What Works:**
- Alert creation and management
- Good validation feedback

**🔴 Issues:**
- **Hardcoded color `#FFFFFF`** (line 211)

**🟡 Issues:**
- Custom styled buttons instead of `CDSButton`
- Mixed padding values (16 and 14)

**Recommendations:**
1. Replace `color="#FFFFFF"` with `colors.onPrimary` or appropriate theme color
2. Migrate all buttons to `CDSButton`
3. Standardize padding to `Spacing[4]` (16px)

---

## 🔄 USER FLOW ANALYSIS

### **Core Flow: Browse Stock → View Details → Trade**
**Steps:** 4 | **Friction Points:** 1 | **Drop-off Risk:** Low

```
Home/Markets → Asset Detail → Trade → Success
     ✅            ✅           ⚠️        ✅
  (quick)    (comprehensive)  (no chart preview)
```

**Bottleneck:** Trade screen shows no price history before confirming trade
**Recommendation:** Add mini chart preview in trade order sheet

---

### **Flow: Set Price Alert**
**Steps:** 3 | **Friction Points:** 0 | **Drop-off Risk:** Very Low

```
Asset Detail → Alert Modal → Confirm
     ✅           ✅          ✅
```

**What Works:** Modal pattern keeps context, clear confirmation

---

### **Flow: First-Time User Onboarding**
**Steps:** Unknown | **Friction Points:** Unknown | **Drop-off Risk:** Unknown

**Issue:** Onboarding screen exists but flow not fully audited
**Recommendation:** Review onboarding.tsx for progressive disclosure and skip options

---

## 🚀 QUICK WINS (Top 5)

### 1. **Replace Custom PriceChart with CDSLineChart** (30 min)
**File:** `app/asset/[id].tsx:45-99`
**Impact:** Immediate chart consistency, better visual design
**Effort:** Low - Direct component swap

### 2. **Fix Hardcoded Colors to Theme** (1 hour)
**Files:** Multiple (see audit findings)
**Impact:** Fixes dark mode, improves maintainability
**Effort:** Low - Find and replace with `useColors()`

### 3. **Standardize Padding to Spacing Tokens** (2 hours)
**Files:** 10+ files with hardcoded padding
**Impact:** Visual consistency, easier responsive design
**Effort:** Low - Automated find/replace possible

### 4. **Add Loading State to Social Screen** (1 hour)
**File:** `app/(tabs)/social.tsx`
**Impact:** Removes jarring content pop-in
**Effort:** Low - Reuse existing skeleton patterns

### 5. **Migrate Buttons to CDSButton** (3 hours)
**Files:** 5 screens with custom button styles
**Impact:** Consistent interactions, proper haptics
**Effort:** Medium - Test each screen after migration

---

## 📊 COINBASE DESIGN SYSTEM CHART INTEGRATION

### **Current Chart Components**

| Component | File | Status | Usage |
|-----------|------|--------|-------|
| **CDSLineChart** | `components/ui/cds-line-chart.tsx` | ✅ Available | Underutilized |
| **CDSBarChart** | `components/ui/cds-bar-chart.tsx` | ✅ Available | Underutilized |
| **CDSSparkline** | `components/ui/cds-sparkline.tsx` | ✅ Available | Active |
| **Legacy Sparkline** | `components/ui/sparkline.tsx` | ⚠️ Deprecated | Being phased out |

### **Chart Usage by Screen**

| Screen | Current Chart | Recommended | Priority |
|--------|---------------|-------------|----------|
| Home - Portfolio Hero | None (data exists) | `CDSSparkline` | 🔴 HIGH |
| Home - Trending | `CDSSparkline` | ✅ Correct | - |
| Trade - Stock Picker | None | `CDSSparkline` | 🟡 MED |
| Trade - Order Sheet | None | `CDSLineChart` | 🔴 HIGH |
| Asset Detail | Custom `PriceChart` | `CDSLineChart` | 🔴 HIGH |
| Portfolio - Sectors | Simple bar | `CDSBarChart` | 🟡 MED |
| Markets - Indices | None | `CDSSparkline` | 🟢 LOW |

### **Missing Chart Types Needed**

1. **Candlestick Chart** - For intraday trading (Pro feature)
2. **Volume Chart** - Trading volume with price overlay
3. **Area Chart** - Full-size filled area for portfolio performance
4. **Combo Chart** - Line + bar for price + volume

### **Chart Integration Action Items**

1. **Immediate (Week 1):**
   - Replace custom `PriceChart` with `CDSLineChart` in asset detail
   - Add `CDSSparkline` to Trade stock picker rows
   - Add `CDSLineChart` to Trade order sheet

2. **Short-term (Week 2-3):**
   - Add `CDSSparkline` to Home portfolio hero
   - Upgrade portfolio sector allocation to `CDSBarChart`
   - Add index performance sparklines to Markets screen

3. **Long-term (Month 2):**
   - Implement candlestick chart component
   - Create volume chart component
   - Build combo chart for advanced analytics

---

## 🎯 SPACING SYSTEM AUDIT

### **4px/8pt Grid Violations Found**

| File | Line | Violation | Should Be |
|------|------|-----------|-----------|
| `swipe-to-confirm.tsx` | 26 | `2px` | `4px` / `Spacing[1]` |
| `swipe-to-confirm.tsx` | 27 | `52px` | `48px` / `52px` → `48px` |
| `swipe-to-confirm.tsx` | 28 | `56px` | `56px` → `56px` (borderline) |
| `price-alerts.tsx` | 277,307 | `14px` | `12px` / `16px` |
| `empty-state-card.tsx` | 113 | `20px` | `16px` / `24px` |
| `cds-stepper.tsx` | 118 | `10px` | `8px` / `12px` |

### **Recommendation:**
Create ESLint rule to enforce spacing:
```typescript
// .eslintrc.js
{
  rules: {
    'no-hardcoded-spacing': 'error',
    'use-spacing-tokens': 'error'
  }
}
```

---

## ♿ ACCESSIBILITY AUDIT

### **Current State: C (65/100)**

**✅ What Works:**
- Basic `accessibilityLabel` on some buttons
- `accessibilityRole="button"` on interactive elements
- Proper color contrast (most text meets WCAG AA)

**❌ Missing:**
- `accessibilityHint` on complex interactions (swipe, long-press)
- Screen reader descriptions for charts
- `accessibilityState` for disabled/loading states
- Focus management in modals
- Reduced Motion support (animations use hardcoded durations)

**🟡 Partial:**
- Some icons lack labels
- Dynamic content updates not announced
- No focus order management

### **Recommended Actions:**

1. **Add Chart Accessibility:**
```typescript
<CDSLineChart
  accessibilityLabel="Portfolio performance chart"
  accessibilityHint="Shows portfolio value over time. Upward trend indicates growth."
/>
```

2. **Support Reduced Motion:**
```typescript
import { useReducedMotion } from 'react-native-reanimated';

const duration = useReducedMotion() ? 0 : 300;
```

3. **Focus Management in Modals:**
```typescript
<Modal
  onShow={() => Accessibility.setFocusableElements([firstInputRef])}
/>
```

---

## 📈 PERFORMANCE PERCEPTION AUDIT

### **Current State: B+ (86/100)**

**✅ Excellent:**
- Skeleton screens (`StockListSkeleton`, `NewsSkeleton`)
- Optimistic UI updates in trade flow
- Smooth Reanimated transitions
- Haptic feedback on meaningful actions
- Proper async/await patterns (no floating promises)

**🟡 Could Improve:**
- Some fade-in animations could be staggered better
- Image loading could use progressive blur
- Chart rendering could use WebGL for large datasets

---

## 🎨 VISUAL DESIGN AUDIT

### **Color Usage**
- ✅ Strong theme system via `useColors()` hook
- ✅ Proper dark/light mode support
- ❌ Hardcoded colors in share components
- ❌ Hardcoded iOS blue in refresh controls

### **Typography**
- ✅ Excellent CDS typography adoption
- ✅ Consistent font families (Inter system)
- ✅ Proper hierarchy (Title1 → Caption1)
- ✅ Mono fonts for financial data

### **Spacing**
- 🟡 Mixed adherence to 4px grid (see violations above)
- ✅ Good section spacing (24-32px between sections)
- 🟡 Some inconsistent component padding

---

## 🏁 RECOMMENDED IMPLEMENTATION ORDER

### **Phase 1: Critical Fixes (Week 1)**
1. Fix spacing violations in `swipe-to-confirm.tsx`
2. Replace custom `PriceChart` with `CDSLineChart`
3. Fix hardcoded colors to theme
4. Add loading state to social screen

### **Phase 2: High Priority (Week 2-3)**
5. Migrate all buttons to `CDSButton`
6. Standardize padding to spacing tokens
7. Add charts to Trade screen
8. Create consistent empty states

### **Phase 3: Polish (Week 4)**
9. Improve accessibility labels
10. Add skeleton states to remaining screens
11. Consolidate card patterns to `CDSCard`
12. Enhance success feedback animations

### **Phase 4: Delight (Month 2)**
13. Add gesture-based navigation
14. Expand haptic feedback patterns
15. Implement contextual tooltips
16. Add voiceOver chart descriptions

---

## 📋 TESTING CHECKLIST

Before marking any UX work complete, verify:

- [ ] Touch targets ≥44×44pt (iOS) / 48×48dp (Android)
- [ ] All spacing follows 4px grid
- [ ] All colors use theme system (no hardcoded hex)
- [ ] Loading states on all data-fetching screens
- [ ] Empty states with CTAs on all list screens
- [ ] Error states with recovery actions
- [ ] Accessibility labels on all interactive elements
- [ ] Charts work in both light and dark mode
- [ ] Animations respect Reduced Motion setting
- [ ] Haptic feedback on meaningful actions
- [ ] No race conditions in data loading
- [ ] Proper focus management in modals

---

## 📚 REFERENCES

- **Coinbase Design System:** `components/ui/cds-*.tsx`
- **Spacing System:** `constants/theme.ts` → `Spacing` tokens
- **Typography:** `components/ui/cds-typography.tsx`
- **Colors:** `hooks/use-colors.ts`
- **Animations:** `lib/animations.ts`

---

## 📞 NEXT STEPS

1. **Review this report** with product/design team
2. **Prioritize fixes** based on impact vs effort matrix
3. **Create tracking tickets** for each phase
4. **Assign to sprints** following recommended order
5. **Verify with testing checklist** before closing tickets

---

**Report Generated By:** Claude (Sonnet 4.5)
**Audit Method:** Mobile UX Refiner + Design System Generator
**Date:** February 9, 2026
