import { select } from 'd3';
import { Item } from "./item.js";
import { Grid } from "./grid.js";
import "./style.css";

const scale = 4;

const svg = select('#app').append('svg');

const grid = new Grid(scale, svg);
grid.drawGrid();

const sword = new Item("./src/assets/textures/item/diamond_sword.png", scale, svg, grid);
const chestplate = new Item("./src/assets/textures/item/diamond_chestplate.png", scale, svg, grid);
const mace = new Item("./src/assets/textures/item/mace.png", scale, svg, grid);

svg.attr('width', window.innerWidth);
svg.attr('height', window.innerHeight);
