export default async function handler(req, res) {
    if (req.method === "POST") {
      const { username } = req.body;
      console.log("Username:", username);
      try {
        return res.status(200).json({ success: true, account: username });
      } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ success: false, detail: error.message });
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      return res
        .status(405)
        .json({ success: false, detail: "Method Not Allowed" });
    }
  }
  