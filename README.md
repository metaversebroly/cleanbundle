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

- 🔍 **Funding Pattern Analysis** - Detects suspicious funding sources and amount patterns
- ⚡ **Relationship Detection** - Identifies risky on-chain connections between wallets
- 📊 **Health Score System** - Clear rating: 🟢 Clean (90-100%) / 🟡 Medium (60-89%) / 🔴 Risky (0-59%)
- 💡 **Actionable Recommendations** - Specific steps to improve your bundle before launch
- 📈 **Comparative Analysis** - Learn from patterns in successful vs flagged bundles

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
2. Paste your wallet addresses (one per line)
3. Click **Analyze Bundle**
4. Review your bundle health score and recommendations

## 🛠️ Tech Stack

Built with modern, reliable technology:

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 3 with dark mode
- **Blockchain:** @solana/web3.js
- **Data Source:** Solana RPC (Quiknode mainnet endpoint)
- **Deployment:** Vercel (Coming Week 4)
- **Analytics:** In-house algorithms (no third-party dependencies)

**Fully open source.** No black boxes. Every check is transparent and auditable.

## 📁 Project Structure

```
cleanbundle/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Landing page
│   ├── analyze/           # Analyzer route
│   │   └── page.tsx       # Wallet analysis page
│   └── globals.css        # Global styles
├── components/            # React components (future)
│   ├── ui/               # Reusable UI components
│   ├── wallet/           # Wallet-specific components
│   └── layout/           # Layout components
├── lib/                   # Business logic
│   ├── solana/           # Solana Web3.js integration
│   │   └── connection.ts # RPC connection setup
│   └── utils/            # Utility functions
│       └── scoring.ts    # Wallet scoring algorithms
├── types/                 # TypeScript type definitions
│   └── index.ts          # Shared types
├── public/               # Static assets
└── package.json          # Dependencies
```

## 🚀 Development Status

**🏗️ Week 1/4 - MVP Completed**

### Shipped ✅
- [x] Next.js 14 + TypeScript migration
- [x] Project architecture & foundation
- [x] Multi-wallet input interface
- [x] Solana Web3.js integration
- [x] Core UI/UX design system
- [x] Landing page
- [x] Wallet analyzer with scoring
- [x] Open source repository

### In Progress 🔨
- [ ] Advanced funding pattern detection
- [ ] Enhanced red flag identification
- [ ] Improved bundle health scoring

### Coming Soon 📅
- [ ] Multi-wallet relationship graph analysis
- [ ] Detailed recommendations engine
- [ ] Historical comparison with known flagged bundles
- [ ] PDF export & reporting features
- [ ] Public API access

## 📊 Roadmap

**Week 1:** Foundation + UI + TypeScript Migration ✅ **(You are here)**  
**Week 2:** Analysis Engine + Pattern Detection  
**Week 3:** Scoring System + Advanced Features  
**Week 4:** Polish + Deploy + Public Launch

**Post-Launch:** API access, advanced features, community-driven improvements

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
