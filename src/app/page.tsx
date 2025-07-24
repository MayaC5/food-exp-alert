'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      return router.replace('/view');
    } else {
      return router.replace('/login');
    }
  }, [router]);

}
