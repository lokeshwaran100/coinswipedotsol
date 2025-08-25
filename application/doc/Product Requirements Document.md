# Product Requirements Document (PRD) – CoinSwipe Solana (MVP)

## 1. Product Vision
CoinSwipe is a **gamified token discovery and trading app** on Solana. Instead of navigating complex DEX interfaces, users can simply **swipe through trending tokens** and instantly trade them with a default amount using **MetaMask Embedded Wallet**.

The goal is to make **token discovery simple, fun, and fast**, especially for retail traders and newcomers who find traditional DeFi apps intimidating.

---

## 2. Why We’re Building This
- **Problem with existing DEXs**: Clunky, data-heavy, and unfriendly for casual users.  
- **Opportunity**: Gamify token discovery + lower entry barriers → create an addictive, fun, and engaging experience.  
- **Why Solana**:  
  - Fast and cheap transactions.  
  - Huge memecoin + retail culture.  
  - Active ecosystem around new tokens (perfect for swipe-style discovery).  
- **Why MetaMask Embedded Wallet**:  
  - No friction (auto wallet creation).  
  - Smooth onboarding for non-crypto-native users.  

---

## 3. Target Users
- **Retail crypto traders** looking for fun/easy ways to discover tokens.  
- **New users** who want exposure to Solana tokens without dealing with wallets or DEX UI complexity.  
- **Degens** who care about fast trading and trend discovery.  

---

## 4. Core Features (MVP Scope)

### A. Trending (Swipe UI)
- Token cards show:  
  - Token logo, name, symbol.  
  - **Contract address** (copy button).  
  - Price + 24h % change.  
  - Liquidity + Volume snapshot.  
- Actions:  
  - **Swipe Right** → Buy default amount.  
  - **Swipe Left** → Skip token.  
  - ⭐ Star icon → Add to watchlist (stored in Supabase).  
  - 📋 Copy → contract address copied instantly.  

### B. Portfolio
- **Wallet balance** (SOL + USD equivalent).  
- **Holdings list**: tokens owned (name, qty, value, PnL).  
- **Watchlist section** (starred tokens from Supabase).  
- **Default trade amount setting**:  
  - Editable.  
  - Default = **0.01 SOL**.  

### C. Wallet Integration
- MetaMask Embedded Wallet for Solana.  
- Auto-creation for new users (no popups).  

---

## 5. Non-Goals (Not in MVP)
- Categories/discover pages.  
- Detailed token analysis pages.  
- Charts beyond a simple sparkline.  
- Leaderboards/social sharing.  
- Notification system.  

---

## 6. App Flow
1. **Onboarding**  
   - User opens app → embedded wallet auto-created.  
   - Lands directly on **Trending page**.  
   - Default trade amount = 0.01 SOL (editable later in Portfolio).  

2. **Trending Page**  
   - Swipe Right = Buy default amount.  
   - Swipe Left = Skip.  
   - ⭐ = Add to watchlist.  
   - 📋 = Copy contract address.  

3. **Portfolio Page**  
   - Wallet balance.  
   - Holdings list.  
   - Watchlist.  
   - Default trade amount editable.  

4. **Navigation**  
   - **Mobile** → Bottom nav: [Trending] [Portfolio].  
   - **Desktop** → Top nav: [Trending] [Portfolio].  

---

## 7. Success Metrics (MVP)
- ✅ Smooth onboarding (wallet created seamlessly).  
- ✅ At least 80% of users complete a trade within first session.  
- ✅ Users add tokens to watchlist and revisit portfolio.  
- ✅ Daily active users retain for 3+ days.  

---

## 8. Technical Considerations
- **Frontend**: React (Next.js or Vite) + Tailwind.  
- **Wallet**: MetaMask Embedded Wallet (Solana integration).  
- **Trading**: Swap is done in the smart contract not to worry.
- **Data**: Token info + price feeds (Source yet to be researched).  
- **Backend**: Supabase (for user watchlist + simple storage).  