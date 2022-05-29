const express = require('express')

const app = express()

app.use('/', require('./routes/api.js'));
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} `)
});