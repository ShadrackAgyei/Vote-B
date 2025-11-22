# Vote-B 🗳️

A secure, transparent voting platform powered by blockchain technology. Built with a minimalistic Apple design aesthetic.

## Features

- ✅ **Blockchain-Based**: Every vote is recorded immutably on the blockchain
- 📧 **Email Verification**: Production-ready email verification using Resend
- 👨‍💼 **Admin Dashboard**: Create and manage elections with custom options
- 🎨 **Apple Design**: Clean, minimalistic interface inspired by Apple's design language
- 📊 **Live Results**: Real-time vote tracking visible to everyone
- 🛡️ **Chain Validation**: Automatic blockchain integrity verification
- 🚫 **One Vote Per Position**: Voters can vote once per position in multi-position elections
- 💾 **Local Persistence**: Elections and voter data stored locally (ready for database upgrade)

## Technology Stack

- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Custom blockchain implementation with Proof of Work
- **Cryptography**: CryptoJS for hashing and wallet generation
- **Email Service**: Resend (production-ready email delivery)

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

3. Set up environment variables (optional for development):
```bash
# Copy example env file
cp .env.example .env.local

# Add your Resend API key (optional - works without it in dev mode)
# Get your API key from: https://resend.com/api-keys
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
Vote-B/
├── app/                  # Next.js app directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── app/
│   ├── admin/
│   │   └── page.tsx     # Admin dashboard for election management
│   ├── page.tsx         # Main voting page
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── Header.tsx       # App header with voter info
│   ├── VotingInterface.tsx  # Voting UI
│   ├── Results.tsx      # Results display
│   └── VoterRegistration.tsx  # Email-based voter registration
├── lib/
│   ├── storage/         # Data persistence layer
│   │   └── Storage.ts   # LocalStorage wrapper for elections & voters
│   ├── utils/
│   │   ├── wallet.ts    # Wallet utilities (legacy, can be removed)
│   │   └── email.ts     # Email validation and verification
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

### Admin Dashboard (`/admin`)

1. **Create Elections**: Set election title, description, and voting options
2. **Configure Options**: Add multiple voting options with descriptions
3. **Set Dates**: Define start and end dates for each election
4. **Manage Elections**: Edit, delete, or set active elections
5. **View Statistics**: See registered voter counts per election

### Voter Registration & Voting Flow

1. **Email Registration**: Voters enter their school email address
2. **Email Verification**: Verification code sent to email (check console in demo)
3. **Vote Casting**: Registered voters select an option and cast vote
4. **Block Mining**: Vote is recorded as a blockchain transaction
5. **Results**: Real-time results calculated from blockchain

### Blockchain Implementation

- Each vote is recorded as a transaction in a block
- Blocks are linked together using cryptographic hashes
- Proof of Work consensus ensures block validity
- The chain validates its own integrity
- Email addresses used as voter identifiers

### Security Features

- **Admin Authentication**: Password-protected admin dashboard
- Email-based voter registration with verification
- Each voter can only vote once per election (checked by email)
- Votes are immutable once recorded on the blockchain
- Cryptographic hashing ensures data integrity
- Chain validation prevents tampering
- Voter verification required before voting
- Session-based admin authentication (24-hour sessions)

## Usage

### Admin Access

1. Navigate to `/admin` page
2. Enter admin password (default: `admin123` for development)
3. You'll stay logged in for 24 hours
4. Click "Logout" to end your session

**Important:** Change the default password in production by setting the `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable.

### Creating a New Election

1. Navigate to `/admin` page and log in
2. Click "Create New Election"
3. Fill in:
   - Election Title
   - Description (optional)
   - Voting Options (add at least 2)
   - Start and End Date/Time
4. Click "Create Election"
5. Set the election as "Active" to make it available for voting

### Voter Registration

1. Voters go to the home page (`/`)
2. Enter their school email address
3. Check email (or browser console in demo) for verification code
4. Enter code to complete registration
5. Once verified, they can cast their vote

### Email Service Setup

The app now includes production-ready email integration using Resend:

**Development Mode** (no API key):
- Verification codes are logged to the console
- Codes stored in localStorage for testing
- Full voting functionality works without emails

**Production Mode** (with API key):
- Real emails sent via Resend API
- Professional verification email templates
- Codes expire after 15 minutes

**Setup Instructions:**
1. Sign up at [resend.com](https://resend.com) (free tier: 100 emails/day)
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=onboarding@resend.dev
   ```
4. Restart the server

For detailed setup instructions, see [docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md)

### Admin Password Configuration

For production, set a secure admin password:

1. Create a `.env.local` file in the project root
2. Add: `NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password-here`
3. Restart the development server

**Security Note:** For production deployments, consider implementing server-side authentication instead of client-side password checking.

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
