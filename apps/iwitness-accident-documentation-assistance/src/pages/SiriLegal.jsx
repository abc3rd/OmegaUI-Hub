import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertCircle, FileText, Lock, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SiriLegal() {
  const sections = [
    {
      icon: Shield,
      title: 'Purpose and Legal Posture',
      content: 'Siri is used solely as a user-initiated voice trigger to launch the iWitness / Free Crash application and begin an evidence or incident session. Siri does not analyze evidence, access databases, perform recognition, or store any evidentiary or referral data. This design preserves chain of custody, complies with Apple App Store policies, and protects evidentiary admissibility.',
      color: 'emerald'
    },
    {
      icon: CheckCircle,
      title: 'Role of Siri',
      content: 'Siri functions as a speech-to-intent interface only. It operates equivalently to a voice-activated button press. Siri is not a witness, recorder, recognition engine, decision maker, or data processor.',
      color: 'blue'
    },
    {
      icon: Lock,
      title: 'Technical Boundary',
      content: 'User voice commands are processed by Apple to invoke an approved App Intent, which launches the application. All evidence capture, cryptographic hashing, audit logging, and referral attribution begin only after the application is active. The legal start of data collection occurs within the application, not within Siri.',
      color: 'purple'
    },
    {
      icon: FileText,
      title: 'Chain of Custody',
      content: 'Upon launch, the application creates a new evidence session with a UTC timestamp, device metadata hashing, optional location snapshot, and an immutable audit log entry. Siri never touches, stores, or alters this information.',
      color: 'amber'
    },
    {
      icon: Scale,
      title: 'Referral Attribution',
      content: 'Referral attribution is handled exclusively within the application after launch using lawful mechanisms such as URL parameters, session metadata, and QR or deep-link tokens. Siri does not assign, track, or process referrals. Referral data is treated as marketing attribution, not evidence.',
      color: 'indigo'
    }
  ];

  const compliancePoints = [
    {
      title: 'Consent and Privacy',
      description: 'Users explicitly enable Siri through iOS settings and grant all recording and location permissions inside the application. No permissions are inferred or assumed through Siri. Data collection follows data-minimization principles and applicable privacy laws.'
    },
    {
      title: 'Recording Laws',
      description: 'In two-party consent jurisdictions, Siri does not initiate recording. Recording begins only after in-app disclosures and user confirmation. This prevents inadvertent unlawful recording.'
    },
    {
      title: 'Apple Policy Compliance',
      description: 'This implementation aligns with Apple App Store Review Guidelines and Siri App Intent policies. Apple remains a platform provider and is not part of the evidentiary chain.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-[#ea00ea] text-white border-0 px-4 py-1">
            Legal Documentation
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Lawful Use of Siri in iWitness
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Understanding how Siri integration preserves evidence integrity, 
            chain of custody, and legal admissibility
          </p>
        </motion.div>

        {/* Key Sections */}
        <div className="space-y-6 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-${section.color}-50`}>
                      <section.icon className={`w-6 h-6 text-${section.color}-600`} />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{section.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Compliance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-r from-[#ea00ea]/5 to-purple-50 mb-12">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Shield className="w-6 h-6 text-[#ea00ea]" />
                Compliance & Legal Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {compliancePoints.map((point, index) => (
                <div key={index} className="pb-6 last:pb-0 border-b last:border-b-0 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#ea00ea]" />
                    {point.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed pl-7">{point.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Plain Language Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg bg-slate-900 text-white mb-12">
            <CardHeader>
              <CardTitle className="text-xl">Plain-Language Legal Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <p className="text-lg leading-relaxed italic">
                  "Siri is used solely as a voice-activated trigger to launch the application. 
                  Siri does not analyze, record, store, or access evidentiary or referral data. 
                  All evidence capture, verification, and referral attribution occur within the 
                  application after launch, under user control."
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conclusion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Conclusion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed text-lg">
                This architecture lawfully enables hands-free app activation while protecting 
                evidence integrity, referral attribution compliance, and intellectual property 
                boundaries. The implementation ensures that all evidentiary data remains under 
                user control and maintains admissibility in legal proceedings.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Download PDF Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Official Documentation
                  </p>
                  <p className="text-xs text-blue-700">
                    This page summarizes the official legal framework document. For the complete 
                    technical and legal specifications, please refer to the full PDF documentation 
                    maintained by Omega Digital legal counsel.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}