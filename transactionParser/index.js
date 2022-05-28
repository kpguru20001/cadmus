const express = require('express')

const app = express()

app.use('/', require('./routes/api.js'));
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} `)
});