const express = require('express');
const axios = require('axios');

const app = express();

// Konfigurasi API FatSecret
const FATSECRET_API_URL = 'https://platform.fatsecret.com/rest/server.api';

// Fungsi untuk mendapatkan Access Token
const getAccessToken = async () => {
    try {
        const response = await axios.post('https://oauth.fatsecret.com/connect/token', 'grant_type=client_credentials&scope=basic', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
                username: 'c231eff6b92947f497b5e959e37c879f', // Ganti dengan key Anda
                password: '691799d3d408493f9bda03b309406400', // Ganti dengan secret Anda
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Failed to get access token:', error.response?.data || error.message);
        throw new Error('Unable to get access token');
    }
};


// Endpoint untuk mendapatkan informasi nutrisi
app.get('/nutrition', async (req, res) => {
    const fruitName = req.query.fruit;
    console.log('Request received for fruit:', fruitName); // Log input

    if (!fruitName) {
        console.error('Nama buah tidak disertakan');
        return res.status(400).json({ error: 'Nama buah harus disertakan' });
    }

    try {
        // Ambil token akses
        const ACCESS_TOKEN = await getAccessToken();

        // Panggil API pencarian makanan
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

        // Panggil API detail makanan
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

// Endpoint untuk cek status API
app.get('/', (req, res) => {
    res.send('API berjalan!');
});

// Jalankan server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
