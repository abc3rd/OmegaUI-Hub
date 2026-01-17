import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, User, Calendar, MessageSquare, AlertCircle, CheckCircle, Clock, ExternalLink, Upload, Download } from 'lucide-react';

export default function ClientPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myCase, setMyCase] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      await loadData(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin('/ClientPortal');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (currentUser) => {
    try {
      const cases = await base44.entities.Case.list();
      const userCase = cases.find(c => c.created_by === currentUser.email);
      setMyCase(userCase);

      if (userCase) {
        const allAppointments = await base44.entities.Appointment.list();
        const caseAppointments = allAppointments.filter(a => a.case_id === userCase.id);
        setAppointments(caseAppointments);

        const allMessages = await base44.entities.Message.list();
        const caseMessages = allMessages.filter(m => m.case_id === userCase.id);
        setMessages(caseMessages);

        const allDocuments = await base44.entities.Document.list();
        const caseDocuments = allDocuments.filter(d => d.case_id === userCase.id);
        setDocuments(caseDocuments);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.Document.create({
        case_id: myCase.id,
        document_type: docType,
        file_name: file.name,
        file_url: file_url,
        uploaded_by: 'client',
        status: 'pending_review'
      });

      await loadData(user);
      alert('Document uploaded successfully!');
    } catch (error) {
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      new: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Under Review', desc: 'Your case is being reviewed by our team' },
      under_review: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Attorney Matching', desc: 'We are finding the best attorney for your case' },
      accepted: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Attorney Assigned', desc: 'An attorney has been assigned to your case' },
      active: { icon: FileText, color: 'text-[#415fdf]', bg: 'bg-blue-100', text: 'Case Active', desc: 'Your attorney is working on your case' },
      declined: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Not Accepted', desc: 'Unfortunately, we could not match your case at this time' },
      closed: { icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Case Closed', desc: 'Your case has been resolved' }
    };
    return statusMap[status] || statusMap.new;
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00c7ad]"></div>
      </div>
    );
  }

  const statusInfo = myCase ? getStatusInfo(myCase.status) : null;
  const StatusIcon = statusInfo?.icon;

  return (
    <div className="min-h-screen gradient-bg">
      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #415fdf 0%, #d2d9f7 25%, #899499 50%, #415fdf 75%, #d2d9f7 100%);
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b-2 border-[#415fdf]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <a href="/">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/ad2324a9c_background-ucrash-999kb.png" 
                  alt="UCRASH Logo" 
                  className="h-12 w-auto cursor-pointer"
                />
              </a>
              <div>
                <h1 className="text-2xl font-black text-gray-800">My Case Portal</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://glytch.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold hover:scale-105 transition-all"
              >
                🤖 Ask GLYTCH
              </a>
              <button
                onClick={() => base44.auth.logout('/')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!myCase ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Active Case</h2>
            <p className="text-gray-600 mb-6">You don't have an active case yet.</p>
            <a
              href="/ClientIntake"
              className="inline-block px-8 py-3 bg-gradient-to-r from-[#415fdf] to-[#899499] text-white rounded-full font-bold hover:scale-105 transition-transform"
            >
              Start Your Free Case Review
            </a>
          </div>
        ) : (
          <>
            {/* Case Status Card */}
            <div className={`${statusInfo.bg} rounded-2xl p-8 mb-8 shadow-lg border-l-4 ${statusInfo.color.replace('text-', 'border-')}`}>
              <div className="flex items-start gap-6">
                <StatusIcon className={`w-16 h-16 ${statusInfo.color}`} />
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-gray-800 mb-2">{statusInfo.text}</h2>
                  <p className="text-lg text-gray-700 mb-4">{statusInfo.desc}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-600">Case ID:</span>
                      <p className="font-bold text-gray-800">#{myCase.id.slice(0, 8)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Accident Type:</span>
                      <p className="font-bold text-gray-800">{myCase.accident_type}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Date Filed:</span>
                      <p className="font-bold text-gray-800">{new Date(myCase.created_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Case Details */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#415fdf]" />
                  Case Details
                </h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-[#415fdf] pl-4">
                    <p className="text-sm font-semibold text-gray-600">Accident Date</p>
                    <p className="text-gray-800">{new Date(myCase.accident_date).toLocaleDateString()}</p>
                  </div>
                  {myCase.injury_summary && (
                    <div className="border-l-4 border-[#899499] pl-4">
                      <p className="text-sm font-semibold text-gray-600">Injury Summary</p>
                      <p className="text-gray-800">{myCase.injury_summary}</p>
                    </div>
                  )}
                  {myCase.ai_summary && (
                    <div className="border-l-4 border-[#071119] pl-4">
                      <p className="text-sm font-semibold text-gray-600">Case Summary</p>
                      <p className="text-gray-800">{myCase.ai_summary}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-[#415fdf]" />
                  Upcoming Appointments
                </h3>
                {appointments.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No upcoming appointments</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="bg-gradient-to-r from-[#415fdf]/10 to-[#d2d9f7]/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-800">{apt.appointment_type}</span>
                          <span className="text-sm px-2 py-1 bg-[#415fdf] text-white rounded-full">
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(apt.scheduled_datetime).toLocaleString()}
                        </p>
                        {apt.location_or_virtual_link && (
                          <p className="text-sm text-gray-600 mt-1">{apt.location_or_virtual_link}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#415fdf]" />
                Documents
              </h3>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Upload Documents</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['police_report', 'medical_records', 'insurance_claim', 'photos'].map((type) => (
                    <label key={type} className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#415fdf] transition-colors text-center">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-600 capitalize">{type.replace('_', ' ')}</p>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, type)}
                          disabled={uploading}
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {documents.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No documents uploaded yet</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#415fdf]" />
                        <div>
                          <p className="font-semibold text-gray-800">{doc.file_name}</p>
                          <p className="text-xs text-gray-500 capitalize">{doc.document_type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status}
                        </span>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#415fdf] hover:text-[#899499]"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-[#415fdf]" />
                Messages & Updates
              </h3>
              {messages.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No messages yet</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="border-l-4 border-[#415fdf] pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-800 capitalize">{msg.sender_type}</span>
                        <span className="text-xs text-gray-500">{new Date(msg.created_date).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700">{msg.message_body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-lg border-t-2 border-[#415fdf] mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Omega UI Network</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { name: 'Omega UI', url: 'https://www.omegaui.com' },
                { name: 'SynCloud', url: 'https://syncloud.omegaui.com' },
                { name: 'ABC Dashboard', url: 'https://www.ancdashboard.com' },
                { name: 'GLYTCH', url: 'https://glytch.cloud' },
                { name: 'GLYTCH Functions', url: 'https://glytch.cloud/functions' },
                { name: 'QR Generator', url: 'https://qr.omegaui.com' },
                { name: 'UI Tools', url: 'https://ui.omegaui.com' },
                { name: 'Cloud Convert', url: 'https://cloudconvert.omegaui.com' },
                { name: 'Chess', url: 'https://chess.omegaui.com' },
                { name: 'Echo', url: 'https://echo.omegaui.com' }
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 text-gray-600 hover:text-[#415fdf] text-sm font-medium transition-colors"
                >
                  {link.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">
            &copy; 2025 Powered by Omega UI, LLC
          </p>
        </div>
      </footer>
    </div>
  );
}