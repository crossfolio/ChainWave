// pages/api/cryptocurrency.js
import axios from 'axios';
export default async function handler(req, res) {
    const { symbol } = req.query; // 接收請求中的 symbol 查詢參數

    try {
        const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`, {
            params: { symbol },
            headers: {
                "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_KEY, // 從環境變量中讀取 API 密鑰
            },
        });

        res.status(200).json(response.data); // 返回 CoinMarketCap 的 API 資料
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch data' });
    }
}