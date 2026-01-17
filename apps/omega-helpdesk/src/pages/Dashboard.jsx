import React from 'react';
import { useTenant } from '../components/TenantContext';
import SupportDashboard from './SupportDashboard';
import ClientDashboard from './ClientDashboard';

export default function Dashboard() {
  const { currentUser } = useTenant();

  // Route to appropriate dashboard based on role
  if (['super_admin', 'support_admin', 'support_agent'].includes(currentUser?.user_role)) {
    return <SupportDashboard />;
  }

  return <ClientDashboard />;
}