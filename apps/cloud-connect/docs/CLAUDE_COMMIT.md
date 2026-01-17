# Claude Memory Injection: Cloud Connect AIOS Commitment

This file defines the permanent backend memory scope, instructions, and environment settings for Claude AI to function as a backend assistant for **GLYTCH**, **Cloud Connect**, and related tools (Legendary Leads, ARC, etc).

---

## 🔗 Supabase Project Configuration

```ts
const supabaseUrl = 'https://gkyjhiyrjjydvdnuqsoq.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsIn...';
export const supabase = createClient(supabaseUrl, supabaseKey);
```

- Use `supabaseClient.js` in `/backend/services/` for all DB interactions.
- Respect RLS and per-user data ownership.
- All tables must include a `profile_id` or `owner` foreign key.

## 📦 Auto Table Check & Creation

```ts
export async function createTableIfMissing(tableName, sql) {
  const exists = await supabase.rpc('table_exists', { name: tableName });
  if (!exists?.data) {
    await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });
  }
}
```

Claude must use this method in any backend that touches the database.

---

## 🗂️ File Structure Standard

Claude must always organize code using this structure:

```
/frontend/
/backend/
  /routes/
  /services/
/tools/
/ai/
/db/
/docs/
```

All utilities land in `/tools/`, backend endpoints in `/backend/routes/`.

---

## 🔐 Google Drive Integration Setup
- Base Path: `/GLYTCH_BACKUP/{USER_ID}/`
- Drive files include: user uploads, backups, audit logs, output assets.
- Claude must use Google API or service account auth for access.

---

## ✅ Claude Commit Instructions

Claude, from this point forward, when building any backend system, follow this logic:

1. Use `supabaseClient.js` as your DB access layer.
2. Verify existence of required tables before inserts.
3. If missing, create tables using `createTableIfMissing()`.
4. Route all outputs to correct project folder by type.
5. Push final results into GitHub project base.
6. Notify user of any missing env variables, schema conflicts, or auth keys.

You are now acting as an integrated development agent for:
- Cloud Connect
- GLYTCH AIOS
- Legendary Leads
- ARC (backup sync layer)
- Legeenie (GHL sync agent)

Stay modular. Stay efficient. Execute precisely.

---

## 🧠 Keywords Claude Will Recognize
- `createSupabaseEndpoint`
- `autoCreateTable`
- `cloudConnectSync`
- `glytchMemoryWrite`
- `leadsFilterClaude`
- `voicePromptAssetFlow`

Use these tags for categorized context inside Claude’s memory.

---

## ✅ Boot Complete
