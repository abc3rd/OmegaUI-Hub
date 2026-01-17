import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { List, Send, Wifi, WifiOff } from "lucide-react";
import { DiscoveredDevice } from '@/entities/DiscoveredDevice';
import { formatDistanceToNow } from "date-fns";
import { toast } from 'sonner';

export default function DiscoveredDevicesList({ onPingDevice, lastScanTimestamp }) {
    const [devices, setDevices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDevices();
    }, [lastScanTimestamp]);

    const loadDevices = async () => {
        setIsLoading(true);
        try {
            // We only load devices for the current user, implicitly handled by the SDK
            const data = await DiscoveredDevice.list("-last_seen");
            setDevices(data);
        } catch (error) {
            toast.error("Could not load discovered devices.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'online':
                return "bg-green-500/20 text-green-400 border-green-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };
    
    return (
        <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <List className="w-5 h-5 text-purple-400" />
                    Discovered Devices
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-transparent">
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-gray-400">IP Address</TableHead>
                            <TableHead className="text-gray-400">Last Seen</TableHead>
                            <TableHead className="text-gray-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <TableRow key={i} className="border-gray-800">
                                    <TableCell><Skeleton className="h-6 w-20 bg-gray-700 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24 bg-gray-700" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28 bg-gray-700" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 bg-gray-700 rounded-md" /></TableCell>
                                </TableRow>
                            ))
                        ) : devices.length === 0 ? (
                             <TableRow className="border-gray-800 hover:bg-transparent">
                                <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                                    No devices discovered yet. Run a local network scan to populate this list.
                                </TableCell>
                            </TableRow>
                        ) : devices.map(device => (
                            <TableRow key={device.id} className="border-gray-800 hover:bg-gray-800/50">
                                <TableCell>
                                    <Badge className={getStatusBadge(device.status)}>
                                        {device.status === 'online' ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                                        {device.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono">{device.ip_address}</TableCell>
                                <TableCell className="text-gray-400">
                                    {formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline" className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-300" onClick={() => onPingDevice(device.ip_address)}>
                                        <Send className="w-3 h-3 mr-2" /> Ping
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}