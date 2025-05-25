const express = require('express');
const cors = require('cors')
const apiRoutes = require('./routes'); 

const app = express();

app.use(cors())
app.use(express.json())

app.use('/api', apiRoutes)

app.get('/', (req, res) => {
    res.send('InsightCRM is live 🧠')
})

module.exports = app;