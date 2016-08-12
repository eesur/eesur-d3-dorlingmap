// mouseout

export default function (d, ref) {

    d3.select('.js-info-1').text('');
    d3.select('.js-info-2').text('');
    d3.select('.js-info-3').text('');

    d3.selectAll('.country-circles').transition().style({
            'stroke-width': 0
        });
    // console.log(d);

}