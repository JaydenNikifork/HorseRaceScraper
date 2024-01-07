const express = require('express');
const path = require('path');
const cors = require('cors');
const { login, getDiffs, close } = require('./src/main.js');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'dist')));

app.use(cors());

app.get('/login', async (req, res) => {
    const failed = await login();

    res.send(failed);
});

app.get('/getData', async (req, res) => {
    const diffs = await getDiffs();

    res.send(diffs);
});

app.get('/logout', async (req, res) => {
    await close();

    res.sendStatus(200);
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});