import { select } from 'd3';

import { state } from "./state.js"
import { grid } from "./grid.js";

import { Item, ItemType } from "./Item.js";
import { ItemSlot } from "./ItemSlot.js"
import { Inventory } from "./inventory.js"
import "./style.css";

state.svg = select('#app').append('svg').attr('class', 'master');
state.svg.attr('width', window.innerWidth);
state.svg.attr('height', window.innerHeight);

state.svg.on('mousemove', (event) => {
    state.mouseX = event.x;
    state.mouseY = event.y;
    if (state.selectedItem != null && typeof state.selectedItem != "undefined") {
    	state.selectedItem.svgContainer.attr('x', event.x - state.selectedItem.svgContainer.attr('width') / 2)
    	state.selectedItem.svgContainer.attr('y', event.y - state.selectedItem.svgContainer.attr('height') / 2)
    }
});

// Add Items to inventory
const netherite_helmet = new Item("./src/assets/textures/item/netherite_helmet.png", ItemType.HELMET, 2, 3, ["Pullup XVI", "Aus. Pullup XIII", "Chinup XIV"], "Netherite Helmet");
const netherite_chestplate = new Item("./src/assets/textures/item/netherite_chestplate.png", ItemType.CHESTPLATE, 2, 8, ["70kg Bench Press I", "30kg Dip II", "0.9m Pike Push IV"], "Netherite Chestplate");
const netherite_leggings = new Item("./src/assets/textures/item/netherite_leggings.png", ItemType.LEGGINGS, 2, 6, ["Squat 120kg", "Nordic Curl X", "Calf Raise XX 20kg"], "Netherite Leggings");
const netherite_boots = new Item("./src/assets/textures/item/netherite_boots.png", ItemType.BOOTS, 2, 3, ["Good Looks CL"], "Netherite Boots");
const diamond_helmet = new Item("./src/assets/textures/item/diamond_helmet.png", ItemType.HELMET, 2, 3, null, "Diamond Helmet");
const diamond_chestplate = new Item("./src/assets/textures/item/diamond_chestplate.png", ItemType.CHESTPLATE, 2, 8, ["Protection IV", "Thorns III", "Mending"], "Diamond Chestplate");
const diamond_leggings = new Item("./src/assets/textures/item/diamond_leggings.png", ItemType.LEGGINGS, 2, 6, null, "Diamond Leggings");
const diamond_boots = new Item("./src/assets/textures/item/diamond_boots.png", ItemType.BOOTS, 2, 3, null, "Diamond Boots");
const iron_helmet = new Item("./src/assets/textures/item/iron_helmet.png", ItemType.HELMET, 2, 3, null, "Iron Helmet");
const iron_chestplate = new Item("./src/assets/textures/item/iron_chestplate.png", ItemType.CHESTPLATE, 2, 8, ["Bench V", "Bench IX", "Bench VIII", "Pike Push V", "Pike Push VIII", "Pike Push VII", "Dip IV", "Dip VIII", "Dip VII"], "Iron Chestplate");
const iron_leggings = new Item("./src/assets/textures/item/iron_leggings.png", ItemType.LEGGINGS, 2, 6, null, "Iron Leggings");
const iron_boots = new Item("./src/assets/textures/item/iron_boots.png", ItemType.BOOTS, 2, 3, null, "Iron Boots");

const items = [];
items[17] = netherite_helmet;
items[26] = netherite_chestplate;
items[35] = netherite_leggings;
items[44] = netherite_boots;
items[16] = diamond_helmet;
items[25] = diamond_chestplate;
items[34] = diamond_leggings;
items[43] = diamond_boots;
items[15] = iron_helmet;
items[24] = iron_chestplate;
items[33] = iron_leggings;
items[42] = iron_boots;

const inventorySvg = state.svg.append('svg').attr('class', "inventory").attr('x', window.innerWidth / 3).attr('y', window.innerHeight / 3);
const inventory = new Inventory(inventorySvg, items);
