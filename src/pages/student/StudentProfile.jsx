import { useState } from 'react';
import { User, Mail, Phone, Shield, Bell, Trash2, Save, Lock, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import { format } from 'date-fns';

const Toggle = ({ checked, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${checked ? 'bg-brand-azure' : 'bg-gray-200'}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const StudentProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const toast  = useToast();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
    notifyEmail:          user?.notifyEmail          ?? true,
    notifyAnnouncements:  user?.notifyAnnouncements  ?? true,
    notifyWeeklyDigest:   user?.notifyWeeklyDigest   ?? false,
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [savingProfile,  setSavingProfile]  = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    if (passwordForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setSavingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    try { await authAPI.deleteAccount(); logout(); navigate('/'); }
    catch { toast.error('Failed to delete account'); }
  };

  // ── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-7 max-w-5xl mx-auto">

      {/* Page header — centred */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1.5">Manage your account settings</p>
      </div>

      {/* ── ROW 1 · Profile header card — centred, full width ── */}
      <div className="card p-7 flex flex-col sm:flex-row items-center gap-6 mx-auto">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-glow-azure"
          style={{ background: 'linear-gradient(135deg, #0077C8, #3B99E0)' }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
          <div className="flex items-center gap-3 mt-3 flex-wrap justify-center sm:justify-start">
            <span className="badge-active">✓ Active Student</span>
            <span className="text-xs text-gray-400">
              Member since {user?.memberSince ? format(new Date(user.memberSince), 'MMM yyyy') : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 2 · Personal Info (left) + Notifications (right) ── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Personal Info — left */}
        <div className="card p-6">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-azure" /> Personal Information
          </h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input className="input-field" value={profileForm.firstName}
                  onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input-field" value={profileForm.lastName}
                  onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Email Address <span className="text-gray-400 normal-case font-normal tracking-normal">(read-only)</span></label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input-field pl-10 bg-brand-pearl text-gray-400 cursor-not-allowed"
                  value={user?.email} readOnly />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Email cannot be changed to prevent account hijacking
              </p>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input-field pl-10" value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+267 72 000 000" />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button type="submit" disabled={savingProfile} className="btn-primary">
                <Save className="w-4 h-4" />
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Notifications — right */}
        <div className="card p-6">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-azure" /> Notification Preferences
          </h3>
          <div className="space-y-5">
            {[
              { key:'notifyEmail',         label:'Email me on new content',      desc:'Get notified when new notes or papers are uploaded' },
              { key:'notifyAnnouncements', label:'Email me on announcements',    desc:'Receive important announcements from your tutor' },
              { key:'notifyWeeklyDigest',  label:'Weekly progress digest',       desc:'Summary of your study activity each week' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-1">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle checked={profileForm[key]} onChange={val => setProfileForm({ ...profileForm, [key]: val })} />
              </div>
            ))}
          </div>
          <div className="pt-5 mt-5 border-t border-gray-100 flex justify-end">
            <button onClick={handleProfileSave} disabled={savingProfile} className="btn-primary">
              <Save className="w-4 h-4" />
              {savingProfile ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 3 · Change Password (left) + Enrolled Modules (right) ── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Change Password — left */}
        <div className="card p-6">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-azure" /> Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input-field" placeholder="••••••••" required
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input-field" placeholder="••••••••" minLength={8} required
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input-field" placeholder="••••••••" required
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
            </div>
            <div className="flex justify-end pt-1">
              <button type="submit" disabled={savingPassword} className="btn-primary">
                <Lock className="w-4 h-4" />
                {savingPassword ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Enrolled Modules — right */}
        <div className="card p-6">
          <h3 className="section-title mb-5">Enrolled Modules</h3>
          {user?.enrolledModules?.length > 0 ? (
            <div className="space-y-2.5">
              {user.enrolledModules.map(mod => (
                <div key={mod._id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 border border-brand-azure/20"
                  style={{ background: 'linear-gradient(135deg, #E8F4FF, #F0F7FF)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: (mod.color || '#0077C8') + '20' }}>
                    <span className="text-base">🧪</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{mod.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{mod.code}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-brand-azure flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No modules assigned yet</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            Module enrolment is managed by your tutor
          </p>
        </div>
      </div>

      {/* ── ROW 4 · Danger Zone — full width, centred ── */}
      <div className="card p-6 border border-red-100 col-span-2">
        <div className="text-center mb-4">
          <h3 className="section-title text-red-600 flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h3>
          <p className="text-sm text-gray-400 mt-1">Once you delete your account, all your data and access will be permanently removed. This cannot be undone.</p>
        </div>
        <div className="flex justify-center">
          <button onClick={() => setDeleteModal(true)} className="btn-danger">
            <Trash2 className="w-4 h-4" /> Delete My Account
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Account" size="sm">
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Are you absolutely sure? All your data, progress, and access will be <strong>permanently removed</strong>.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDeleteAccount} className="btn-danger flex-1">Yes, Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


export default StudentProfile;
