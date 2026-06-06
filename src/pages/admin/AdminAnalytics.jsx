import { useState, useEffect } from 'react';
import { Eye, Download, Clock, Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format } from 'date-fns';

const StatCard = ({ label, value, sub, icon: Icon, trend, color }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-display font-bold text-gray-900 mt-1">{value}</p>
        {sub && (
          <p className={`text-xs mt-1 flex items-center gap-1 font-medium ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
          }`}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {sub}
          </p>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    adminAPI.getAnalytics({ days })
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Crunching analytics data..." />
    </div>
  );

  // Build daily trend chart data
  const trendMap = {};
  data?.dailyTrend?.forEach(item => {
    const date = item._id.date;
    if (!trendMap[date]) trendMap[date] = { date, views: 0, downloads: 0 };
    if (item._id.action === 'view') trendMap[date].views = item.count;
    if (item._id.action === 'download') trendMap[date].downloads = item.count;
  });
  const trendData = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);

  // Heatmap data
  const days7 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const heatmapGrid = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      const entry = data?.heatmapData?.find(h => h._id.dayOfWeek === day + 1 && h._id.hour === hour);
      return entry?.count || 0;
    })
  );
  const maxHeat = Math.max(...heatmapGrid.flat(), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Student Engagement Analytics</h1>
          <p className="text-gray-500 mt-1">Track how students interact with your content</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="input-field w-auto"
            value={days}
            onChange={e => setDays(parseInt(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button className="btn-secondary text-sm py-2">Export Report</button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Views" value={data?.summary?.totalViews?.toLocaleString() ?? 0} sub="+12% vs last period" trend="up" icon={Eye} color="bg-brand-azure" />
        <StatCard label="Total Downloads" value={data?.summary?.totalDownloads?.toLocaleString() ?? 0} sub="+8% vs last period" trend="up" icon={Download} color="bg-violet-600" />
        <StatCard label="Avg Session" value={`${data?.summary?.avgSession ?? 0}min`} sub="-3% vs last period" trend="down" icon={Clock} color="bg-amber-500" />
        <StatCard label="Active Students Today" value={data?.summary?.activeToday ?? 0} icon={Users} color="bg-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily Trend Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="section-title mb-5">Daily Engagement Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={d => d.slice(5)} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="views" stroke="#0077C8" strokeWidth={2} dot={false} name="Views" />
                <Line type="monotone" dataKey="downloads" stroke="#7C3AED" strokeWidth={2} dot={false} name="Downloads" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No trend data yet</div>
          )}
        </div>

        {/* Most Viewed Content */}
        <div className="card p-6">
          <h3 className="section-title mb-5">Most Viewed Content</h3>
          {data?.mostViewedContent?.length > 0 ? (
            <div className="space-y-3">
              {data.mostViewedContent.map((item, i) => (
                <div key={item._id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium truncate flex-1 pr-2">{item.title}</span>
                    <span className="text-gray-500 font-semibold flex-shrink-0">{item.views}</span>
                  </div>
                  <div className="w-full bg-brand-pearl-dark rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${(item.views / data.mostViewedContent[0].views) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Per-Student Activity Log */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="section-title">Per-Student Activity Log</h3>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="data-table">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Module</th>
                  <th>Content</th>
                  <th>Action</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {data?.studentActivity?.map((log, i) => (
                  <tr key={log._id}>
                    <td className="text-gray-400">{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-brand-azure-dark text-xs flex-shrink-0">
                          {log.student?.firstName?.[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {log.student?.firstName} {log.student?.lastName?.charAt(0)}.
                        </span>
                      </div>
                    </td>
                    <td className="text-gray-500 text-xs">{log.module?.title}</td>
                    <td className="text-gray-700 text-sm max-w-[160px] truncate">{log.content?.title}</td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        log.action === 'download'
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-blue-100 text-brand-azure-dark'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="text-gray-400 text-xs">
                      {format(new Date(log.createdAt), 'dd MMM, h:mm a')}
                    </td>
                  </tr>
                ))}
                {(!data?.studentActivity || data.studentActivity.length === 0) && (
                  <tr><td colSpan={6} className="text-center text-gray-400 py-6">No activity data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> At-Risk Students
          </h3>
          <p className="text-xs text-gray-400 mb-4">No activity in the last 14 days</p>
          {data?.atRiskStudents?.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">All students are active!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.atRiskStudents?.map(student => (
                <div key={student._id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                  <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 text-xs font-semibold flex-shrink-0">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-amber-600">No activity in 14+ days</p>
                  </div>
                  <button className="text-xs text-brand-azure font-semibold hover:underline flex-shrink-0">
                    Remind
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="card p-6">
        <h3 className="section-title mb-5">Activity Heatmap (by Day & Hour)</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 justify-start pt-5">
              {days7.map(d => (
                <div key={d} className="h-6 flex items-center text-xs text-gray-400 w-8">{d}</div>
              ))}
            </div>
            <div className="flex-1">
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="flex-1 text-center text-xs text-gray-400" style={{ minWidth: '20px' }}>
                    {h % 4 === 0 ? `${h}h` : ''}
                  </div>
                ))}
              </div>
              {heatmapGrid.map((row, dayIdx) => (
                <div key={dayIdx} className="flex gap-0.5 mb-0.5">
                  {row.map((count, hour) => {
                    const intensity = count / maxHeat;
                    const opacity = intensity > 0 ? Math.max(0.15, intensity) : 0;
                    return (
                      <div
                        key={hour}
                        className="flex-1 h-6 rounded-sm transition-all"
                        style={{
                          minWidth: '20px',
                          backgroundColor: count > 0 ? `rgba(0, 119, 200, ${opacity})` : '#f1f5f9',
                        }}
                        title={`${days7[dayIdx]} ${hour}:00 — ${count} activities`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-xs text-gray-400">Less</span>
            {[0.15, 0.35, 0.55, 0.75, 1].map(o => (
              <div key={o} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(0, 119, 200, ${o})` }} />
            ))}
            <span className="text-xs text-gray-400">More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
