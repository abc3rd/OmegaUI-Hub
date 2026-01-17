import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { action, ...params } = await req.json();

        // Get API configuration from environment
        const TRANSIT_API_KEY = Deno.env.get('TRANSIT_API_KEY');
        const TRANSIT_API_BASE_URL = Deno.env.get('TRANSIT_API_BASE_URL') || 'https://api.example-transit.com';

        if (!TRANSIT_API_KEY) {
            return new Response(JSON.stringify({ 
                error: 'Transit API key not configured. Please set TRANSIT_API_KEY in environment variables.' 
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Common headers for transit API calls
        const apiHeaders = {
            'Authorization': `Bearer ${TRANSIT_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        let response;

        switch (action) {
            case 'searchRoutes':
                // Search for transit routes between two locations
                response = await fetch(`${TRANSIT_API_BASE_URL}/routes/search`, {
                    method: 'POST',
                    headers: apiHeaders,
                    body: JSON.stringify({
                        origin: params.from,
                        destination: params.to,
                        transport_types: params.routeType ? [params.routeType] : undefined,
                        departure_time: params.departureTime || 'now',
                        max_results: 20
                    })
                });
                break;

            case 'getRealTimeUpdates':
                // Get real-time updates for a specific route
                response = await fetch(`${TRANSIT_API_BASE_URL}/routes/${params.routeId}/realtime`, {
                    headers: apiHeaders
                });
                break;

            case 'getRouteDetails':
                // Get detailed information about a specific route
                response = await fetch(`${TRANSIT_API_BASE_URL}/routes/${params.routeId}`, {
                    headers: apiHeaders
                });
                break;

            case 'getStopInformation':
                // Get information about a specific stop
                response = await fetch(`${TRANSIT_API_BASE_URL}/stops/${params.stopId}`, {
                    headers: apiHeaders
                });
                break;

            case 'getServiceAlerts':
                // Get active service alerts
                response = await fetch(`${TRANSIT_API_BASE_URL}/alerts`, {
                    headers: apiHeaders
                });
                break;

            case 'getNearbyStops':
                // Find stops near a location
                response = await fetch(`${TRANSIT_API_BASE_URL}/stops/nearby?lat=${params.latitude}&lng=${params.longitude}&radius=${params.radius || 1000}`, {
                    headers: apiHeaders
                });
                break;

            default:
                return new Response(JSON.stringify({ error: 'Invalid action' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Transit API error: ${response.status} ${response.statusText}`, errorText);
            
            return new Response(JSON.stringify({ 
                error: 'Transit API request failed',
                details: errorText,
                status: response.status 
            }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await response.json();

        // Transform the API response to match our expected format
        let transformedData = data;

        if (action === 'searchRoutes') {
            // Transform search results to match TransitRoute entity
            transformedData = {
                routes: data.routes?.map(route => ({
                    route_name: route.name || route.short_name || `Route ${route.id}`,
                    route_id: route.id,
                    route_type: route.type || 'bus',
                    agency_name: route.agency?.name || 'Transit Agency',
                    start_location: route.origin?.name || params.from,
                    end_location: route.destination?.name || params.to,
                    stops: route.stops?.map(stop => ({
                        stop_id: stop.id,
                        stop_name: stop.name,
                        latitude: stop.location?.lat,
                        longitude: stop.location?.lng,
                        scheduled_times: stop.departure_times || []
                    })) || [],
                    schedule: route.schedule || {},
                    real_time_updates: route.realtime_enabled || false
                })) || []
            };
        }

        return new Response(JSON.stringify(transformedData), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Transit API function error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});