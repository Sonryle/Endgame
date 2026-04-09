const express = require('express')
const fs = require('fs');
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

    // We have all the decoded data we need. Now its time to send back a copy of texture (hosted from this server)
    const fileBuffer = await getFileFromURL(skin.url);
    console.log(fileBuffer);
    await fs.open(`${req.params.username}.png`, 'a', function(err, fd) {

    // If the output file does not exists
    // an error is thrown else data in the
    // buffer is written to the output file
    if(err) {
        console.log('Cant open file');
    }else {
        fs.write(fd, fileBuffer, 0, fileBuffer.length, 
                null, function(err,writtenbytes) {
            if(err) {
                console.log('Cant write to file');
            }else {
                console.log(writtenbytes +
                    ' characters added to file');
            }
        })
    }
})
});

app.use(express.static('./'))

app.listen(port, () => {
    console.log(`Endgame listening on port ${port}`)
});
