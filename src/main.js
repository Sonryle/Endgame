import { select } from 'd3';

import { state } from "./state.js"

import { Item } from "./Item.js";
import { ItemSlot } from "./ItemSlot.js"
import { Grid } from "./grid.js";
import { Inventory } from "./inventory.js"
import "./style.css";

state.svg = select('#app').append('svg');
state.svg.attr('width', window.innerWidth);
state.svg.attr('height', window.innerHeight);

const grid = new Grid();

const inventory = new Inventory(grid);
grid.drawGrid();

const helmet = new Item("./src/assets/textures/item/diamond_helmet.png", grid, inventory);
const chestplate = new Item("./src/assets/textures/item/diamond_chestplate.png", grid, inventory);
const leggings = new Item("./src/assets/textures/item/diamond_leggings.png", grid, inventory);
const boots = new Item("./src/assets/textures/item/diamond_boots.png", grid, inventory);

state.selectedItem = helmet;
inventory.slots[5].swapItems();
state.selectedItem = chestplate;
inventory.slots[6].swapItems();
state.selectedItem = leggings;
inventory.slots[7].swapItems();
state.selectedItem = boots;
inventory.slots[8].swapItems();
state.selectedItem = null;

