import { useState, useEffect } from 'react';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('vtis_admin_token');
    setIsLoggedIn(!!token);
  }, []);

  const refresh = () => setIsLoggedIn(!!localStorage.getItem('vtis_admin_token'));

  return { isLoggedIn, refresh };
}
