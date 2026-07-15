const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const bookRoutes = require('./route/Book');
const userRoutes = require('./route/user');
const path = require('path');

const app = express();
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)


    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(error => console.log('Connexion à MongoDB échouée !', error));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/books', bookRoutes);


module.exports = app;