const express = require('express')
const app = express()
const port = 5137;

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get('/api/skin/:username', async (req, res) => {

    // Fetch UUID from Username
    let response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${req.params.username}`);
    if (!response.ok)
        console.log(`Response to requesting UUID from Username was not OK: ${response.statusText}`);
    let data = await response.json();

    // Fetch User Data with UUID
    response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${data.id}`);
    if (!response.ok)
        console.log(`Response to requesting User Data using UUID was not OK: ${response.statusText}`);
    data = await response.json();

    // Decoded skin information
    const textureInfo = data.properties[0].value;
    const skinInfo = JSON.parse(atob(textureInfo));
    const skin = skinInfo.textures.SKIN;

    // Find PlayerType
    let playerType = "WIDE";
    if (typeof skin.metadata != "undefined")
        playerType = "SLIM";
    console.log(playerType);
    console.log(skin.url);

    // response = await fetch(obj.skinURL);
    //
    // const blobImage = await response.blob();
    //
    // const href = URL.createObjectURL(blobImage);
});

app.use(express.static('./'))

app.listen(port, () => {
    console.log(`Endgame listening on port ${port}`)
});
