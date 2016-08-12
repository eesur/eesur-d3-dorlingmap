// mouseover

export default function (d, ref) {

    d3.select('.js-info-1').text(d.country);
    d3.select('.js-info-2').text('value that sets area: ' + d[ref.keyCircleArea]);
    d3.select('.js-info-3').text('value that sets colour: ' + d[ref.keyCircleColour]);

    d3.selectAll('.country-circles').transition().duration(200).ease('quad')
        .style({
            stroke: '#ccc',
            'stroke-width': 0
        });

    d3.select('#' + d.alias).transition().duration(500).ease('elastic')
        .style({
            'stroke-width': 6
        });

    // console.log(d);

}