import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId, data, sheetName = 'Sheet1' } = await req.json();

    if (!spreadsheetId || !data) {
      return Response.json({ error: 'spreadsheetId and data are required' }, { status: 400 });
    }

    // Get Google Sheets access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    // Prepare row data
    const timestamp = new Date().toISOString();
    const rowData = [
      timestamp,
      user.email,
      ...Object.values(data)
    ];

    // Append to Google Sheets
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData]
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Sheets API error: ${error}`);
    }

    const result = await response.json();

    return Response.json({
      success: true,
      updatedRange: result.updates?.updatedRange,
      updatedRows: result.updates?.updatedRows
    });

  } catch (error) {
    console.error('Sync to Sheets error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});