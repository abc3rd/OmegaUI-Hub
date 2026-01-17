import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const TenantContext = createContext(null);

export function TenantProvider({ children, currentPageName }) {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [isPublicPage, setIsPublicPage] = useState(false);

  useEffect(() => {
    // Check if this is a public page based on the page name
    const publicPage = currentPageName === 'PublicSupport' || 
                       currentPageName === 'CheckTicketStatus' || 
                       currentPageName === 'PublicKnowledgeBase';
    setIsPublicPage(publicPage);
    
    if (!publicPage) {
      loadUserAndTenant();
    } else {
      setLoading(false);
    }
  }, [currentPageName]);

  const loadUserAndTenant = async () => {
    try {
      let user = await base44.auth.me();
      
      // Load all tenants
      let allTenants = await base44.entities.Tenant.list();
      
      // If no tenants exist, create a default one
      if (allTenants.length === 0) {
        const defaultTenant = await base44.entities.Tenant.create({
          name: 'Default Organization',
          slug: 'default',
          support_email: user.email,
          is_active: true
        });
        allTenants = [defaultTenant];
      }
      
      // Always ensure user has tenant_id and user_role
      const needsUpdate = !user.tenant_id || !user.user_role;
      if (needsUpdate) {
        const assignTenant = allTenants[0];
        const updateData = {};
        if (!user.tenant_id) updateData.tenant_id = assignTenant.id;
        if (!user.user_role) updateData.user_role = 'super_admin';
        
        await base44.auth.updateMe(updateData);
        
        // Refresh user data after update
        user = { ...user, ...updateData };
      }

      // Set user and tenants
      setCurrentUser(user);
      setTenants(allTenants);

      // Determine which tenant to show
      const savedTenantId = localStorage.getItem('selected_tenant_id');
      let selectedTenant = null;
      
      if (savedTenantId) {
        selectedTenant = allTenants.find(t => t.id === savedTenantId);
      }
      if (!selectedTenant && user.tenant_id) {
        selectedTenant = allTenants.find(t => t.id === user.tenant_id);
      }
      if (!selectedTenant) {
        selectedTenant = allTenants[0];
      }
      
      setCurrentTenant(selectedTenant);
    } catch (error) {
      console.error('Failed to load user/tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = (tenant) => {
    setCurrentTenant(tenant);
    if (currentUser?.user_role === 'super_admin') {
      localStorage.setItem('selected_tenant_id', tenant.id);
    }
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    
    // Super admin has all permissions
    if (currentUser.user_role === 'super_admin') return true;
    
    // Check role-based permissions
    const rolePermissions = {
      tenant_admin: ['view_tickets', 'reply_tickets', 'manage_tickets', 'manage_users', 'manage_kb', 'view_reports', 'manage_settings', 'remote_support'],
      agent: ['view_tickets', 'reply_tickets', 'view_contacts', 'view_kb', 'remote_support'],
      viewer: ['view_tickets', 'view_contacts', 'view_kb'],
      external_partner: ['view_tickets', 'view_kb']
    };

    const userPermissions = rolePermissions[currentUser.user_role] || [];
    return userPermissions.includes(permission) || (currentUser.permissions || []).includes(permission);
  };

  const canAccessTenant = (tenantId) => {
    if (!currentUser) return false;
    if (currentUser.user_role === 'super_admin') return true;
    return currentUser.tenant_id === tenantId;
  };

  return (
    <TenantContext.Provider value={{
      currentTenant,
      currentUser,
      loading,
      tenants,
      switchTenant,
      hasPermission,
      canAccessTenant,
      reload: loadUserAndTenant,
      isPublicPage
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}