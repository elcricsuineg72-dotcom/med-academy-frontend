import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Upload, Bell,
  BarChart2, LogOut, FlaskConical, Menu, ChevronDown, Search, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/admin/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/students',       icon: Users,           label: 'Students' },
  { path: '/admin/modules',        icon: BookOpen,        label: 'Modules' },
  { path: '/admin/content',        icon: Upload,          label: 'Content' },
  { path: '/admin/announcements',  icon: Bell,            label: 'Announcements' },
  { path: '/admin/analytics',      icon: BarChart2,       label: 'Analytics' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/auth'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #0077C8, #3B99E0)' }}>
          <FlaskConical className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm tracking-tight leading-none">Med Academy</p>
          <div className="flex items-center gap-1 mt-1">
            <Shield className="w-3 h-3 text-brand-gold" />
            <p className="text-brand-gold text-xs font-semibold tracking-wide">ADMIN PANEL</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User — single, bottom */}
      <div className="px-3 pb-5 border-t border-white/8 pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96A)' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-brand-gold text-xs truncate">Tutor</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="sidebar-nav-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 mt-1">
          <LogOut style={{ width: '18px', height: '18px' }} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen" style={{ background: '#F7F8FC' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0 sticky top-0 h-screen"
        style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #1C1C2E 100%)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 flex flex-col z-50"
            style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #1C1C2E 100%)' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-3.5 flex items-center gap-4 sticky top-0 z-30"
          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-gray-700">
            <Menu className="w-6 h-6" />
          </button>

          {/* Search — centred, wider */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-lg">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search students, modules, content..."
                className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-brand-azure/30 focus:border-brand-azure
                           bg-brand-pearl text-gray-700 placeholder-gray-400 transition-all" />
            </div>
          </div>

          {/* Right — single user pill only */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <NavLink to="/admin/students?status=pending">
              <button className="p-2 text-gray-400 hover:text-brand-azure hover:bg-brand-azure-light rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
              </button>
            </NavLink>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 hover:bg-brand-pearl rounded-xl px-2.5 py-1.5 transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96A)' }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-gray-700">{user?.firstName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-card-hover py-1.5 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
