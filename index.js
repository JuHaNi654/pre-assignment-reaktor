'uses strict';
const express = require('express')
const path = require('path')
const cors = require('cors')
const getPackages = require('./server-scripts/package-reader')
const app = express()
const port = process.env.PORT || 8080

app.use(cors())

app.use('/', express.static(path.join(__dirname, '/dist')))
//Remove favicon error
app.get('/favicon.ico', (req, res) => res.status(204))

app.get('/api/packages', (req, res) => {
    getPackages
        .then(value => res.json(value))
        .catch(err => res.status(500).send({ error: 'Something broke!' }))
})


app.listen(port, () => console.log(`App listening on port ${port}`))













