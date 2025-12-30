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
// ---- Mongo debug / no-illusion settings ----
mongoose.set("bufferCommands", false); // чтобы не было "как будто сохранилось"
mongoose.connection.on("connected", () => {
  console.log("Mongo connected ✅");
  console.log("Mongo host:", mongoose.connection.host);
  console.log("Mongo db:", mongoose.connection.name);
});
mongoose.connection.on("error", (e) => console.log("Mongo error ❌", e));
mongoose.connection.on("disconnected", () => console.log("Mongo disconnected ⚠️"));

const mongoUri = process.env.DB_MONGO_URL;
if (!mongoUri) {
  console.error("DB_MONGO_URL is missing ❌");
  process.exit(1);
}

// Подключение к MongoDB
mongoose
  .connect(mongoUri, {
    dbName: "cv-application",            // 👈 принудительно
    serverSelectionTimeoutMS: 8000,      // 👈 чтобы не висеть вечность
    socketTimeoutMS: 20000,
  })
  .then(async () => {
    console.log("Успешное подключение к MongoDB");

    // контрольная вставка (всегда видно в Atlas)
    const r = await mongoose.connection.db
      .collection("ping")
      .insertOne({ t: new Date(), from: "render" });
    console.log("Ping inserted:", r.insertedId);

    app.listen(PORT, () => console.log("Сервер запущен на порту:", PORT));
  })
  .catch((err) => {
    console.error("Ошибка подключения к MongoDB ❌", err);
    process.exit(1);
  });