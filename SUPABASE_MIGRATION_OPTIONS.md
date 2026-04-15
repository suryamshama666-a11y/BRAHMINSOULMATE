# Supabase Migration - Two Options

## ⚡ OPTION 1: Quick Manual Migration (5 minutes)

This is the fastest way to get your database set up right now.

### Steps:

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/sql/new

2. **Copy Migration SQL**
   - Open the file: `SUPABASE_MIGRATION_READY.sql` in this project
   - Copy the ENTIRE file (Ctrl+A, Ctrl+C)

3. **Run Migration**
   - Paste into the SQL Editor
   - Click the green "RUN" button
   - Wait for "Success. No rows returned" message

4. **Get Your Credentials**
   - Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/settings/api
   - Copy these values:
     - **Project URL** (looks like: `https://dotpqqfcamimrsdnvzor.supabase.co`)
     - **anon public** key (starts with `eyJ...`)
     - **service_role** key (starts with `eyJ...`)

5. **Update Environment Files**
   
   Update `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_API_URL=http://localhost:3001/api
   VITE_DEV_BYPASS_AUTH=false
   ```

   Update `backend/.env.local`:
   ```env
   VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   PORT=3001
   FRONTEND_URL=http://localhost:8080
   NODE_ENV=development
   ```

6. **Restart Your App**
   ```bash
   # Stop current processes (Ctrl+C in both terminals)
   # Then restart:
   npm run dev        # Frontend
   cd backend && npm run dev  # Backend
   ```

✅ **Done!** Your app will now connect to real Supabase database.

---

## 🔧 OPTION 2: Fix MCP Server (for automated migrations)

If you want to use MCP tools for future migrations, fix the configuration:

### Steps:

1. **Open MCP Config**
   - File: `C:/Users/ramie/.kiro/settings/mcp.json`
   - Open in any text editor

2. **Update Supabase Section**
   
   Change from:
   ```json
   "supabase": {
     "command": "npx",
     "args": [
       "-y",
       "@supabase/mcp-server-supabase@latest",
       "--access-token",
       "sbp_5940f8222a7179250e7e73ece0c8e4f4612f8ea9"
     ],
     ...
   }
   ```

   To:
   ```json
   "supabase": {
     "command": "npx",
     "args": [
       "-y",
       "@supabase/mcp-server-supabase@latest"
     ],
     "env": {
       "SUPABASE_ACCESS_TOKEN": "sbp_5940f8222a7179250e7e73ece0c8e4f4612f8ea9"
     },
     "autoApprove": [
       "apply_migration",
       "get_project_url",
       "get_publishable_keys",
       "execute_sql",
       "list_tables"
     ]
   }
   ```

3. **Save and Reconnect**
   - Save the file
   - The MCP server will auto-reconnect
   - Then I can push migrations via MCP tools

---

## 📋 What Gets Created

The migration creates:

### Tables:
- ✅ **profiles** - User profiles with all fields
- ✅ **messages** - Chat messages
- ✅ **matches** - User matches with compatibility scores
- ✅ **connections** - Connection requests
- ✅ **payments** - Payment records

### Features:
- ✅ Indexes for fast queries
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for auto-updating timestamps
- ✅ Foreign key constraints
- ✅ Payment handling function

---

## 🎯 Recommendation

**Use OPTION 1** (Manual Migration) right now - it's faster and you'll have your database ready in 5 minutes.

You can fix the MCP configuration later for future migrations.
