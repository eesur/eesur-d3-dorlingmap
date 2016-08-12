import collide from './dorlingmap-collide';
import mouseover from './dorlingmap-events-mouseover';
import mouseout from './dorlingmap-events-mouseout';
import legendGradient from './u-legend-gradient';
import legendCircular from './u-legend-circular';

// pass in a object of any opts/params 
export default function(ref) {

    //________________________________________________
    // PARAMS  
    //________________________________________________
    // let vpWidth = ref.vpWidth;

    let k;
    let node;
    let nodes = [];

    let pixelLoc = d3.geo.mercator();
    pixelLoc.scale(100);

    //________________________________________________
    // set up colour scales
    //________________________________________________

    // get min and max for colour range
    let colorDomain = d3.extent(ref.data, (d) => d[ref.keyCircleColour]);
    // get the mean
    let colorDomainMean = _.meanBy(ref.data, ref.keyCircleColour);
    // insert the colorDomain
    colorDomain.splice(1, 0, colorDomainMean);
    // update references 
    ref.colorDomain = colorDomain;
    console.log('colorDomain', colorDomain);

    let colorScale = d3.scale.linear()
        .domain(colorDomain)
        .range(ref.colourRange)
        .interpolate(d3.interpolateHcl);

    //________________________________________________
    // GET/SET defaults 
    //________________________________________________

    // getter setter default and private variables
    let svg,
        width = 800,
        height = 800, 
        padding = 10,
        margin = { top: 10, right: 10, bottom: 10, left: 10};

    let dispatch = d3.dispatch('customHover');

    //________________________________________________
    // RENDER 
    //________________________________________________

    function exports(_selection) {

        // // access data
        let countries = ref.data;
        let coordinates = ref.coordinatesData;

        // create scales
        let xScale = d3.scale.linear().domain([ref.minX, ref.maxX]).range([-50, -30]);
        let yScale = d3.scale.linear().domain([ref.minY, ref.maxY]).range([-20, -10]);

        // only add svg if doesn't already exist
        svg = _selection.selectAll('svg')
            .data([0]);

        svg.enter().append('svg')
            .attr({
                 class: 'dorling-chart',
                width: width,
                height: (height + margin.top + margin.bottom)
            });

        //________________________________________________
        // set up area scales
        //________________________________________________

        //scale for circle areas
        // get min and max for colour range
        let areaDomain = d3.extent(ref.data, (d) => d[ref.keyCircleArea]);
        // get the mean
        let areaDomainMean = _.meanBy(ref.data, ref.keyCircleArea);
        // insert the colorDomain
        areaDomain.splice(1, 0, areaDomainMean);
        // update reference
        ref.areaDomain = areaDomain;
        console.log('areaDomain', areaDomain);
        // apply to scale
        let pointScale = d3.scale.sqrt().domain([0, areaDomain[2]]).range([0, 80]);

        //________________________________________________

        var d3_geom_voronoi = d3.geom.voronoi()
            .x((d) => d.x)
            .y((d) => d.y);

        var path = svg.selectAll('path');

        _.times(countries.length, i => {
            node = countries[i];
            node.coordinates = coordinates[node.alias];
            if (!_.isUndefined(node.coordinates)[0]) {
                node.cx = xScale(pixelLoc(node.coordinates)[0]);
            } else {
                console.log('can\'t find');
            }
            
            node.cy = yScale(pixelLoc(node.coordinates)[1]);
            node.radius = pointScale(node[ref.keyCircleArea]);
            nodes.push(node);
        });

        let force = d3.layout.force()
            .nodes(nodes)
            .links([])
            .size([width, height])
            .charge(d => -Math.pow(d.radius * 5.0, 2.0) / 8)
            .gravity(1.8)
            .on('tick', (e) => {
                k = 10 * e.alpha;
                _.times(nodes.length, i => {
                    nodes[i].x += k * nodes[i].cx;
                    nodes[i].y += k * nodes[i].cy;
                });
                svg.selectAll('.country-circles')
                    .each(collide(0.1, nodes, pointScale, padding))
                    .attr({
                        cx: d => d.x,
                        cy: d => d.y
                    });

                svg.selectAll('.country-labels')
                    .attr({
                        x: d => d.x,
                        y: d => d.y + 5,
                        opacity: d => (d.radius < 17) ? 0 : 1
                    });

                path = path.data(d3_geom_voronoi(nodes));
                path.enter().append('path');

                path
                    .style('fill', 'none')
                    .style('stroke', () => (ref.dev) ? 'pink' : 'none')
                    .style('pointer-events', 'all');

                path.attr('d', (d) => 'M' + d.join('L') + 'Z')
                    .datum((d) => d.point)
                    .attr('class', (d,i) => ' v-' + i)
                    .on('mouseover', (d) => mouseover(d, ref))
                    .on('mouseout', (d) => mouseout(d, ref));

                path.exit().remove();
            })
            .start();

        let circles = svg.selectAll('.country-circles')
            .data(nodes);
            
        circles.enter().append('svg:circle');

        circles.attr({
                cx: d => d.cx,
                cy: d => d.cy,
                r: d => d.radius,
                class: d => d.continent.replace(' ', '') + ' ' + 'country-circles',
                id: d => d.alias,
                fill: (d) => colorScale(d[ref.keyCircleColour]),
                stroke: '#fff', // not shown but is on mouseover
                'stroke-width': 0
            });

        circles.exit().transition().remove();

        let labels = svg.selectAll('.country-labels')
            .data(nodes);

        labels.enter().append('svg:text')
            .attr('class', 'country-labels');

        labels.text(d => d.alias);

        labels.exit().remove();

        // add a gradient legend
        legendGradient(svg, ref);
        // add a circular legend
        legendCircular(svg, ref);

    } // exports

    //________________________________________________
    // GET/SET  
    //________________________________________________

    exports.width = function(_x) {
        if (!arguments.length) return width;
        width = _x;
        return this;
    };
    exports.height = function(_x) {
        if (!arguments.length) return height;
        height = _x;
        return this;
    };
    exports.margin = function(_x) {
        if (!arguments.length) return margin;
        margin = _x;
        return this;
    };

    d3.rebind(exports, dispatch, 'on');
    return exports;


}


