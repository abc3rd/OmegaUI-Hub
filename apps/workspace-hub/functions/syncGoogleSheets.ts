import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SPREADSHEET_ID = '1TEbk1yhEUrRAc-a888esSp19wUNRnzLkGBgawEc9-Cc';
const RANGE = 'Sheet1!A:F'; // Adjust range if needed

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Google Sheets API key not configured' }, { status: 500 });
    }

    // Fetch data from Google Sheets
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: 'Failed to fetch Google Sheets data: ' + error }, { status: response.status });
    }

    const data = await response.json();
    const rows = data.values || [];

    if (rows.length < 2) {
      return Response.json({ apps: [], message: 'No data found in sheet' });
    }

    // Parse rows (skip header)
    const apps = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] && row[2]) { // name and url required
        apps.push({
          name: row[0] || '',
          description: row[1] || '',
          url: row[2] || '',
          category: row[3] || 'Tools',
          screenshot_url: row[4] || '',
          status: row[5] || 'active',
          tags: [],
          featured: false,
          views: 0
        });
      }
    }

    return Response.json({ apps, count: apps.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});