import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

async function handlePing(target) {
    try {
        const command = new Deno.Command("ping", {
            args: ["-c", "4", target], // Send 4 packets
            stdout: "piped",
            stderr: "piped",
        });
        const { code, stdout, stderr } = await command.output();
        const outputString = new TextDecoder().decode(stdout);
        const errorString = new TextDecoder().decode(stderr);

        if (code !== 0) {
            throw new Error(errorString || outputString || `Ping failed with exit code ${code}`);
        }
        
        // Extract stats from ping output
        const statsMatch = outputString.match(/rtt min\/avg\/max\/mdev = ([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+) ms/);
        const packetMatch = outputString.match(/(\d+) packets transmitted, (\d+) received/);

        return {
            success: true,
            raw_output: outputString,
            stats: statsMatch ? {
                min: parseFloat(statsMatch[1]),
                avg: parseFloat(statsMatch[2]),
                max: parseFloat(statsMatch[3]),
                mdev: parseFloat(statsMatch[4]),
            } : null,
            packets: packetMatch ? {
                transmitted: parseInt(packetMatch[1]),
                received: parseInt(packetMatch[2]),
            } : null,
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function handleDnsLookup(target) {
    try {
        const records = await Deno.resolveDns(target, "A");
        if (records.length === 0) {
            throw new Error('No A records found.');
        }
        return { success: true, records };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function handlePortScan(target) {
    const commonPorts = [21, 22, 25, 80, 110, 143, 443, 3306, 5432, 8080];
    const results = { open: [], closed: [] };

    for (const port of commonPorts) {
        try {
            const conn = await Deno.connect({ hostname: target, port });
            conn.close();
            results.open.push(port);
        } catch (error) {
            // "Connection refused" or timeout means it's likely closed
            results.closed.push(port);
        }
    }
    return { success: true, results };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { test_type, target } = await req.json();
    if (!test_type || !target) {
        return Response.json({ error: 'Test type and target are required' }, { status: 400 });
    }

    let result;
    switch (test_type) {
        case 'ping':
            result = await handlePing(target);
            break;
        case 'dns_lookup':
            result = await handleDnsLookup(target);
            break;
        case 'port_scan':
            result = await handlePortScan(target);
            break;
        default:
            return Response.json({ error: 'Invalid test type' }, { status: 400 });
    }

    return Response.json(result);
});