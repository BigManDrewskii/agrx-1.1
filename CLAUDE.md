# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AGRX Manus 1.0** is a React Native/Expo stock trading application with social features, focused on Greek (ATHEX) stocks. The app supports both native (iOS/Android) and web platforms with a shared codebase.

**Tech Stack:**
- Frontend: React Native 0.81.5, Expo Router 6.0.19, React Query (TanStack Query)
- Styling: Tailwind CSS + NativeWind, Coinbase Design System (CDS Mobile v8.43.0)
- Backend: Node.js/Express, tRPC, Drizzle ORM
- Database: MySQL/TiDB
- Auth: Manus OAuth (platform-specific: cookie on web, bearer token on native)

## Development Commands

### Start Development
```bash
pnpm dev              # Start both frontend (Metro) and backend servers
pnpm dev:metro        # Frontend only (http://localhost:8081)
pnpm dev:server       # Backend only
```

### Type Checking & Linting
```bash
pnpm check            # TypeScript type check (no emit)
pnpm lint             # ESLint
pnpm format           # Prettier
```

### Testing
```bash
pnpm test             # Run all tests with Vitest
pnpm test <pattern>   # Run tests matching a pattern (e.g., `pnpm test stock`)
```

### Database
```bash
pnpm db:push          # Generate and apply Drizzle migrations
```

### Build & Production
```bash
pnpm build            # Bundle server for production
pnpm start            # Run production server (node dist/index.js)
```

### Platform-Specific
```bash
pnpm android          # Run on Android
pnpm ios              # Run on iOS
pnpm qr               # Generate QR code for Expo DevTools
EXPO_PORT=8082 pnpm dev  # Start on custom port (useful for QR codes)
```

## Architecture

### Directory Structure
```
app/                      # Expo Router file-based routing
  (tabs)/                 # Main tab screens (Home, Markets, Trade, Portfolio, Social)
  asset/[id]/             # Asset detail modal
  settings/               # Settings screen
  price-alerts/           # Price alerts screen
  notification-history/   # Notification history
  trade-history/          # Trade history screen
  oauth/callback/         # OAuth callback handler
components/               # Reusable UI components
  ui/                     # Base UI components (CDS wrappers, typography, etc.)
  features/               # Feature-specific components by screen area
constants/                # App constants (theme, typography, oauth, spacing)
hooks/                    # Custom React hooks (useAuth, useColors, useStocks, etc.)
lib/                      # Core libraries and contexts
  _core/                  # Framework-level code (DO NOT MODIFY)
  mock-data.ts            # 135+ Greek stocks with realistic ATHEX data
  demo-context.tsx        # Demo mode state (portfolio, trades, balance)
  watchlist-context.tsx   # User watchlist state
  viewmode-context.tsx    # Simple/Pro view mode
  notification-context.tsx # In-app notifications
  theme-provider.tsx      # Dark/light mode theming
  trpc.ts                 # tRPC client configuration
server/                   # Backend (Express + tRPC)
  _core/                  # Framework-level code (DO NOT MODIFY)
  routers.ts              # Main tRPC router composition
  stockRouter.ts          # Stock data endpoints
  newsRouter.ts           # News endpoints
  notificationRouter.ts    # Notification endpoints
  stockService.ts         # Business logic for stocks
  newsService.ts          # Business logic for news
  db.ts                   # Database queries
  storage.ts              # S3 storage helpers
shared/                   # Shared types and constants between frontend/backend
drizzle/                  # Database schema and migrations
  schema.ts               # Database table definitions
__tests__/                # Frontend integration tests
tests/                    # Backend unit tests
```

### Frontend Architecture

**Routing**: File-based with Expo Router. Main tabs in `app/(tabs)/`, modals in `app/`.

**State Management** (layered in `app/_layout.tsx`):
1. **GestureHandlerRootView** - Gesture handling for Reanimated
2. **DemoProvider** - Demo trading (portfolio, balance, trades)
3. **WatchlistProvider** - User watchlist
4. **ViewModeProvider** - Simple/Pro view toggle
5. **tRPC Provider** - Type-safe API client
6. **QueryClient** - React Query for server state
7. **NotificationProvider** - In-app notifications
8. **ThemeProvider** + **CDSThemeProvider** - Dark/light mode theming (synced with CDS)

**Context Providers**:
- `DemoProvider` (`lib/demo-context.tsx`): Manages demo trading state including holdings, trades, balance. Persists to AsyncStorage.
- `WatchlistProvider` (`lib/watchlist-context.tsx`): User's watchlist of stocks.
- `ViewModeProvider` (`lib/viewmode-context.tsx`): Toggles between Simple and Pro UI modes.

### Backend Architecture

**tRPC Router Structure** (`server/routers.ts`):
```typescript
export const appRouter = router({
  system: systemRouter,        // System endpoints (notifyOwner)
  auth: router({               // Auth endpoints
    me, logout
  }),
  stocks: stockRouter,         // Stock data
  news: newsRouter,           // News feed
  notifications: notificationRouter // Notifications
});

// All API routes must start with /api/ for gateway routing
```

**Adding New Features**:
1. Create router in `server/` (e.g., `myFeatureRouter.ts`)
2. Register in `server/routers.ts`: `myFeature: myFeatureRouter`
3. Use `publicProcedure` for open endpoints, `protectedProcedure` for auth-required
4. Access frontend: `trpc.myFeature.myEndpoint.useQuery()`

**Database Queries**: Add to `server/db.ts`. Schema changes go in `drizzle/schema.ts`, then run `pnpm db:push`.

### Authentication

**Platform Differences**:
- **Native**: Bearer token stored in expo-secure-store
- **Web**: HTTP-only cookie

**Usage**:
```tsx
import { useAuth } from "@/hooks/use-auth";

const { user, isAuthenticated, loading, logout } = useAuth();
```

**Protected Procedures**:
```typescript
import { protectedProcedure } from "./server/_core/trpc";

myEndpoint: protectedProcedure.query(({ ctx }) => {
  // ctx.user is guaranteed to exist
})
```

**Frontend Error Handling** (REQUIRED for protectedProcedure):
```tsx
try {
  await trpc.someProtectedEndpoint.mutate(data);
} catch (error) {
  if (error.data?.code === 'UNAUTHORIZED') {
    router.push('/login');
    return;
  }
  throw error;
}
```

### Mock Data System

**`lib/mock-data.ts`** contains 135+ Greek stocks with realistic ATHEX tickers and prices. This is the fallback when live Yahoo Finance API is unavailable.

**Key Exports**:
- `GREEK_STOCKS`: All available stocks
- `PORTFOLIO_HOLDINGS`: Initial demo portfolio
- `SOCIAL_FEED`, `LEADERBOARD`, `ACHIEVEMENTS`: Social/gamification data

### Testing

**Frontend Tests**: `__tests__/` using Vitest. Run with `pnpm test`.

**Backend Tests**: `tests/` using Vitest. Mock tRPC context with `createMockContext({ userId: 1 })`.

**Test Patterns**:
- BDD-style: `describe()`, `it()`, `expect()`
- Mock external dependencies
- Test happy path + error cases
- Test edge cases (empty, null, boundaries)
- Frontend tests use `http://127.0.0.1:3000/api/trpc` for integration testing

### Type Safety

- **NO `any`, `@ts-ignore`, `@ts-expect-error`** without explicit justification
- Use explicit return types on exported functions
- tRPC provides end-to-end type safety (backend to frontend)
- Run `pnpm check` before committing

### React Hooks Best Practices

**useEffect Guidelines**:
- Prefer derived values over state + effect patterns
- Use `useMemo` for expensive calculations, not `useEffect`
- When reviewing `useEffect` or `useState` for derived values, invoke `react-useeffect` skill

**Custom Hooks** (in `hooks/`):
- `useAuth()` - Authentication state with platform-specific handling
- `useColors()` - Access theme colors with dark/light mode support
- `useStocks()` - Stock data fetching with tRPC
- `useNews()` - News feed data
- `useMarketStatus()` - Market open/closed status

### Styling

**Tailwind + NativeWind**: Use utility classes in `className` prop.
**Theme Colors**: Access via `useColors()` hook from `@/hooks/use-colors`.
**Dark Mode**: Automatic via `ThemeProvider`. Use `colors.surface`, `colors.text`, etc.
**Coinbase Design System**: CDS Mobile v8.43.0 components are wrapped in `components/ui/cds-*.tsx` files. When building mobile UI, prefer using the `cds-mobile-ui` skill for CDS components.

### Component Structure

**UI Components** (`components/ui/`): Reusable, generic components like buttons, typography, charts, and CDS wrappers. These should have no business logic.

**Feature Components** (`components/features/`): Screen-specific components organized by feature area:
- `home/` - Home screen components
- `markets/` - Markets screen components
- `trading/` - Trade screen components
- `portfolio/` - Portfolio screen components
- `social/` - Social screen components

### Platform Considerations

**Web vs Native**:
- Safe areas handled automatically via `SafeAreaProvider`
- Web uses cookie auth, native uses bearer token
- Platform checks: `Platform.OS === 'web'`
- Web-specific safe area injection in `app/_layout.tsx` via `subscribeSafeAreaInsets`

**Tab Bar** (`app/(tabs)/_layout.tsx`):
- 5 tabs: Home, Markets, Trade (floating center button), Portfolio, Social
- Haptic feedback on tab press
- 60pt height + safe area bottom padding
- Floating design with shadow/elevation
- Trade tab has prominent elevated button style

### Common Patterns

**Optimistic Updates** (tRPC + React Query):
```tsx
const mutation = trpc.items.update.useMutation({
  onMutate: async (input) => {
    await utils.items.list.cancel();
    const previous = utils.items.list.getData();
    utils.items.list.setData(undefined, (old) =>
      old?.map((item) => item.id === input.id ? { ...item, ...input } : item)
    );
    return { previous };
  },
  onError: (err, input, context) => {
    utils.items.list.setData(undefined, context?.previous);
  },
  onSettled: () => {
    utils.items.list.invalidate();
  },
});
```

**Calling tRPC from Frontend**:
```tsx
import { trpc } from "@/lib/trpc";

const { data, isLoading } = trpc.stocks.list.useQuery();
const mutation = trpc.stocks.buy.useMutation();
```

### LLM Integration

Preconfigured LLM helpers in `server/_core/llm.ts`. Use from server-side only:

```typescript
import { invokeLLM } from "./server/_core/llm";

const response = await invokeLLM({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello!" }
  ]
});
```

**Structured JSON**:
```typescript
const response = await invokeLLM({
  messages: [...],
  response_format: {
    type: "json_schema",
    json_schema: { name: "...", schema: { ... } }
  }
});
```

### File Storage

Preconfigured S3 helpers in `server/storage.ts`:

```typescript
import { storagePut } from "./server/storage";

const { url } = await storagePut(
  `users/${userId}/avatar.png`,
  fileBuffer,
  "image/png"
);
```

Add random suffixes to file keys to prevent enumeration.

### Key Constants

- `@/constants/const.ts`: Shared constants
- `@/constants/oauth.ts`: OAuth URLs and configuration
- `@/constants/theme.ts`: Theme color definitions (re-exports from `lib/_core/theme.ts`)
- `@/constants/typography.ts`: Font families and sizes
- `@/constants/spacing.ts`: 8px grid spacing system (use `Spacing[4]` for 16px, etc.)

## Important Notes

**Framework Code**: DO NOT modify anything under `server/_core/`, `lib/_core/`, or `shared/_core/` unless extending infrastructure.

**API Routes**: All tRPC routes must start with `/api/` for gateway routing.

**Session Management**: Native uses SecureStore, web uses cookies. Handle both in `useAuth` hook.

**Demo Mode**: The app defaults to demo mode with realistic Greek stock data. This is intentional for testing without API keys.

**Database**: Lazy-loaded connection. Check if DB exists before queries in `server/db.ts`.

**Testing**: All tests must pass before marking work complete. Run `pnpm test` to verify.

**tRPC v11 Transformer Placement**: The `transformer` (superjson) must be inside `httpBatchLink`, not at the root of `createClient`. This is already configured correctly in `lib/trpc.ts` — do not move it.

**CDS Theme Sync**: The app uses both a custom ThemeProvider and CDS's CDSThemeProvider. They are synced in `app/_layout.tsx` via `CDSThemeWrapper` which passes the colorScheme to CDS.

**Server Port Selection**: The backend server (`server/_core/index.ts`) automatically finds an available port starting from 3000, checking up to 20 ports if needed.
