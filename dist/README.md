
# Dorling map

------------------

## External dependencies

- [d3.js](https://d3js.org/)
- [d3-queue](https://github.com/d3/d3-queue)
- [lodash.js](https://lodash.com/)
- [basscss](http://www.basscss.com/)

------------------

# d3 dev notes

## Global namespace:

Object that any components will be attached to, so not to pollute the global space: `THED3`

#### Container element:

`div#thed3`

## Initiation code

```
var chart = THED3.chartInit()
    .id('#dorling-map')
    .keyCircleArea('hex1000')
    .keyCircleColour('value') 
    .coordinatesData('dorling-coordinates.json')
    .dataJson('dorling-countries.json');

    chart.render();

```

NOTE: only `data()` or `dataJson()` should be used, not both

## Data structure

```

[
    {
          "country" : "China",
          "alias" : "CHN",
          "continent" : "Asia",
          "value_for_area" : 1484040,
          "another_value_for_colour": 60
        },
        ...
\
```

NOTE: `country` key must be included
NOTE: `alias` key must be included must be in the data with ISO alpha-3 codes

## Alternative data

The data can also be inserted directly as an array, by replacing `dataJson`, with `data`. For example:

```
var data = [
{
      "name" : "China",
      "alias" : "CHN",
      "continent" : "Asia",
      "value" : 800
    },
{
      "name" : "United States of America",
      "alias" : "USA",
      "continent" : "North America",
      "value" : 1265064
    },
{
      "name" : "Japan",
      "alias" : "JPN",
      "continent" : "Asia",
      "value" : 660489
    },
]

var chart = THED3.chartInit()
    ...
    .data(data);

    chart.render();

```


------------------

## Required files

d3 code: `thed3-compiled.js`
coordinates data: `dorling-coordinates.json`

**Note: 
- index.html is included for ease of testing/debugging only
- ES6 code is compiled from BABEL to ES5


