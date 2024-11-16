'use client';

import { VerificationLevel, IDKitWidget, useIDKit } from '@worldcoin/idkit';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function WorldCoin() {
  const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID;
  const action = process.env.NEXT_PUBLIC_WLD_ACTION;
  const router = useRouter();
  const { setOpen } = useIDKit();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const onSuccess = (result) => {
    console.log(
      'Verification successful with World ID. Nullifier hash:',
      result.nullifier_hash,
    );

    Cookies.set('isAuthenticated', 'true', { expires: 1 });
    Cookies.set('worldcoinId', result.nullifier_hash, { expires: 1 });

    const redirectTo = router.query.redirectTo || '/';
    router.push(redirectTo);
  };

  const handleProof = async (result) => {
    console.log(
      'Proof received, sending to backend:\n',
      JSON.stringify(result),
    );

    try {
      const response = await fetch(`${apiBaseUrl}/api/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof: result,
          signal: result.signal,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (data.success === true) {
        onSuccess(result);
      } else {
        throw new Error(`Verification failed: ${data.detail}`);
      }
    } catch (error) {
      console.error('Error during verification:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <div className="flex flex-col items-center justify-center">
        <img src="/img/login.png" alt="ChainWave" className="w-64 h-64 mb-5" />
        <p className="text-2xl mb-5">Welcome to ChainWave</p>
        <IDKitWidget
          action={action}
          app_id={app_id}
          onSuccess={onSuccess}
          handleVerify={handleProof}
          verification_level={VerificationLevel.Device}
        />
        <button
          className="border border-black rounded-md"
          onClick={() => setOpen(true)}
        >
          <div className="mx-3 my-1">Verify with World ID</div>
        </button>
      </div>
    </div>
  );
}
