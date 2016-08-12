// render charts and run updates
import dorlingMap from './dorlingmap-component';
import dorlingMapRender from './dorlingmap-render';
// import dorlingMapReset  from './dorlingmap-reset';


export default function (ref) {

    // update calls for everything
    // can loop through all charts

    // render chart
    dorlingMapRender(ref);

    // apply any tidying up
    // dorlingMapReset(ref);

} 