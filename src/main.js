import { select } from 'd3';

import { state } from "./state.js"

import { Item, ItemType } from "./Item.js";
import { ItemSlot } from "./ItemSlot.js"
import { Grid } from "./grid.js";
import { Inventory } from "./inventory.js"
import "./style.css";

state.svg = select('#app').append('svg');
state.svg.attr('width', window.innerWidth);
state.svg.attr('height', window.innerHeight);
state.svg.on('mousemove', (event) => {
    state.mouseX = event.x;
    state.mouseY = event.y;
})

const grid = new Grid();
const inventory = new Inventory(grid);
// grid.drawGrid();

const helmet = new Item("./src/assets/textures/item/diamond_helmet.png", ItemType.HELMET);
const chestplate = new Item("./src/assets/textures/item/diamond_chestplate.png", ItemType.CHESTPLATE);
const leggings = new Item("./src/assets/textures/item/diamond_leggings.png", ItemType.LEGGINGS);
const boots = new Item("./src/assets/textures/item/diamond_boots.png", ItemType.BOOTS);

inventory.slots[5].setItem(helmet);
inventory.slots[6].setItem(chestplate);
inventory.slots[7].setItem(leggings);
inventory.slots[8].setItem(boots);

// TESTING GROUNDS

