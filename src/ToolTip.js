import { state } from "./state.js"

export class ToolTip {
    constructor(text) {
        this.svgContainer = state.svg.append('svg').attr('class', 'ToolTipContainer');
        this.svgContainer.raise();

        const foreignObject = this.svgContainer.append('foreignObject')
            .attr('pointer-events', 'none')
            .attr('width', 10000 * state.scale)
            .attr('height', 10000 * state.scale)
            .style('position', 'relative')

        const toolTip = foreignObject.append('xhtml:div')
            .attr('class', 'ToolTip')
            .style('position', 'absolute')
            .style('padding', state.scale * 11 + "px");
        toolTip.node().style.setProperty('--border-image-width', (state.scale * 10).toString() + "px");

        this.svgContainer.attr('x', (Math.trunc(state.mouseX / state.scale) * state.scale) - (1 * state.scale));
        this.svgContainer.attr('y', (Math.trunc(state.mouseY / state.scale) * state.scale) - (24 * state.scale));
        state.svg.node().addEventListener('mousemove', (event) => {
            if (this.svgContainer != null) {
                this.svgContainer.attr('x', (Math.trunc(state.mouseX / state.scale) * state.scale) - (1 * state.scale));
                this.svgContainer.attr('y', (Math.trunc(state.mouseY / state.scale) * state.scale) - (24 * state.scale));
            }
        })

        // Text Time!
        toolTip.append('xhtml:p').attr('class', 'minecraftText').text(text)
        toolTip.append('xhtml:div').attr('class', 'minecraftText')
                .style('line-height', state.scale * 12 + 'px')
                .html('<br/>')
        toolTip.append('xhtml:p').attr('class', 'minecraftText').text(text)
        toolTip.append('xhtml:p').attr('class', 'minecraftText').text(text)

        toolTip.selectAll('p')
                .style('font-size', 7 * state.scale + "px")
                .style('text-shadow', state.scale + "px " + state.scale + "px " + "#3e3e3e")
                .style('padding', state.scale + "px");

    }

    delete() {
        this.svgContainer.remove();
    }
}
