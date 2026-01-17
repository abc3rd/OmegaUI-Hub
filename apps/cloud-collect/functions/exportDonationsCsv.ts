import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { year } = await req.json().catch(() => ({}));

        // Fetch donations, optionally filtered by year
        let donations = await base44.entities.Donation.filter({ 
            donorUserId: user.id,
            status: 'completed'
        });

        // Filter by year if specified
        if (year) {
            donations = donations.filter(d => {
                const donationYear = new Date(d.created_date).getFullYear();
                return donationYear === parseInt(year);
            });
        }

        if (!donations || donations.length === 0) {
            return Response.json({ error: 'No donations found' }, { status: 404 });
        }

        // Fetch all profiles for recipient names
        const profileIds = [...new Set(donations.map(d => d.profileId))];
        const allProfiles = await base44.asServiceRole.entities.Profile.list();
        const profileMap = {};
        allProfiles.forEach(p => {
            profileMap[p.id] = p.publicName;
        });

        // Calculate total
        const total = donations.reduce((sum, d) => sum + d.grossAmount, 0);

        // Generate CSV with tax-friendly format
        const headers = ['Date', 'Tax Year', 'Recipient', 'Amount', 'Payment Method', 'Transaction ID', 'Description'];
        const rows = donations.map(d => [
            new Date(d.created_date).toLocaleDateString('en-US'),
            new Date(d.created_date).getFullYear().toString(),
            profileMap[d.profileId] || 'Unknown Recipient',
            d.grossAmount.toFixed(2),
            'Credit/Debit Card',
            d.id,
            d.donorMessage || 'Charitable contribution via Cloud QR'
        ]);

        const csvContent = [
            '# Cloud QR Donation History for Tax Filing',
            `# Generated on: ${new Date().toLocaleDateString('en-US')}`,
            `# Donor: ${user.email}`,
            `# Total Amount: $${total.toFixed(2)}`,
            year ? `# Tax Year: ${year}` : '# All Years',
            '',
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const filename = year 
            ? `cloud-qr-tax-year-${year}.csv`
            : `cloud-qr-donations-all-years.csv`;

        return new Response(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=${filename}`
            }
        });

    } catch (error) {
        console.error('CSV export error:', error);
        return Response.json({ 
            error: 'Failed to export donations',
            details: error.message 
        }, { status: 500 });
    }
});