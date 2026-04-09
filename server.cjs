const express = require('express')
const app = express()
const port = 5137;

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get('/api/skin/:username', async (req, res) => {
    let response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${req.params.username}`);
    let data = await response.json();
    const UUID = data.id
    response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${UUID}`);
    data = await response.json();
    const value = data.properties[0].value;
    console.log(value);
    const decodedString = atob(value);
    const lastJSON = JSON.parse(decodedString);
    const textures = lastJSON.textures;
    const skin = textures.SKIN;
    const URL = skin.url;
    console.log(URL);
});

app.use(express.static('./'))

app.listen(port, () => {
    console.log(`Endgame listening on port ${port}`)
});
