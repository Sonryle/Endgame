// Manages texturepacks and returns correct textures

// const current_pack = "./src/assets/TexturePacks/Bare Bones 1.21.11";
const current_pack = "./src/assets/TexturePacks/Vanilla";

class TexturePack {
    constructor() {
    }

    // Begins at TexturePack/assets/minecraft/textures/item
    getItemPath(textureFileName) {
        return this.getPath("item/" + textureFileName);
    }

    // Begins at TexturePack/minecraft/textures
    getPath(texturePath) {
        // Test if texture exists in texture pack
        return current_pack + "/assets/minecraft/textures/" + texturePath;

        // try {
        //     const response = await fetch(url);
        //     if (response.ok) {
        //         return url
        //     } else {
        //         console.log("error");
        //         throw new Error(`Response status: ${response.status}`);
        //     }
        // } catch (error) {
        //     console.error(error.message);
        // }
    }
}

export const texturePack = new TexturePack();
