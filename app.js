const path = require('path');
const express = require('express');
const cors = require('cors');
var useragent = require('express-useragent');

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.use(useragent.express());
app.enable('trust proxy');

// add sk
var allowlist = ['http://localhost:5173/', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']
var corsOptionsDelegate = function (req, callback) {
        var corsOptions;
        if (allowlist.indexOf(req.header('Origin')) !== -1) {
                corsOptions = { origin: true }
        } else {
                corsOptions = { origin: false }
        }
        callback(null, corsOptions) 
}

app.use("/images/", express.static(path.join(__dirname, 'public/img/')));

app.get('/', (req, res, next) => {

        res.json({
                status: 'success',
                message: 'Welcome to  e-commerce-app'
        });

});



app.use('/api/v1/auth', cors(corsOptionsDelegate), authRouter);
app.use('/api/v1/user', cors(corsOptionsDelegate), userRouter);

module.exports = app;