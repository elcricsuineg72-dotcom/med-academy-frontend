import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, AlertCircle, Upload, Plus, CheckSquare, BarChart2, Clock } from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-4xl font-display font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

const activityIcons = { view:'👁️', download:'⬇️', registration:'👤' };

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboardStats()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" text="Loading dashboard…" /></div>;

  return (
    <div className="space-y-7">

      {/* Page header — centred */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-gray-900">Tutor Command Center</h1>
        <p className="text-gray-400 mt-1.5 text-sm">Overview of your Med Academy</p>
      </div>

      {/* Pending alert */}
      {data?.stats?.pendingApprovals > 0 && (
        <div className="rounded-2xl p-4 flex items-center justify-between border border-amber-200"
          style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' }}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 font-semibold text-sm">
              You have <strong>{data.stats.pendingApprovals}</strong> pending student approval{data.stats.pendingApprovals !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/admin/students?status=pending">
            <button className="text-sm font-bold text-amber-700 hover:text-amber-900 underline">Review Now →</button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}        label="Total Students"    value={data?.stats?.totalStudents ?? 0}    color="bg-brand-azure" />
        <StatCard icon={BookOpen}     label="Active Modules"    value={data?.stats?.activeModules ?? 0}    color="bg-violet-600" />
        <StatCard icon={AlertCircle}  label="Pending Approvals" value={data?.stats?.pendingApprovals ?? 0} color="bg-amber-500" />
        <StatCard icon={Upload}       label="Files Uploaded"    value={data?.stats?.filesUploaded ?? 0}    color="bg-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Engagement chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="section-title mb-5">Module Engagement</h2>
          {data?.moduleEngagement?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.moduleEngagement} margin={{ top:0, right:10, bottom:0, left:-10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'#9CA3AF' }} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#9CA3AF' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border:'1px solid #E5E7EB', borderRadius:'12px', fontSize:'12px' }} cursor={{ fill:'#F9FAFB' }} />
                <Bar dataKey="views" fill="#0077C8" radius={[6,6,0,0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No engagement data yet</div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="space-y-1">
            {[
              { icon: Plus,        label:'New Module',          to:'/admin/modules',                color:'text-brand-azure' },
              { icon: Upload,      label:'Upload Content',      to:'/admin/content',                color:'text-violet-600' },
              { icon: AlertCircle, label:'New Announcement',    to:'/admin/announcements',          color:'text-amber-500' },
              { icon: CheckSquare, label:'Approve Students',    to:'/admin/students?status=pending',color:'text-emerald-600' },
              { icon: BarChart2,   label:'View Analytics',      to:'/admin/analytics',              color:'text-gray-500' },
            ].map(item => (
              <Link key={item.label} to={item.to}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-pearl transition-colors cursor-pointer">
                  <item.icon className={`w-4.5 h-4.5 ${item.color}`} style={{ width:18, height:18 }} />
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity feed */}
        <div className="card p-6">
          <h2 className="section-title mb-5">Recent Activity</h2>
          {data?.activityFeed?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
          ) : (
            <div className="space-y-3.5">
              {data?.activityFeed?.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-brand-pearl flex items-center justify-center text-sm flex-shrink-0">
                    {activityIcons[activity.type] || '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending mini-table */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Pending Approvals</h2>
            <Link to="/admin/students?status=pending" className="text-xs font-bold text-brand-azure hover:underline">View all</Link>
          </div>
          {data?.pendingStudents?.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">All caught up!</p>
            </div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Registered</th><th></th></tr></thead>
              <tbody>
                {data?.pendingStudents?.map(s => (
                  <tr key={s._id}>
                    <td className="font-semibold text-gray-800">{s.firstName} {s.lastName}</td>
                    <td className="text-gray-400 text-xs">{s.email}</td>
                    <td className="text-gray-400 text-xs">{formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}</td>
                    <td><Link to="/admin/students?status=pending"><button className="text-xs text-brand-azure font-bold hover:underline">Review</button></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
