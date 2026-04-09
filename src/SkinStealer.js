import { texturePack } from "./TexturePack.js"
import { PlayerType } from "./PlayerModel.js"

// Returns URL of skin belonging to player of "username"
export async function stealSkinURL(username) {
    let response = await fetch(`/api/skin/${username}`)
    if (response.status != 200) {
        console.log(`Server Skin API Response for username "${username}" was not 200: ${response.statusText}.`)
        console.log("Returning Default Wide Player Skin")
        return [await texturePack.getPath("entity/player/wide/steve.png"), PlayerType.WIDE]
    } else {
        let text = await response.text();
        let data = JSON.parse(text);
        let playerType = data.playerType;
        let skinPath = data.skinPath;
        console.log("skinPath = " + skinPath);
        console.log("playerType = " + playerType);
        
        return [skinPath, playerType];
    }
}
