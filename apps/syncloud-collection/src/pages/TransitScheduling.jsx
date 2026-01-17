
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TransitRoute } from '@/entities/TransitRoute';
import { TransitAlert } from '@/entities/TransitAlert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Bus, Train, TrainFront, Ship, Star, AlertCircle, Clock, MapPin } from 'lucide-react';

const transitIcons = {
    bus: <Bus className="w-5 h-5" />,
    train: <Train className="w-5 h-5" />,
    subway: <Train className="w-5 h-5" />,
    tram: <TrainFront className="w-5 h-5" />,
    ferry: <Ship className="w-5 h-5" />,
    default: <Bus className="w-5 h-5" />,
};

// Mock function until API is integrated
const getRealTimeUpdates = async ({ routeId }) => {
    console.log(`Fetching real-time data for route ${routeId}...`);
    return new Promise(resolve => setTimeout(() => resolve({
        status: 'On Time',
        nextArrival: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        vehicleId: 'V123',
    }), 1000));
};

const ScheduleModal = ({ route, isOpen, onClose }) => {
  const [selectedDay, setSelectedDay] = useState('weekday');
  const [realTimeData, setRealTimeData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRealTimeData = useCallback(async () => {
    if (!route?.real_time_updates) return;
    
    setLoading(true);
    try {
      const data = await getRealTimeUpdates({ routeId: route.route_id });
      setRealTimeData(data);
    } catch (error) {
      console.error('Failed to load real-time data:', error);
    } finally {
      setLoading(false);
    }
  }, [route?.real_time_updates, route?.route_id]);

  useEffect(() => {
    if (isOpen && route?.real_time_updates) {
      loadRealTimeData();
      const interval = setInterval(loadRealTimeData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, route?.real_time_updates, loadRealTimeData]);

  if (!isOpen || !route) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Schedule for {route.route_name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                {route.real_time_updates && (
                    <Card className="mb-4 bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600"/> Real-Time Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <p>Loading real-time data...</p> : (
                                <div className="flex justify-around">
                                    <p><span className="font-bold">Status:</span> {realTimeData?.status}</p>
                                    <p><span className="font-bold">Next Arrival:</span> {realTimeData ? format(parseISO(realTimeData.nextArrival), 'p') : 'N/A'}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
                <Tabs defaultValue="weekday" onValueChange={setSelectedDay}>
                    <TabsList>
                        <TabsTrigger value="weekday">Weekday</TabsTrigger>
                        <TabsTrigger value="saturday">Saturday</TabsTrigger>
                        <TabsTrigger value="sunday">Sunday</TabsTrigger>
                    </TabsList>
                    <div className="mt-4 max-h-[50vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><MapPin className="w-4 h-4 inline-block mr-1"/> Stop Name</TableHead>
                                    <TableHead><Clock className="w-4 h-4 inline-block mr-1"/> Scheduled Times</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {route.stops?.map(stop => (
                                    <TableRow key={stop.stop_id}>
                                        <TableCell>{stop.stop_name}</TableCell>
                                        <TableCell className="flex flex-wrap gap-2">
                                            {route.schedule?.[selectedDay]?.map(time => (
                                                <Badge key={time} variant="secondary">{time}</Badge>
                                            ))}
                                            {!route.schedule?.[selectedDay] && 'No service'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Tabs>
            </div>
        </DialogContent>
    </Dialog>
  );
};

export default function TransitScheduling() {
    const [routes, setRoutes] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [routesData, alertsData] = await Promise.all([
                    TransitRoute.list(),
                    TransitAlert.filter({ is_active: true }),
                ]);
                setRoutes(routesData);
                setAlerts(alertsData);
            } catch (error) {
                console.error("Failed to load transit data:", error);
                toast.error("Failed to load transit data.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleViewSchedule = (route) => {
        setSelectedRoute(route);
        setIsModalOpen(true);
    };

    const toggleFavorite = async (e, route) => {
        e.stopPropagation();
        try {
            const updatedRoute = await TransitRoute.update(route.id, { is_favorite: !route.is_favorite });
            setRoutes(routes.map(r => r.id === route.id ? updatedRoute : r));
            toast.success(`Route ${route.is_favorite ? 'removed from' : 'added to'} favorites.`);
        } catch (error) {
            toast.error("Failed to update favorite status.");
        }
    };

    const favoriteRoutes = useMemo(() => routes.filter(r => r.is_favorite), [routes]);
    const otherRoutes = useMemo(() => routes.filter(r => !r.is_favorite), [routes]);

    if (loading) return <div className="p-6 text-center">Loading transit schedules...</div>;

    return (
        <div className="p-4 md:p-6 w-full space-y-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold">Transit Scheduling</h1>
                <p className="text-muted-foreground">View live schedules and alerts for public transit.</p>
            </header>

            {alerts.length > 0 && (
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-800"><AlertCircle className="w-5 h-5"/> Active Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {alerts.map(alert => (
                            <div key={alert.id} className="text-sm">
                                <span className="font-bold capitalize">{alert.alert_type}:</span> {alert.description}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
            
            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">All Routes</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites ({favoriteRoutes.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {otherRoutes.map(route => (
                            <Card key={route.id} className="cursor-pointer hover:shadow-md" onClick={() => handleViewSchedule(route)}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            {transitIcons[route.route_type] || transitIcons.default}
                                            <CardTitle>{route.route_name}</CardTitle>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={(e) => toggleFavorite(e, route)}>
                                            <Star className={`w-5 h-5 ${route.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}/>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{route.start_location} to {route.end_location}</p>
                                    {route.real_time_updates && <Badge className="mt-2">Live Updates</Badge>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                 <TabsContent value="favorites">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {favoriteRoutes.map(route => (
                            <Card key={route.id} className="cursor-pointer hover:shadow-md" onClick={() => handleViewSchedule(route)}>
                                <CardHeader>
                                     <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            {transitIcons[route.route_type] || transitIcons.default}
                                            <CardTitle>{route.route_name}</CardTitle>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={(e) => toggleFavorite(e, route)}>
                                            <Star className={`w-5 h-5 ${route.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}/>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                     <p className="text-sm text-muted-foreground">{route.start_location} to {route.end_location}</p>
                                    {route.real_time_updates && <Badge className="mt-2">Live Updates</Badge>}
                                </CardContent>
                            </Card>
                        ))}
                         {favoriteRoutes.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">No favorite routes yet. Click the star on a route to add it here.</p>}
                    </div>
                </TabsContent>
            </Tabs>
            
            <ScheduleModal route={selectedRoute} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
