import { select } from 'd3';
import { Item } from "./item.js";
import { Grid } from "./grid.js";
import { Inventory } from "./inventory.js"
import "./style.css";

const scale = 4;

const svg = select('#app').append('svg');

const grid = new Grid(scale, svg);
const inventory = new Inventory(scale, svg, grid);
// grid.drawGrid();

const helmet = new Item("./src/assets/textures/item/diamond_helmet.png", scale, svg, grid);
const chestplate = new Item("./src/assets/textures/item/diamond_chestplate.png", scale, svg, grid);
const leggings = new Item("./src/assets/textures/item/diamond_leggings.png", scale, svg, grid);
const boots = new Item("./src/assets/textures/item/diamond_boots.png", scale, svg, grid);

svg.attr('width', window.innerWidth);
svg.attr('height', window.innerHeight);
