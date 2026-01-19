# Development Guide

## 🚀 Getting Started

### First Time Setup
```bash
npm install
npm run dev
```

Visit http://localhost:3000

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint checker |

---

## 📁 Project Structure

### `/app` - Next.js App Router
- **`layout.tsx`** - Root layout, metadata, global providers
- **`page.tsx`** - Landing page (/)
- **`globals.css`** - Global Tailwind styles
- **`analyze/page.tsx`** - Wallet analyzer (/analyze)

### `/components` - React Components
Currently empty - ready for refactoring:
- `/ui` - Buttons, Cards, Inputs, etc.
- `/wallet` - WalletCard, WalletTable, etc.
- `/layout` - Header, Footer, Nav

### `/lib` - Business Logic
- **`solana/connection.ts`** - Solana RPC setup
- **`utils/scoring.ts`** - Wallet scoring algorithms

### `/types` - TypeScript Definitions
- **`index.ts`** - Shared interfaces (Wallet, WalletData, etc.)

### `/public` - Static Assets
- Favicon, logos, manifest (automatically served)

---

## 🔧 Key Technologies

### Next.js 14 (App Router)
- File-based routing
- Server Components by default
- Client Components with `'use client'`
- Automatic code splitting

### TypeScript
- Strict mode enabled
- Path aliases: `@/*` → root directory
- Type checking: `npx tsc --noEmit`

### Tailwind CSS
- Dark mode: `class` strategy
- Utility-first CSS
- Custom colors in `tailwind.config.ts`

### Solana Web3.js
- Connection to Quiknode RPC
- Wallet analysis on-chain
- Transaction history fetching

---

## 💡 Common Tasks

### Adding a New Page
1. Create `app/your-route/page.tsx`
2. Export default React component
3. Automatically routed to `/your-route`

Example:
```typescript
// app/dashboard/page.tsx
export default function Dashboard() {
  return <div>Dashboard</div>
}
```

### Adding a New Component
1. Create in `components/ui/YourComponent.tsx`
2. Use TypeScript + proper types
3. Import with `@/components/ui/YourComponent`

Example:
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className="bg-purple-500 px-4 py-2 rounded">
      {children}
    </button>
  )
}
```

### Adding a New Type
1. Add to `types/index.ts`
2. Export the interface
3. Import with `@/types`

Example:
```typescript
// types/index.ts
export interface BundleAnalysis {
  wallets: Wallet[]
  totalScore: number
  recommendations: string[]
}
```

### Using Client-Side Features
Add `'use client'` at the top of the file:
```typescript
'use client'

import { useState } from 'react'

export default function MyComponent() {
  const [count, setCount] = useState(0)
  // ... rest of component
}
```

### Adding API Routes
Create in `app/api/your-route/route.ts`:
```typescript
// app/api/analyze/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  // Your logic here
  return NextResponse.json({ success: true })
}
```

---

## 🎨 Styling Guidelines

### Tailwind Classes
- Use utility classes directly in JSX
- Common patterns:
  - Spacing: `p-4`, `mt-6`, `gap-4`
  - Colors: `bg-gray-800`, `text-white`, `border-purple-500`
  - Layout: `flex`, `grid`, `items-center`
  - Responsive: `md:text-xl`, `lg:grid-cols-3`

### Dark Mode
All styles are dark by default. The app uses:
- Background: `bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900`
- Text: `text-white`, `text-gray-300`, `text-gray-400`
- Accents: `text-purple-400`, `bg-purple-500`

---

## 🔍 Debugging

### TypeScript Errors
```bash
npx tsc --noEmit
```

### Linting Errors
```bash
npm run lint
```

### Build Errors
```bash
npm run build
```

### Check Terminal Output
Look for:
- ✓ Compiled successfully
- ○ Pre-rendered routes
- ƒ Dynamic routes

---

## 📦 Adding Dependencies

### Production Dependency
```bash
npm install package-name
```

### Development Dependency
```bash
npm install -D package-name
```

### Common Additions
```bash
# Forms
npm install react-hook-form zod

# UI Components
npm install @radix-ui/react-dialog

# Data Fetching
npm install swr

# Charts
npm install recharts
```

---

## 🚀 Deployment (Vercel)

### Prerequisites
1. Push code to GitHub
2. Connect Vercel to GitHub repo

### Deploy
1. Import project in Vercel dashboard
2. Configure build settings (auto-detected)
3. Deploy!

**Environment Variables:**
Add any secrets in Vercel dashboard under Settings → Environment Variables

---

## 🧪 Testing (Future)

### Add Testing Libraries
```bash
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

### Add to package.json
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

---

## 📝 Code Style

- Use TypeScript for all new files
- Use functional components (no class components)
- Use arrow functions for components
- Keep components small and focused
- Extract reusable logic to `/lib`
- Use meaningful variable names
- Add comments for complex logic

---

## 🐛 Troubleshooting

### "Module not found"
- Check import paths
- Verify `@/*` alias in `tsconfig.json`
- Restart dev server

### TypeScript errors
- Check `types/index.ts` for missing types
- Use `any` sparingly
- Run `npx tsc --noEmit` for full check

### Tailwind styles not working
- Check `tailwind.config.ts` content paths
- Verify `globals.css` imports Tailwind
- Restart dev server

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
```

---

## 📚 Resources

- **Next.js Docs:** https://nextjs.org/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Solana Web3.js:** https://solana-labs.github.io/solana-web3.js/

---

**Happy coding! 🚀**
