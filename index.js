require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const formDataRouter = require('./Components/Routers/formDataRouter');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
    "origin": `${process.env.CLIENT_URL}`,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": false
}));

app.use('/api', formDataRouter);

// Подключение к MongoDB
mongoose
    .connect(process.env.DB_MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Успешное подключение к MongoDB');
        // Запуск сервера
        app.listen(PORT, () => {
            console.log('Сервер запущен на порту:', PORT);
        });
    })
    .catch((err) => {
        console.error('Ошибка подключения к MongoDB', err);
    });