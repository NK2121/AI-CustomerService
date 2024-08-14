"use client";

import { getProviders, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SignIn() {
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Sign in</h1>
      {providers && Object.values(providers).map((provider) => (
        <div key={provider.name} style={{ margin: '10px' }}>
          <button onClick={() => signIn(provider.id)} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </div>
  );
}
