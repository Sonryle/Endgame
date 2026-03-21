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
// grid.drawGrid();

const inventory = new Inventory(grid);

const helmet = new Item("./src/assets/textures/item/diamond_helmet.png", grid, inventory);
const chestplate = new Item("./src/assets/textures/item/diamond_chestplate.png", grid, inventory);
const leggings = new Item("./src/assets/textures/item/diamond_leggings.png", grid, inventory);
const boots = new Item("./src/assets/textures/item/diamond_boots.png", grid, inventory);

state.selectedItem = chestplate;

