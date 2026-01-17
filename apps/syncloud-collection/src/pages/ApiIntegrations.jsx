import React, { useState, useEffect } from 'react';
import { ApiIntegration } from '@/entities/ApiIntegration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Plug, KeyRound, Server, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const ApiEndpointForm = ({ endpoint, onSave, onCancel }) => {
  const [data, setData] = useState(endpoint || { id: uuidv4(), name: '', path: '', method: 'GET', description: '', headers: [], params: [], body_template: '' });

  const handleSave = () => {
    if (!data.name || !data.path) {
      toast.error("Endpoint Name and Path are required.");
      return;
    }
    onSave(data);
  };
  
  const handleKeyValueChange = (type, index, field, value) => {
    const newItems = [...(data[type] || [])];
    newItems[index][field] = value;
    setData(prev => ({...prev, [type]: newItems}));
  };
  
  const addKeyValue = (type) => {
    setData(prev => ({...prev, [type]: [...(prev[type] || []), {key: '', value: ''}]}));
  }
  
  const removeKeyValue = (type, index) => {
    setData(prev => ({...prev, [type]: data[type].filter((_, i) => i !== index)}));
  }

  return (
    <div className="space-y-4 p-1">
      <h3 className="font-semibold text-lg border-b pb-2">Endpoint Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="endpoint-name">Endpoint Name</Label>
          <Input id="endpoint-name" value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="e.g., Get Current Weather" />
        </div>
        <div>
          <Label htmlFor="endpoint-method">HTTP Method</Label>
          <Select value={data.method} onValueChange={value => setData({...data, method: value})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="endpoint-path">Path</Label>
        <Input id="endpoint-path" value={data.path} onChange={e => setData({...data, path: e.target.value})} placeholder="/weather" />
        <p className="text-xs text-muted-foreground mt-1">Relative to base URL. Use {'{param}'} for path variables.</p>
      </div>
       <div>
        <Label htmlFor="endpoint-description">Description</Label>
        <Textarea id="endpoint-description" value={data.description} onChange={e => setData({...data, description: e.target.value})} placeholder="Fetches weather data for a city." className="h-20" />
      </div>
      
      <div>
        <Label>Query Parameters</Label>
        {data.params?.map((p, i) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input placeholder="Key" value={p.key} onChange={e => handleKeyValueChange('params', i, 'key', e.target.value)} />
            <Input placeholder="Value (template)" value={p.value} onChange={e => handleKeyValueChange('params', i, 'value', e.target.value)} />
            <Button size="icon" variant="ghost" onClick={() => removeKeyValue('params', i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addKeyValue('params')}>Add Param</Button>
      </div>

      <div>
        <Label>Headers</Label>
        {data.headers?.map((h, i) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input placeholder="Key" value={h.key} onChange={e => handleKeyValueChange('headers', i, 'key', e.target.value)} />
            <Input placeholder="Value" value={h.value} onChange={e => handleKeyValueChange('headers', i, 'value', e.target.value)} />
            <Button size="icon" variant="ghost" onClick={() => removeKeyValue('headers', i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addKeyValue('headers')}>Add Header</Button>
      </div>
      
      <div>
        <Label>Body Template (JSON)</Label>
        <Textarea value={data.body_template} onChange={e => setData({...data, body_template: e.target.value})} className="font-mono h-24" placeholder={'{\n  "key": "{value}"\n}'} />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Endpoint</Button>
      </div>
    </div>
  );
}

const IntegrationForm = ({ integration, onSave, onCancel }) => {
  const [data, setData] = useState(integration || { name: '', base_url: '', auth_type: 'none', auth_config: {}, endpoints: [] });
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [isEndpointFormVisible, setIsEndpointFormVisible] = useState(false);

  const handleSave = () => {
    if (!data.name || !data.base_url) {
      toast.error("Integration Name and Base URL are required.");
      return;
    }
    onSave(data);
  };
  
  const handleEndpointSave = (endpointData) => {
    const existingIndex = data.endpoints.findIndex(e => e.id === endpointData.id);
    let newEndpoints;
    if (existingIndex > -1) {
      newEndpoints = [...data.endpoints];
      newEndpoints[existingIndex] = endpointData;
    } else {
      newEndpoints = [...data.endpoints, endpointData];
    }
    setData(prev => ({...prev, endpoints: newEndpoints}));
    setEditingEndpoint(null);
    setIsEndpointFormVisible(false);
  };
  
  const handleEditEndpoint = (endpoint) => {
    setEditingEndpoint(endpoint);
    setIsEndpointFormVisible(true);
  };
  
  const handleDeleteEndpoint = (endpointId) => {
    setData(prev => ({...prev, endpoints: prev.endpoints.filter(e => e.id !== endpointId)}));
  };

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{integration ? 'Edit' : 'Create'} API Integration</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 max-h-[80vh] overflow-y-auto p-4">
        <div>
          <Label htmlFor="integration-name">Integration Name</Label>
          <Input id="integration-name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="e.g., OpenWeatherMap API" />
        </div>
        <div>
          <Label htmlFor="base-url">Base URL</Label>
          <Input id="base-url" value={data.base_url} onChange={e => setData({ ...data, base_url: e.target.value })} placeholder="https://api.example.com/v1" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={data.description} onChange={e => setData({ ...data, description: e.target.value })} placeholder="Briefly describe what this API does." className="h-20" />
        </div>
        
        <div className="border p-4 rounded-md space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><KeyRound className="w-5 h-5"/> Authentication</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3 rounded-r-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">Important Security Note</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">Never paste your API key or token directly. Add it to the app's Secrets manager, then enter the **name** of the secret here.</p>
              </div>
            </div>
          </div>
          
          <Label htmlFor="auth-type">Authentication Type</Label>
          <Select value={data.auth_type} onValueChange={value => setData({ ...data, auth_type: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="bearer_token">Bearer Token</SelectItem>
              <SelectItem value="api_key_header">API Key (Header)</SelectItem>
            </SelectContent>
          </Select>

          {data.auth_type !== 'none' && (
            <div className="space-y-2">
              <div>
                <Label>Secret Name *</Label>
                <Input value={data.auth_config?.secret_name || ''} onChange={e => setData({...data, auth_config: {...data.auth_config, secret_name: e.target.value}})} placeholder="MY_API_SECRET_NAME" />
              </div>
              {data.auth_type === 'api_key_header' && (
                <div>
                  <Label>Header Name *</Label>
                  <Input value={data.auth_config?.header_name || ''} onChange={e => setData({...data, auth_config: {...data.auth_config, header_name: e.target.value}})} placeholder="X-API-Key" />
                </div>
              )}
               {data.auth_type === 'bearer_token' && (
                 <p className="text-xs text-muted-foreground">The 'Authorization' header and 'Bearer ' prefix will be added automatically.</p>
               )}
            </div>
          )}
        </div>
        
        <div className="border p-4 rounded-md space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><Server className="w-5 h-5" /> Endpoints</h3>
            {data.endpoints?.map(ep => (
              <div key={ep.id} className="flex justify-between items-center p-2 border rounded-md">
                <div>
                  <p className="font-medium">{ep.name}</p>
                  <p className="text-sm text-muted-foreground"><span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{ep.method}</span> {ep.path}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEditEndpoint(ep)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteEndpoint(ep.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {isEndpointFormVisible ? (
              <ApiEndpointForm 
                endpoint={editingEndpoint} 
                onSave={handleEndpointSave} 
                onCancel={() => { setIsEndpointFormVisible(false); setEditingEndpoint(null); }} 
              />
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setIsEndpointFormVisible(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Endpoint
              </Button>
            )}
        </div>

      </div>
      <DialogFooter className="p-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Integration</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default function ApiIntegrations() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const data = await ApiIntegration.list('-created_date');
      setIntegrations(data);
    } catch (error) {
      console.error("Error loading integrations:", error);
      toast.error("Failed to load API integrations.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSave = async (data) => {
    try {
      if (editingIntegration) {
        await ApiIntegration.update(editingIntegration.id, data);
        toast.success("Integration updated!");
      } else {
        await ApiIntegration.create(data);
        toast.success("Integration created!");
      }
      setIsFormOpen(false);
      setEditingIntegration(null);
      loadIntegrations();
    } catch (error) {
      console.error("Failed to save integration:", error);
      toast.error("Could not save integration.");
    }
  };
  
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this integration and all its endpoints?")) {
      try {
        await ApiIntegration.delete(id);
        toast.success("Integration deleted.");
        loadIntegrations();
      } catch (error) {
        toast.error("Failed to delete integration.");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Plug className="w-7 h-7 text-primary" />
          API Integrations
        </h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingIntegration(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Integration
            </Button>
          </DialogTrigger>
          <IntegrationForm 
            integration={editingIntegration}
            onSave={handleFormSave} 
            onCancel={() => { setIsFormOpen(false); setEditingIntegration(null); }} 
          />
        </Dialog>
      </div>

      {loading ? (
        <p>Loading integrations...</p>
      ) : integrations.length === 0 ? (
        <Card className="text-center p-12">
          <CardTitle>No API Integrations Found</CardTitle>
          <CardContent className="mt-4">
            <p className="text-muted-foreground mb-4">
              Get started by connecting your first external API.
            </p>
            <Button onClick={() => { setEditingIntegration(null); setIsFormOpen(true); }}>
              Create Your First Integration
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map(integration => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{integration.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                     <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingIntegration(integration); setIsFormOpen(true); }}>
                            <Edit className="w-4 h-4" />
                        </Button>
                         <Button size="icon" variant="ghost" onClick={() => handleDelete(integration.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-mono bg-muted p-2 rounded break-all">{integration.base_url}</p>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Endpoints ({integration.endpoints?.length || 0})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {integration.endpoints?.map(ep => (
                      <div key={ep.id} className="text-sm p-2 bg-muted/50 rounded">
                        <span className={`font-bold ${ep.method === 'GET' ? 'text-green-600' : 'text-blue-600'}`}>{ep.method}</span>
                        <span className="ml-2 font-mono">{ep.path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}