import { useState, useEffect, useRef } from 'react';
import {
  Upload, FileText, Pencil, Trash2, Eye, EyeOff,
  ChevronDown, BookOpen, Plus
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { format } from 'date-fns';

const categoryOptions = [
  { value: 'notes', label: 'Notes' },
  { value: 'past_paper', label: 'Past Paper' },
  { value: 'lab_report', label: 'Lab Report' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'resource', label: 'Resource' },
];

const categoryColors = {
  notes: 'bg-blue-100 text-brand-azure-dark',
  past_paper: 'bg-violet-100 text-violet-700',
  lab_report: 'bg-emerald-100 text-emerald-700',
  assignment: 'bg-amber-100 text-amber-700',
  resource: 'bg-brand-pearl-dark text-gray-700',
};

const AdminContent = () => {
  const toast = useToast();
  const fileInputRef = useRef();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [content, setContent] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '', category: 'notes', year: '', sortOrder: '10', isPublished: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [editModal, setEditModal] = useState(null);

  useEffect(() => {
    adminAPI.getModules()
      .then(res => {
        setModules(res.data.data);
        if (res.data.data.length > 0) setSelectedModule(res.data.data[0]);
      })
      .catch(() => toast.error('Failed to load modules'))
      .finally(() => setLoadingModules(false));
  }, []);

  useEffect(() => {
    if (!selectedModule) return;
    setLoadingContent(true);
    adminAPI.getModuleContent(selectedModule._id)
      .then(res => setContent(res.data.data.content))
      .catch(() => toast.error('Failed to load content'))
      .finally(() => setLoadingContent(false));
  }, [selectedModule]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      if (!uploadForm.title) setUploadForm(f => ({ ...f, title: file.name.replace('.pdf', '') }));
    } else {
      toast.error('Only PDF files are allowed');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadForm.title) setUploadForm(f => ({ ...f, title: file.name.replace('.pdf', '') }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.error('Please select a PDF file');
    if (!selectedModule) return toast.error('Please select a module');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadForm.title);
    formData.append('category', uploadForm.category);
    formData.append('year', uploadForm.year);
    formData.append('sortOrder', uploadForm.sortOrder);
    formData.append('isPublished', uploadForm.isPublished);

    setUploading(true);
    setUploadProgress(0);
    try {
      await adminAPI.uploadContent(selectedModule._id, formData, setUploadProgress);
      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      setUploadForm({ title: '', category: 'notes', year: '', sortOrder: '10', isPublished: true });
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Refresh content
      const res = await adminAPI.getModuleContent(selectedModule._id);
      setContent(res.data.data.content);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      await adminAPI.updateContent(item._id, { isPublished: !item.isPublished });
      setContent(prev => prev.map(c => c._id === item._id ? { ...c, isPublished: !c.isPublished } : c));
      toast.success(item.isPublished ? 'Hidden from students' : 'Now visible to students');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await adminAPI.deleteContent(item._id);
      setContent(prev => prev.filter(c => c._id !== item._id));
      toast.success('Content deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.updateContent(editModal._id, {
        title: editModal.title,
        category: editModal.category,
        year: editModal.year,
        isPublished: editModal.isPublished,
        sortOrder: editModal.sortOrder,
      });
      setContent(prev => prev.map(c => c._id === editModal._id ? res.data.data : c));
      setEditModal(null);
      toast.success('Content updated');
    } catch { toast.error('Failed to update'); }
  };

  const fileSizeFormatted = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  if (loadingModules) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 text-center">Content Management</h1>
        <p className="text-gray-400 text-sm mt-1 text-center">Upload and manage module resources</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Panel (right on wireframe) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-brand-azure" /> Upload Form
            </h3>
            <form onSubmit={handleUpload} className="space-y-4">
              {/* Module Selector */}
              <div>
                <label className="label">Module</label>
                <select
                  className="input-field"
                  value={selectedModule?._id || ''}
                  onChange={e => setSelectedModule(modules.find(m => m._id === e.target.value))}
                >
                  {modules.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>

              {/* Dropzone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  isDragging ? 'border-brand-azure bg-brand-azure-light' :
                  selectedFile ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                {selectedFile ? (
                  <div>
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-emerald-700">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{fileSizeFormatted(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Drag PDFs here or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">Max 50MB · PDF only</p>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Title</label>
                <input
                  className="input-field" required value={uploadForm.title}
                  onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g. 2023 Final Exam"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input-field"
                    value={uploadForm.category}
                    onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                  >
                    {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Year</label>
                  <input
                    className="input-field" type="number" min="2000" max="2030"
                    value={uploadForm.year}
                    onChange={e => setUploadForm({ ...uploadForm, year: e.target.value })}
                    placeholder="2023"
                  />
                </div>
              </div>

              <div>
                <label className="label">Sort Order</label>
                <input
                  className="input-field" type="number"
                  value={uploadForm.sortOrder}
                  onChange={e => setUploadForm({ ...uploadForm, sortOrder: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadForm.isPublished}
                  onChange={e => setUploadForm({ ...uploadForm, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-azure"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Visible to students</p>
                  <p className="text-xs text-gray-400">Uncheck to hide as draft</p>
                </div>
              </label>

              {/* Progress bar */}
              {uploading && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-brand-pearl-dark rounded-full h-2">
                    <div
                      className="bg-brand-azure h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={uploading || !selectedFile} className="btn-primary w-full">
                <Upload className="w-4 h-4" />
                {uploading ? `Uploading ${uploadProgress}%...` : 'Upload to Server'}
              </button>
            </form>
          </div>
        </div>

        {/* Content List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">
                Current Content {selectedModule ? `— ${selectedModule.title}` : ''}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">{content.length} files</p>
            </div>
          </div>

          {loadingContent ? (
            <div className="flex items-center justify-center h-40"><LoadingSpinner /></div>
          ) : content.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No content uploaded yet for this module</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Year</th>
                    <th>Uploaded</th>
                    <th>Views</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {content.map(item => (
                    <tr key={item._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-8 bg-red-50 border border-red-100 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-red-500 text-xs font-bold">PDF</span>
                          </div>
                          <span className="font-medium text-gray-800 text-sm max-w-[180px] truncate">{item.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[item.category] || 'bg-brand-pearl-dark text-gray-600'}`}>
                          {categoryOptions.find(c => c.value === item.category)?.label || item.category}
                        </span>
                      </td>
                      <td className="text-gray-500 text-sm">{item.year || '—'}</td>
                      <td className="text-gray-400 text-xs">
                        {format(new Date(item.createdAt), 'dd MMM yy')}
                      </td>
                      <td className="text-gray-500 text-sm">{item.views}</td>
                      <td>
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                            item.isPublished
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-brand-pearl-dark text-gray-500 hover:bg-slate-200'
                          }`}
                        >
                          {item.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {item.isPublished ? 'Published' : 'Hidden'}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditModal({ ...item })}
                            className="p-1.5 text-gray-500 hover:bg-brand-pearl-dark rounded-lg"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Content" size="sm">
        {editModal && (
          <form onSubmit={handleEditSave} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                className="input-field" value={editModal.title}
                onChange={e => setEditModal({ ...editModal, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category</label>
                <select className="input-field" value={editModal.category}
                  onChange={e => setEditModal({ ...editModal, category: e.target.value })}>
                  {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <input type="number" className="input-field" value={editModal.year || ''}
                  onChange={e => setEditModal({ ...editModal, year: e.target.value })} placeholder="2023" />
              </div>
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input type="number" className="input-field" value={editModal.sortOrder}
                onChange={e => setEditModal({ ...editModal, sortOrder: parseInt(e.target.value) })} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-brand-azure"
                checked={editModal.isPublished}
                onChange={e => setEditModal({ ...editModal, isPublished: e.target.checked })} />
              <span className="text-sm font-medium text-gray-700">Visible to students</span>
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminContent;
