# CLAUDE.md — Smart Tax BD Admin

## Project Overview
Next.js (App Router) admin dashboard for Smart Tax BD. Manages users, tax filings, payments, orders, files, news, and tax types.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4
- **State / Data Fetching**: Redux Toolkit + RTK Query (via axios base query)
- **UI Components**: shadcn/ui (new-york style) + Radix UI primitives + Lucide icons
- **Forms**: React Hook Form + Zod v4
- **Charts**: Recharts
- **Toasts**: Sonner
- **Package Manager**: pnpm

## Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```
- Backend runs separately on port 5000. Never hardcode this URL; always use `process.env.NEXT_PUBLIC_API_URL`.

## Key Commands
```bash
pnpm dev      # Start development server (port 3000, Turbopack)
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Directory Structure
```
src/
├── app/
│   ├── admin/          # All admin routes (layout + pages)
│   │   ├── page.tsx        # Dashboard
│   │   ├── users/
│   │   ├── orders/[orderId]/
│   │   ├── payments/
│   │   ├── tax-types/
│   │   ├── files/[fileId]/
│   │   ├── news/
│   │   ├── profile/
│   │   └── settings/
│   ├── layout.tsx      # Root layout (ReduxProvider + Toaster)
│   └── globals.css
├── components/
│   ├── ui/             # shadcn/Radix base components (56 components)
│   ├── layouts/        # AdminLayout, ReduxProvider
│   ├── auth/
│   ├── orders/
│   └── files/
├── redux/
│   ├── api/
│   │   ├── baseApi.ts      # RTK Query base with axiosBaseQuery
│   │   ├── auth/authApi.ts
│   │   ├── user/userApi.ts
│   │   ├── order/orderApi.ts
│   │   ├── file/fileApi.ts
│   │   ├── tax-type/taxTypeApi.ts
│   │   ├── payments/ (payments API)
│   │   └── news/newsApi.ts
│   ├── feature/
│   │   └── auth.ts         # Auth slice (isLoggedIn, user, role)
│   ├── store.ts
│   └── hooks.ts            # useAppDispatch, useAppSelector
├── helpers/
│   ├── axios/axiosBaseQuery.ts
│   └── globalErrorHandler.ts
├── hooks/
│   └── use-mobile.ts
├── lib/utils.ts            # cn() helper (clsx + tailwind-merge)
└── types/
    ├── common.ts           # TResponse<T> and shared types
    └── index.ts
```

## Architecture Patterns

### API Slices (RTK Query)
All API calls use `baseApi.injectEndpoints`. Follow this pattern:

```typescript
const entityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAll: builder.query<TResponse<EntityType[]>, void>({
      query: () => ({ url: "/entities", method: "GET" }),
      providesTags: ["entityTag"],
    }),
    create: builder.mutation<TResponse<EntityType>, Partial<EntityType>>({
      query: (data) => ({ url: "/entities", method: "POST", data }),
      invalidatesTags: ["entityTag"],
    }),
  }),
});
```

**Registered tag types** (in `baseApi.ts`): `"files"`, `"orders"`, `"users"`, `"taxTypes"`, `"profile"`, `"payments"`, `"news"`. Add new tags here when adding a new entity.

### Redux Hooks
Always use typed hooks from `src/redux/hooks.ts`:
```typescript
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
```

### Path Aliases
Use `@/` for all imports from `src/`:
```typescript
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

### Forms
Use React Hook Form + Zod resolver pattern:
```typescript
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});
```

### Styling
- Use `cn()` from `@/lib/utils` to merge Tailwind classes.
- Tailwind v4 — no `tailwind.config.ts` needed; configuration via CSS.
- Follow existing component variants using `class-variance-authority` (cva).

### Component Library
- Use shadcn/ui components from `src/components/ui/` for all base UI.
- Do not install new UI libraries without explicit request.
- Icons: Lucide React only.

## Adding a New Admin Page
1. Create route: `src/app/admin/<feature>/page.tsx`
2. Create API slice: `src/redux/api/<feature>/<feature>Api.ts` using `baseApi.injectEndpoints`
3. Register new tag types in `src/redux/api/baseApi.ts` if needed
4. Add navigation link in `src/components/layouts/admin-layout.tsx`

## Code Style Rules
- All components are functional with TypeScript types — no `any` unless unavoidable.
- Keep page components lean; extract logic into custom hooks or separate components.
- Use `TResponse<T>` from `@/types` for all API response types.
- Toasts via `sonner`: `toast.success(...)` / `toast.error(...)`.
- Never use `console.log` in production code.
