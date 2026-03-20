import { select } from 'd3';
import { Item } from "./item.js";
import "./style.css";

const scale = 4;

const svg = select('#app').append('svg');
const image = svg.append('image');

const sword = new Item("./src/assets/textures/item/diamond_sword.png", scale, svg);
const chestplate = new Item("./src/assets/textures/item/diamond_chestplate.png", scale, svg);
const mace = new Item("./src/assets/textures/item/mace.png", scale, svg);

svg.attr('width', window.innerWidth);
svg.attr('height', window.innerHeight);
