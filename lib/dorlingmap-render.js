// renders chart
import dorlingMap from './dorlingmap-component';

// `ref` is object inherited from _state.js
export default function (ref) {


    // call chart 
    // can override settings here (GET/SET)
    let chart = dorlingMap(ref)
        .width(ref.svgWidth)
        .height(ref.svgHeight);

    // apply chart to DOM
    d3.select(ref.id)
        .datum(ref.data)
        .call(chart);

}
