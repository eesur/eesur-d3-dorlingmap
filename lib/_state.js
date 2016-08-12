// keep track of state
// null values will get set at runtime

let defaults = {
    dev: false, // boolean to toggle dev features
    svgWidth: 800,
    svgHeight: 800,
    keyCircleArea: null, // key for data related to area
    keyCircleColour: null, // key for data related to colour rendering
    colourRange: ['#fde0dd','#fa9fb5','#c51b8a'],
    id: null,
    data: null,
    areaDomain: null, // domain [min, mean, max]
    colorDomain: null, // domain [min, mean, max]
    coordinatesData: null,
    minX: null,
    maxX: null,
    minY: null,
    maxY: null
};

export default defaults;