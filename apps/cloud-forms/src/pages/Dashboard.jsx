import { useState, useEffect } from "react";
import { Form, Submission, User } from "@/entities/all";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, FileText, Eye, Users, Calendar, TrendingUp, UploadCloud, LogIn, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setIsAuthenticated(true);
      loadData();
    } catch (error) {
      console.error("User not authenticated:", error);
      setIsAuthenticated(false);
      loadData();
    }
  };

  const handleLogin = async () => {
    try {
      const callbackUrl = `${window.location.origin}${window.location.pathname}`;
      await User.loginWithRedirect(callbackUrl);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loadData = async () => {
    try {
      const [formsData, submissionsData] = await Promise.all([
        Form.list("-created_date", 10),
        Submission.list("-created_date", 10)
      ]);
      setForms(formsData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionCount = (formId) => {
    return submissions.filter(sub => sub.formId === formId).length;
  };

  const deleteSubmission = async (submissionId) => {
    if (!isAuthenticated || (user?.email !== "book.drivepal@gmail.com" && user?.role !== "admin")) {
      alert("You don't have permission to delete submissions.");
      return;
    }

    if (confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      try {
        await Submission.delete(submissionId);
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      } catch (error) {
        console.error("Error deleting submission:", error);
      }
    }
  };

  const stats = {
    totalForms: forms.length,
    totalSubmissions: submissions.length,
    todaySubmissions: submissions.filter(sub => 
      format(new Date(sub.created_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length,
    activeForms: forms.filter(form => form.isActive).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="neu-card p-6 sm:p-8">
          <div className="animate-pulse text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.email === "book.drivepal@gmail.com" || user?.role === "admin";

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Admin Login/Logout Section */}
      <div className="neu-card p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">FormForge Dashboard</h1>
            {isAuthenticated && (
              <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.full_name || user?.email}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="neu-button px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="neu-button px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900 flex items-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="neu-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600">Total Forms</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">{stats.totalForms}</p>
            </div>
            <div className="neu-raised p-2 sm:p-3 rounded-full w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="neu-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600">Submissions</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">{stats.totalSubmissions}</p>
            </div>
            <div className="neu-raised p-2 sm:p-3 rounded-full w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="neu-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600">Today</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">{stats.todaySubmissions}</p>
            </div>
            <div className="neu-raised p-2 sm:p-3 rounded-full w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="neu-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600">Active</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">{stats.activeForms}</p>
            </div>
            <div className="neu-raised p-2 sm:p-3 rounded-full w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="neu-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link
            to={createPageUrl("CreateForm")}
            className="neu-button px-4 py-3 rounded-xl flex items-center justify-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Form</span>
          </Link>
          <Link
            to={createPageUrl("ImportFromPDF")}
            className="neu-button px-4 py-3 rounded-xl flex items-center justify-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Import from PDF</span>
          </Link>
          <Link
            to={createPageUrl("MyForms")}
            className="neu-button px-4 py-3 rounded-xl flex items-center justify-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <FileText className="w-5 h-5" />
            <span>View All Forms</span>
          </Link>
        </div>
      </div>

      {/* Recent Forms */}
      <div className="neu-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Forms</h2>
        {forms.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="neu-raised p-4 sm:p-6 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">No forms created yet</p>
            <Link
              to={createPageUrl("CreateForm")}
              className="neu-button px-6 py-3 rounded-xl inline-flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Form</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {forms.map((form) => (
              <div key={form.id} className="neu-inset p-3 sm:p-4 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 mb-3 sm:mb-0">
                    <h3 className="font-semibold text-gray-800 mb-1">{form.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{form.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span>Created {format(new Date(form.created_date), 'MMM d, yyyy')}</span>
                      <span>{getSubmissionCount(form.id)} submissions</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        form.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Link
                      to={createPageUrl(`FormView?id=${form.id}`)}
                      className="neu-button p-2 rounded-lg text-gray-600 hover:text-gray-800"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={createPageUrl(`EditForm?id=${form.id}`)}
                      className="neu-button px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Submissions */}
      <div className="neu-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Submissions</h2>
        {submissions.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="neu-raised p-4 sm:p-6 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => {
              const form = forms.find(f => f.id === submission.formId);
              return (
                <div key={submission.id} className="neu-inset p-3 sm:p-4 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 mb-2 sm:mb-0">
                      <h4 className="font-medium text-gray-800 mb-1">
                        {form?.title || 'Unknown Form'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {submission.submitterName || 'Anonymous'} • {format(new Date(submission.created_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isAdmin && (
                        <Link
                          to={createPageUrl(`FormData?id=${submission.formId}`)}
                          className="neu-button px-3 py-1 rounded-lg text-sm text-gray-700 hover:text-gray-900"
                        >
                          View
                        </Link>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => deleteSubmission(submission.id)}
                          className="neu-button p-1 rounded-lg text-red-600 hover:text-red-800"
                          title="Delete Submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {!isAdmin && (
                        <span className="text-sm text-gray-500">Admin access required</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}