require('dotenv').config();
const express = require("express");
const app = express();
const { locationsRouter } = require('./routers/locationsRouter.js');
const port = process.env.PORT || 8080;

app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': "GET, POST, PUT, DELETE",
        'Content-Type': 'application/json'
    });
    next();
});

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/locations',locationsRouter);

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
})