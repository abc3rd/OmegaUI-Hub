import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';

const footerLinks = {
  platform: [
    { label: 'SynCloud Connect', href: createPageUrl('Home') },
    { label: 'GLYTCH Butler', href: createPageUrl('Glytch') },
    { label: 'LegendDatabase', href: createPageUrl('LegendDB') },
    { label: 'Cloud QR', href: createPageUrl('CloudQR') },
  ],
  technology: [
    { label: 'Universal Command Protocol', href: createPageUrl('UCP') },
    { label: 'Omega UI, LLC', href: createPageUrl('OmegaUI') },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Contact', href: '#contact' },
  ]
};

export default function Footer() {
  return (
    <footer className="relative bg-[#3c3c3c] text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-[#ea00ea]/10 to-[#2699fe]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-[#2699fe]/10 to-[#4bce2a]/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">SynCloud</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Unifying data, automation, and AI into a single operational layer for modern businesses.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Technology</h4>
            <ul className="space-y-3">
              {footerLinks.technology.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Omega UI, LLC. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe]" />
              Patent Pending — Universal Command Protocol
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}