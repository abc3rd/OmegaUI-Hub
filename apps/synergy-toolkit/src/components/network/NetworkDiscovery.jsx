
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Code, Copy, Download, Loader2, Scan } from 'lucide-react';
import { generateScanToken } from '@/functions/generateScanToken';
import { toast } from 'sonner';

const getScannerScript = (functionUrl, token) => `// Save this as scanner.js and run with Deno: deno run --allow-net --allow-run scanner.js
// You can get Deno from https://deno.land

async function getLocalIP() {
    try {
        const tempConn = await Deno.connect({ port: 80, hostname: '8.8.8.8' });
        const localAddr = tempConn.localAddress;
        tempConn.close();
        if (localAddr.transport === 'tcp') {
            return localAddr.hostname;
        }
    } catch (e) {
        console.error("Could not determine local IP. Are you connected to a network?", e.message);
    }
    return null;
}

async function scanSubnet(subnet) {
    console.log(\`Scanning subnet: \${subnet}.0/24...\`);
    const promises = [];
    const liveHosts = [];
    for (let i = 1; i < 255; i++) {
        const ip = \`\${subnet}.\${i}\`;
        const promise = (async () => {
            const command = new Deno.Command('ping', {
                args: Deno.build.os === 'windows' ? ['-n', '1', '-w', '500', ip] : ['-c', '1', '-W', '0.5', ip],
                stdout: 'piped',
                stderr: 'piped',
            });
            const { code } = await command.output();
            if (code === 0) {
                console.log(\`  -> Found device at: \${ip}\`);
                liveHosts.push({ ip_address: ip, hostname: '' }); // Hostname discovery is complex, skipping for now.
            }
        })();
        promises.push(promise);
    }
    await Promise.all(promises);
    return liveHosts;
}

async function main() {
    const token = Deno.args[0];
    if (!token) {
        console.error('Error: Please provide the scan token as the first argument.');
        console.error('Usage: deno run --allow-net --allow-run scanner.js <your_token>');
        return;
    }
    
    const localIp = await getLocalIP();
    if (!localIp) {
        return;
    }
    console.log(\`Your local IP is: \${localIp}\`);
    
    const subnet = localIp.substring(0, localIp.lastIndexOf('.'));
    const discoveredDevices = await scanSubnet(subnet);
    
    if (discoveredDevices.length > 0) {
        console.log(\`\nFound \${discoveredDevices.length} devices. Uploading results...\`);
        try {
            const response = await fetch('${functionUrl}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, devices: discoveredDevices }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Unknown error');
            }
            console.log('Successfully uploaded scan results!');
        } catch (error) {
            console.error('Failed to upload results:', error.message);
        }
    } else {
        console.log('No devices found on your local network.');
    }
}

main();
`;

export default function NetworkDiscovery({ onScanComplete }) {
    const [isLoading, setIsLoading] = useState(false);
    const [scanCommand, setScanCommand] = useState('');
    const [token, setToken] = useState('');

    const handleGenerateCommand = async () => {
        setIsLoading(true);
        try {
            const { data } = await generateScanToken();
            if (data.token) {
                const uploadUrl = `${window.location.origin}/functions/uploadScanResults`;
                setToken(data.token);
                setScanCommand(`deno run --allow-net --allow-run scanner.js ${data.token}`);
                toast.success("Scan command generated. It will expire in 5 minutes.");
            }
        } catch (error) {
            toast.error("Failed to generate scan token.");
        }
        setIsLoading(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.info("Copied to clipboard!");
    }

    const downloadScript = () => {
        const uploadUrl = `${window.location.origin}/functions/uploadScanResults`;
        const scriptContent = getScannerScript(uploadUrl, token);
        const blob = new Blob([scriptContent], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scanner.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return (
        <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Scan className="w-5 h-5 text-cyan-400" />
                    Local Network Discovery
                </CardTitle>
                <CardDescription>
                    Run a local agent to discover devices on your network and populate them here.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2 text-gray-300">Step 1: Generate Scan Command</h3>
                    <Button onClick={handleGenerateCommand} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Code className="w-4 h-4 mr-2" />
                        )}
                        Generate Command
                    </Button>
                </div>

                {scanCommand && (
                    <div className="space-y-4 pt-4 border-t border-gray-800">
                        <div>
                            <h3 className="font-semibold mb-2 text-gray-300">Step 2: Download and Save Scanner Agent</h3>
                            <p className="text-sm text-gray-400 mb-2">Download the script and save it as `scanner.js` in a folder on your computer.</p>
                            <Button variant="outline" onClick={downloadScript} className="border-gray-700 hover:bg-gray-800">
                                <Download className="w-4 h-4 mr-2"/>
                                Download scanner.js
                            </Button>
                             <p className="text-xs text-gray-500 mt-1">Requires <a href="https://deno.land" target="_blank" rel="noopener noreferrer" className="underline">Deno</a> to be installed.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 text-gray-300">Step 3: Run the Scan</h3>
                            <p className="text-sm text-gray-400 mb-2">Open a terminal in the folder where you saved `scanner.js` and run this command:</p>
                            <div className="flex items-center gap-2 bg-gray-950 p-3 rounded-md border border-gray-700 font-mono text-sm">
                                <span className="text-cyan-400 flex-1 overflow-x-auto whitespace-nowrap">{scanCommand}</span>
                                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(scanCommand)}>
                                    <Copy className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2 text-gray-300">Step 4: View Results</h3>
                            <p className="text-sm text-gray-400 mb-2">Once the scan is complete, the discovered devices will appear in the list below. You might need to refresh.</p>
                             <Button variant="outline" onClick={onScanComplete} className="border-gray-700 hover:bg-gray-800">
                                <Code className="w-4 h-4 mr-2" />
                                Refresh Device List
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
