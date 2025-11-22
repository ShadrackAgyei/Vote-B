# Supabase Setup Guide

This guide walks you through setting up Supabase for Vote-B's production database.

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- **PostgreSQL Database** - Robust relational database
- **Authentication** - Built-in user management
- **Real-time subscriptions** - Live data updates
- **Storage** - File uploads (for candidate pictures)
- **Edge Functions** - Serverless functions
- **Generous free tier** - 500MB database, 2GB bandwidth, 50MB storage

## Step-by-Step Setup

### 1. Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign in with GitHub (recommended) or email

### 2. Create a New Project

1. Click **New Project**
2. Fill in:
   - **Name**: `vote-b` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is perfect to start
3. Click **Create new project**
4. Wait 2-3 minutes for project initialization

### 3. Get Your Database Credentials

Once your project is ready:

#### a) Get Connection Strings

1. Go to **Project Settings** (gear icon in sidebar)
2. Navigate to **Database** section
3. Scroll to **Connection String**
4. Copy both URLs:

**Connection Pooling** (for your app):
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Direct Connection** (for migrations):
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### b) Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **anon public** key: Long string starting with `eyJ...`

### 4. Configure Environment Variables

Update your `.env.local` file:

```env
# Supabase Database Configuration
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

**Important:**
- Replace `[PROJECT-REF]` with your actual project reference
- Replace `[YOUR-PASSWORD]` with your database password
- Don't commit this file to git!

### 5. Run Database Migrations

Once you've added your Supabase credentials:

```bash
# Generate Prisma Client
npx prisma generate

# Create the database schema
npx prisma db push

# Or create a migration (recommended for production)
npx prisma migrate dev --name init
```

This will create all the tables, indexes, and relationships defined in `prisma/schema.prisma`.

### 6. Verify Setup

1. Go to Supabase Dashboard → **Table Editor**
2. You should see all your tables:
   - `schools`
   - `elections`
   - `positions`
   - `candidates`
   - `voters`
   - `vote_records`
   - `verification_codes`
   - `blockchain_blocks`

### 7. Set Up Row Level Security (Optional but Recommended)

Supabase has Row Level Security (RLS) built in. Enable it for production:

1. Go to **Authentication** → **Policies**
2. For each table, create policies:

**Example for `elections` table:**
```sql
-- Allow anyone to read active elections
CREATE POLICY "Public read access for active elections"
ON elections FOR SELECT
USING (is_active = true);

-- Allow admins to manage elections
CREATE POLICY "Admin full access to elections"
ON elections FOR ALL
USING (auth.role() = 'authenticated' AND auth.jwt()->>'role' = 'admin');
```

We'll set up more policies as we implement admin authentication.

## Testing Your Connection

Test the database connection:

```bash
# Start development server
npm run dev

# Check console for database connection
# You should see Prisma connecting to your database
```

## Supabase Studio (Database GUI)

Supabase provides a built-in database GUI:

1. Go to **Table Editor** in Supabase dashboard
2. You can:
   - View/edit data
   - Run SQL queries
   - Export data
   - Monitor performance

## Free Tier Limits

The free tier includes:
- **500 MB database space** - Plenty for thousands of elections
- **2 GB bandwidth/month** - Good for moderate traffic
- **50 MB file storage** - For candidate profile pictures
- **100,000 monthly active users**
- **500 MB database backups**

## Upgrading (When Needed)

When you outgrow the free tier:
- **Pro**: $25/month - 8GB database, 50GB bandwidth
- **Team**: $599/month - Enterprise features
- **Enterprise**: Custom pricing

## Common Issues

### Issue: Connection Timeout

**Solution:** Make sure you're using the pooler URL (`DATABASE_URL`) for your app, not the direct connection URL.

### Issue: Password Authentication Failed

**Solution:**
1. Reset your database password in Project Settings
2. Update both `DATABASE_URL` and `DIRECT_URL` with new password
3. Restart your dev server

### Issue: Prisma Can't Connect

**Solution:**
```bash
# Verify your connection string
npx prisma db pull

# If it works, you'll see your schema
# If not, double-check your DATABASE_URL
```

### Issue: Migrations Fail

**Solution:**
```bash
# Use db push for development
npx prisma db push

# For production, use migrations
npx prisma migrate deploy
```

## Database Backup Strategy

Supabase automatically backs up your database:
- **Daily backups** - Kept for 7 days (free tier)
- **Point-in-time recovery** - Last 7 days (free tier)

To create manual backups:
1. Go to **Database** → **Backups**
2. Click **Create backup**
3. Download the backup file for local storage

## Monitoring & Performance

### Built-in Monitoring

Supabase provides:
- **Database Health** - CPU, memory, disk usage
- **API Analytics** - Request counts, errors
- **Query Performance** - Slow query detection

Access via **Reports** in the dashboard.

### Optimization Tips

1. **Use indexes** - Already defined in our schema
2. **Enable connection pooling** - Use the pooler URL
3. **Monitor query performance** - Check slow queries in Reports
4. **Use prepared statements** - Prisma does this automatically

## Next Steps

After setup:
1. ✅ Database is ready
2. → Migrate `Storage.ts` to use Prisma
3. → Update components to use database
4. → Set up admin authentication with Supabase Auth
5. → Deploy to production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

## Support

- **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
- **Prisma Discord**: [pris.ly/discord](https://pris.ly/discord)
- **GitHub Issues**: File issues in the Vote-B repository
