const fsp = require('fs/promises');
const express = require('express');
const http = require('http');
const app = express()
const port = 5137;

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

function getFileFromURL(pathFile) {

    return new Promise(function(resolve, reject) {//create a promise
        http.get(pathFile.replace('https', 'http'), function(res) {
            let bufferImage = Buffer.from(''); // create an empty buffer
            res.on('data', function(chunk) { // listen to 'data' event and concatenate each chunk when it is received
                bufferImage = Buffer.concat([bufferImage, chunk]);
            });
            res.on('end', function() {
                resolve(bufferImage); // fulfil promise 
            });
            res.on('error', function(err) {
                reject(err); // reject promise
            })
        })
    })
}

app.get('/api/skin/:username', async (req, res) => {

    // Fetch UUID from Username
    let response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${req.params.username}`);
    if (!response.ok) {
        console.log(`Response to requesting UUID from Username "${req.params.username}" was not OK: ${response.statusText}`);
        res.status(404).send(`Could Not Find Skin Named "${req.params.username}"`);
        return;
    }
    let data = await response.json();

    // Fetch User Data with UUID
    response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${data.id}`);
    if (!response.ok) {
        console.log(`Response to requesting User Data using UUID was not OK: ${response.statusText}`);
        res.status(404).send(`Could Not Find UUID for Skin Named "${req.params.username}"`);
        return;
    }
    data = await response.json();

    // Decoded skin information
    const textureInfo = data.properties[0].value;
    const skinInfo = JSON.parse(atob(textureInfo));
    const skin = skinInfo.textures.SKIN;

    // Find PlayerType
    let playerType = "WIDE";
    if (typeof skin.metadata != "undefined")
        playerType = "SLIM";

    // Get buffer of image data
    const fileBuffer = await getFileFromURL(skin.url);

    // Create skin dir if not created
    const skinDir = "./assets/playerskins";
    await fsp.mkdir(skinDir, { recursive: true });

    // Write Skin file to skin directory
    const filePath = `${skinDir}/${req.params.username}.png`;
    try {
        await fsp.writeFile(filePath, fileBuffer);
        console.log(`Handled Skin Request for User "${req.params.username}"`);
    } catch (err) {
        console.error(`Cant write to file "${skinDir}/${req.params.username}.png : `, err);
        res.status(500).send("Failed to save skin!");
        return;
    }

    let obj = { playerType: playerType, skinPath: `${skinDir}/${req.params.username}.png` };
    res.status(201).json(obj);
});

app.use(express.static('./'))

app.listen(port, () => {
    console.log(`Endgame listening on port ${port}`)
});
