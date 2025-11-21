# Shogun Notes

A Google Keep-style notes application built with GunDB and the Shogun ecosystem. This app allows you to create, edit, organize, and sync notes across devices in a decentralized way.

## Features

- **Decentralized Storage** - Notes are stored in GunDB, syncing across all your devices
- **Google Keep-style UI** - Familiar grid-based note layout with color coding
- **Rich Note Features**:
  - Title and content
  - Color coding (12 colors available)
  - Pin/unpin notes
  - Labels/tags
  - Archive functionality
  - Search notes by title, content, or labels
- **Authentication** - Multiple auth methods via Shogun (WebAuthn, Web3, Nostr, ZK-Proof)
- **Theme Support** - Dark and light themes

## Quick Start

### Prerequisites

- Node.js ≥ 18.0.0
- npm or yarn package manager

### Installation

```bash
# Navigate to the project directory
cd shogun-notes

# Install dependencies
yarn install
# or
npm install

# Start development server
yarn dev
# or
npm run dev
```

The app will be available at `http://localhost:8080`

### Production Build

```bash
# Build for production
yarn build
# or
npm run build

# Preview production build
yarn preview
# or
npm run preview
```

## Usage

1. **Authenticate** - Use the Shogun button in the header to authenticate with your preferred method
2. **Create Notes** - Click "New Note" or click on any empty area to start creating notes
3. **Edit Notes** - Click on any note to edit it
4. **Color Notes** - Click the color picker icon in the note to change its color
5. **Pin Notes** - Use the menu (three dots) to pin important notes
6. **Add Labels** - Add labels to notes for better organization
7. **Archive Notes** - Archive notes you don't need to see regularly
8. **Search** - Use the search bar to find notes by title, content, or labels

## Project Structure

```
shogun-notes/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── ThemeToggle.tsx    # Theme switcher component
│   │   ├── NoteCard.tsx           # Individual note card component
│   │   ├── NoteEditor.tsx         # Note editor modal
│   │   ├── NoteGrid.tsx           # Grid layout for notes
│   │   ├── NotesApp.tsx           # Main notes application component
│   │   └── SearchBar.tsx          # Search component
│   ├── hooks/
│   │   └── useNotes.ts            # Custom hook for GunDB notes operations
│   ├── types/
│   │   └── Note.ts                # TypeScript types for notes
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   ├── polyfills.ts               # Node.js polyfills for browser
│   └── index.css                  # Global styles and theme imports
├── public/
│   └── logo.svg                   # App logo
├── index.html                     # HTML template
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **GunDB** - Decentralized database
- **Shogun Core** - Authentication and infrastructure
- **Tailwind CSS + DaisyUI** - Styling
- **Vite** - Build tool and dev server

## Notes Storage

Notes are stored in GunDB in the user's private space and encrypted:
- **Storage Path**: `user().get('notes').get(noteId)`
- **Encryption**: All notes are encrypted using GunDB SEA (Security, Encryption, Authorization) with the user's private key (epriv)
- **Privacy**: Notes are stored in the user's private space, accessible only to the authenticated user
- **Sync**: Each note is synced across all devices where you're logged in
- **Decentralization**: Notes are stored in a decentralized manner across GunDB peers, but remain encrypted and private

## Available Scripts

- `yarn dev` / `npm run dev` - Start development server
- `yarn build` / `npm run build` - Build for production
- `yarn preview` / `npm run preview` - Preview production build
- `yarn lint` / `npm run lint` - Run ESLint

## Browser Support

- Chrome ≥ 60
- Firefox ≥ 60
- Safari ≥ 12
- Edge ≥ 79

## License

MIT

## Resources

- [Shogun Documentation](https://shogun-eco.xyz)
- [Shogun Core](https://github.com/scobru/shogun-core)
- [GunDB Documentation](https://gun.eco)

---

Built with ❤️ by the Shogun community

