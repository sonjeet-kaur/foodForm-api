// app.js

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/products');

const app = express();
app.enable('trust proxy');
app.use(express.json());

const allowlist = ['http://localhost:5173/', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

const corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

app.use("/images/", express.static(path.join(__dirname, 'public/img/')));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.get('/', (req, res, next) => {
    res.json({
        status: 'success',
        message: 'Welcome to e-commerce-site'
    });
});

app.use('/api/v1/auth', cors(corsOptionsDelegate), authRouter);
app.use('/api/v1/product', cors(corsOptionsDelegate), productRouter);
// app.use('/api/v1/user', cors(corsOptionsDelegate), userRouter);

module.exports = app;
