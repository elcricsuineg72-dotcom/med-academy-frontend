import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, FileText, File } from 'lucide-react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const moduleIcons = { flask: '🧪', atom: '⚗️', beaker: '🔬', grid: '🧲', dna: '🧬', fire: '🔥' };

const StudentModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getModules()
      .then(res => setModules(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading modules..." />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">My Modules</h1>
        <p className="text-gray-500 mt-1">Your enrolled chemistry subjects</p>
      </div>

      {modules.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No modules yet</h3>
          <p className="text-gray-400">Your tutor hasn't enrolled you in any modules yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <Link key={mod._id} to={`/student/modules/${mod._id}`}>
              <div className="card hover:shadow-lg transition-all duration-200 group cursor-pointer overflow-hidden">
                {/* Color header */}
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: mod.color || '#0077C8' }}
                />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: (mod.color || '#2563EB') + '15' }}
                    >
                      {moduleIcons[mod.icon] || '🧪'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 group-hover:text-brand-azure transition-colors leading-tight">
                        {mod.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{mod.code}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                    {mod.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-brand-azure" />
                      <span>{mod.notesCount ?? 0} notes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <File className="w-4 h-4 text-violet-500" />
                      <span>{mod.papersCount ?? 0} papers</span>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs text-gray-400">
                        by {mod.instructor?.firstName} {mod.instructor?.lastName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-3 text-brand-azure text-sm font-medium group-hover:gap-2 transition-all">
                    Open Module <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentModules;
