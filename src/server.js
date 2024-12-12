const express = require('express');
const NodeCache = require('node-cache');
const axios = require('axios');

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); // Cache duration: 10 minutes

// Function to fetch data from external API
const fetchDataFromAPI = async (symbol, period, startTime, endTime) => {
  try {
    const response = await axios.get(`http://localhost:5000/timeseries`, {
      params: { symbol,
         period,
        start: startTime,
        end: endTime },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from API:', error);
  }
};

// Function to determine cache intervals based on request
const determineCacheIntervals = (period, start, end) => {
  const intervals = [];
  const intervalDuration = getIntervalDuration(period); // Function to convert period to ms
  let currentStart = start;

  while (currentStart <= end) {
    const currentEnd = new Date(currentStart.getTime() + intervalDuration);  
    intervals.push({ key: `${period}-${currentStart.toISOString()}`, start: currentStart, end: currentEnd });
    currentStart = new Date(currentStart.getTime() + intervalDuration);
  }

  return intervals;

};

// Function to get interval duration in ms
const getIntervalDuration = (period) => {
  switch (period) {
    case '1min':
      return 60 * 1000;
    case '5min':
      return 5 * 60 * 1000;
    case '1hour':
      return 60 * 60 * 1000;
    case '1day':
      return 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported period: ${period}`);
  }
};

// Route for timeseries data requests
app.get('/timeseries', async (req, res) => {
  const { symbol, period, start, end } = req.query;

  // Validate request params
  if (!symbol || !period || !start || !end) {
    return res.status(400).json({ error: 'Symbol, period, start time, and end time are required' });
  }

  // Generate unique cache key
  const cacheKey = `${symbol}-${period}-${start}-${end}`;

  // Check cache for complete data
  let cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData); // Return cached data if it is valid
  }

  // Initialize empty data array and missing intervals array
  let data = [];
  let missingIntervals = [];

  // Get cache intervals based on period and time intervals
  const cacheIntervals = determineCacheIntervals(period, new Date(start), new Date(end));

  // Check each interval in the cache
  for (const interval of cacheIntervals) {
    const intervalData = cache.get(interval.key);
    if (intervalData) {
      data.push(...intervalData); // Add cached data to final result
    } else {
      missingIntervals.push(interval); // Add to missing intervals
    }
  }

  // Fetch missing data
  if (missingIntervals.length > 0) {
    try {
      for (const interval of missingIntervals) {
        const intervalData = await fetchDataFromAPI(symbol, period, interval.start, interval.end);
        cache.set(interval.key, intervalData); // Store data in cache
        data.push(intervalData); // Add data to final result
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch data from external API' });
    }
  }

  //Update cache with new data
  cache.set(cacheKey, data);

  // Return the final data
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});