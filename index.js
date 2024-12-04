const express = require('express');
const axios = require('axios');

const app = express();

// Konfigurasi API FatSecret
const FATSECRET_API_URL = 'https://platform.fatsecret.com/rest/server.api';
const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwOEFEREZGRjZBNDkxOUFBNDE4QkREQTYwMDcwQzE5NzNDRjMzMUUiLCJ0eXAiOiJhdCtqd3QiLCJ4NXQiOiJFSXJkX19ha2tacWtHTDNhWUFjTUdYUFBNeDQifQ.eyJuYmYiOjE3MzMyNjgxMjIsImV4cCI6MTczMzM1NDUyMiwiaXNzIjoiaHR0cHM6Ly9vYXV0aC5mYXRzZWNyZXQuY29tIiwiYXVkIjoiYmFzaWMiLCJjbGllbnRfaWQiOiJjMjMxZWZmNmI5Mjk0N2Y0OTdiNWU5NTllMzdjODc5ZiIsInNjb3BlIjpbImJhc2ljIl19.LPEKx55GSoy6GDkvCT-Nkx-IRtIQLubVSboZHNLdhnHShaNvyAouFXZHVMIgcZsfkWBtcX4IerrooAekKnGLxSi-CX85f9ZlY5kOJrnMkN3H8CkEUq8oeDXglmiGOftEOY2ipjHQlRoBKD8gZ4vftB0o_dQJ1lWks1WrCCesVcuJMClrcvqQDy-i93waWk2S3xVc1_2WCfpAlGaKPmYxixFwz1wkfbQn_yfySoJrBlezLXSfE2kdLDHaZNVm1KzyKyGBPofQkc7Ih8zb4I3MfHcXpZRj59oi1ziasA-U1Z1OFbdmTXHKZGp9Zb9z6YkeXuQjlnei1y11-F5HinAAjc2t3tqLtSM6g-AYr6fDF4nql1yY4CdkU9LUz5SAguDqojkD3oWGG5tg28WrsZMlP7vIVotCIpeWRuF44_spZl0jRN_Xec4UhPaZ6f6CJxim6DsEGQNIDIvjoJVoObbXgvU3umDmazU5xsfbUSleUthvoF3CEg5K23vvhsJZIVjTl5iJVuZR9eqZ89uSDUhBwv7Nesx7EIGR8FME7RdlwxbJoqCmiGMxmByX2AWqCw5ZBxg6VPacqOORsKBrnqK2iRATHE8aLeDRJJlX3ZV68XAP6XNg0SbIRWYZG6WRmpmLqU6ijMIeupI2-p-AeziaNPo7NcnEXnbXEIIt6oounB0'; // Ganti dengan token Anda

app.get('/nutrition', async (req, res) => {
  const fruitName = req.query.fruit;
  console.log('Request received for fruit:', fruitName); // Log input
  
  if (!fruitName) {
      console.error('Nama buah tidak disertakan');
      return res.status(400).json({ error: 'Nama buah harus disertakan' });
  }

  try {
      const searchResponse = await axios.get(FATSECRET_API_URL, {
          params: {
              method: 'foods.search',
              search_expression: fruitName,
              format: 'json',
          },
          headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
      });
      console.log('Search response:', searchResponse.data); // Log hasil pencarian

      const foods = searchResponse.data.foods.food;
      if (!foods || foods.length === 0) {
          console.error(`Data untuk buah '${fruitName}' tidak ditemukan`);
          return res.status(404).json({ error: `Data untuk buah '${fruitName}' tidak ditemukan` });
      }

      const firstFood = Array.isArray(foods) ? foods[0] : foods;

      const detailResponse = await axios.get(FATSECRET_API_URL, {
          params: {
              method: 'food.get',
              food_id: firstFood.food_id,
              format: 'json',
          },
          headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
      });
      console.log('Detail response:', detailResponse.data); // Log hasil detail

      const foodDetail = detailResponse.data.food;
      res.json({
          food_id: foodDetail.food_id,
          food_name: foodDetail.food_name,
          food_description: foodDetail.food_description,
          food_type: foodDetail.food_type,
          food_url: foodDetail.food_url,
          servings: foodDetail.servings.serving || null,
      });
  } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message); // Log error
      res.status(500).json({ error: 'Gagal mengambil data dari API' });
  }
});

  
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });