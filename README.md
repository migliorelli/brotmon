# 🎮 Brotmon

Brotmon (B-rotmon) is a turn-based battle game inspired by Pokémon's combat system, featuring Brainrot characters. Built with Next.js and Tailwind CSS.

## ✨ Features

- ⚔️ Turn-based battle system
- 🧠 Brainrot characters from the internet
- 🎭 Character abilities and stats
- 🖥️ Brotdex (Brotmon Codex)
- 🌓 Light/dark theme support

## ☑️ Todo

- ⚡ Optimized performance
- 📱 Mobile-friendly gameplay
- 💾 Account support

## 🚀 Tech Stack

- [Next.js 14](https://nextjs.org/)
- [React 18](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vercel](https://vercel.com/)
- [Supabase](https://supabase.com/)

## 💻 Getting Started

### 🛜 Cloning the repository

1. Clone the repository:

```bash
git clone https://github.com/your-username/brotmon.git
```

2. Install dependencies:

```bash
cd brotmon
yarn
```

3. Start the development server:

```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### ⚡ Running Supabase

1. Install Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

2. Install Supabase CLI:

```bash
yarn add supabase --dev
```

3. Start Supabase services:

```bash
npx supabase start
```

4. Apply migrations and seed the database:

```bash
npx supabase db reset
```

5. Generate TypeScript types from your database schema:

```bash
yarn gen-types
```

The Supabase Studio will be available at [http://localhost:54323](http://localhost:54323)

## 📦 Project Structure

```filetree
src/
  ├── app/           # Application routes and layouts
  │   └── (app)/     # App routes
  │   └── api/       # API routes
  ├── components/    # Reusable components
  │   └── ui/        # Base UI components
  ├── hooks/         # Reusable hooks
  ├── lib/           # Utilities and configurations
  ├── services/      # API services
  └── types/         # Reusable types
supabase/
  ├── migrations/    # Database migrations
  ├── schemas/       # Tables schemas
  └── seeds/         # Seed sql files
```

## 🛠️ Development

- Run `yarn dev` to start the development server
- Run `yarn build` to create a production build
- Run `yarn start` to start the production server

## 📄 License

This project is under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are always welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

---

Made with 💜 and Next.js
