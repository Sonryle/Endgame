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

const helmet = new Item("./src/assets/textures/item/diamond_helmet.png", ItemType.HELMET, 2, 3, null, "Diamond Helmet");
const chestplate = new Item("./src/assets/textures/item/diamond_chestplate.png", ItemType.CHESTPLATE, 2, 8, ["Protection IV", "Thorns III", "Mending"], "Diamond Chestplate");
const leggings = new Item("./src/assets/textures/item/diamond_leggings.png", ItemType.LEGGINGS, 2, 6, null, "Diamond Leggings");
const boots = new Item("./src/assets/textures/item/diamond_boots.png", ItemType.BOOTS, 2, 3, null, "Diamond Boots");
const sword = new Item("./src/assets/textures/item/diamond_sword.png", ItemType.WEAPON, 1.6, 10, ["Sharpness V", "Mending"], "Diamond Sword");
const string = new Item("./src/assets/textures/item/string.png", ItemType.DEFAULT, null, null, null, "String");
const stick = new Item("./src/assets/textures/item/stick.png", ItemType.DEFAULT, null, null, ["Knockback enchantment.level.255"], "Stick");

inventory.slots[5].setItem(helmet);
inventory.slots[6].setItem(chestplate);
inventory.slots[7].setItem(leggings);
inventory.slots[8].setItem(boots);
inventory.slots[36].setItem(sword);
inventory.slots[44].setItem(string);
inventory.slots[43].setItem(stick);

// TESTING GROUNDS

const slot1 = new ItemSlot(100, 100, ItemType.DEFAULT);
