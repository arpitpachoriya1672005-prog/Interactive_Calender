# 🌙 Aura Calendar — Production-Grade Interactive Calendar

A high-performance, visually stunning interactive calendar built with a focus on senior-level engineering principles, modular architecture, and premium UI/UX aesthetics.

![Aura Calendar Preview](https://github.com/arpitpachoriya1672005-prog/Interactive_Calender/blob/main/preview.png?raw=true) 

## 🌟 Key Features

- **🏛 Physical Wall Calendar UI**: Inspired by high-end stationary with industrial binding effects and editorial typography.
- **🎨 Dynamic Seasonal Branding**: 12 unique, hand-crafted themes that shift accent colors and imagery based on the active month.
- **✨ Advanced Range Selection**: Intelligent date range engine supporting forward/backward selection with live hover previews.
- **📝 Persistent Notes Engine**: Local-first notes system powered by `localStorage` with full Date hydration and CRUD capabilities.
- **🎭 Motion Choreography**: High-fidelity transitions including 3D Page-Flips, staggered grid entries, and cinematic image cross-fades.
- **📱 Fully Responsive**: Adaptive layouts designed for everything from ultra-wide desktops to mobile touch interfaces.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) (Utility-first with @theme tokens)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Date Logic**: [date-fns](https://date-fns.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/arpitpachoriya1672005-prog/Interactive_Calender.git
   cd interactive-calendar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📐 Design & Architecture Decisions

### 1. Component-Driven Architecture
The project follows a "Smart-Container, Dumb-Presentational" pattern. The `CalendarContainer` orchestrates the logic via the `useCalendar` hook, while sub-components like `CalendarDay` focus exclusively on rendering and micro-interactions.

### 2. The "Physical" Unit Philosophy
The UI is grouped into a singular unit rather than scattered cards. This mimics a real physical calendar "pendant," creating a more cohesive and meaningful visual center.

### 3. State Synchronization
Notes are stored using a Date-keyed map in `localStorage`. We implemented a hydration pattern to ensure SSR-compatibility and prevent layout shifts during client-side data loading.

### 4. Mathematical Precision
All calendar grid calculations (padding days, leap years, range spans) are extracted into `src/utils/calendar-math.ts`, making the core logic testable and independent of the React lifecycle.

## 📸 Screenshots

| Desktop View | Mobile View |
| :--- | :--- |
| ![Desktop](https://github.com/arpitpachoriya1672005-prog/Interactive_Calender/blob/main/desktop.png?raw=true) | ![Mobile](https://github.com/arpitpachoriya1672005-prog/Interactive_Calender/blob/main/mobile.png?raw=true) |

---

Built with ❤️ by [Arpit](https://github.com/arpitpachoriya1672005-prog)
