const express = require('express');
const path = require('path');
const axios = require('axios');

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/api/movies', async (req, res) => {
    // Get search term
    const searchTerm = req.query.s;
    // To search for movies
    // Axios automatically parses the response, no need for "response.json()"
    async function getMovies(searchTerm) {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: process.env.API_KEY,
                s: `${searchTerm}`
            }
        });
        if (response.data.Search) {
            return response.data.Search;
        } else {
            return { data: false };
        }
    }
    // Getting data from OMDb API
    const data = await getMovies(searchTerm);
    // Sending data to the front end
    res.send(data);
});

app.get('/api/movie', async (req, res) => {
    // Get specific movie id
    const id = req.query.id;
    // To get more info about specific movie
    async function getSpecificMovie(id) {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: process.env.API_KEY,
                i: `${id}`
            }
        })
        return response.data;
    }
    const data = await getSpecificMovie(id);
    res.send(data);
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './views/index.html'))
});

const port = process.env.PORT || 3000;
app.listen(port, (req, res) => {
    console.log(`Listening on port ${port}`);
})