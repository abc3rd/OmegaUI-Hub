import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTenant } from '../components/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Palette, Users, Settings as SettingsIcon, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { currentTenant, currentUser, hasPermission } = useTenant();
  const queryClient = useQueryClient();

  const [tenantData, setTenantData] = useState(currentTenant || {});
  const [userData, setUserData] = useState(currentUser || {});

  const updateTenantMutation = useMutation({
    mutationFn: (data) => base44.entities.Tenant.update(currentTenant.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant settings updated successfully');
      window.location.reload(); // Reload to apply theme changes
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
  });

  const handleSaveTenant = () => {
    if (!hasPermission('manage_settings')) {
      toast.error('You do not have permission to update tenant settings');
      return;
    }
    updateTenantMutation.mutate(tenantData);
  };

  const handleSaveProfile = () => {
    const updates = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      timezone: userData.timezone
    };
    updateUserMutation.mutate(updates);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your tenant and profile settings</p>
      </div>

      <Tabs defaultValue="tenant" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tenant" className="gap-2">
            <Building2 className="h-4 w-4" />
            Tenant Settings
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <Users className="h-4 w-4" />
            My Profile
          </TabsTrigger>
        </TabsList>

        {/* Tenant Settings */}
        <TabsContent value="tenant">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tenant Name</Label>
                  <Input
                    value={tenantData.name || ''}
                    onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
                    disabled={!hasPermission('manage_settings')}
                  />
                </div>

                <div>
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={tenantData.support_email || ''}
                    onChange={(e) => setTenantData({ ...tenantData, support_email: e.target.value })}
                    disabled={!hasPermission('manage_settings')}
                  />
                </div>

                <div>
                  <Label>Domain</Label>
                  <Input
                    value={tenantData.domain || ''}
                    onChange={(e) => setTenantData({ ...tenantData, domain: e.target.value })}
                    disabled={!hasPermission('manage_settings')}
                  />
                </div>

                <div>
                  <Label>Logo URL</Label>
                  <Input
                    value={tenantData.logo_url || ''}
                    onChange={(e) => setTenantData({ ...tenantData, logo_url: e.target.value })}
                    disabled={!hasPermission('manage_settings')}
                  />
                </div>

                <div>
                  <Label>Welcome Message</Label>
                  <Textarea
                    value={tenantData.welcome_message || ''}
                    onChange={(e) => setTenantData({ ...tenantData, welcome_message: e.target.value })}
                    rows={3}
                    disabled={!hasPermission('manage_settings')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Brand Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={tenantData.primary_color || '#0A1F44'}
                        onChange={(e) => setTenantData({ ...tenantData, primary_color: e.target.value })}
                        className="w-20 h-10"
                        disabled={!hasPermission('manage_settings')}
                      />
                      <Input
                        value={tenantData.primary_color || '#0A1F44'}
                        onChange={(e) => setTenantData({ ...tenantData, primary_color: e.target.value })}
                        disabled={!hasPermission('manage_settings')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={tenantData.accent_color || '#10B981'}
                        onChange={(e) => setTenantData({ ...tenantData, accent_color: e.target.value })}
                        className="w-20 h-10"
                        disabled={!hasPermission('manage_settings')}
                      />
                      <Input
                        value={tenantData.accent_color || '#10B981'}
                        onChange={(e) => setTenantData({ ...tenantData, accent_color: e.target.value })}
                        disabled={!hasPermission('manage_settings')}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg" style={{
                  backgroundColor: tenantData.primary_color || '#0A1F44',
                  color: 'white'
                }}>
                  <p className="font-semibold">Preview: Primary Color</p>
                  <p className="text-sm mt-1">This is how your primary color looks</p>
                  <button
                    className="mt-2 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: tenantData.accent_color || '#10B981' }}
                  >
                    Accent Button
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  SLA Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Response Target (hours)</Label>
                    <Input
                      type="number"
                      value={tenantData.sla_response_hours || 24}
                      onChange={(e) => setTenantData({ ...tenantData, sla_response_hours: parseInt(e.target.value) })}
                      disabled={!hasPermission('manage_settings')}
                    />
                  </div>

                  <div>
                    <Label>Resolution Target (hours)</Label>
                    <Input
                      type="number"
                      value={tenantData.sla_resolution_hours || 72}
                      onChange={(e) => setTenantData({ ...tenantData, sla_resolution_hours: parseInt(e.target.value) })}
                      disabled={!hasPermission('manage_settings')}
                    />
                  </div>
                </div>

                <div>
                  <Label>Timezone</Label>
                  <Input
                    value={tenantData.timezone || 'America/New_York'}
                    onChange={(e) => setTenantData({ ...tenantData, timezone: e.target.value })}
                    disabled={!hasPermission('manage_settings')}
                  />
                </div>
              </CardContent>
            </Card>

            {hasPermission('manage_settings') && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveTenant}
                  disabled={updateTenantMutation.isPending}
                  className="tenant-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Tenant Settings
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={userData.first_name || ''}
                    onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={userData.last_name || ''}
                    onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userData.email || ''}
                  disabled
                  className="bg-slate-100"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={userData.phone || ''}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label>Role</Label>
                <Input
                  value={userData.user_role?.replace('_', ' ') || ''}
                  disabled
                  className="bg-slate-100"
                />
              </div>

              <div>
                <Label>Timezone</Label>
                <Input
                  value={userData.timezone || 'America/New_York'}
                  onChange={(e) => setUserData({ ...userData, timezone: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateUserMutation.isPending}
                  className="tenant-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}