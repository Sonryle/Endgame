import { select } from 'd3';

import { state } from "./state.js"
import { grid } from "./grid.js";

import { Item, ItemType } from "./Item.js";
import { ItemSlot } from "./ItemSlot.js"
import { Inventory } from "./inventory.js"
import "./style.css";

state.svg = select('#app').append('svg');
state.svg.attr('width', window.innerWidth);
state.svg.attr('height', window.innerHeight);
state.svg.on('mousemove', (event) => {
    state.mouseX = event.x;
    state.mouseY = event.y;
})

const inventory = new Inventory(grid);
// grid.drawGrid();

// Add Items to inventory

const netherite_helmet = new Item("./src/assets/textures/item/netherite_helmet.png", ItemType.HELMET, 2, 3, ["Pullup XVI", "Aus. Pullup XIII", "Chinup XIV"], "Netherite Helmet");
const netherite_chestplate = new Item("./src/assets/textures/item/netherite_chestplate.png", ItemType.CHESTPLATE, 2, 8, ["70kg Bench Press I", "30kg Dip II", "0.9m Pike Push IV"], "Netherite Chestplate");
const netherite_leggings = new Item("./src/assets/textures/item/netherite_leggings.png", ItemType.LEGGINGS, 2, 6, ["Squat 120kg", "Nordic Curl X", "Calf Raise XX 20kg"], "Netherite Leggings");
const netherite_boots = new Item("./src/assets/textures/item/netherite_boots.png", ItemType.BOOTS, 2, 3, ["Good Looks CL"], "Netherite Boots");
inventory.slots[17].setItem(netherite_helmet);
inventory.slots[26].setItem(netherite_chestplate);
inventory.slots[35].setItem(netherite_leggings);
inventory.slots[44].setItem(netherite_boots);
const diamond_helmet = new Item("./src/assets/textures/item/diamond_helmet.png", ItemType.HELMET, 2, 3, null, "Diamond Helmet");
const diamond_chestplate = new Item("./src/assets/textures/item/diamond_chestplate.png", ItemType.CHESTPLATE, 2, 8, ["Protection IV", "Thorns III", "Mending"], "Diamond Chestplate");
const diamond_leggings = new Item("./src/assets/textures/item/diamond_leggings.png", ItemType.LEGGINGS, 2, 6, null, "Diamond Leggings");
const diamond_boots = new Item("./src/assets/textures/item/diamond_boots.png", ItemType.BOOTS, 2, 3, null, "Diamond Boots");
inventory.slots[16].setItem(diamond_helmet);
inventory.slots[25].setItem(diamond_chestplate);
inventory.slots[34].setItem(diamond_leggings);
inventory.slots[43].setItem(diamond_boots);
const iron_helmet = new Item("./src/assets/textures/item/iron_helmet.png", ItemType.HELMET, 2, 3, null, "Iron Helmet");
const iron_chestplate = new Item("./src/assets/textures/item/iron_chestplate.png", ItemType.CHESTPLATE, 2, 8, ["Bench V", "Bench IX", "Bench VIII", "Pike Push V", "Pike Push VIII", "Pike Push VII", "Dip IV", "Dip VIII", "Dip VII"], "Iron Chestplate");
const iron_leggings = new Item("./src/assets/textures/item/iron_leggings.png", ItemType.LEGGINGS, 2, 6, null, "Iron Leggings");
const iron_boots = new Item("./src/assets/textures/item/iron_boots.png", ItemType.BOOTS, 2, 3, null, "Iron Boots");
inventory.slots[15].setItem(iron_helmet);
inventory.slots[24].setItem(iron_chestplate);
inventory.slots[33].setItem(iron_leggings);
inventory.slots[42].setItem(iron_boots);
