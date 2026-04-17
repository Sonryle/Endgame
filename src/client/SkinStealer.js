import { texturePack } from "./TexturePack.js"
import { PlayerType } from "./PlayerModel.js"

function getImageHeight(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.height);
        img.src = src;
    })
}

// Returns URL of skin belonging to player of "username"
export async function getSkinPath(username) {
    let response;
    try {
        response = await fetch(`/api/skin/${username}`);
    } catch (err) {
        console.warn(`Network error fetching skin for "${username}`);
        return defaultSkin();
    }

    // server responds with code 201 for success
    if (response.status !== 201 && response.status !== 304) {
        console.warn(`Unexpected status "${response.status}" for skin "${username}"`);
        return defaultSkin();
    }

    // Get texture data
    let data = await response.json();
    let skinPath = data.skinPath;

    // Find PlayerType
    let playerType;
    if (data.playerType === "WIDE") {
        if (await getImageHeight(skinPath) === 32) {
            playerType = PlayerType.LEGACY;
	} else {
            playerType = PlayerType.WIDE;
	}
    } else {
        playerType = PlayerType.SLIM;
    }
    
    return [skinPath, playerType];
}

export async function defaultSkin() {
    console.log("Returning Default Wide Player Skin");
    return [await texturePack.getPath("entity/player/wide/steve.png"), PlayerType.WIDE];
}
