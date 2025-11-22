# Vote-B 🗳️

A secure, transparent voting platform powered by blockchain technology. Built with a minimalistic Apple design aesthetic.

## Features

- ✅ **Blockchain-Based**: Every vote is recorded immutably on the blockchain
- 🔐 **Secure Wallet System**: Cryptographically secure wallet addresses for each voter
- 🎨 **Apple Design**: Clean, minimalistic interface inspired by Apple's design language
- 📊 **Real-Time Results**: Transparent vote counting with visual results
- 🛡️ **Chain Validation**: Automatic blockchain integrity verification
- 🚫 **One Vote Per Voter**: Prevents duplicate voting

## Technology Stack

- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Custom blockchain implementation with Proof of Work
- **Cryptography**: CryptoJS for hashing and wallet generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ShadrackAgyei/Vote-B.git
cd Vote-B
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
Vote-B/
├── app/                  # Next.js app directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── Header.tsx       # App header with wallet info
│   ├── VotingInterface.tsx  # Voting UI
│   ├── Results.tsx      # Results display
│   └── WalletSetup.tsx  # Wallet creation
├── lib/                 # Core logic
│   ├── blockchain/      # Blockchain implementation
│   │   ├── Block.ts     # Block class
│   │   └── Blockchain.ts # Blockchain class
│   ├── voting/          # Voting system
│   │   └── VotingSystem.ts
│   └── utils/           # Utilities
│       └── wallet.ts    # Wallet management
└── package.json
```

## How It Works

### Blockchain Implementation

- Each vote is recorded as a transaction in a block
- Blocks are linked together using cryptographic hashes
- Proof of Work consensus ensures block validity
- The chain validates its own integrity

### Voting Flow

1. **Wallet Creation**: User creates a secure wallet address
2. **Election Setup**: An election is created with voting options
3. **Voting**: User selects an option and casts their vote
4. **Block Mining**: The vote is added to a block and mined
5. **Results**: Results are calculated from the blockchain

### Security Features

- Each voter can only vote once (checked by wallet address)
- Votes are immutable once recorded on the blockchain
- Cryptographic hashing ensures data integrity
- Chain validation prevents tampering

## Customization

### Creating a New Election

Edit `app/page.tsx` and modify the election creation:

```typescript
votingSystem.createElection(
  'election-id',
  'Election Title',
  'Election description',
  [
    { id: 'option1', label: 'Option 1', description: 'Description' },
    { id: 'option2', label: 'Option 2', description: 'Description' },
  ],
  startDate,
  endDate
);
```

### Adjusting Blockchain Difficulty

Modify the difficulty in `lib/blockchain/Blockchain.ts`:

```typescript
this.difficulty = 2; // Lower = faster mining, higher = more secure
```

## Development

### Build for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Design Philosophy

The app follows Apple's design principles:
- **Simplicity**: Clean, uncluttered interface
- **Clarity**: Clear visual hierarchy and typography
- **Depth**: Subtle shadows and transitions
- **Consistency**: Uniform spacing and component styling

## License

MIT License - see LICENSE file for details

## Author

Shadrack Agyei Nti

---

Built with ❤️ using Next.js and blockchain technology
