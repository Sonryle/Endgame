import { state } from "./state.js"
import { grid } from "./grid.js"
import { texturePack } from "./TexturePack.js"
import { ItemType } from "./Item.js"

export class ToolTip {
    constructor(itemName, itemEnchantments, itemType, itemStatValue1, itemStatValue2) {
        this.init(itemName, itemEnchantments, itemType, itemStatValue1, itemStatValue2);
    }

    async init(itemName, itemEnchantments, itemType, itemStatValue1, itemStatValue2) {

        // Set up svg container
        this.svgContainer = state.svg.append('svg').attr('class', 'ToolTipContainer');
        this.svgContainer.raise();
        this.svgContainer.attr('x', (Math.trunc(state.mouseX / state.scale) * state.scale) - (1 * state.scale));
        this.svgContainer.attr('y', (Math.trunc(state.mouseY / state.scale) * state.scale) - (24 * state.scale));
        state.svg.node().addEventListener('mousemove', (event) => {
            if (this.svgContainer != null) {
                let [x, y] = grid.nearestPixel(state.mouseX, state.mouseY)
                this.svgContainer.attr('x', x)
                this.svgContainer.attr('y', y - 24 * state.scale)
            }
        })

        // Set up foreign object for html to be rendered
        const foreignObject = this.svgContainer.append('foreignObject')
            .attr('pointer-events', 'none')
            .attr('width', 10000 * state.scale)
            .attr('height', 10000 * state.scale)
            .style('position', 'relative')

        // Set up css stylised border
        const toolTip = foreignObject.append('xhtml:div')
            .attr('class', 'ToolTip')
            .style('position', 'absolute')
            .style('padding', state.scale * 11 + "px");
        toolTip.node().style.setProperty('--border-image-width', (state.scale * 10).toString() + "px");
        // document.querySelector(':root').style.setProperty('--tooltip-texture-path', `url("${await texturePack.getPath("gui/sprites/tooltip/background.png")}")`);
        // document.querySelector(':root').style.setProperty('--tooltip-frame-texture-path', `url("${await texturePack.getPath("gui/sprites/tooltip/frame.png")}")`);
        // console.log(await texturePack.getPath("gui/sprites/tooltip/background.png"));

        // Item Name
        const name = toolTip.append('xhtml:p').attr('class', 'minecraftText').text(itemName)
                .style('text-shadow', state.scale + "px " + state.scale + "px " + "#3e3e3e")
        if (itemEnchantments != null && typeof itemEnchantments != "undefined")
            name.style('color', '#55ffff')
                .style('text-shadow', state.scale + "px " + state.scale + "px " + "#153f3f")

        // Item Enchantments
        if (itemEnchantments != null && typeof itemEnchantments != "undefined") {
            itemEnchantments.forEach((currentValue) => {
                toolTip.append('xhtml:p').attr('class', 'minecraftText')
                        .text(currentValue)
                        .style('color', '#a8a8a8')
                        .style('text-shadow', state.scale + "px " + state.scale + "px " + "#3e3e3e")
            })
        }

        // Item Stats
        let phrase = "";
        switch (itemType) {
            case ItemType.HELMET:
                phrase = "When on head:"
                break;
            case ItemType.CHESTPLATE:
                phrase = "When on body:"
                break;
            case ItemType.LEGGINGS:
                phrase = "When on legs:"
                break;
            case ItemType.BOOTS:
                phrase = "When on feet:"
                break;
            case ItemType.WEAPON:
                phrase = "When in main hand:"
                break;
        }

        if (itemType != ItemType.DEFAULT) {
            toolTip.append('xhtml:div').attr('class', 'minecraftText')
                    .style('line-height', state.scale * 12 + 'px')
                    .html('<br/>')
            toolTip.append('xhtml:p').attr('class', 'minecraftText')
                    .text(phrase)
                    .style('color', '#a8a8a8')
                    .style('text-shadow', state.scale + "px " + state.scale + "px " + "#3e3e3e")

            if (itemType == ItemType.WEAPON) {
                toolTip.append('xhtml:p')
                        .attr('class', 'minecraftText')
                        .text(" " + itemStatValue1 + " Attack Speed")
                        .style('color', '#00aa00')
                        .style('text-shadow', state.scale + "px " + state.scale + "px " + "#002a00")
                toolTip.append('xhtml:p')
                        .attr('class', 'minecraftText')
                        .text(" " + itemStatValue2 + " Attack Damage")
                        .style('color', '#00aa00')
                        .style('text-shadow', state.scale + "px " + state.scale + "px " + "#002a00")
            } else {
                toolTip.append('xhtml:p')
                        .attr('class', 'minecraftText')
                        .text("+" + itemStatValue1 + " Armour Toughness")
                        .style('color', '#5353f8')
                        .style('text-shadow', state.scale + "px " + state.scale + "px " + "#15153e")
                toolTip.append('xhtml:p')
                        .attr('class', 'minecraftText')
                        .text("+" + itemStatValue2 + " Armour")
                        .style('color', '#5353f8')
                        .style('text-shadow', state.scale + "px " + state.scale + "px " + "#15153e")
            }
        }

        // Stylise
        toolTip.selectAll('p')
                .style('font-size', 8 * state.scale + "px")
                .style('padding', state.scale + "px")
                .style('word-spacing', 4 * state.scale + "px")
                .style('letter-spacing', "-1px")
    }

    delete() {
        this.svgContainer.remove();
    }
}
