import { useState, useEffect } from 'react';

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem("hd_admin_mode") === "true";
    } catch {}
    return false;
  });

  useEffect(() => {
    const handleAdminModeChange = (e: any) => {
      setIsAdmin(e.detail.isAdmin);
    };
    window.addEventListener('admin_mode_changed', handleAdminModeChange);
    return () => window.removeEventListener('admin_mode_changed', handleAdminModeChange);
  }, []);

  return isAdmin;
}
