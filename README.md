# 🧪 CleanBundle

> Automated bundle health checker for Solana token launches

**Stop getting flagged. Launch with confidence.**

[![Status](https://img.shields.io/badge/status-MVP%20in%20progress-yellow)](https://github.com/metaversebroly/cleanbundle)
[![Built with](https://img.shields.io/badge/built%20with-Next.js%2014%20%7C%20TypeScript%20%7C%20Solana-purple)](https://github.com/metaversebroly/cleanbundle)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/metaversebroly/cleanbundle)

## 🎯 The Problem

When bundling wallets for token launches on Solana, suspicious patterns get you flagged instantly by on-chain analysis tools. Your launch dies before it starts.

**Common red flags that kill launches:**
- ❌ All wallets funded from the same source
- ❌ Perfect round amounts (0.5 SOL, 1.0 SOL, 2.0 SOL...)
- ❌ All wallets created on the same day
- ❌ Zero transaction history on bundled wallets
- ❌ Detectable on-chain relationships between wallets

Currently, devs check these patterns **manually**. It's tedious, error-prone, and easy to miss critical issues.

## ✨ The Solution

CleanBundle automatically analyzes your wallet bundle **before launch** and provides:

### 🎯 Core Features

- 🔍 **CEX Funding Detection** - Identifies wallets funded by major exchanges (Binance, Bybit, Coinbase, OKX, Kraken, HTX, Kucoin, CoinEx, ChangeNOW)
- 👤 **Smart Role Recommendation** - Classifies wallets as Dev, Top Holder, Market Maker, Early Supporter, or Sniper
- 📊 **Health Score System** - Clear rating: 🟢 Excellent (80+) / 🟡 Good (60-79) / 🔴 Needs Work (<60)
- 🔗 **Cross-Wallet Pattern Detection** - Detects SOL transfers, shared funding, timing patterns, and suspicious connections
- 🎨 **Interactive Bubble Map** - D3.js visualization showing wallet relationships and on-chain connections
- ⚠️ **Critical Issues Box** - Instant alerts for high-risk patterns with smart removal recommendations
- 💡 **Optimization Plans** - Step-by-step guide to reach target scores (default: 100)
- 📤 **CSV Export** - Export full analysis with recommendations for offline review

Think of it as **pre-flight checks for your token launch.**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/metaversebroly/cleanbundle.git
cd cleanbundle

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

1. Navigate to the **Analyze** page
2. Paste your wallet addresses (one per line, max 10 wallets)
3. Click **Analyze Bundle**
4. Review comprehensive insights:
   - Overall bundle health score and risk level
   - Individual wallet scores with role predictions
   - CEX funding breakdown
   - Pattern detection warnings (connections, timing, amounts)
   - Interactive bubble map visualization
   - Actionable optimization recommendations
5. **Remove risky wallets** directly from the interface
6. **Export results** to CSV for offline analysis

## 📸 Key Features Preview

**Bundle Insights Dashboard:**
- Average score, CEX funding %, average age, risk level
- Role distribution breakdown
- Funding sources visualization

**Pattern Detection:**
- Real-time connection detection
- Hub wallet identification
- Smart removal recommendations

**Interactive Bubble Map:**
- Force-directed graph with wallet relationships
- Color-coded by health (green/yellow/red)
- Click to remove connected wallets
- Shows exact SOL transfer amounts

**Critical Issues Box:**
- Connection warnings with affected wallets
- Young wallet alerts
- Low score notifications
- One-click navigation to bubble map

## 🛠️ Tech Stack

Built with modern, reliable technology:

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 3 with dark mode
- **Animation:** Framer Motion
- **Visualization:** D3.js (force-directed graphs)
- **Blockchain:** @solana/web3.js
- **Data Source:** Solana RPC (QuickNode mainnet endpoint)
- **Deployment:** Vercel (Coming Soon)
- **Analytics:** In-house algorithms (no third-party dependencies)

**Fully open source.** No black boxes. Every check is transparent and auditable.

## 📁 Project Structure

```
cleanbundle/
├── app/                         # Next.js 14 App Router
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Landing page
│   ├── analyze/                # Analyzer route
│   │   └── page.tsx            # Wallet analysis page
│   └── globals.css             # Global styles
├── components/                 # React components
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── GlassCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Toast.tsx
│   ├── wallet/                 # Wallet-specific components
│   │   ├── BubbleMap.tsx       # D3.js visualization
│   │   ├── CriticalIssuesBox.tsx
│   │   ├── InsightsCard.tsx
│   │   ├── PatternWarnings.tsx
│   │   ├── RoleBadge.tsx
│   │   ├── FundingBadge.tsx
│   │   └── WalletTableRow.tsx
│   └── layout/                 # Layout components
│       └── Navigation.tsx
├── lib/                        # Business logic
│   ├── analysis/               # Analysis engines
│   │   ├── fundingDetector.ts  # CEX funding detection
│   │   ├── roleRecommender.ts  # Role classification
│   │   ├── patternDetector.ts  # Cross-wallet patterns
│   │   └── optimizationPlanner.ts # Score improvement plans
│   ├── data/
│   │   └── knownAddresses.ts   # CEX wallet database
│   ├── solana/
│   │   └── connection.ts       # RPC connection setup
│   └── utils/                  # Utility functions
│       ├── scoring.ts          # Health score algorithms
│       ├── export.ts           # CSV export
│       └── validation.ts       # Input validation
├── types/                      # TypeScript type definitions
│   └── index.ts               # Shared types
├── public/                    # Static assets
└── package.json              # Dependencies
```

## 🚀 Development Status

**✅ Core Features - SHIPPED**

### Shipped ✅
- [x] Next.js 14 + TypeScript foundation
- [x] Multi-wallet input interface (max 10 wallets)
- [x] Solana Web3.js integration with QuickNode
- [x] Modern UI/UX with Framer Motion animations
- [x] Landing page with gradient effects
- [x] **Health scoring system** (TXs, age, balance, activity)
- [x] **CEX funding detection** (9 major exchanges)
- [x] **Smart role recommendations** (5 role types)
- [x] **Cross-wallet pattern detection**
  - SOL transfer tracking (including CREATE ACCOUNT)
  - Shared funding source analysis
  - Timing pattern detection
  - Amount pattern analysis
- [x] **Interactive D3.js bubble map**
  - Force-directed graph visualization
  - Wallet connections with SOL amounts
  - Click to remove wallets
  - Zoom and drag functionality
- [x] **Critical issues detection box**
  - Hub wallet identification
  - Young wallet warnings
  - Low score alerts
- [x] **Optimization plan generator**
- [x] **CSV export with recommendations**
- [x] **Connected wallet removal system**
- [x] **Pattern warnings with smart recommendations**

### In Progress 🔨
- [ ] Performance optimization for large bundles
- [ ] Enhanced spam filtering
- [ ] Historical transaction depth (beyond 1000 TXs)

### Coming Soon 📅
- [ ] PDF export with visual reports
- [ ] Custom target scores (currently fixed at 100)
- [ ] Historical comparison with flagged bundles
- [ ] Public API access
- [ ] Multi-bundle comparison
- [ ] Vercel deployment

## 📊 Roadmap

**Week 1:** Foundation + UI + TypeScript Migration ✅  
**Week 2:** Analysis Engine + Pattern Detection ✅  
**Week 3:** Scoring System + Advanced Features ✅ **(You are here)**  
**Week 4:** Polish + Deploy + Public Launch 🔜

### Key Milestones Completed:
- ✅ Smart recommendations system
- ✅ CEX funding detection
- ✅ Cross-wallet pattern analysis
- ✅ Interactive bubble map
- ✅ Critical issues detection
- ✅ CSV export functionality

### Next Up:
- 🔜 Performance optimizations
- 🔜 PDF report generation
- 🔜 Public deployment
- 🔜 API access for partners

**Post-Launch:** Advanced analytics, community features, API marketplace

## 🔥 Features in Detail

### 🕵️ Pattern Detection System
CleanBundle scans for **on-chain relationships** that Axiom, Padre, and other bubble map tools will flag:

- **Cross-Wallet SOL Transfers:** Detects any SOL transfers between wallets in your bundle (including CREATE ACCOUNT transactions)
- **Shared Funding Sources:** Identifies if multiple wallets were funded by the same address (excludes legitimate CEX hot wallets)
- **Timing Patterns:** Flags wallets created or funded within suspicious timeframes (24h, 48h windows)
- **Amount Patterns:** Detects identical funding amounts or round numbers across wallets

**🎨 Bubble Map Visualization:**
- Interactive D3.js force-directed graph
- Wallet size = health score
- Wallet color = risk level (green/yellow/red)
- Connection lines show SOL transfer amounts
- Click any wallet to remove it from bundle
- Synchronized with table view

### 👤 Smart Role Classification
Automatically predicts wallet roles for your next launch:

- **Dev Wallet:** Low balance, few TXs, high risk
- **Top Holder:** High balance, moderate activity
- **Market Maker:** High TX count, consistent activity
- **Early Supporter:** Aged wallet, moderate balance
- **Sniper:** Recent creation, specific patterns

Each prediction includes a confidence score (0-100%) based on wallet characteristics.

### 💰 CEX Funding Detection
Identifies wallets funded by major exchanges:

- Binance, Bybit, Coinbase, OKX, Kraken
- HTX, Kucoin, CoinEx, ChangeNOW
- Includes hot wallet addresses with 100% confidence
- Shows funding distribution across bundle

**Why it matters:** CEX-funded wallets appear more legitimate to on-chain analysts.

### ⚠️ Critical Issues Box
Instant alerts for high-risk patterns:

- **Hub Wallet Detection:** Identifies wallets connected to multiple others (recommends removal)
- **Young Wallets:** Flags average age < 30 days
- **Low Score Alerts:** Warns if >30% of bundle has score < 50
- **Smart Recommendations:** Tells you exactly which wallet to remove

### 📊 Optimization Plans
Step-by-step guide to improve each wallet:

- Increase transaction count
- Age the wallet
- Improve balance distribution
- Fix activity patterns
- Diversify funding sources

**Target Score:** 100 (configurable in future updates)

## 🎯 Target Users

- **Token launchers** preparing bundles for fair launches
- **Dev teams** wanting to validate their wallet setup
- **Launch consultants** checking client bundles before go-live
- **Researchers** analyzing bundle patterns across the Solana ecosystem

## 💪 Why This Project Exists

Built by a Solana dev who understands the launch process from experience.

After seeing too many solid projects fail due to preventable bundle issues, I built the tool I wish existed.

**This is real utility. Not hype.**

Open source. Built in public. Feedback-driven development.

## ⚙️ Known Limitations

**Current constraints (to be addressed in future updates):**

- **Wallet Limit:** Maximum 10 wallets per analysis (performance optimization)
- **Transaction History:** Limited to ~1000 recent transactions per wallet (RPC limitation)
- **Rate Limiting:** QuickNode free tier = 15 req/sec (analysis may take 1-2 minutes for full bundles)
- **Spam Filtering:** Filters transfers < 0.001 SOL to reduce noise
- **Pattern Detection:** May miss very old connections (>1000 TXs ago)

**Workarounds:**
- For large bundles (>10 wallets): analyze in batches
- For old transactions: manual verification on Solscan recommended
- For production use: upgrade to QuickNode paid tier for faster analysis

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📬 Follow Development

- **Twitter:** [@metaversebroly](https://twitter.com/metaversebroly) - Daily build updates
- **Issues:** Open an issue for feature requests or bug reports
- **Discussions:** Share your launch experience and bundle strategies

## 📝 License

MIT License - see LICENSE file for details

---

Built with ❤️ for the Solana community
