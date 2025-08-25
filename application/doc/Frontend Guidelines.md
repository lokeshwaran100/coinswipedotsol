# Frontend Guidelines (CoinSwipe on Solana)

## General Principles
- **Lightweight first**: Use **TailwindCSS** + **custom components** (no shadcn, radix-ui, or other heavy UI kits).
- **Consistency**: Stick to a defined color palette, typography, and spacing scale across all pages.
- **Fun but professional**: Playful animations & swipe interactions, but with a clean, trustworthy interface.

---

## Theme & Styling
- **Primary Colors**:  
  - Background: `#0D1117` (black/near-black)  
  - Accent: `#2563EB` (blue, Tailwind `blue-600`)  
  - Secondary: `#1F2937` (gray-800)  
  - Text: White / Light Gray (`gray-200`)  

- **Avoid Neon Colors**: Stick to darker tones with blue highlights for a sleek look.  
- **Animations**: Use **Framer Motion** for smooth card swipes and subtle transitions.  
- **Rounded Corners**: Default `rounded-2xl` for cards, buttons, and inputs.  
- **Shadow**: Soft shadow (`shadow-lg`) for cards to pop against the dark background.

---

## Layout & Navigation
- **Mobile-first** with responsive breakpoints.
- **Navigation**:
  - **Mobile**: Bottom navigation (Trending | Portfolio).  
  - **Desktop**: Top navigation bar.  
- **Pages**:
  - Trending (swipe cards with token info, star for watchlist, copy contract).  
  - Portfolio (holdings + watchlist, simple list view).  

---

## Components
1. **Token Card (Trending)**  
   - Shows token logo, name, symbol, price, contract (copyable).  
   - Swipe right = Buy (default amount).  
   - Star icon = Add to watchlist.  

2. **Portfolio Card**  
   - List of tokens owned with amount & value.  
   - Simple, no charts in MVP.  

3. **Watchlist Card**  
   - Similar to portfolio card but only token metadata + price.  

4. **Buttons**  
   - Primary: Blue background, white text.  
   - Secondary: Transparent with border.  

5. **Inputs**  
   - Minimal, border-bottom style preferred.  
   - Used only where necessary (e.g., changing default trade amount).  

---

## UX Notes
- Minimize clicks: Swiping, starring, or tapping should handle 90% of interactions.  
- Default trade amount = **0.01 SOL** (modifiable only in Portfolio page).  
- Copy contract address = **one-tap copy** with toast feedback.  
- Keep portfolio & watchlist **readable lists**, no heavy charts/graphs in MVP.  
- No hardcoding failed transactions or failed actions to mock functions.
