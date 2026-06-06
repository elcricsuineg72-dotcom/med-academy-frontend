import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, FileText, File, Download, Eye,
  User, Users, BookOpen, Star
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { format } from 'date-fns';

// Convert Cloudinary raw URL to a browser-viewable URL
const getViewableUrl = (url) => {
  if (!url) return '';
  // For Cloudinary URLs, ensure inline display
  if (url.includes('cloudinary.com') && url.includes('/raw/upload/')) {
    return url.replace('/raw/upload/', '/raw/upload/fl_attachment:false/');
  }
  return url;
};

const categoryColors = {
  notes: { bg: 'bg-brand-azure-light', text: 'text-brand-azure-dark', label: 'Notes' },
  past_paper: { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Past Paper' },
  lab_report: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Lab Report' },
  assignment: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Assignment' },
  resource: { bg: 'bg-brand-pearl', text: 'text-gray-700', label: 'Resource' },
};

const ModuleDetail = () => {
  const { id } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [viewingContent, setViewingContent] = useState(null);

  useEffect(() => {
    studentAPI.getModuleContent(id)
      .then(res => setData(res.data.data))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load module'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleView = async (content) => {
    setViewingContent(content);
    try {
      await studentAPI.logActivity({
        contentId: content._id,
        moduleId: id,
        action: 'view',
        sessionDuration: 0,
      });
    } catch (err) {
      // Silent - don't interrupt user experience
    }
  };

  const handleDownload = async (content) => {
    try {
      await studentAPI.logActivity({
        contentId: content._id,
        moduleId:  id,
        action:    'download',
      });

      // Fetch the file as a blob and trigger browser download
      // This works even with CORS-restricted URLs
      const response = await fetch(content.fileUrl);
      const blob     = await response.blob();
      const url      = window.URL.createObjectURL(blob);
      const link     = document.createElement('a');
      link.href      = url;
      link.download  = content.fileName || `${content.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download started');
    } catch (err) {
      // Fallback: open in new tab if fetch fails
      window.open(content.fileUrl, '_blank');
      toast.success('Opening PDF in new tab');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading module..." />
    </div>
  );

  if (!data) return null;

  const { module, content } = data;
  const notes = content.filter(c => c.category === 'notes');
  const papers = content.filter(c => c.category === 'past_paper');
  const labs = content.filter(c => c.category === 'lab_report');
  const other = content.filter(c => !['notes', 'past_paper', 'lab_report'].includes(c.category));

  const tabs = [
    { id: 'notes', label: `Study Notes (${notes.length})`, items: notes },
    { id: 'papers', label: `Past Papers (${papers.length})`, items: papers },
    ...(labs.length > 0 ? [{ id: 'labs', label: `Lab Reports (${labs.length})`, items: labs }] : []),
    ...(other.length > 0 ? [{ id: 'other', label: `Resources (${other.length})`, items: other }] : []),
  ];

  const activeItems = tabs.find(t => t.id === activeTab)?.items || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/student/modules" className="hover:text-brand-azure flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> My Modules
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{module?.title}</span>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Module Header */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: (module?.color || '#2563EB') + '15' }}
              >
                🧪
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{module?.title}</h1>
                <p className="text-gray-500 text-sm mt-1">{module?.description}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-gray-400">
                  <User className="w-4 h-4" />
                  Module taught by {module?.instructor?.firstName} {module?.instructor?.lastName}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-azure text-brand-azure'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content List */}
          {activeItems.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No {activeTab} available yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeItems.map(item => {
                const cat = categoryColors[item.category] || categoryColors.resource;
                return (
                  <div key={item._id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                    {/* PDF Icon */}
                    <div className="w-12 h-14 bg-red-50 border border-red-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                      <div className="w-6 h-7 bg-red-500 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PDF</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.bg} ${cat.text}`}>
                          {cat.label}
                        </span>
                        {item.year && (
                          <span className="text-xs text-gray-400">Year: {item.year}</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {item.fileSizeFormatted || item.fileName}
                        </span>
                        {item.markingSchemeUrl && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            + Marking Scheme
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {item.views}
                      </div>
                      <button
                        onClick={() => handleView(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-brand-pearl-dark hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={() => handleDownload(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-brand-azure hover:bg-brand-azure-dark rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Module Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-pearl-dark rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {module?.instructor?.firstName} {module?.instructor?.lastName}
                  </p>
                  <p className="text-xs text-gray-400">Module Instructor</p>
                </div>
              </div>
              <hr className="border-gray-100" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Students
                </span>
                <span className="font-semibold text-gray-800">{module?.studentCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Total Resources
                </span>
                <span className="font-semibold text-gray-800">{content.length}</span>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
            <div className="space-y-2">
              {tabs.map(tab => (
                <div key={tab.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{tab.label.split('(')[0].trim()}</span>
                  <span className="font-semibold text-gray-800">{tab.items.length}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewingContent && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          {/* Header bar */}
          <div className="flex items-center justify-between bg-brand-charcoal px-6 py-3 flex-shrink-0"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            <div>
              <p className="text-white font-semibold text-sm">{viewingContent.title}</p>
              <p className="text-gray-400 text-xs mt-0.5">{viewingContent.fileName}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownload(viewingContent)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, #0077C8, #3B99E0)' }}>
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={() => setViewingContent(null)}
                className="text-gray-400 hover:text-white px-4 py-2 text-sm border border-gray-600 rounded-xl hover:border-gray-400 transition-colors">
                ✕ Close
              </button>
            </div>
          </div>

          {/* PDF Viewer — uses Google Docs viewer for reliable cross-browser rendering */}
          <div className="flex-1 overflow-hidden bg-gray-800">
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(getViewableUrl(viewingContent.fileUrl))}&embedded=true`}
              className="w-full h-full border-0"
              title={viewingContent.title}
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleDetail;
