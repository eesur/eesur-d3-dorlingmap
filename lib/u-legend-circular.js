import circleLegend from './uc-circle-legend';
// http://bl.ocks.org/aubergene/4723857

// domainArray is an array of [min, mean, max]

export default function (_svg, ref) {

    let margin = {top: 20, right: 100, bottom: 20, left: 160};
    
    let svg = _svg.selectAll('.legend-circle')
        .data([0]);

    svg.enter().append('g')
        .attr({
            class: 'legend-circle',
            transform: 'translate(' + margin.left + ',' + (ref.svgHeight - 200) + ')'
        });

    let scale = d3.scale.sqrt()
        .domain([0, ref.areaDomain[2]])
        .range([0, 80]);

    let circleKey = circleLegend()
        .scale(scale)
        .tickValues([ref.areaDomain[0], ref.areaDomain[1], (ref.areaDomain[2]/2)])
        .tickPadding(5)
        .orient('right');

    let renderCircleKey = svg.selectAll('.legend-circle')
        .data([0]);

    renderCircleKey.enter().append('g')
        .attr({
            class: 'legend-circle',
            transform: 'translate(100, 200)'
        });
    // update
    svg.select('.circle-legend').remove();
    renderCircleKey.call(circleKey);

}