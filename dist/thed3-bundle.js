(function (exports) {
  'use strict';

  // keep track of state
  // null values will get set at runtime

  var defaults = {
      dev: false, // boolean to toggle dev features
      svgWidth: 800,
      svgHeight: 800,
      keyCircleArea: null, // key for data related to area
      keyCircleColour: null, // key for data related to colour rendering
      colourRange: ['#fde0dd', '#fa9fb5', '#c51b8a'],
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

  // data transform/clean required for chart

  function dataTransform (ref) {

      var coords = [];
      var xs = [];
      var ys = [];
      var alias = void 0;

      // access data
      var coordinates = ref.coordinatesData;

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

  // Adapted from http://bl.ocks.org/3116713
  var collide = function collide(alpha, nodes, scale, padding) {
      var quadtree = d3.geom.quadtree(nodes);
      return function (d) {
          var r = d.radius + scale.domain()[1] + padding;
          var nx1 = d.x - r;
          var nx2 = d.x + r;
          var ny1 = d.y - r;
          var ny2 = d.y + r;
          quadtree.visit(function (quad, x1, y1, x2, y2) {
              if (quad.point && quad.point !== d) {
                  var x = d.x - quad.point.x;
                  var y = d.y - quad.point.y;
                  var l = Math.sqrt(x * x + y * y);
                  var _r = d.radius + quad.point.radius + padding;
                  if (l < _r) {
                      l = (l - _r) / l * alpha;
                      d.x -= x *= l;
                      d.y -= y *= l;
                      quad.point.x += x;
                      quad.point.y += y;
                  }
              }
              return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          });
      };
  };

  // mouseover

  function mouseover (d, ref) {

      d3.select('.js-info-1').text(d.country);
      d3.select('.js-info-2').text('value that sets area: ' + d[ref.keyCircleArea]);
      d3.select('.js-info-3').text('value that sets colour: ' + d[ref.keyCircleColour]);

      d3.selectAll('.country-circles').transition().duration(200).ease('quad').style({
          stroke: '#ccc',
          'stroke-width': 0
      });

      d3.select('#' + d.alias).transition().duration(500).ease('elastic').style({
          'stroke-width': 6
      });

      // console.log(d);
  }

  // mouseout

  function mouseout (d, ref) {

      d3.select('.js-info-1').text('');
      d3.select('.js-info-2').text('');
      d3.select('.js-info-3').text('');

      d3.selectAll('.country-circles').transition().style({
          'stroke-width': 0
      });
      // console.log(d);
  }

  // pass in svg and ref onject with domains etc

  function legendGradient (svg, ref) {

      var width = 160,
          height = 12;
      // append a defs (for definition) element to your SVG
      var defs = svg.append('defs');

      // append a linearGradient element to the defs and give it a unique id
      var linearGradient = defs.append('linearGradient').attr('id', 'linear-gradient');

      // horizontal gradient
      linearGradient.attr({
          x1: '0%',
          y1: '0%',
          x2: '100%',
          y2: '0%'
      });

      // set the color for the start (0%)
      linearGradient.append('stop').attr('offset', '0%').attr('stop-color', ref.colourRange[0]);

      // set the color for the mid (50%)
      linearGradient.append('stop').attr('offset', '50%').attr('stop-color', ref.colourRange[1]);

      // set the color for the end (100%)
      linearGradient.append('stop').attr('offset', '100%').attr('stop-color', ref.colourRange[2]);

      // draw the rectangle and fill with gradient
      // color Legend container
      var legendsvg = svg.selectAll('.legend-gradient').data([0]);

      legendsvg.enter().append('g').attr({
          class: 'legend-gradient',
          transform: 'translate(' + 30 + ',' + (ref.svgHeight - 30) + ')'
      }).append('rect').attr({
          class: 'legendRect',
          width: width,
          height: height,
          x: 0,
          y: 0
      }).style('fill', 'url(#linear-gradient)');

      // append title
      // legendsvg.append('text')
      //     .attr('class', 'legendTitle')
      //     .attr('x', 0)
      //     .attr('y', -10)
      //     .style('text-anchor', 'middle')
      //     .text('Range');

      console.log('colourRange[2]', ref.colorDomain[2]);

      // set scale for x-axis
      var xScale = d3.scale.linear().domain([0, ref.colorDomain[2]]).range([0, width]);

      // define x-axis
      var xAxis = d3.svg.axis().orient('bottom').ticks(4).scale(xScale);

      // set up X axis
      var applyAxis = legendsvg.selectAll('.axis').data([0]);

      applyAxis.enter().append('g').attr('class', 'axis').attr('transform', 'translate(0,' + 12 + ')');
      // update
      applyAxis.call(xAxis);
  }

  // adapted from http://bl.ocks.org/aubergene/4723857
  // circleLegend
  function circleLegend (text, width) {

      var scale,
          orient = 'left',
          tickPadding = 3,
          tickExtend = 5,
          tickArguments_ = [10],
          tickValues = null,
          tickFormat_,
          ε = 1e-6;

      function key(selection) {
          selection.each(function () {
              var g = d3.select(this);

              g.attr('class', 'circle-legend');

              // Stash a snapshot of the new scale, and retrieve the old snapshot.
              var scale0 = this.__chart__ || scale,
                  scale1 = this.__chart__ = scale.copy();

              // Ticks, or domain values for ordinal scales.
              var ticks = tickValues == null ? scale.ticks ? scale.ticks.apply(scale, tickArguments_) : scale.domain() : tickValues;
              ticks = ticks.slice().filter(function (d) {
                  return d > 0;
              }).sort(d3.descending);
              var tickFormat = tickFormat_ == null ? scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments_) : String : tickFormat_;
              var tick = g.selectAll('.tick').data(ticks, scale1);
              var tickEnter = tick.enter().insert('g', '.tick').attr('class', 'tick').style('opacity', ε);
              var tickExit = d3.transition(tick.exit()).style('opacity', ε).remove();
              var tickUpdate = d3.transition(tick.order()).style('opacity', 1);
              var tickTransform = void 0;

              tickEnter.each(function (tick) {
                  var gg = d3.select(this);

                  var tickText = tickFormat(tick);

                  if (!tickText) return;

                  gg.append('circle').attr('cx', 0).attr('cy', 0).attr('r', scale(tick));

                  gg.append('line').attr('y1', 0).attr('y2', 0).attr('stroke', '#000').text(tick);

                  gg.append('text').attr('dy', '.35em').style('text-anchor', 'left' == orient ? 'end' : 'start').text(tickText);
              });
              tickEnter.call(d3_svg_legend, scale0);
              tickUpdate.call(d3_svg_legend, scale1);
              tickExit.call(d3_svg_legend, scale1);

              function d3_svg_legend(selection, scale) {
                  selection.select('circle').attr('r', scale);

                  var x2 = scale(ticks[0]) + tickExtend;
                  var sign = 'left' == orient ? -1 : 1;

                  selection.select('text').attr('transform', 'translate(' + (x2 + tickPadding) * sign + ', 0)');

                  selection.select('line').attr('x1', function (d) {
                      return scale(d) * sign;
                  }).attr('x2', x2 * sign);

                  selection.attr('transform', function (d) {
                      return 'translate(0,' + -scale(d) + ')';
                  });
              }
          });
      }

      key.scale = function (value) {
          if (!arguments.length) return scale;
          scale = value;
          return key;
      };

      key.orient = function (value) {
          if (!arguments.length) return orient;
          orient = value;
          return key;
      };

      key.ticks = function () {
          if (!arguments.length) return tickArguments_;
          tickArguments_ = arguments;
          return key;
      };

      key.tickFormat = function (x) {
          if (!arguments.length) return tickFormat_;
          tickFormat_ = x;
          return key;
      };

      key.tickValues = function (x) {
          if (!arguments.length) return tickValues;
          tickValues = x;
          return key;
      };

      key.tickPadding = function (x) {
          if (!arguments.length) return tickPadding;
          tickPadding = +x;
          return key;
      };

      key.tickExtend = function (x) {
          if (!arguments.length) return tickExtend;
          tickExtend = +x;
          return key;
      };

      key.width = function (value) {
          if (!arguments.length) return width;
          width = value;
          return key;
      };

      key.height = function (value) {
          if (!arguments.length) return height;
          height = value;
          return key;
      };

      return key;
  }

  // http://bl.ocks.org/aubergene/4723857

  // domainArray is an array of [min, mean, max]

  function legendCircular (_svg, ref) {

      var margin = { top: 20, right: 100, bottom: 20, left: 160 };

      var svg = _svg.selectAll('.legend-circle').data([0]);

      svg.enter().append('g').attr({
          class: 'legend-circle',
          transform: 'translate(' + margin.left + ',' + (ref.svgHeight - 200) + ')'
      });

      var scale = d3.scale.sqrt().domain([0, ref.areaDomain[2]]).range([0, 80]);

      var circleKey = circleLegend().scale(scale).tickValues([ref.areaDomain[0], ref.areaDomain[1], ref.areaDomain[2] / 2]).tickPadding(5).orient('right');

      var renderCircleKey = svg.selectAll('.legend-circle').data([0]);

      renderCircleKey.enter().append('g').attr({
          class: 'legend-circle',
          transform: 'translate(100, 200)'
      });
      // update
      svg.select('.circle-legend').remove();
      renderCircleKey.call(circleKey);
  }

  // pass in a object of any opts/params
  function dorlingMap (ref) {

      //________________________________________________
      // PARAMS 
      //________________________________________________
      // let vpWidth = ref.vpWidth;

      var k = void 0;
      var node = void 0;
      var nodes = [];

      var pixelLoc = d3.geo.mercator();
      pixelLoc.scale(100);

      //________________________________________________
      // set up colour scales
      //________________________________________________

      // get min and max for colour range
      var colorDomain = d3.extent(ref.data, function (d) {
          return d[ref.keyCircleColour];
      });
      // get the mean
      var colorDomainMean = _.meanBy(ref.data, ref.keyCircleColour);
      // insert the colorDomain
      colorDomain.splice(1, 0, colorDomainMean);
      // update references
      ref.colorDomain = colorDomain;
      console.log('colorDomain', colorDomain);

      var colorScale = d3.scale.linear().domain(colorDomain).range(ref.colourRange).interpolate(d3.interpolateHcl);

      //________________________________________________
      // GET/SET defaults
      //________________________________________________

      // getter setter default and private variables
      var svg = void 0,
          width = 800,
          height = 800,
          padding = 10,
          margin = { top: 10, right: 10, bottom: 10, left: 10 };

      var dispatch = d3.dispatch('customHover');

      //________________________________________________
      // RENDER
      //________________________________________________

      function exports(_selection) {

          // // access data
          var countries = ref.data;
          var coordinates = ref.coordinatesData;

          // create scales
          var xScale = d3.scale.linear().domain([ref.minX, ref.maxX]).range([-50, -30]);
          var yScale = d3.scale.linear().domain([ref.minY, ref.maxY]).range([-20, -10]);

          // only add svg if doesn't already exist
          svg = _selection.selectAll('svg').data([0]);

          svg.enter().append('svg').attr({
              class: 'dorling-chart',
              width: width,
              height: height + margin.top + margin.bottom
          });

          //________________________________________________
          // set up area scales
          //________________________________________________

          //scale for circle areas
          // get min and max for colour range
          var areaDomain = d3.extent(ref.data, function (d) {
              return d[ref.keyCircleArea];
          });
          // get the mean
          var areaDomainMean = _.meanBy(ref.data, ref.keyCircleArea);
          // insert the colorDomain
          areaDomain.splice(1, 0, areaDomainMean);
          // update reference
          ref.areaDomain = areaDomain;
          console.log('areaDomain', areaDomain);
          // apply to scale
          var pointScale = d3.scale.sqrt().domain([0, areaDomain[2]]).range([0, 80]);

          //________________________________________________

          var d3_geom_voronoi = d3.geom.voronoi().x(function (d) {
              return d.x;
          }).y(function (d) {
              return d.y;
          });

          var path = svg.selectAll('path');

          _.times(countries.length, function (i) {
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

          var force = d3.layout.force().nodes(nodes).links([]).size([width, height]).charge(function (d) {
              return -Math.pow(d.radius * 5.0, 2.0) / 8;
          }).gravity(1.8).on('tick', function (e) {
              k = 10 * e.alpha;
              _.times(nodes.length, function (i) {
                  nodes[i].x += k * nodes[i].cx;
                  nodes[i].y += k * nodes[i].cy;
              });
              svg.selectAll('.country-circles').each(collide(0.1, nodes, pointScale, padding)).attr({
                  cx: function cx(d) {
                      return d.x;
                  },
                  cy: function cy(d) {
                      return d.y;
                  }
              });

              svg.selectAll('.country-labels').attr({
                  x: function x(d) {
                      return d.x;
                  },
                  y: function y(d) {
                      return d.y + 5;
                  },
                  opacity: function opacity(d) {
                      return d.radius < 17 ? 0 : 1;
                  }
              });

              path = path.data(d3_geom_voronoi(nodes));
              path.enter().append('path');

              path.style('fill', 'none').style('stroke', function () {
                  return ref.dev ? 'pink' : 'none';
              }).style('pointer-events', 'all');

              path.attr('d', function (d) {
                  return 'M' + d.join('L') + 'Z';
              }).datum(function (d) {
                  return d.point;
              }).attr('class', function (d, i) {
                  return ' v-' + i;
              }).on('mouseover', function (d) {
                  return mouseover(d, ref);
              }).on('mouseout', function (d) {
                  return mouseout(d, ref);
              });

              path.exit().remove();
          }).start();

          var circles = svg.selectAll('.country-circles').data(nodes);

          circles.enter().append('svg:circle');

          circles.attr({
              cx: function cx(d) {
                  return d.cx;
              },
              cy: function cy(d) {
                  return d.cy;
              },
              r: function r(d) {
                  return d.radius;
              },
              class: function _class(d) {
                  return d.continent.replace(' ', '') + ' ' + 'country-circles';
              },
              id: function id(d) {
                  return d.alias;
              },
              fill: function fill(d) {
                  return colorScale(d[ref.keyCircleColour]);
              },
              stroke: '#fff', // not shown but is on mouseover
              'stroke-width': 0
          });

          circles.exit().transition().remove();

          var labels = svg.selectAll('.country-labels').data(nodes);

          labels.enter().append('svg:text').attr('class', 'country-labels');

          labels.text(function (d) {
              return d.alias;
          });

          labels.exit().remove();

          // add a gradient legend
          legendGradient(svg, ref);
          // add a circular legend
          legendCircular(svg, ref);
      } // exports

      //________________________________________________
      // GET/SET 
      //________________________________________________

      exports.width = function (_x) {
          if (!arguments.length) return width;
          width = _x;
          return this;
      };
      exports.height = function (_x) {
          if (!arguments.length) return height;
          height = _x;
          return this;
      };
      exports.margin = function (_x) {
          if (!arguments.length) return margin;
          margin = _x;
          return this;
      };

      d3.rebind(exports, dispatch, 'on');
      return exports;
  }

  // `ref` is object inherited from _state.js
  function dorlingMapRender (ref) {

      // call chart
      // can override settings here (GET/SET)
      var chart = dorlingMap(ref).width(ref.svgWidth).height(ref.svgHeight);

      // apply chart to DOM
      d3.select(ref.id).datum(ref.data).call(chart);
  }

  // import dorlingMapReset  from './dorlingmap-reset';

  function update (ref) {

      // update calls for everything
      // can loop through all charts

      // render chart
      dorlingMapRender(ref);

      // apply any tidying up
      // dorlingMapReset(ref);
  }

  // event handlers
  function events (ref) {

      // add event listeners

  }

  // https://gist.github.com/gneatgeek/5892586
  /**
   * getSet creates a getter/setter function for a re-usable D3.js component. 
   *
   * @method getSet
   * @param  {string}   option    - the name of the object in the string you want agetter/setter for.
   * @param  {function} component - the D3 component this getter/setter relates to.
   *
   * @return {mixed} The value of the option or the component.
   */
  function getSet(option, component) {
    return function (_) {
      if (!arguments.length) {
        return this[option];
      }

      this[option] = _;

      return component;
    };
  }

  function _init () {

      var instance = {};

      // api overrides
      var opts = {
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
      var ref = Object.create(defaults);

      // render/update
      instance.render = function () {

          var q = d3.queue();

          // reference configurations
          updateRef();

          // check if json url or data object
          if (_.isNull(opts.dataJson)) {
              q.defer(d3.json, coordinatesData).await(function (error, file1) {
                  // make data available across scope
                  ref.coordinatesData = file1;
                  ref.data = opts.data;
                  renderCalls();
              });
          } else {
              q.defer(d3.json, opts.coordinatesData).defer(d3.json, opts.dataJson).await(function (error, file1, file2) {
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
          _.forIn(opts, function (value, key) {
              if (!_.isNull(opts[key])) ref[key] = opts[key];
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
      for (var key in opts) {
          instance[key] = getSet(key, instance).bind(opts);
      }

      return instance;
  }

  function initDorling() {
      return _init();
  }
  // *****************************
  // UPDATE
  // *****************************
  // import _update from './_update';

  // export function update() {
  //     return _update();
  // }

  exports.initDorling = initDorling;

}((this.EESUR = this.EESUR || {})));
//# sourceMappingURL=thed3-bundle.js.map