'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<string>('Testing...');

  useEffect(() => {
    async function test() {
      try {
        // Test localStorage
        localStorage.setItem('test', 'works');
        const testValue = localStorage.getItem('test');
        setResult(prev => prev + `\nLocalStorage: ${testValue === 'works' ? '✅' : '❌'}`);

        // Test login API
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
        });
        const loginData = await loginRes.json();
        setResult(prev => prev + `\nLogin API: ${loginRes.ok ? '✅' : '❌'}`);
        setResult(prev => prev + `\nToken received: ${loginData.token ? '✅' : '❌'}`);

        if (loginData.token) {
          // Save token
          localStorage.setItem('token', loginData.token);
          setResult(prev => prev + `\nToken saved: ✅`);

          // Test profile API
          const profileRes = await fetch('/api/user/profile', {
            headers: { Authorization: `Bearer ${loginData.token}` }
          });
          const profileData = await profileRes.json();
          setResult(prev => prev + `\nProfile API: ${profileRes.ok ? '✅' : '❌'}`);
          setResult(prev => prev + `\nProfile data: ${JSON.stringify(profileData)}`);
        }
      } catch (error) {
        setResult(prev => prev + `\nError: ${error}`);
      }
    }
    test();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Production Debug Test</h1>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f0f0f0', padding: '10px' }}>
        {result}
      </pre>
    </div>
  );
}
