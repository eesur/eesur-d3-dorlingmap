// pass in svg and ref object with all state

export default function (svg, ref) {

    const width = 160,
        height = 12;
    // append a defs (for definition) element to your SVG
    let defs = svg.append('defs');

    // append a linearGradient element to the defs and give it a unique id
    let linearGradient = defs.append('linearGradient')
        .attr('id', 'linear-gradient');

    // horizontal gradient
    linearGradient
        .attr({
            x1: '0%',
            y1: '0%',
            x2: '100%',
            y2: '0%'
        });

    // set the color for the start (0%)
    linearGradient.append('stop') 
        .attr('offset', '0%')   
        .attr('stop-color', ref.colourRange[0]); 

    // set the color for the mid (50%)
    linearGradient.append('stop') 
        .attr('offset', '50%')   
        .attr('stop-color', ref.colourRange[1]); 

    // set the color for the end (100%)
    linearGradient.append('stop') 
        .attr('offset', '100%')   
        .attr('stop-color', ref.colourRange[2]); 

    // draw the rectangle and fill with gradient
    // color Legend container
    let legendsvg = svg.selectAll('.legend-gradient')
        .data([0]);

    legendsvg.enter().append('g')
        .attr({
            class: 'legend-gradient',
            transform: 'translate(' + 30 + ',' + (ref.svgHeight -30) + ')'
        })
        .append('rect')
        .attr({
            class: 'legendRect',
            width: width,
            height: height,
            x: 0,
            y: 0
        })
        .style('fill', 'url(#linear-gradient)');

    // append title
    // legendsvg.append('text')
    //     .attr('class', 'legendTitle')
    //     .attr('x', 0)
    //     .attr('y', -10)
    //     .style('text-anchor', 'middle')
    //     .text('Range');

    console.log('colourRange[2]', ref.colorDomain[2]);

    // set scale for x-axis
    let xScale = d3.scale.linear()
        .domain([0, ref.colorDomain[2]] )
        .range([0, width]);

    // define x-axis
    let xAxis = d3.svg.axis()
        .orient('bottom')
        .ticks(4)
        .scale(xScale);

    // set up X axis
    let applyAxis = legendsvg.selectAll('.axis')
        .data([0]);

    applyAxis.enter().append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (12) + ')');
    // update
    applyAxis.call(xAxis);

}

