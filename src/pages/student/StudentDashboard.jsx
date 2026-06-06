import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Clock, TrendingUp, ChevronRight, Download, Eye } from 'lucide-react';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-4xl font-display font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

const moduleIcons = { flask: '🧪', atom: '⚗️', beaker: '🔬', grid: '🧲', dna: '🧬', fire: '🔥' };

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading dashboard..." />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}! 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Here's your study overview</p>
        </div>
      </div>

      {/* Pending Notice */}
      {user?.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Account Pending Approval</p>
            <p className="text-sm text-amber-700 mt-0.5">Your tutor will review and activate your account shortly.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Enrolled Modules" value={data?.stats?.enrolledModules ?? 0} color="bg-brand-azure" />
        <StatCard icon={Eye} label="Files Viewed" value={data?.stats?.filesViewed ?? 0} color="bg-violet-600" />
        <StatCard icon={Clock} label="Hours Studied" value={`${data?.stats?.hoursStudied ?? 0}h`} color="bg-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Modules */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">My Modules</h2>
            <Link to="/student/modules" className="text-sm text-brand-azure hover:text-brand-azure-dark font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {user?.enrolledModules?.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No modules yet</p>
              <p className="text-sm mt-1">Your tutor will enroll you in modules after approval.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {user?.enrolledModules?.slice(0, 4).map((mod) => {
                const progress = data?.progressByModule?.find(p => (p.module?._id || p.module) === mod._id);
                return (
                  <Link key={mod._id} to={`/student/modules/${mod._id}`}>
                    <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: mod.color + '20' }}
                        >
                          {moduleIcons[mod.icon] || '🧪'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-brand-azure transition-colors truncate">
                            {mod.title}
                          </p>
                          <p className="text-xs text-gray-400">{mod.code}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs font-semibold text-gray-700">{progress?.percentage ?? 0}%</span>
                        </div>
                        <div className="w-full bg-brand-pearl-dark rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${progress?.percentage ?? 0}%`,
                              backgroundColor: mod.color || '#2563EB'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Uploads */}
        <div>
          <h2 className="section-title mb-4">Recent Uploads</h2>
          <div className="card divide-y divide-gray-100">
            {data?.recentContent?.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">No recent uploads</p>
            ) : (
              data?.recentContent?.slice(0, 6).map((item) => (
                <div key={item._id} className="flex items-start gap-3 p-3 hover:bg-brand-pearl transition-colors">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.module?.title} · {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      {data?.progressByModule?.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-5">Progress Tracker</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.progressByModule.map((p) => {
              const mod = p.module;
              return (
                <div key={mod?._id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 truncate">{mod?.title || 'Module'}</p>
                    <span className="text-sm font-bold text-gray-900">{p.percentage}%</span>
                  </div>
                  <div className="w-full bg-brand-pearl-dark rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${p.percentage}%`, backgroundColor: mod?.color || '#0077C8' }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{p.viewedContent}/{p.totalContent} resources</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
