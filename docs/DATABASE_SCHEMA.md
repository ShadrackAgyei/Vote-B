# Database Schema Design

## Overview

Vote-B uses **Supabase (PostgreSQL)** for data persistence, replacing localStorage for production-ready scalability and security.

## Entity Relationship Diagram

```
┌─────────────┐
│   schools   │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐      ┌──────────────┐
│   elections     │◄────►│  positions   │
└──────┬──────────┘ 1:N  └──────┬───────┘
       │                         │
       │ 1:N                     │ 1:N
       │                         │
┌──────▼──────────┐      ┌──────▼───────┐
│     voters      │      │  candidates  │
└──────┬──────────┘      └──────────────┘
       │
       │ 1:N
       │
┌──────▼──────────┐
│   vote_records  │
└──────┬──────────┘
       │
       │ 1:N
       │
┌──────▼──────────┐
│verification_codes│
└─────────────────┘
```

## Tables

### 1. `schools`
Represents schools or organizations running elections.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | School/organization name |
| domain | VARCHAR(100) | UNIQUE | Email domain (e.g., "university.edu") |
| allowed_domains | TEXT[] | | List of allowed email domains |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_schools_domain` on `domain`

---

### 2. `elections`
Represents voting elections.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| school_id | UUID | FOREIGN KEY → schools(id) | Associated school |
| title | VARCHAR(255) | NOT NULL | Election title |
| description | TEXT | | Election description |
| start_date | TIMESTAMP | NOT NULL | Election start time |
| end_date | TIMESTAMP | NOT NULL | Election end time |
| is_active | BOOLEAN | DEFAULT false | Active status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_elections_school_id` on `school_id`
- `idx_elections_is_active` on `is_active`
- `idx_elections_dates` on `(start_date, end_date)`

**Constraints:**
- `CHECK (end_date > start_date)`

---

### 3. `positions`
Positions within an election (e.g., "President", "Vice President").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| election_id | UUID | FOREIGN KEY → elections(id) CASCADE | Parent election |
| title | VARCHAR(255) | NOT NULL | Position title |
| description | TEXT | | Position description |
| display_order | INTEGER | DEFAULT 0 | Display order |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_positions_election_id` on `election_id`
- `idx_positions_order` on `(election_id, display_order)`

---

### 4. `candidates`
Candidates running for positions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| position_id | UUID | FOREIGN KEY → positions(id) CASCADE | Parent position |
| name | VARCHAR(255) | NOT NULL | Candidate name |
| description | TEXT | | Candidate bio/description |
| picture_url | TEXT | | Profile picture URL |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_candidates_position_id` on `position_id`

---

### 5. `voters`
Registered voters for elections.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | NOT NULL | Voter email (normalized) |
| election_id | UUID | FOREIGN KEY → elections(id) | Associated election |
| school_id | UUID | FOREIGN KEY → schools(id) | Associated school |
| is_verified | BOOLEAN | DEFAULT false | Email verification status |
| verified_at | TIMESTAMP | | Verification timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration timestamp |

**Indexes:**
- `idx_voters_email_election` on `(email, election_id)` UNIQUE
- `idx_voters_school_id` on `school_id`
- `idx_voters_is_verified` on `is_verified`

**Constraints:**
- `UNIQUE (email, election_id)` - One registration per voter per election

---

### 6. `vote_records`
Individual vote records (blockchain transactions).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| voter_email | VARCHAR(255) | NOT NULL | Voter identifier (normalized) |
| election_id | UUID | FOREIGN KEY → elections(id) | Associated election |
| position_id | UUID | FOREIGN KEY → positions(id) | Position voted for |
| candidate_id | UUID | FOREIGN KEY → candidates(id) | Candidate voted for |
| vote_hash | VARCHAR(64) | NOT NULL | Cryptographic hash of vote |
| block_hash | VARCHAR(64) | | Blockchain block hash |
| block_index | INTEGER | | Block number in chain |
| timestamp | TIMESTAMP | DEFAULT NOW() | Vote timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_votes_voter_position` on `(voter_email, position_id)` UNIQUE
- `idx_votes_election_id` on `election_id`
- `idx_votes_candidate_id` on `candidate_id`
- `idx_votes_block_hash` on `block_hash`

**Constraints:**
- `UNIQUE (voter_email, position_id)` - One vote per voter per position

---

### 7. `verification_codes`
Email verification codes (temporary).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | NOT NULL | Voter email (normalized) |
| election_id | UUID | FOREIGN KEY → elections(id) CASCADE | Associated election |
| code | VARCHAR(6) | NOT NULL | 6-digit verification code |
| expires_at | TIMESTAMP | NOT NULL | Expiration timestamp |
| used | BOOLEAN | DEFAULT false | Whether code was used |
| used_at | TIMESTAMP | | Usage timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_verification_email_election` on `(email, election_id)`
- `idx_verification_expires` on `expires_at`

**Constraints:**
- Auto-delete expired codes (via PostgreSQL trigger or scheduled job)

---

### 8. `blockchain_blocks` (Optional - for full blockchain storage)
Store complete blockchain data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| election_id | UUID | FOREIGN KEY → elections(id) | Associated election |
| block_index | INTEGER | NOT NULL | Block number |
| previous_hash | VARCHAR(64) | NOT NULL | Previous block hash |
| hash | VARCHAR(64) | NOT NULL | Current block hash |
| nonce | INTEGER | NOT NULL | Proof of work nonce |
| timestamp | TIMESTAMP | NOT NULL | Block creation time |
| transactions | JSONB | NOT NULL | Array of transactions |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_blocks_election_index` on `(election_id, block_index)` UNIQUE
- `idx_blocks_hash` on `hash` UNIQUE

---

## Row Level Security (RLS) Policies

Supabase supports Row Level Security for fine-grained access control:

### Public Read Access
- `elections` - Anyone can read active elections
- `positions` - Anyone can read positions for active elections
- `candidates` - Anyone can read candidates
- `vote_records` - Aggregated results only (no individual votes exposed)

### Authenticated Write Access
- `voters` - Users can register themselves
- `vote_records` - Verified voters can create their own votes
- `verification_codes` - System only

### Admin Access
- `schools` - Full CRUD for admins
- `elections` - Full CRUD for admins
- `positions` - Full CRUD for admins
- `candidates` - Full CRUD for admins

---

## Migration Strategy

### Phase 1: Dual Write
1. Keep localStorage as fallback
2. Write to both localStorage and database
3. Read from database, fallback to localStorage

### Phase 2: Database Primary
1. Read from database only
2. Migrate existing localStorage data
3. Remove localStorage writes

### Phase 3: Cleanup
1. Remove all localStorage code
2. Database is single source of truth

---

## Performance Optimizations

1. **Materialized Views** for vote counts:
   ```sql
   CREATE MATERIALIZED VIEW election_results AS
   SELECT
     position_id,
     candidate_id,
     COUNT(*) as vote_count
   FROM vote_records
   GROUP BY position_id, candidate_id;
   ```

2. **Indexes** on frequently queried columns (already defined above)

3. **Connection Pooling** via Supabase built-in pooler

4. **Caching** for election data (Next.js cache or Redis)

---

## Security Considerations

✅ **Email Normalization** - Always lowercase and trim
✅ **One Vote Per Position** - Enforced by unique constraint
✅ **Code Expiration** - 15-minute TTL on verification codes
✅ **RLS Policies** - Fine-grained access control
✅ **Encrypted Connections** - All data encrypted in transit (TLS)
⚠️ **TODO**: Add rate limiting on vote submission
⚠️ **TODO**: Add audit logging for admin actions

---

## Data Retention

- **Verification Codes**: Auto-delete after 24 hours
- **Vote Records**: Permanent (blockchain immutability)
- **Voters**: Keep for audit trail
- **Elections**: Soft delete (mark as deleted, don't remove)

---

## Backup Strategy

Supabase provides:
- **Point-in-time Recovery** (PITR) - 7 days on free tier
- **Daily Backups** - Automatic
- **Manual Snapshots** - Before major changes

---

## Next Steps

1. Create Prisma schema from this design
2. Generate migrations
3. Set up Supabase project
4. Run migrations
5. Implement data access layer
6. Migrate components
7. Test thoroughly
