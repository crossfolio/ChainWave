import { verifyCloudProof } from '@worldcoin/idkit-core/backend';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { proof, signal } = req.body;
    const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID;
    const action = process.env.NEXT_PUBLIC_WLD_ACTION;

    if (!app_id || !action) {
      return res
        .status(500)
        .json({ success: false, detail: 'App ID or Action not set' });
    }

    try {
      const verifyRes = await verifyCloudProof(proof, app_id, action, signal);

      if (verifyRes.success) {
        return res.status(200).json({ success: true });
      } else if (verifyRes.code === 'max_verifications_reached') {
        return res.status(200).json({
          success: true,
          code: verifyRes.code,
          attribute: verifyRes.attribute,
          detail: verifyRes.detail,
        });
      } else {
        return res.status(400).json({
          success: false,
          code: verifyRes.code,
          attribute: verifyRes.attribute,
          detail: verifyRes.detail,
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      return res.status(500).json({ success: false, detail: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res
      .status(405)
      .json({ success: false, detail: 'Method Not Allowed' });
  }
}
