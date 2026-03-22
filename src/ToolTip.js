import { state } from "./state.js"

export class ToolTip {
    constructor(text) {
        this.svgContainer = state.svg.append('svg').attr('class', 'tooltipcontainer');
        this.svgContainer.raise();

        const foreignObject = this.svgContainer.append('foreignObject')
            .attr('pointer-events', 'none')
            .attr('width', 120 * state.scale)
            .attr('height', 66 * state.scale)
            .style('position', 'relative')

        const toolTip = foreignObject.append('xhtml:div')
            .attr('class', 'tooltip')
            .style('width', '100%')
            .style('height', '100%')
            .style('border-image-width', (state.scale * 10).toString() + "px")
            .style('position', 'absolute')
        foreignObject.append('xhtml:div')
            .attr('class', 'tooltipFrame')
            .style('width', '100%')
            .style('height', '100%')
            .style('border-image-width', (state.scale * 10).toString() + "px")
            .style('position', 'absolute')

        this.svgContainer.attr('x', (Math.trunc(state.mouseX / state.scale) * state.scale) - (1 * state.scale));
        this.svgContainer.attr('y', (Math.trunc(state.mouseY / state.scale) * state.scale) - (24 * state.scale));
        state.svg.node().addEventListener('mousemove', (event) => {
            if (this.svgContainer != null) {
                this.svgContainer.attr('x', (Math.trunc(state.mouseX / state.scale) * state.scale) - (1 * state.scale));
                this.svgContainer.attr('y', (Math.trunc(state.mouseY / state.scale) * state.scale) - (24 * state.scale));
            }
        })

        // Text Time!
        this.svgContainer.append('text').attr('class', 'minecraftTextShadow')
                .text(text)
                .attr('font-size', 7 * state.scale)
                .attr('y', 19 * state.scale)
                .attr('x', 13 * state.scale)
                .attr('pointer-events', 'none')
                .attr('fill', '#3e3e3e')
        this.svgContainer.append('text').attr('class', 'minecraftText')
                .text(text)
                .attr('font-size', 7 * state.scale)
                .attr('y', 18 * state.scale)
                .attr('x', 12 * state.scale)
                .attr('pointer-events', 'none')
                .attr('fill', 'white')

        this.svgContainer.append('text').attr('class', 'minecraftTextShadow')
                .text("When on head:")
                .attr('font-size', 7 * state.scale)
                .attr('y', 33 * state.scale)
                .attr('x', 13 * state.scale)
                .attr('pointer-events', 'none')
                .attr('fill', '#2a2a2a')
        this.svgContainer.append('text').attr('class', 'minecraftText')
                .text("When on head:")
                .attr('font-size', 7 * state.scale)
                .attr('y', 32 * state.scale)
                .attr('x', 12 * state.scale)
                .attr('pointer-events', 'none')
                .attr('fill', '#a8a8a8')

        this.svgContainer.append('text').attr('class', 'minecraftTextShadow')
                .text("+2 armour toughness")
                .attr('font-size', 7 * state.scale)
                .attr('y', 42 * state.scale)
                .attr('x', 13 * state.scale)
                .attr('pointer-events', 'none')
                .attr('fill', '#15153e')
        this.svgContainer.append('text').attr('class', 'minecraftText')
                .text("+2 armour toughness")
                .attr('font-size', 7 * state.scale)
                .attr('y', 41 * state.scale)
                .attr('x', 12 * state.scale)
                .attr('pointer-events', 'none')
                .attr('fill', '#5454fc')

        this.svgContainer.append('text').attr('class', 'minecraftTextShadow')
                .text("+2 armour")
                .attr('font-size', 7 * state.scale)
                .attr('y', 51 * state.scale)
                .attr('x', 13 * state.scale)
                .attr('pointer-events', 'none')
                .attr('fill', '#15153e')
        this.svgContainer.append('text').attr('class', 'minecraftText')
                .text("+2 armour")
                .attr('font-size', 7 * state.scale)
                .attr('y', 50 * state.scale)
                .attr('x', 12 * state.scale)
                .attr('pointer-events', 'none')
                .attr('fill', '#5454fc')
    }

    delete() {
        this.svgContainer.remove();
    }
}
