import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Save, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

import WizardProgress from '../components/ui/WizardProgress';
import BasicInfoStep from '../components/incident/BasicInfoStep';
import VehiclesStep from '../components/incident/VehiclesStep';
import InjuriesStep from '../components/incident/InjuriesStep';
import WitnessesStep from '../components/incident/WitnessesStep';
import EvidenceStep from '../components/incident/EvidenceStep';
import NarrativeStep from '../components/incident/NarrativeStep';
import ReviewStep from '../components/incident/ReviewStep';
import { createAuditLog, recordConsent } from '../components/core/jurisdictionGate';

const WIZARD_STEPS = [
  { id: 'basic', title: 'Basic Info' },
  { id: 'vehicles', title: 'Vehicles' },
  { id: 'injuries', title: 'Injuries' },
  { id: 'witnesses', title: 'Witnesses' },
  { id: 'evidence', title: 'Evidence' },
  { id: 'narrative', title: 'Statement' },
  { id: 'review', title: 'Review' }
];

export default function IncidentWizard() {
  const urlParams = new URLSearchParams(window.location.search);
  const incidentId = urlParams.get('id');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [incidentData, setIncidentData] = useState({});
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [consents, setConsents] = useState({
    terms_privacy: false,
    accuracy: false,
    marketing: false
  });
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  // Fetch existing incident if editing
  const { data: existingIncident, isLoading: loadingIncident } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: async () => {
      if (!incidentId) return null;
      const incidents = await base44.entities.Incident.filter({ id: incidentId });
      return incidents[0] || null;
    },
    enabled: !!incidentId
  });

  // Fetch evidence files for this incident
  const { data: existingEvidence } = useQuery({
    queryKey: ['evidence', incidentId],
    queryFn: async () => {
      if (!incidentId) return [];
      return await base44.entities.EvidenceFile.filter({ incident_id: incidentId });
    },
    enabled: !!incidentId
  });

  // Load existing data
  useEffect(() => {
    if (existingIncident) {
      setIncidentData(existingIncident);
      setCurrentStep(existingIncident.wizard_step || 1);
    }
  }, [existingIncident]);

  useEffect(() => {
    if (existingEvidence) {
      setEvidenceFiles(existingEvidence);
    }
  }, [existingEvidence]);

  // Create incident mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const incident = await base44.entities.Incident.create({
        ...data,
        user_id: user.id,
        status: 'draft',
        wizard_step: currentStep
      });
      
      await createAuditLog({
        actor_user_id: user.id,
        actor_email: user.email,
        actor_role: 'user',
        action: 'create',
        entity_type: 'Incident',
        entity_id: incident.id,
        details: { step: currentStep }
      });
      
      return incident;
    },
    onSuccess: (data) => {
      setIncidentData(data);
      queryClient.invalidateQueries(['incident', data.id]);
      // Update URL with incident ID
      window.history.replaceState({}, '', createPageUrl('IncidentWizard') + `?id=${data.id}`);
    }
  });

  // Update incident mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Incident.update(incidentData.id, {
        ...data,
        wizard_step: currentStep
      });
      
      return { ...incidentData, ...data, wizard_step: currentStep };
    },
    onSuccess: (data) => {
      setIncidentData(data);
      queryClient.invalidateQueries(['incident', data.id]);
    }
  });

  // Auto-save on step change
  const saveProgress = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      if (incidentData.id) {
        await updateMutation.mutateAsync(incidentData);
      } else if (incidentData.occurred_at || incidentData.jurisdiction_state) {
        await createMutation.mutateAsync(incidentData);
      }
    } finally {
      setSaving(false);
    }
  }, [incidentData, user]);

  const handleNext = async () => {
    await saveProgress();
    setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    if (!consents.terms_privacy || !consents.accuracy) {
      return;
    }

    setSaving(true);
    try {
      // Record consents
      for (const [type, accepted] of Object.entries(consents)) {
        await recordConsent({
          user_id: user.id,
          incident_id: incidentData.id,
          consent_type: type === 'accuracy' ? 'terms_privacy' : type,
          accepted,
          consent_version: '1.0'
        });
      }

      // Update incident status
      await base44.entities.Incident.update(incidentData.id, {
        ...incidentData,
        status: 'submitted',
        wizard_completed: true,
        wizard_step: WIZARD_STEPS.length
      });

      await createAuditLog({
        actor_user_id: user.id,
        actor_email: user.email,
        actor_role: 'user',
        action: 'submit',
        entity_type: 'Incident',
        entity_id: incidentData.id,
        details: { consents }
      });

      // Redirect to dashboard
      window.location.href = createPageUrl('Dashboard');
    } finally {
      setSaving(false);
    }
  };

  const handleConsentChange = (type, value) => {
    setConsents(prev => ({ ...prev, [type]: value }));
  };

  if (loadingIncident) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={incidentData} onChange={setIncidentData} />;
      case 2:
        return <VehiclesStep data={incidentData} onChange={setIncidentData} />;
      case 3:
        return <InjuriesStep data={incidentData} onChange={setIncidentData} />;
      case 4:
        return <WitnessesStep data={incidentData} onChange={setIncidentData} />;
      case 5:
        return (
          <EvidenceStep 
            incidentId={incidentData.id} 
            userId={user?.id}
            evidenceFiles={evidenceFiles}
            setEvidenceFiles={setEvidenceFiles}
          />
        );
      case 6:
        return <NarrativeStep data={incidentData} onChange={setIncidentData} />;
      case 7:
        return (
          <ReviewStep 
            data={incidentData}
            evidenceFiles={evidenceFiles}
            consents={consents}
            onConsentChange={handleConsentChange}
          />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return incidentData.occurred_at && incidentData.jurisdiction_state;
      case 7:
        return consents.terms_privacy && consents.accuracy;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              to={createPageUrl('Dashboard')}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ab548df9978830eeb95a3/9d98f704c_iwitnesslogo.jpg" 
                alt="iWitness"
                className="h-8 w-auto"
              />
              <h1 className="text-2xl font-bold text-slate-900">Document Incident</h1>
            </div>
            <p className="text-slate-500">
              {incidentData.id ? 'Continue documenting your incident' : 'Create a new incident report'}
            </p>
          </div>
          
          {saving && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </div>
          )}
        </div>

        {/* Progress */}
        <WizardProgress 
          steps={WIZARD_STEPS} 
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="mt-8"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < WIZARD_STEPS.length && (
              <Button
                variant="ghost"
                onClick={saveProgress}
                disabled={saving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
            )}
            
            {currentStep < WIZARD_STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || saving}
                className="gap-2 bg-slate-900 hover:bg-slate-800"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || saving}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4" />
                Submit Report
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}