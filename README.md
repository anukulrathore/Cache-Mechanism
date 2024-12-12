# Dummy External Server

const express = require('express');
const app = express();
const port = 5000;

const dummyData = {
  "symbol": "AAPL",
  "period": "1min",
  "data": [
    { "time": "2024-05-14T10:00:26Z", "open": 150, "high": 152.5, "low": 148.75, "close": 151.25, "volume": 10000 },
    { "time": "2024-05-14T10:01:26Z", "open": 151.25, "high": 153, "low": 150.5, "close": 152.75, "volume": 12000 },
    { "time": "2024-05-14T10:02:26Z", "open": 152.75, "high": 154.25, "low": 151.5, "close": 153.5, "volume": 9000 },
    { "time": "2024-05-14T10:03:26Z", "open": 153.5, "high": 155, "low": 152, "close": 154.25, "volume": 11000 },
    { "time": "2024-05-14T10:04:26Z", "open": 154.25, "high": 155.75, "low": 153.5, "close": 155, "volume": 8000 },
    { "time": "2024-05-14T10:05:26Z", "open": 155, "high": 156.5, "low": 154, "close": 155.75, "volume": 13000 },
    { "time": "2024-05-14T10:06:26Z", "open": 155.75, "high": 157.25, "low": 155, "close": 156.25, "volume": 10000 },
    { "time": "2024-05-14T10:07:26Z", "open": 156.25, "high": 157.75, "low": 155.5, "close": 156.75, "volume": 12000 },
    { "time": "2024-05-14T10:08:26Z", "open": 156.75, "high": 158.25, "low": 156, "close": 157.5, "volume": 9000 },
    { "time": "2024-05-14T10:09:26Z", "open": 157.5, "high": 159, "low": 156.5, "close": 158.25, "volume": 11000 }
  ]
};

app.get('/timeseries', (req, res) => {
  const { symbol, period, start, end } = req.query;

  const filteredData = dummyData.data.filter(dataPoint => {
    return dataPoint.time >= start && dataPoint.time <= end;
  });

  const response = {
    symbol,
    period,
    data: filteredData
  };

  res.json(response);
});

app.listen(port, () => {
  console.log(`Dummy server listening on port ${port}`);
});
