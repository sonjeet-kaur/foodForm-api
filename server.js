// server.js

require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 9000
}).then(() => console.log('DB connection successful!'));

const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
