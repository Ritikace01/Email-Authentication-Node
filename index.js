const cors = require('cors');
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
// import routes
const authRoute = require('./routes/authRoutes');
const postRoute = require('./routes/privateRoutes/post');

dotenv.config();

// connect db
mongoose.connect(process.env.DB_CONNECT,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    () => {
        console.log("Connected to DB");
    });

// middleware
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));
// route middleware
app.use('/api/user', authRoute);
app.use('/api/post', postRoute);

var PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server is running");
})