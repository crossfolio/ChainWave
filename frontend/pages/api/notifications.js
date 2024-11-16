// pages/api/notifications.js
export default function handler(req, res) {
    const { worldcoinid } = req.query;
    console.log('Worldcoin ID:', worldcoinid);
  
    // 根據不同的 worldcoinid 返回不同的假資料
    const notificationsData = {
      user1: [
        { id: 1, symbol: 'ETH', price: '1500', condition: 'greater' },
        { id: 2, symbol: 'BTC', price: '30000', condition: 'less' },
      ],
      user2: [
        { id: 3, symbol: 'LTC', price: '200', condition: 'greater' },
        { id: 4, symbol: 'DOGE', price: '0.1', condition: 'less' },
      ],
    };
  
    // 如果 worldcoinid 有對應的資料就返回，否則返回空陣列
    const notifications = notificationsData['user1'] || [];
    console.log('Notifications:', notifications);
    res.status(200).json(notifications);
  }
  