import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import {
  LayoutTemplate,
  FolderOpen,
  Image,
  Settings,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

const navigation = [
  { name: 'Projects', page: 'Dashboard', icon: FolderOpen },
  { name: 'Templates', page: 'Templates', icon: LayoutTemplate },
  { name: 'Assets', page: 'Assets', icon: Image },
];

export default function Layout({ children, currentPageName }) {
  // Hide layout on Editor page for full-screen experience
  if (currentPageName === 'Editor') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}