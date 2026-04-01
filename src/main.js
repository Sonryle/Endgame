import { select } from 'd3';

import { state } from "./state.js"
import { grid } from "./grid.js";

import { ItemInstance, MinecraftItem } from "./Item.js";
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
const apple = new ItemInstance( MinecraftItem.apple, null, null);
const book = new ItemInstance( MinecraftItem.book, null, null);
const carrot = new ItemInstance( MinecraftItem.carrot, null, null);
const diamond_helmet = new ItemInstance( MinecraftItem.diamond_helmet, ["Good Looks XII"], null);
const diamond_chestplate = new ItemInstance( MinecraftItem.diamond_chestplate, null, null);
const diamond_leggings = new ItemInstance( MinecraftItem.diamond_leggings, null, null);
const diamond_boots = new ItemInstance( MinecraftItem.diamond_boots, null, null);


const items = [];
items[17] = apple;
items[26] = book;
items[35] = carrot;
items[44] = diamond_helmet;
items[43] = diamond_chestplate;
items[42] = diamond_leggings;
items[41] = diamond_boots;

let [invWidth, invHeight] = [176 * state.scale, 166 * state.scale];
const inventorySvg = state.svg.append('svg')
                      .attr('class', "inventory")
                      .attr('x', window.innerWidth / 2 - invWidth / 2)
                      .attr('y', window.innerHeight / 2 - invHeight / 2)
                      .attr('width', invWidth)
                      .attr('height', invHeight)
const inventory = new Inventory(inventorySvg, items);
