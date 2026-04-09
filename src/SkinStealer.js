import { texturePack } from "./TexturePack.js"
import { PlayerType } from "./PlayerModel.js"

// Returns URL of skin belonging to player of "username"
export async function stealSkinURL(username) {
    let response;
    try {
        response = await fetch(`/api/skin/${username}`);
    } catch (err) {
        response.ok = false;
        // // Server is offline / no network
        // console.warn(`Network error fetching skin for "${username}": ${err.message}`);
        // console.log("Returning Default Wide Player Skin");
        // return [await texturePack.getPath("entity/player/wide/steve.png"), PlayerType.WIDE];
    }
    if (!response.ok) {
        // Server is offline / no network
        console.warn(`Network error fetching skin for "${username}`);
        console.log("Returning Default Wide Player Skin");
        return [await texturePack.getPath("entity/player/wide/steve.png"), PlayerType.WIDE];
    }

    console.log("No Errors to report Sir")
    let text = await response.text();
    let data = JSON.parse(text);
    let playerType = data.playerType;
    let skinPath = data.skinPath;
    
    return [skinPath, playerType];
}
