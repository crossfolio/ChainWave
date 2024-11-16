import axios from 'axios';

export default async function handler(req, res) {
  const { symbol } = req.query;

  try {
    const response = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`,
      {
        params: { symbol },
        headers: {
          'X-CMC_PRO_API_KEY': process.env.NEXT_PUBLIC_COINMARKETCAP_KEY,
        },
      },
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res
      .status(error.response?.status || 500)
      .json({ error: 'Failed to fetch data' });
  }
}
