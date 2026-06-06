import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Users, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

const MODULE_ICONS = ['flask', 'atom', 'beaker', 'grid', 'dna', 'fire'];
const MODULE_COLORS = [
  { label: 'Blue', value: '#2563EB' }, { label: 'Violet', value: '#7C3AED' },
  { label: 'Green', value: '#059669' }, { label: 'Red', value: '#DC2626' },
  { label: 'Amber', value: '#D97706' }, { label: 'Orange', value: '#EA580C' },
];
const moduleIcons = { flask: '🧪', atom: '⚗️', beaker: '🔬', grid: '🧲', dna: '🧬', fire: '🔥' };

const defaultForm = { title: '', code: '', description: '', icon: 'flask', color: '#2563EB', isPublished: false };

const AdminModules = () => {
  const toast = useToast();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getModules();
      setModules(res.data.data);
    } catch { toast.error('Failed to load modules'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchModules(); }, []);

  const openCreate = () => {
    setEditingModule(null);
    setForm(defaultForm);
    setModal(true);
  };

  const openEdit = (mod) => {
    setEditingModule(mod);
    setForm({
      title: mod.title, code: mod.code, description: mod.description,
      icon: mod.icon, color: mod.color, isPublished: mod.isPublished,
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingModule) {
        await adminAPI.updateModule(editingModule._id, form);
        toast.success('Module updated');
      } else {
        await adminAPI.createModule(form);
        toast.success('Module created');
      }
      setModal(false);
      fetchModules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save module');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mod) => {
    if (!confirm(`Delete "${mod.title}"? All its content will remain but won't be associated.`)) return;
    try {
      await adminAPI.deleteModule(mod._id);
      toast.success('Module deleted');
      fetchModules();
    } catch { toast.error('Failed to delete'); }
  };

  const handleTogglePublish = async (mod) => {
    try {
      await adminAPI.updateModule(mod._id, { isPublished: !mod.isPublished });
      toast.success(mod.isPublished ? 'Module hidden from students' : 'Module published');
      fetchModules();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h1 className="font-display text-3xl font-bold text-gray-900">Modules</h1>
        <p className="text-gray-400 text-sm mt-1">Create and manage chemistry modules</p>
      </div>
      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> New Module
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      ) : modules.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <p className="text-gray-500">No modules yet. Create your first module.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map(mod => (
            <div key={mod._id} className="card overflow-hidden">
              <div className="h-1.5 w-full" style={{ backgroundColor: mod.color }} />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: mod.color + '15' }}
                  >
                    {moduleIcons[mod.icon] || '🧪'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{mod.title}</h3>
                    <p className="text-xs font-mono text-gray-400">{mod.code}</p>
                  </div>
                  <button
                    onClick={() => handleTogglePublish(mod)}
                    className={`flex-shrink-0 ${mod.isPublished ? 'text-emerald-600' : 'text-slate-300'}`}
                    title={mod.isPublished ? 'Published - click to hide' : 'Hidden - click to publish'}
                  >
                    {mod.isPublished
                      ? <ToggleRight className="w-6 h-6" />
                      : <ToggleLeft className="w-6 h-6" />
                    }
                  </button>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{mod.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {mod.enrolledStudents?.length || 0} students
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> {mod.contentCount ?? 0} files
                  </span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full font-medium ${
                    mod.isPublished ? 'badge-published' : 'badge-draft'
                  }`}>
                    {mod.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                  <button onClick={() => openEdit(mod)} className="btn-secondary flex-1 text-sm py-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(mod)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editingModule ? `Edit: ${editingModule.title}` : 'Create New Module'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Module Title</label>
              <input
                className="input-field" required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Organic Chemistry"
              />
            </div>
            <div>
              <label className="label">Module Code</label>
              <input
                className="input-field font-mono" required value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. CHEM201"
              />
            </div>
            <div>
              <label className="label">Icon</label>
              <select
                className="input-field"
                value={form.icon}
                onChange={e => setForm({ ...form, icon: e.target.value })}
              >
                {MODULE_ICONS.map(i => (
                  <option key={i} value={i}>{moduleIcons[i]} {i}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field resize-none" rows={3} required
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this module..."
            />
          </div>

          <div>
            <label className="label">Color Theme</label>
            <div className="flex gap-3 flex-wrap">
              {MODULE_COLORS.map(c => (
                <button
                  key={c.value} type="button"
                  onClick={() => setForm({ ...form, color: c.value })}
                  className={`w-9 h-9 rounded-lg border-2 transition-all ${
                    form.color === c.value ? 'border-slate-900 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 bg-brand-pearl rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={e => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 rounded text-brand-azure"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">Publish immediately</p>
              <p className="text-xs text-gray-400">Students can see published modules</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editingModule ? 'Update Module' : 'Create Module'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminModules;
