// initiation abstraction for chart
import defaults from './_state'; // all defaults
import dataTransform  from './dorlingmap-data-transform';
import update from './_update';
import events from './update-events';
import getSet from './u-get-set';


export default function () {

    const instance = {};

    
    // api overrides
    let opts = {
        id: null, // selection element for container
        dataJson: null, // path to JSON file
        data: null, // js object directly
        dev: null, // boolean to toggle dev features
        coordinatesData: null, // path to JSON coordinates file
        keyCircleArea: null,
        keyCircleColour: null,
        colourRange: null,
        levels: null,
        svgHeight: null,
        svgWidth: null
    };

    // reference all data and configurations
    // pure prototypal inheritance 
    const ref = Object.create(defaults);

    // render/update 
    instance.render = function() {

        const q = d3.queue();

        // reference configurations
        updateRef();

        // check if json url or data object
        if (_.isNull(opts.dataJson)) {
            q
                .defer(d3.json, coordinatesData)
                .await(function(error, file1) { 
                    // make data available across scope
                    ref.coordinatesData = file1;
                    ref.data = opts.data;
                    renderCalls();
            });
        } else {
            q
                .defer(d3.json, opts.coordinatesData)
                .defer(d3.json, opts.dataJson)
                .await(function(error, file1, file2) { 
                    // make data available across scope
                    ref.coordinatesData = file1;
                    ref.data = file2;
                    renderCalls();
            });
        }

        console.log(ref);

        return instance;
    };

    function updateRef() {
        // chart specific api overrides 
        _.forIn(opts, function(value, key) {
            if(!_.isNull(opts[key])) ref[key] = opts[key];
        });
    }

    function renderCalls() {

        // clean data & check null values/ transform etc
        dataTransform(ref);

        // trigger event listeners
        events(ref);

        // run the visualisation
        update(ref);
    }


    // api for chart, all items in `opts` object made into get-set
    for (let key in opts) {
        instance[key] = getSet(key, instance).bind(opts);
    }

    return instance;
}