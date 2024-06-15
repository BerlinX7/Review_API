const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

app.get('/reviews', async (req, res) => {
  const query = req.query.query; // Example: 'Eiffel Tower'

  if (!query) {
    return res.status(400).send('Query is required');
  }

  try {
    // Step 1: Fetch Place ID based on user query
    const placeSearchResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json`, {
      params: {
        input: query,
        inputtype: 'textquery',
        fields: 'place_id',
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (!placeSearchResponse.data.candidates || placeSearchResponse.data.candidates.length === 0) {
      return res.status(404).send('No place found for the given query');
    }

    const placeId = placeSearchResponse.data.candidates[0].place_id;

    // Step 2: Fetch reviews using the Place ID
    const placeDetailsResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    const result = placeDetailsResponse.data.result;

    if (result && result.reviews) {
      res.json(result.reviews);
    } else {
      res.status(404).send('No reviews found for the specified place');
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});