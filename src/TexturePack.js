// Manages texturepacks and returns correct textures

const fallback_pack = "/src/assets/texturePacks/Vanilla";
// ------------------------
const current_pack = "./src/assets/texturePacks/Bare Bones";
// const current_pack = "./src/assets/texturePacks/Vanilla";
// const current_pack = "./src/assets/texturePacks/Faithful 64x";

class TexturePack {
    constructor() {
    }

    // Begins at TexturePack/minecraft/textures
    async getPath(texturePath) {
        const URL = current_pack + "/assets/minecraft/textures/" + texturePath;
        if(await this.textureExists(URL)) {
            return URL;
        } else {
            // console.log("missing texture. using fallback texture for texture \"" + URL + "\"");
            return fallback_pack + "/assets/minecraft/textures/" + texturePath;
        }
    }

    getPathNoFallback(texturePath) {
        return current_pack + "/assets/minecraft/textures/" + texturePath;
    }

    async textureExists(URL) {
        let response = await fetch(URL, { method: "HEAD" });
        const contentType = response.headers.get("content-type");
        if (contentType != "image/png")
            return false
        else
            return true;
    }
}

export const texturePack = new TexturePack();
