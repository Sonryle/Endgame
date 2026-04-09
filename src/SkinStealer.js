import { texturePack } from "./TexturePack.js"
import { PlayerType } from "./PlayerModel.js"

// Returns URL of skin belonging to player of "username"
export async function getSkinPath(username) {
    let response;
    try {
        response = await fetch(`/api/skin/${username}`);
    } catch (err) {
        console.warn(`Network error fetching skin for "${username}`);
        return defaultSkin();
    }

    // server responds with code 201
    if (response.status !== 201 && response.status !== 304) {
        console.warn(`Unexpected status "${response.status}" for skin "${username}"`);
        return defaultSkin();
    }

    console.log("No Errors to report Sir Response Status " + response.status)
    let data = await response.json();
    let playerType = (data.playerType == "WIDE")? PlayerType.WIDE : PlayerType.SLIM;
    let skinPath = data.skinPath;
    
    return [skinPath, playerType];
}

export async function defaultSkin() {
    console.log("Returning Default Wide Player Skin");
    return [await texturePack.getPath("entity/player/wide/steve.png"), PlayerType.WIDE];
}
