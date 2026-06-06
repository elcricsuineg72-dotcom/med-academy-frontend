import { useState, useEffect } from 'react';
import { Bell, Globe, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    studentAPI.getAnnouncements()
      .then(res => setAnnouncements(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = async (ann) => {
    setSelected(ann);
    if (!ann.hasRead) {
      try {
        await studentAPI.markAnnouncementRead(ann._id);
        setAnnouncements(prev =>
          prev.map(a => a._id === ann._id ? { ...a, hasRead: true } : a)
        );
      } catch { /* silent */ }
    }
  };

  const unreadCount = announcements.filter(a => !a.hasRead).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading announcements..." />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 text-center">Announcements</h1>
        <p className="text-gray-400 text-sm mt-1 text-center">Updates from your tutor</p>
        </div>
        {unreadCount > 0 && (
          <span className="bg-brand-azure text-white text-sm font-semibold px-3 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No announcements yet</h3>
          <p className="text-gray-400">Your tutor hasn't posted any announcements.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {announcements.map(ann => (
              <button
                key={ann._id}
                onClick={() => handleOpen(ann)}
                className={`w-full text-left card p-4 hover:shadow-md transition-all duration-200 border-l-4 ${
                  selected?._id === ann._id
                    ? 'border-l-blue-600 bg-brand-azure-light/50'
                    : ann.hasRead ? 'border-l-transparent' : 'border-l-blue-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    ann.scope === 'global' ? 'bg-blue-100' : 'bg-violet-100'
                  }`}>
                    {ann.scope === 'global'
                      ? <Globe className="w-4 h-4 text-brand-azure" />
                      : <BookOpen className="w-4 h-4 text-violet-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${!ann.hasRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {ann.title}
                      </p>
                      {!ann.hasRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(ann.publishedAt || ann.createdAt), { addSuffix: true })}
                    </p>
                    {ann.scope === 'module' && ann.targetModule && (
                      <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {ann.targetModule.title}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail View */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="card p-6 sticky top-20">
                <div className="flex items-start gap-3 mb-5 pb-5 border-b border-gray-100">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selected.scope === 'global' ? 'bg-blue-100' : 'bg-violet-100'
                  }`}>
                    {selected.scope === 'global'
                      ? <Globe className="w-5 h-5 text-brand-azure" />
                      : <BookOpen className="w-5 h-5 text-violet-600" />}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-sm text-gray-500">
                        by {selected.author?.firstName} {selected.author?.lastName}
                      </span>
                      <span className="text-sm text-gray-400">·</span>
                      <span className="text-sm text-gray-400">
                        {formatDistanceToNow(new Date(selected.publishedAt || selected.createdAt), { addSuffix: true })}
                      </span>
                      {selected.scope === 'module' && selected.targetModule && (
                        <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">
                          {selected.targetModule.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Read
                  </div>
                </div>
                <div
                  className="announcement-body text-gray-700 leading-relaxed text-sm"
                  dangerouslySetInnerHTML={{ __html: selected.body }}
                />
              </div>
            ) : (
              <div className="card p-12 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Select an announcement to read</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncements;
