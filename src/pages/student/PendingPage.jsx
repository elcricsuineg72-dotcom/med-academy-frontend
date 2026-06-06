import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, FlaskConical, CheckCircle } from 'lucide-react';

const PendingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-brand-pearl flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-azure rounded-xl flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <p className="font-bold text-gray-900 text-xl">Med Academy</p>
        </div>

        <div className="card p-8">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">Account Pending Approval</h1>
          <p className="text-gray-500 mb-6">
            Welcome, <strong className="text-gray-800">{user?.firstName}</strong>! Your account has been created and is currently pending review by your tutor.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
            <h3 className="font-semibold text-amber-800 mb-3">What happens next?</h3>
            <div className="space-y-2">
              {[
                'Your tutor reviews your registration',
                'You get assigned to your chemistry modules',
                'Your account is activated',
                'You receive an email notification',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-amber-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-400 mb-6">
            Registered as: <span className="font-medium text-gray-600">{user?.email}</span>
          </div>

          <button onClick={handleLogout} className="btn-secondary w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <p className="text-sm text-gray-400">
          This usually takes 1–2 business days. Contact your tutor if it takes longer.
        </p>
      </div>
    </div>
  );
};

export default PendingPage;
