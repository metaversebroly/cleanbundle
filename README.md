# 🧪 CleanBundle

> Automated bundle health checker for Solana token launches

**Stop getting flagged. Launch with confidence.**

[![Status](https://img.shields.io/badge/status-MVP%20in%20progress-yellow)](https://github.com/metaversebroly/cleanbundle)
[![Built with](https://img.shields.io/badge/built%20with-React%20%7C%20Solana-purple)](https://github.com/metaversebroly/cleanbundle)
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

## 🚀 Development Status

**🏗️ Week 1/4 - MVP in Active Development**

### Shipped ✅
- [x] Project architecture & foundation
- [x] Multi-wallet input interface
- [x] Solana Web3.js integration
- [x] Core UI/UX design system
- [x] Open source repository

### In Progress 🔨
- [ ] Wallet transaction data fetching (Solana RPC)
- [ ] Funding pattern detection algorithm
- [ ] Red flag identification engine
- [ ] Bundle health scoring system

### Coming Soon 📅
- [ ] Multi-wallet relationship graph analysis
- [ ] Detailed recommendations engine
- [ ] Historical comparison with known flagged bundles
- [ ] PDF export & reporting features
- [ ] Public API access

## 🛠️ Tech Stack

Built with modern, reliable technology:

- **Frontend:** React 18 + TailwindCSS 3
- **Blockchain:** @solana/web3.js
- **Data Source:** Solana RPC (public mainnet endpoint)
- **Deployment:** Vercel (Week 4)
- **Analytics:** In-house algorithms (no third-party dependencies)

**Fully open source.** No black boxes. Every check is transparent and auditable.

## 💪 Why This Project Exists

Built by a Solana dev who understands the launch process from experience.

After seeing too many solid projects fail due to preventable bundle issues, I built the tool I wish existed.

**This is real utility. Not hype.**

Open source. Built in public. Feedback-driven development.

## 📊 Roadmap

**Week 1:** Foundation + UI ✅ **(You are here)**  
**Week 2:** Analysis Engine + Pattern Detection  
**Week 3:** Scoring System + Advanced Features  
**Week 4:** Polish + Deploy + Public Launch

**Post-Launch:** API access, advanced features, community-driven improvements

## 🎯 Target Users

- **Token launchers** preparing bundles for fair launches
- **Dev teams** wanting to validate their wallet setup
- **Launch consultants** checking client bundles before go-live
- **Researchers** analyzing bundle patterns across the Solana ecosystem

## 📬 Follow Development

- **Twitter:** [@metaversebroly](https://twitter.com/metaversebroly) - Daily build updates
- **Issues:** Open an issue for feature requests or bug reports
- **Discussions:** Share your launch experience and bundle strategies

**Launching ~February 2026** | **MVP in 4 weeks**

## ⭐ Support This Project

If you're building on Solana or planning a token launch:

- **Star this repo** to follow development progress
- **Share with other devs** who could benefit
- **Open issues** with feature requests or feedback
- **Contribute** if you want to help build (open to PRs after Week 2)

---

**Built with determination. One commit at a time.** 💪

*This project represents a comeback story. Lost everything. Rebuilding through code and real utility.*
