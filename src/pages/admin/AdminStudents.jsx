import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Plus, Download, Check, X, Pencil, Trash2,
  ChevronLeft, ChevronRight, Filter, Users
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { formatDistanceToNow, format } from 'date-fns';

const statusBadge = {
  active: <span className="badge-active">Active</span>,
  pending: <span className="badge-pending">Pending</span>,
  suspended: <span className="badge-suspended">Suspended</span>,
};

const AdminStudents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);

  const [approveModal, setApproveModal] = useState(null); // student to approve
  const [selectedModules, setSelectedModules] = useState([]);
  const [approving, setApproving] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getStudents({ status: statusFilter, search, page });
      setStudents(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    adminAPI.getModules().then(res => setModules(res.data.data)).catch(() => {});
  }, []);

  // Sync status filter from URL
  useEffect(() => {
    const s = searchParams.get('status');
    if (s) setStatusFilter(s);
  }, [searchParams]);

  const openApproveModal = (student) => {
    setApproveModal(student);
    setSelectedModules(student.requestedSubjects?.map(subj => {
      const mod = modules.find(m => m.title.toLowerCase().includes(subj.toLowerCase().split(' ')[0]));
      return mod?._id;
    }).filter(Boolean) || []);
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    setApproving(true);
    try {
      await adminAPI.approveStudent(approveModal._id, { moduleIds: selectedModules });
      toast.success(`${approveModal.firstName} ${approveModal.lastName} approved!`);
      setApproveModal(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await adminAPI.updateStudentStatus(studentId, { status: newStatus });
      toast.success('Status updated');
      fetchStudents();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (student) => {
    if (!confirm(`Delete ${student.firstName} ${student.lastName}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteStudent(student._id);
      toast.success('Student deleted');
      fetchStudents();
    } catch {
      toast.error('Failed to delete student');
    }
  };

  const pendingCount = students.filter(s => s.status === 'pending').length;
  const activeCount = students.filter(s => s.status === 'active').length;
  const suspendedCount = students.filter(s => s.status === 'suspended').length;

  const tabs = [
    { label: `All (${pagination.total})`, value: 'all' },
    { label: `Pending (${pendingCount})`, value: 'pending', dot: pendingCount > 0 },
    { label: `Active (${activeCount})`, value: 'active' },
    { label: `Suspended (${suspendedCount})`, value: 'suspended' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 mb-2">
        <h1 className="font-display text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-400 text-sm">Approve, enrol, and manage student accounts</p>
      </div>
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-sm py-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-10"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="all">Status: All</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select className="input-field w-auto">
          <option>Module: All</option>
          {modules.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
        </select>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-gray-200 flex gap-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              statusFilter === tab.value
                ? 'border-brand-azure text-brand-azure'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.dot && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner size="md" text="Loading students..." />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" className="rounded" /></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Requested Subjects</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td>
                      <input type="checkbox" className="rounded"
                        checked={selectedRows.includes(student._id)}
                        onChange={e => setSelectedRows(prev =>
                          e.target.checked ? [...prev, student._id] : prev.filter(id => id !== student._id)
                        )}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-brand-azure-dark text-xs font-semibold flex-shrink-0">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <span className="font-medium text-gray-800">
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="text-gray-500 text-xs">{student.email}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {student.requestedSubjects?.slice(0, 2).map(s => (
                          <span key={s} className="text-xs bg-brand-pearl-dark text-gray-600 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                        {student.requestedSubjects?.length > 2 && (
                          <span className="text-xs text-gray-400">+{student.requestedSubjects.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>{statusBadge[student.status]}</td>
                    <td className="text-gray-400 text-xs">
                      {format(new Date(student.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {student.status === 'pending' && (
                          <button
                            onClick={() => openApproveModal(student)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {student.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(student._id, 'suspended')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Suspend"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {student.status === 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(student._id, 'active')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Reactivate"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(student)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 text-sm rounded-lg ${page === i + 1 ? 'bg-brand-azure text-white' : 'text-gray-600 hover:bg-brand-pearl-dark'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={!!approveModal}
        onClose={() => setApproveModal(null)}
        title={`Approve Student: ${approveModal?.firstName} ${approveModal?.lastName}`}
        size="md"
      >
        <div className="space-y-5">
          <div className="bg-brand-pearl rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Student Details</p>
            <p className="text-sm text-gray-600">{approveModal?.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Requested: {approveModal?.requestedSubjects?.join(', ') || 'None specified'}
            </p>
          </div>

          <div>
            <label className="label mb-3">Assign Modules</label>
            <div className="space-y-2">
              {modules.filter(m => m.isPublished).map(mod => (
                <label key={mod._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-pearl cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-brand-azure"
                    checked={selectedModules.includes(mod._id)}
                    onChange={e => setSelectedModules(prev =>
                      e.target.checked ? [...prev, mod._id] : prev.filter(id => id !== mod._id)
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{mod.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{mod.code}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setApproveModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleApprove} disabled={approving} className="btn-primary flex-1">
              <Check className="w-4 h-4" />
              {approving ? 'Approving...' : 'Approve & Enrol'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminStudents;
