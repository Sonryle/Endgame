import { state } from "./state.js"
import { texturePack } from './TexturePack.js'
import { Inventory } from "./inventory.js"

export const ItemType = Object.freeze({
    NONE:           "none",
    DEFAULT:        "default",
    HELMET:         "helmet",
    CHESTPLATE:     "chestplate",
    LEGGINGS:       "leggings",
    BOOTS:          "boots",
    WEAPON:         "weapon",
    BLOCK:          "block",
});

export const MinecraftItem = {
    apple:                { texture: "apple.png",                type: ItemType.DEFAULT,     name: "Apple"                 },
    axolotl_bucket:       { texture: "axolotl_bucket.png",       type: ItemType.DEFAULT,     name: "Axolotl Bucket"        },
    bread:                { texture: "bread.png",                type: ItemType.DEFAULT,     name: "Bread"                 },
    carrot:               { texture: "carrot.png",               type: ItemType.DEFAULT,     name: "Carrot"                },
    dark_oak_sign:        { texture: "dark_oak_sign.png",        type: ItemType.DEFAULT,     name: "Dark Oak Sign"         },
    diamond:              { texture: "diamond.png",              type: ItemType.DEFAULT,     name: "Diamond"               },
    diamond_boots:        { texture: "diamond_boots.png",        type: ItemType.BOOTS,       name: "Diamond Boots"         },
    diamond_chestplate:   { texture: "diamond_chestplate.png",   type: ItemType.CHESTPLATE,  name: "Diamond Chestplate"    },
    diamond_helmet:       { texture: "diamond_helmet.png",       type: ItemType.HELMET,      name: "Diamond Helmet"        },
    diamond_leggings:     { texture: "diamond_leggings.png",     type: ItemType.LEGGINGS,    name: "Diamond Leggings"      },
    diamond_sword:        { texture: "diamond_sword.png",        type: ItemType.WEAPON,      name: "Diamond Sword"         },
    diamond_pickaxe:      { texture: "diamond_pickaxe.png",      type: ItemType.WEAPON,      name: "Diamond Pickaxe"       },
    golden_boots:         { texture: "golden_boots.png",         type: ItemType.BOOTS,       name: "Golden Boots"          },
    golden_chestplate:    { texture: "golden_chestplate.png",    type: ItemType.CHESTPLATE,  name: "Golden Chestplate"     },
    golden_helmet:        { texture: "golden_helmet.png",        type: ItemType.HELMET,      name: "Golden Helmet"         },
    golden_ingot:         { texture: "golden_ingot.png",         type: ItemType.DEFAULT,     name: "Golden Ingot"          },
    golden_leggings:      { texture: "golden_leggings.png",      type: ItemType.LEGGINGS,    name: "Golden Leggings"       },
    iron_boots:           { texture: "iron_boots.png",           type: ItemType.BOOTS,       name: "Iron Boots"            },
    iron_chestplate:      { texture: "iron_chestplate.png",      type: ItemType.CHESTPLATE,  name: "Iron Chestplate"       },
    iron_helmet:          { texture: "iron_helmet.png",          type: ItemType.HELMET,      name: "Iron Helmet"           },
    iron_ingot:           { texture: "iron_ingot.png",           type: ItemType.DEFAULT,     name: "Iron Ingot"            },
    iron_leggings:        { texture: "iron_leggings.png",        type: ItemType.LEGGINGS,    name: "Iron Leggings"         },
    netherite_boots:      { texture: "netherite_boots.png",      type: ItemType.BOOTS,       name: "Netherite Boots"       },
    netherite_chestplate: { texture: "netherite_chestplate.png", type: ItemType.CHESTPLATE,  name: "Netherite Chestplate"  },
    netherite_helmet:     { texture: "netherite_helmet.png",     type: ItemType.HELMET,      name: "Netherite Helmet"      },
    netherite_ingot:      { texture: "netherite_ingot.png",      type: ItemType.DEFAULT,     name: "Netherite Ingot"       },
    netherite_leggings:   { texture: "netherite_leggings.png",   type: ItemType.LEGGINGS,    name: "Netherite Leggings"    },
    totem_of_undying:     { texture: "totem_of_undying.png",     type: ItemType.DEFAULT,     name: "Totem of Undying"      },
}

export class ItemInstance {
    constructor(minecraftItem, enchantments, customName) {
        this.init(minecraftItem, enchantments, customName);
    }

    async init(minecraftItem, enchantments, customName) {
        this.minecraftItem = minecraftItem;
        this.customName = customName;
        this.enchantments = enchantments;
        this.itemType = minecraftItem.type;
        this.name = minecraftItem.name;
        this.href = await texturePack.getPath("item/" + minecraftItem.texture);

        // Figure out later
        this.statValue1 = 5;
        this.statValue2 = 5;

        this.svgContainer = state.svg.append('svg');
        this.svgContainer.attr('width', 16 * state.scale);
        this.svgContainer.attr('height', 16 * state.scale);

        this.itemTexture = this.svgContainer.append('image');
        this.itemTexture.attr('href', this.href);
        this.itemTexture.attr('width', 16 * state.scale);
        this.itemTexture.attr('height', 16 * state.scale);
        this.itemTexture.attr('pointer-events', 'none');

        this.itemGlint = null;
        if (enchantments != null && typeof enchantments != "undefined") {
            // Check for legacy texture location
            let enchantedItemGlintPath = null;
            if (await texturePack.textureExists(texturePack.getPathNoFallback("misc/enchanted_item_glint.png")))
                enchantedItemGlintPath = await texturePack.getPath("misc/enchanted_item_glint.png");
            else
                enchantedItemGlintPath = await texturePack.getPath("misc/enchanted_glint_item.png");

            const patternId = 'itemGlintPattern-' + this.href.replaceAll(" ", "");
            const maskId = 'maskId-' + this.href.replaceAll(" ", "");
            
            // Append a <defs> block with an animated pattern
            const defs = this.svgContainer.append('defs');
            const pattern = defs.append('pattern')
                .attr('id', patternId)
                .attr('width', 1)
                .attr('height', 1)
            pattern.append('image')
                .attr('href', enchantedItemGlintPath);
            pattern.append('animateTransform')
                .attr('attributeName', 'patternTransform')
                .attr('to', `${16 * state.scale} ${-64 * state.scale}`)  // move up by one tile height
                .attr('dur', '4s')
                .attr('repeatCount', 'indefinite');

            const mask = defs.append('mask')
                .attr('id', maskId)
                .attr('mask-mode', 'alpha')
            
            mask.append('image')
                .attr('href', this.href)
                .attr('width', 16 * state.scale)
                .attr('height', 16 * state.scale)
                .style('filter', 'brightness(0) invert(1)')
            
            this.itemGlint = this.svgContainer.append('rect');
            this.itemGlint.attr('mask', `url(#${maskId})`);
            this.itemGlint.attr('fill', `url(#${patternId})`);
            this.itemGlint.attr('width', 16 * state.scale);
            this.itemGlint.attr('height', 16 * state.scale);
            this.itemGlint.attr('pointer-events', 'none');
            this.itemGlint.style('mix-blend-mode', 'screen');
            this.itemGlint.style('filter', 'blur(2px)');
        }
    }

    // Cause Item to snap to the grid
    snapToGrid(grid) {
        let centerX = +this.svgContainer.attr('x') + +this.svgContainer.attr('width') / 2;
        let centerY = +this.svgContainer.attr('y') + +this.svgContainer.attr('height') / 2;
        let [new_x, new_y] = grid.nearestCell(centerX, centerY);
        new_x += state.scale;    // Offset coordinates by 1 pixel to center item
        new_y += state.scale;
        this.svgContainer.attr('x', new_x);
        this.svgContainer.attr('y', new_y);
    }
    // Can be either "hidden" or "visible"
    setOpacity(level) {
        this.svgContainer.attr('opacity', visibility);
    }
}
