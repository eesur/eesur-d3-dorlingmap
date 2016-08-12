// data transform/clean required for chart

export default function (ref) {

    let coords = [];
    let xs = [];
    let ys = [];
    let alias;

    // access data
    let coordinates = ref.coordinatesData;

    for (alias in coordinates) {
        coords.push(coordinates[alias]);
        xs.push(coordinates[alias][0]);
        ys.push(coordinates[alias][1]);
    }

    // create values for x an y scales
    ref.minX = d3.min(xs);
    ref.maxX = d3.max(xs);
    ref.minY = d3.min(ys);
    ref.maxY = d3.max(ys);


}