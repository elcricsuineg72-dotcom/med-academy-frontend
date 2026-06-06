import { useState, useEffect } from 'react';
import {
  Plus, Globe, BookOpen, Clock, Pencil, Trash2,
  Copy, Bell, CheckCircle, Send
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { formatDistanceToNow, format } from 'date-fns';

const defaultForm = {
  title: '', body: '', scope: 'global', targetModule: '',
  status: 'draft', notifyViaEmail: false, scheduledAt: '',
};

const AdminAnnouncements = () => {
  const toast = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [annRes, modRes] = await Promise.all([
        adminAPI.getAnnouncements(),
        adminAPI.getModules(),
      ]);
      setAnnouncements(annRes.data.data);
      setModules(modRes.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (statusOverride) => {
    if (!form.title.trim() || !form.body.trim()) {
      return toast.error('Title and body are required');
    }
    setSaving(true);
    const payload = {
      ...form,
      status: statusOverride || form.status,
      targetModule: form.scope === 'module' ? form.targetModule : null,
    };
    try {
      if (editingId) {
        const res = await adminAPI.updateAnnouncement(editingId, payload);
        setAnnouncements(prev => prev.map(a => a._id === editingId ? res.data.data : a));
        toast.success('Announcement updated');
      } else {
        const res = await adminAPI.createAnnouncement(payload);
        setAnnouncements(prev => [res.data.data, ...prev]);
        toast.success(statusOverride === 'published' ? 'Announcement published!' : 'Saved as draft');
      }
      setForm(defaultForm);
      setEditingId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ann) => {
    setEditingId(ann._id);
    setForm({
      title: ann.title,
      body: ann.body,
      scope: ann.scope,
      targetModule: ann.targetModule?._id || '',
      status: ann.status,
      notifyViaEmail: ann.notifyViaEmail,
      scheduledAt: '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicate = (ann) => {
    setEditingId(null);
    setForm({
      title: `[Copy] ${ann.title}`,
      body: ann.body,
      scope: ann.scope,
      targetModule: ann.targetModule?._id || '',
      status: 'draft',
      notifyViaEmail: false,
      scheduledAt: '',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await adminAPI.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = announcements.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'global') return a.scope === 'global' && a.status === 'published';
    if (filter === 'module') return a.scope === 'module' && a.status === 'published';
    if (filter === 'draft') return a.status === 'draft';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 text-center">Announcements</h1>
        <p className="text-gray-400 text-sm mt-1 text-center">Broadcast updates to students</p>
        </div>
        <div className="text-sm text-gray-400">
          {announcements.filter(a => a.status === 'published').length} active ·{' '}
          {announcements.filter(a => a.status === 'draft').length} drafts ·{' '}
          {announcements.reduce((sum, a) => sum + (a.views || 0), 0)} total views
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Compose Panel (40%) */}
        <div className="lg:col-span-2">
          <div className="card p-5 sticky top-20">
            <h3 className="section-title mb-4">
              {editingId ? '✏️ Edit Announcement' : '✉️ Create Announcement'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  className="input-field" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Exam Schedule Update"
                />
              </div>

              <div>
                <label className="label">Scope</label>
                <div className="flex gap-4">
                  {[
                    { val: 'global', label: 'Global (all students)', icon: Globe },
                    { val: 'module', label: 'Per-Module', icon: BookOpen },
                  ].map(opt => (
                    <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="scope" value={opt.val}
                        checked={form.scope === opt.val}
                        onChange={() => setForm({ ...form, scope: opt.val })}
                        className="text-brand-azure"
                      />
                      <opt.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {form.scope === 'module' && (
                <div>
                  <label className="label">Target Module</label>
                  <select
                    className="input-field"
                    value={form.targetModule}
                    onChange={e => setForm({ ...form, targetModule: e.target.value })}
                  >
                    <option value="">Select module...</option>
                    {modules.map(m => (
                      <option key={m._id} value={m._id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="label">Body</label>
                <textarea
                  className="input-field resize-none text-sm" rows={6}
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  placeholder="Write your announcement here... (HTML supported)"
                />
                <p className="text-xs text-gray-400 mt-1">Tip: You can use HTML tags like &lt;strong&gt;, &lt;p&gt;, &lt;ol&gt;</p>
              </div>

              <div>
                <label className="label">Schedule</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="schedule" value="now"
                      checked={!form.scheduledAt}
                      onChange={() => setForm({ ...form, scheduledAt: '' })}
                      className="text-brand-azure"
                    />
                    <span className="text-sm text-gray-700">Send Now</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="schedule" value="later"
                      checked={!!form.scheduledAt}
                      onChange={() => setForm({ ...form, scheduledAt: new Date().toISOString().slice(0, 16) })}
                      className="text-brand-azure"
                    />
                    <span className="text-sm text-gray-700">Schedule for later</span>
                  </label>
                  {form.scheduledAt && (
                    <input
                      type="datetime-local" className="input-field text-sm"
                      value={form.scheduledAt}
                      onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-brand-pearl rounded-lg">
                <input
                  type="checkbox" className="w-4 h-4 rounded text-brand-azure"
                  checked={form.notifyViaEmail}
                  onChange={e => setForm({ ...form, notifyViaEmail: e.target.checked })}
                />
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Notify via email</span>
              </label>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={saving}
                  className="btn-secondary flex-1 text-sm py-2.5"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit('published')}
                  disabled={saving}
                  className="btn-primary flex-1 text-sm py-2.5"
                >
                  <Send className="w-4 h-4" />
                  {saving ? 'Publishing...' : 'Publish Now'}
                </button>
              </div>

              {editingId && (
                <button
                  onClick={() => { setForm(defaultForm); setEditingId(null); }}
                  className="text-sm text-gray-400 hover:text-gray-600 w-full text-center"
                >
                  Cancel editing
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Announcements List (60%) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { val: 'all', label: 'All' },
              { val: 'global', label: 'Global' },
              { val: 'module', label: 'Per-Module' },
              { val: 'draft', label: 'Drafts' },
            ].map(f => (
              <button
                key={f.val}
                onClick={() => setFilter(f.val)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f.val
                    ? 'bg-brand-charcoal text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-brand-pearl'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40"><LoadingSpinner /></div>
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No announcements yet</p>
            </div>
          ) : (
            filtered.map(ann => {
              const readPercent = ann.views > 0 ? Math.round((ann.readCount / ann.views) * 100) : 0;
              return (
                <div key={ann._id} className="card p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      ann.scope === 'global' ? 'bg-blue-100' : 'bg-violet-100'
                    }`}>
                      {ann.scope === 'global'
                        ? <Globe className="w-4 h-4 text-brand-azure" />
                        : <BookOpen className="w-4 h-4 text-violet-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm">{ann.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          ann.status === 'published' ? 'badge-published' : 'badge-draft'
                        }`}>
                          {ann.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ann.scope === 'global' ? 'Global' : ann.targetModule?.title || 'Module'} ·{' '}
                        Posted {formatDistanceToNow(new Date(ann.publishedAt || ann.createdAt), { addSuffix: true })} by{' '}
                        {ann.author?.firstName} {ann.author?.lastName}
                        {ann.views > 0 && ` · ${ann.views} recipients`}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 ml-11">
                    {ann.body.replace(/<[^>]*>/g, '')}
                  </p>

                  {ann.status === 'published' && ann.views > 0 && (
                    <div className="ml-11 mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>{ann.readCount || 0} read</span>
                        <span>{readPercent}% read rate</span>
                      </div>
                      <div className="w-full bg-brand-pearl-dark rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${readPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-11">
                    <button onClick={() => handleEdit(ann)} className="btn-secondary text-xs py-1.5 px-3">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDuplicate(ann)} className="btn-secondary text-xs py-1.5 px-3">
                      <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>
                    <button onClick={() => handleDelete(ann._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
