import { select } from 'd3';

import { state } from "./state.js"
import { grid } from "./grid.js";
import { texturePack } from "./TexturePack.js"

import { ItemInstance, MinecraftItem } from "./Item.js";
import { ItemSlot } from "./ItemSlot.js"
import { Inventory } from "./inventory.js"
import "./style.css";

state.svg = select('#app').append('svg').attr('class', 'master');
state.svg.attr('width', window.innerWidth);
state.svg.attr('height', window.innerHeight);

document.querySelector(':root').style.setProperty('--tooltip-texture-path', `url("${await texturePack.getPath('gui/sprites/tooltip/background.png')}")`);
document.querySelector(':root').style.setProperty('--tooltip-frame-texture-path', `url("${await texturePack.getPath('gui/sprites/tooltip/frame.png')}")`);

state.svg.on('mousemove', (event) => {
    state.mouseX = event.x;
    state.mouseY = event.y;
    if (state.selectedItem != null && typeof state.selectedItem != "undefined") {
    	state.selectedItem.svgContainer.attr('x', event.x - state.selectedItem.svgContainer.attr('width') / 2)
    	state.selectedItem.svgContainer.attr('y', event.y - state.selectedItem.svgContainer.attr('height') / 2)
    }
});

// Add Items to inventory
// ----------------------------
const apple                   = new ItemInstance( MinecraftItem.apple,                  null, null);
const book                    = new ItemInstance( MinecraftItem.book,                   null, null);
const carrot                  = new ItemInstance( MinecraftItem.carrot,                 null, null);
const dark_oak_sign           = new ItemInstance( MinecraftItem.dark_oak_sign,          null, null);
// ----------------------------
const netherite_helmet        = new ItemInstance( MinecraftItem.netherite_helmet,       null, null);
const netherite_chestplate    = new ItemInstance( MinecraftItem.netherite_chestplate,   null, null);
const netherite_leggings      = new ItemInstance( MinecraftItem.netherite_leggings,     null, null);
const netherite_boots         = new ItemInstance( MinecraftItem.netherite_boots,        null, null);
// ----------------------------
const diamond_helmet          = new ItemInstance( MinecraftItem.diamond_helmet,         null, null);
const diamond_chestplate      = new ItemInstance( MinecraftItem.diamond_chestplate,     null, null);
const diamond_leggings        = new ItemInstance( MinecraftItem.diamond_leggings,       null, null);
const diamond_boots           = new ItemInstance( MinecraftItem.diamond_boots,          null, null);
// ----------------------------
const golden_helmet           = new ItemInstance( MinecraftItem.golden_helmet,          null, null);
const golden_chestplate       = new ItemInstance( MinecraftItem.golden_chestplate,      null, null);
const golden_leggings         = new ItemInstance( MinecraftItem.golden_leggings,        null, null);
const golden_boots            = new ItemInstance( MinecraftItem.golden_boots,           null, null);
// ----------------------------
const iron_helmet             = new ItemInstance( MinecraftItem.iron_helmet,            null, null);
const iron_chestplate         = new ItemInstance( MinecraftItem.iron_chestplate,        null, null);
const iron_leggings           = new ItemInstance( MinecraftItem.iron_leggings,          null, null);
const iron_boots              = new ItemInstance( MinecraftItem.iron_boots,             null, null);
// ----------------------------

const items = [];
items[9] = apple;
items[18] = book;
items[27] = carrot;
items[36] = dark_oak_sign;
items[17] = netherite_helmet;
items[26] = netherite_chestplate;
items[35] = netherite_leggings;
items[8] = netherite_boots;
items[16] = diamond_helmet;
items[25] = diamond_chestplate;
items[7] = diamond_leggings;
items[43] = diamond_boots;
items[15] = golden_helmet;
items[6] = golden_chestplate;
items[33] = golden_leggings;
items[42] = golden_boots;
items[5] = iron_helmet;
items[23] = iron_chestplate;
items[32] = iron_leggings;
items[41] = iron_boots;

let [invWidth, invHeight] = [176 * state.scale, 166 * state.scale];
const inventorySvg = state.svg.append('svg')
                      .attr('class', "inventory")
                      .attr('x', window.innerWidth / 2 - invWidth / 2)
                      .attr('y', window.innerHeight / 2 - invHeight / 2)
                      .attr('width', invWidth)
                      .attr('height', invHeight)
const inventory = new Inventory(inventorySvg, items);
