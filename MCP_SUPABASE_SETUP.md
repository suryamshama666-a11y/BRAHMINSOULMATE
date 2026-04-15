# Supabase MCP Server Setup

## Current Issue
The Supabase MCP server needs the access token as an environment variable, not as a command argument.

## Fix Required

Update your MCP configuration file at:
`C:/Users/ramie/.kiro/settings/mcp.json`

Change the `supabase` section from:
```json
"supabase": {
  "command": "npx",
  "args": [
    "-y",
    "@supabase/mcp-server-supabase@latest",
    "--access-token",
    "sbp_5940f8222a7179250e7e73ece0c8e4f4612f8ea9"
  ],
  "autoApprove": [
    "apply_migration",
    "get_project_url",
    "get_publishable_keys",
    "execute_sql",
    "execute_sql"
  ]
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

## After Updating

1. Save the file
2. The MCP server will automatically reconnect
3. I'll then be able to push the migration to your Supabase project

## Alternative: Manual Migration

If you prefer to do it manually right now:

1. Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/sql/new
2. Copy the entire contents of `SUPABASE_MIGRATION_READY.sql`
3. Paste into the SQL Editor
4. Click "RUN"
5. Wait for "Success" message

Then update your environment files with the actual Supabase credentials from:
https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/settings/api
