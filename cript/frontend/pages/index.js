import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated()) {
      router.push('/secrets');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>Redirecting...</p>
    </div>
  );
}
