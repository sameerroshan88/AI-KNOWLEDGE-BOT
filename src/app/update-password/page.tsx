"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const [tokenFound, setTokenFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Parse access_token from URL hash (Supabase sends it in the fragment)
    if (typeof window === "undefined") return;
    const hash = window.location.hash ? window.location.hash.substring(1) : window.location.search.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token) {
      setTokenFound(true);
      // set session so updateUser works
      (async () => {
        setLoading(true);
        try {
          await supabase.auth.setSession({ access_token, refresh_token });
        } catch (err) {
          console.warn('setSession error', err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await supabase.auth.updateUser({ password });
      if ((res as any)?.error) {
        setError((res as any).error.message || 'Failed to update password');
        setLoading(false);
        return;
      }

      alert('Password updated successfully. Please sign in with your new password.');
      router.push('/');
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!tokenFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md p-8">
          <h2 className="text-2xl font-bold mb-4">Password reset</h2>
          <p className="mb-4">No reset token found in the URL. Please use the "Forgot password" flow from the login page and follow the link in your email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full p-8 bg-zinc-900/60 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Set a new password</h2>
        {error && <div className="mb-4 text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded bg-black/60 border" />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full p-3 rounded bg-black/60 border" />
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full p-3 bg-white text-black rounded">
              {loading ? 'Updating...' : 'Set new password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
