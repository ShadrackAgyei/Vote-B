# Supabase Setup Checklist

Follow these steps to set up your Supabase database for Vote-B.

## ✅ Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with GitHub (recommended) or email
4. ✅ Check this box when done: [✅ ]

---

## ✅ Step 2: Create New Project

1. Click **"New Project"** in Supabase dashboard
2. Fill in project details:
   - **Name**: `vote-b` (or your preference)
   - **Database Password**: Click "Generate password" and **SAVE IT SOMEWHERE SAFE**
   - **Region**: Choose closest to your location (e.g., US East, Europe West)
   - **Pricing Plan**: Select "Free"
3. Click **"Create new project"**
4. ⏳ Wait 2-3 minutes for project to initialize
5. ✅ Check this box when project is ready: [ ✅ ]

---

## ✅ Step 3: Get Database Connection Strings

Once your project is ready:

### 3a. Get Connection Pooling URL (for your app)

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **Database** in settings menu
3. Scroll down to **"Connection string"** section
4. Select **"Connection pooling"** tab
5. Make sure **"Mode"** is set to **"Transaction"**
6. Copy the connection string - it looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   
7. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the password you saved in Step 2
8. ✅ Check this box when copied: [✅ ]

### 3b. Get Direct Connection URL (for migrations)

1. In the same **Connection string** section
2. Select **"Session mode"** tab
3. Copy the connection string - it looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
   
4. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your password
5. ✅ Check this box when copied: [ ✅]

---

## ✅ Step 4: Get API Keys

1. Still in **Project Settings**, click **API** in the menu
2. Find **Project URL** - copy it (looks like `https://xxxxx.supabase.co`)
"https://ofkeykcbhwecgecxznql.supabase.co"
3. Find **Project API keys** section
4. Copy the **anon public** key (long string starting with `eyJ...`)
5. ✅ Check this box when copied: [ ✅]

---

## ✅ Step 5: Update .env.local

Open your `.env.local` file and update these values:

```env
# Supabase Database Configuration
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxxx:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**IMPORTANT**:
- Replace ALL `xxxxx` with your actual project reference
- Replace `[PASSWORD]` with your database password
- Add `?pgbouncer=true` at the end of DATABASE_URL (this is important!)

✅ Check this box when .env.local is updated: [ ✅ ]

---

## ✅ Step 6: Run Database Migration

Now let's create the database schema:

```bash
# Push the schema to Supabase
npm run db:push
```

You should see output like:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

✅ Check this box when migration succeeds: [ ]

---

## ✅ Step 7: Verify in Supabase Dashboard

1. Go back to your Supabase project dashboard
2. Click **"Table Editor"** in left sidebar
3. You should see all 8 tables:
   - ✅ schools
   - ✅ elections
   - ✅ positions
   - ✅ candidates
   - ✅ voters
   - ✅ vote_records
   - ✅ verification_codes
   - ✅ blockchain_blocks

✅ Check this box when you see all tables: [ ]

---

## ✅ Step 8: Test Database Connection

Let's test the connection from your app:

```bash
# Start your dev server
npm run dev
```

Check the terminal output. You should see:
```
[Database] Connected successfully
```

If you see this, congratulations! Your database is connected! 🎉

✅ Check this box when connection works: [ ]

---

## 🎉 All Done!

If all checkboxes are marked, your Supabase database is fully set up!

### What's Working Now:
- ✅ PostgreSQL database hosted on Supabase
- ✅ 8 tables with full schema
- ✅ Indexes for performance
- ✅ Connection pooling for scalability
- ✅ Ready for production data

### Next Steps:
1. Migrate Storage layer to use database
2. Update components to read from database
3. Test full app with real database
4. Enable Row Level Security (optional)
5. Set up admin authentication

---

## 🆘 Troubleshooting

### Issue: Migration fails with "Can't reach database server"

**Solution:**
- Check that `DATABASE_URL` in `.env.local` is correct
- Verify password is correct
- Make sure you added `?pgbouncer=true` to DATABASE_URL
- Try using DIRECT_URL instead temporarily

### Issue: "Password authentication failed"

**Solution:**
1. Go to Supabase Project Settings → Database
2. Click "Reset database password"
3. Copy new password
4. Update both DATABASE_URL and DIRECT_URL in `.env.local`
5. Restart dev server

### Issue: Tables don't appear in Supabase

**Solution:**
- Make sure migration ran successfully
- Try running `npm run db:push` again
- Check Supabase project is fully initialized (no loading indicators)

### Issue: Connection timeout

**Solution:**
- Check your internet connection
- Verify Supabase project region is accessible
- Try switching from pooler URL to direct URL temporarily

---

## 📞 Need More Help?

- Re-read: [`docs/SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
- Check Prisma schema: [`prisma/schema.prisma`](../prisma/schema.prisma)
- Validate schema: `npx prisma validate`
- Ask in Supabase Discord: [discord.supabase.com](https://discord.supabase.com)

---

**Ready?** Let's do this! Start with Step 1 and work your way down. Take your time and double-check each step. When you're done, come back and let me know how it went! 🚀
