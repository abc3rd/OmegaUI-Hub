import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { type, data } = await req.json();
        
        // Get Google Sheets access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');
        
        // Get or create spreadsheet ID from environment
        const spreadsheetId = Deno.env.get('GOOGLE_SHEETS_ID');
        
        if (!spreadsheetId) {
            return Response.json({ 
                error: 'Google Sheets ID not configured. Please set GOOGLE_SHEETS_ID in environment variables.' 
            }, { status: 400 });
        }
        
        let range, values;
        
        if (type === 'profile') {
            range = 'Profiles!A:I';
            values = [[
                new Date().toISOString(),
                data.publicName,
                data.story,
                data.goalAmount || 0,
                data.dailyGoal || 0,
                data.location || '',
                data.phoneNumber || '',
                data.publicProfileUrl,
                data.created_by
            ]];
        } else if (type === 'resource') {
            range = 'Resources!A:R';
            values = [[
                new Date().toISOString(),
                data.name,
                data.type || '',
                data.description || '',
                data.address || '',
                data.city || '',
                data.state || '',
                data.latitude,
                data.longitude,
                data.hours || '',
                data.accessNotes || '',
                data.managerName || '',
                data.managerContact || '',
                data.tips || '',
                data.costInfo || '',
                data.isVerified ? 'Yes' : 'No',
                data.upvotes || 0,
                data.downvotes || 0,
                data.created_by
            ]];
        } else {
            return Response.json({ error: 'Invalid type' }, { status: 400 });
        }
        
        // Append to Google Sheets
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: values
                })
            }
        );
        
        if (!response.ok) {
            const error = await response.text();
            console.error('Google Sheets API error:', error);
            return Response.json({ 
                error: 'Failed to sync to Google Sheets',
                details: error
            }, { status: response.status });
        }
        
        const result = await response.json();
        
        return Response.json({ 
            success: true,
            message: 'Data synced to Google Sheets',
            result
        });
        
    } catch (error) {
        console.error('Sync error:', error);
        return Response.json({ 
            error: 'Failed to sync to Google Sheets',
            details: error.message 
        }, { status: 500 });
    }
});