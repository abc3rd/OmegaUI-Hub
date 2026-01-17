import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MapPicker from "../components/report/MapPicker";
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Camera, 
  Upload, 
  CheckCircle, 
  Loader2,
  X,
  User,
  FileText,
  ChevronRight,
  Shield,
  QrCode,
  Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export default function Report() {
  const [step, setStep] = useState("panic"); // panic, form, uploading, success
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referrer, setReferrer] = useState(null);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    incident_type: "Auto Accident",
    at_fault: "Not at fault",
    injuries: "",
    medical_treatment: "Not yet",
    incident_date_time: new Date().toISOString(),
    latitude: null,
    longitude: null,
    location_address: "",
    location_unknown: false,
    description: "",
    photo_evidence: [],
    // Conditional fields
    employer_name: "",
    job_title: "",
    worksite_address: "",
    property_name: "",
    hazard_description: "",
    other_driver_insurance: "unknown",
    police_report: "no",
    vehicle_towed: "no",
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      setReferrer(ref);
      localStorage.setItem("iwitness_referrer", ref);
    } else {
      const storedRef = localStorage.getItem("iwitness_referrer");
      if (storedRef) setReferrer(storedRef);
    }

    // Check if user is logged in
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
          setFormData(prev => ({
            ...prev,
            full_name: userData.full_name || "",
            email: userData.email || "",
            phone_number: userData.phone || ""
          }));
        }
      } catch (e) {}
    };
    loadUser();
  }, []);

  const handlePanicClick = () => {
    setStep("form");
    getLocation();
  };

  const getLocation = async () => {
    setIsLocating(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      
      setFormData(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));

      // Reverse geocode
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
        );
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          location_address: data.display_name || "Location captured"
        }));
      } catch (e) {
        setFormData(prev => ({
          ...prev,
          location_address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        }));
      }
    } catch (error) {
      console.log("Location access denied");
    }
    setIsLocating(false);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const id = Date.now() + Math.random();
      setUploadProgress(prev => ({ ...prev, [id]: 0 }));
      
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setUploadedFiles(prev => [...prev, { id, url: file_url, name: file.name }]);
        setFormData(prev => ({
          ...prev,
          photo_evidence: [...prev.photo_evidence, file_url]
        }));
        setUploadProgress(prev => ({ ...prev, [id]: 100 }));
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadProgress(prev => {
          const { [id]: removed, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const removeFile = (id) => {
    const file = uploadedFiles.find(f => f.id === id);
    if (file) {
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
      setFormData(prev => ({
        ...prev,
        photo_evidence: prev.photo_evidence.filter(url => url !== file.url)
      }));
    }
  };

  const generateFingerprint = () => {
    const nav = window.navigator;
    const screen = window.screen;
    return btoa([
      nav.userAgent,
      screen.height,
      screen.width,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      nav.language,
    ].join("||")).substring(0, 32);
  };

  const handleMapLocationChange = (lat, lng, address) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location_address: address
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await base44.entities.Lead.create({
        ...formData,
        referred_by: referrer || null,
        is_guest: !user,
        browser_fingerprint: !user ? generateFingerprint() : null,
        status: "new"
      });

      // Update referral count if there's a referrer
      if (referrer) {
        try {
          const codes = await base44.entities.ReferralCode.filter({ affiliate_id: referrer });
          if (codes.length > 0) {
            await base44.entities.ReferralCode.update(codes[0].id, {
              total_referrals: (codes[0].total_referrals || 0) + 1
            });
          }
        } catch (e) {}
      }

      setStep("success");
    } catch (error) {
      console.error("Submission failed:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ea00ea]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2699fe]/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">iWitness</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to={createPageUrl("Scan")}>
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              <QrCode className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Scan QR</span>
            </Button>
          </Link>
          {user ? (
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                <span className="hidden sm:inline">My Dashboard</span>
                <ChevronRight className="w-4 h-4 sm:ml-1" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => base44.auth.redirectToLogin()}
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      <div className="relative z-10 max-w-lg mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {/* PANIC BUTTON STATE */}
          {step === "panic" && (
            <motion.div
              key="panic"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center min-h-[80vh] text-center"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Just Crashed?
              </h1>
              <p className="text-slate-400 mb-12 max-w-sm">
                Tap the emergency button below. We'll capture your location and connect you with help immediately.
              </p>

              <button
                onClick={handlePanicClick}
                className="relative group"
              >
                {/* Pulsing rings */}
                <div className="absolute inset-0 rounded-full bg-[#ea00ea]/30 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-4 rounded-full bg-[#ea00ea]/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                
                {/* Main button */}
                <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#ff3366] flex items-center justify-center shadow-2xl shadow-[#ea00ea]/50 transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                  <div className="text-center">
                    <AlertTriangle className="w-16 h-16 md:w-20 md:h-20 text-white mx-auto mb-2" />
                    <span className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider">
                      REPORT
                    </span>
                  </div>
                </div>
              </button>

              <p className="text-slate-500 text-sm mt-12">
                Your report helps protect your rights
              </p>

              {referrer && (
                <div className="mt-4 px-4 py-2 rounded-full bg-[#4bce2a]/10 border border-[#4bce2a]/30">
                  <p className="text-[#4bce2a] text-sm">
                    Referred by: <span className="font-mono font-bold">{referrer}</span>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* FORM STATE */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pt-8"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ea00ea]/10 border border-[#ea00ea]/30 text-[#ea00ea] mb-4">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Secure Report</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Report Your Accident</h2>
                <p className="text-slate-400 mt-2">Fill in the details below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Location Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Incident Location
                    </label>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost" 
                      onClick={getLocation}
                      disabled={isLocating}
                      className="text-[#2699fe]"
                    >
                      {isLocating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <MapPin className="w-4 h-4 mr-1" />}
                      Use My Location
                    </Button>
                  </div>

                  {formData.latitude && formData.longitude ? (
                    <MapPicker 
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onLocationChange={handleMapLocationChange}
                    />
                  ) : (
                    <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
                      <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm mb-3">
                        Click "Use My Location" or tap on the map to set the incident location
                      </p>
                      <MapPicker 
                        latitude={null}
                        longitude={null}
                        onLocationChange={handleMapLocationChange}
                      />
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      <User className="w-4 h-4 inline mr-2" />
                      Your Name
                    </label>
                    <Input
                      placeholder="Full name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      required
                      placeholder="(555) 123-4567"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      <AlertTriangle className="w-4 h-4 inline mr-2" />
                      Incident Type *
                    </label>
                    <Select
                      value={formData.incident_type}
                      onValueChange={(value) => setFormData({ ...formData, incident_type: value })}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-800 text-white h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        <SelectItem value="Auto Accident">Auto Accident</SelectItem>
                        <SelectItem value="Workers' Compensation">Workers' Compensation</SelectItem>
                        <SelectItem value="Slip & Fall">Slip & Fall</SelectItem>
                        <SelectItem value="Pedestrian/Bike">Pedestrian/Bike</SelectItem>
                        <SelectItem value="Dog Bite">Dog Bite</SelectItem>
                        <SelectItem value="Product Injury">Product Injury</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Were you at fault?
                    </label>
                    <Select
                      value={formData.at_fault}
                      onValueChange={(value) => setFormData({ ...formData, at_fault: value })}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-800 text-white h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        <SelectItem value="Not at fault">Not at fault</SelectItem>
                        <SelectItem value="Unsure">Unsure</SelectItem>
                        <SelectItem value="Partially at fault">Partially at fault</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Describe your injuries
                    </label>
                    <Textarea
                      placeholder="List any injuries you sustained..."
                      value={formData.injuries}
                      onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
                      className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 rounded-xl min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Medical Treatment
                    </label>
                    <Select
                      value={formData.medical_treatment}
                      onValueChange={(value) => setFormData({ ...formData, medical_treatment: value })}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-800 text-white h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        <SelectItem value="Not yet">Not yet</SelectItem>
                        <SelectItem value="ER/Urgent Care">ER/Urgent Care</SelectItem>
                        <SelectItem value="Doctor Visit">Doctor Visit</SelectItem>
                        <SelectItem value="Hospital Stay">Hospital Stay</SelectItem>
                        <SelectItem value="Ongoing Treatment">Ongoing Treatment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      <FileText className="w-4 h-4 inline mr-2" />
                      What happened?
                    </label>
                    <Textarea
                      placeholder="Brief description of the incident..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 rounded-xl min-h-[100px]"
                    />
                  </div>

                  {/* Conditional Fields - Auto Accident */}
                  {formData.incident_type === "Auto Accident" && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Other Driver Has Insurance?
                        </label>
                        <Select
                          value={formData.other_driver_insurance}
                          onValueChange={(value) => setFormData({ ...formData, other_driver_insurance: value })}
                        >
                          <SelectTrigger className="bg-slate-900/50 border-slate-800 text-white h-12 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800">
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-2 block">
                            Police Report Filed?
                          </label>
                          <Select
                            value={formData.police_report}
                            onValueChange={(value) => setFormData({ ...formData, police_report: value })}
                          >
                            <SelectTrigger className="bg-slate-900/50 border-slate-800 text-white h-12 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800">
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-2 block">
                            Vehicle Towed?
                          </label>
                          <Select
                            value={formData.vehicle_towed}
                            onValueChange={(value) => setFormData({ ...formData, vehicle_towed: value })}
                          >
                            <SelectTrigger className="bg-slate-900/50 border-slate-800 text-white h-12 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800">
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Conditional Fields - Workers' Compensation */}
                  {formData.incident_type === "Workers' Compensation" && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Employer Name
                        </label>
                        <Input
                          placeholder="Company name"
                          value={formData.employer_name}
                          onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
                          className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 h-12 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Job Title
                        </label>
                        <Input
                          placeholder="Your position"
                          value={formData.job_title}
                          onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                          className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 h-12 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Worksite Address
                        </label>
                        <Input
                          placeholder="Where did the incident occur?"
                          value={formData.worksite_address}
                          onChange={(e) => setFormData({ ...formData, worksite_address: e.target.value })}
                          className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 h-12 rounded-xl"
                        />
                      </div>
                    </>
                  )}

                  {/* Conditional Fields - Slip & Fall */}
                  {formData.incident_type === "Slip & Fall" && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Property Name
                        </label>
                        <Input
                          placeholder="Store, building, or property name"
                          value={formData.property_name}
                          onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                          className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 h-12 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Hazard Description
                        </label>
                        <Textarea
                          placeholder="What caused the fall? (wet floor, uneven surface, etc.)"
                          value={formData.hazard_description}
                          onChange={(e) => setFormData({ ...formData, hazard_description: e.target.value })}
                          className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 rounded-xl min-h-[80px]"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    <Camera className="w-4 h-4 inline mr-2" />
                    Photo Evidence
                  </label>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <div className="grid grid-cols-3 gap-3">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-[#2699fe] flex flex-col items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-slate-500" />
                      <span className="text-xs text-slate-500">Add Photo</span>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.phone_number}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white font-bold text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>

                <p className="text-xs text-slate-500 text-center italic">
                  This app helps document incidents and connect you with assistance. It is not legal advice and does not guarantee compensation.
                </p>
                </form>
            </motion.div>
          )}

          {/* SUCCESS STATE */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center min-h-[80vh] text-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4bce2a] to-[#2ecc71] flex items-center justify-center mb-8 shadow-2xl shadow-[#4bce2a]/30">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Report Submitted!</h2>
              <p className="text-slate-400 max-w-sm mb-8">
                Your accident has been documented. Our team will contact you shortly to assist with your case.
              </p>

              <div className="space-y-4 w-full max-w-xs">
                <Button
                  onClick={() => {
                    setStep("panic");
                    setFormData({
                      full_name: user?.full_name || "",
                      phone_number: user?.phone || "",
                      email: user?.email || "",
                      incident_type: "Auto Accident",
                      at_fault: "Not at fault",
                      injuries: "",
                      medical_treatment: "Not yet",
                      incident_date_time: new Date().toISOString(),
                      latitude: null,
                      longitude: null,
                      location_address: "",
                      location_unknown: false,
                      description: "",
                      photo_evidence: [],
                      employer_name: "",
                      job_title: "",
                      worksite_address: "",
                      property_name: "",
                      hazard_description: "",
                      other_driver_insurance: "unknown",
                      police_report: "no",
                      vehicle_towed: "no",
                    });
                    setUploadedFiles([]);
                  }}
                  className="w-full h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                >
                  Submit Another Report
                </Button>
                
                {!user && (
                  <Button
                    onClick={() => base44.auth.redirectToLogin()}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white"
                  >
                    Create Account to Track
                  </Button>
                )}

                {user && (
                  <Link to={createPageUrl("Dashboard")} className="block">
                    <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white">
                      View My Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}