import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { apiFetch } from '../services/apiClient';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const toast = useToast();
  const [statusText, setStatusText] = useState('Verifying Microsoft 365 Authenticator credentials...');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setErrorMsg(`Microsoft Authentication Error: ${searchParams.get('error_description') || error}`);
      return;
    }

    if (!code) {
      setErrorMsg('No authorization code received from Microsoft 365.');
      return;
    }

    const processOAuth = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        const res = await apiFetch('/auth/microsoft/callback/', {
          method: 'POST',
          body: JSON.stringify({ code, redirect_uri: redirectUri }),
        });

        if (res?.status === 'success') {
          if (res.ms_access_token) {
            sessionStorage.setItem('ms_access_token', res.ms_access_token);
          }
          if (res.user) {
            await updateProfile(res.user);
          }
          toast?.('Microsoft 365 Account successfully connected & verified with Authenticator!', 'success');
          navigate('/meetings');
        } else {

          setErrorMsg(res?.error || 'Failed to exchange Microsoft authorization token.');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setErrorMsg('Authentication request failed. Please try again.');
      }
    };

    processOAuth();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center space-y-4 border border-ink-100">
        {errorMsg ? (
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-lg font-bold text-ink-900">Authentication Failed</h2>
            <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl font-medium">{errorMsg}</p>
            <button
              onClick={() => navigate('/meetings')}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Return to Meetings
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <RefreshCw className="animate-spin" size={28} />
            </div>
            <h2 className="text-base font-bold text-ink-900">Microsoft Authenticator Verification</h2>
            <p className="text-xs text-ink-500">{statusText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
