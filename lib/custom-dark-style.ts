import type { StyleSpecification } from 'maplibre-gl';

// Dark basemap reduced to land, water and borders: no labels, roads or
// railways, so the only names on the map are our own markers.
//
// Water is darker than land. It used to be the reverse (light-blue sea,
// near-black land), and a light sea reads as land: the Gulf of Oman looked
// like a landmass, putting Fujairah on its "west coast", facing Iran.
export const CUSTOM_DARK_STYLE: StyleSpecification = {
  "version": 8,
  "sources": {
    "openmaptiles": {
      "type": "vector",
      "url": "https://tiles.openfreemap.org/planet"
    }
  },
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": {
        "background-color": "#2c2e32"
      }
    },
    {
      "id": "water",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "water",
      "filter": [
        "all",
        [
          "match",
          [
            "geometry-type"
          ],
          [
            "MultiPolygon",
            "Polygon"
          ],
          true,
          false
        ],
        [
          "!=",
          [
            "get",
            "brunnel"
          ],
          "tunnel"
        ]
      ],
      "paint": {
        "fill-antialias": true,
        "fill-color": "#0b1824"
      }
    },
    {
      "id": "landcover_ice_shelf",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landcover",
      "maxzoom": 8,
      "filter": [
        "all",
        [
          "match",
          [
            "geometry-type"
          ],
          [
            "MultiPolygon",
            "Polygon"
          ],
          true,
          false
        ],
        [
          "==",
          [
            "get",
            "subclass"
          ],
          "ice_shelf"
        ]
      ],
      "paint": {
        "fill-color": "#2c2e32",
        "fill-opacity": 0.7
      }
    },
    {
      "id": "landcover_glacier",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landcover",
      "maxzoom": 8,
      "filter": [
        "all",
        [
          "match",
          [
            "geometry-type"
          ],
          [
            "MultiPolygon",
            "Polygon"
          ],
          true,
          false
        ],
        [
          "==",
          [
            "get",
            "subclass"
          ],
          "glacier"
        ]
      ],
      "paint": {
        "fill-color": "#2c2e32",
        "fill-opacity": [
          "interpolate",
          [
            "linear"
          ],
          [
            "zoom"
          ],
          0,
          1,
          8,
          0.5
        ]
      }
    },
    {
      "id": "landuse_residential",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landuse",
      "maxzoom": 16,
      "filter": [
        "all",
        [
          "match",
          [
            "geometry-type"
          ],
          [
            "MultiPolygon",
            "Polygon"
          ],
          true,
          false
        ],
        [
          "==",
          [
            "get",
            "class"
          ],
          "residential"
        ]
      ],
      "paint": {
        "fill-color": "#2c2e32",
        "fill-opacity": [
          "interpolate",
          [
            "exponential",
            0.6
          ],
          [
            "zoom"
          ],
          8,
          0.8,
          9,
          0.6
        ]
      }
    },
    {
      "id": "landcover_wood",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landcover",
      "minzoom": 10,
      "filter": [
        "all",
        [
          "match",
          [
            "geometry-type"
          ],
          [
            "MultiPolygon",
            "Polygon"
          ],
          true,
          false
        ],
        [
          "==",
          [
            "get",
            "class"
          ],
          "wood"
        ]
      ],
      "paint": {
        "fill-color": "#2c2e32",
        "fill-opacity": [
          "interpolate",
          [
            "linear"
          ],
          [
            "zoom"
          ],
          8,
          0,
          12,
          1
        ]
      }
    },
    {
      "id": "waterway",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "waterway",
      "filter": [
        "match",
        [
          "geometry-type"
        ],
        [
          "LineString",
          "MultiLineString"
        ],
        true,
        false
      ],
      "paint": {
        "line-color": "#0b1824"
      }
    },
    {
      "id": "boundary_3",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "boundary",
      "minzoom": 8,
      "filter": [
        "all",
        [
          ">=",
          [
            "get",
            "admin_level"
          ],
          3
        ],
        [
          "<=",
          [
            "get",
            "admin_level"
          ],
          6
        ],
        [
          "!=",
          [
            "get",
            "maritime"
          ],
          1
        ],
        [
          "!=",
          [
            "get",
            "disputed"
          ],
          1
        ],
        [
          "!",
          [
            "has",
            "claimed_by"
          ]
        ]
      ],
      "paint": {
        "line-color": "#45474d",
        "line-dasharray": [
          1,
          1
        ],
        "line-width": [
          "interpolate",
          [
            "linear"
          ],
          [
            "zoom"
          ],
          7,
          1,
          11,
          2
        ]
      }
    },
    {
      "id": "boundary_2",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "boundary",
      "filter": [
        "all",
        [
          "==",
          [
            "get",
            "admin_level"
          ],
          2
        ],
        [
          "!=",
          [
            "get",
            "maritime"
          ],
          1
        ],
        [
          "!=",
          [
            "get",
            "disputed"
          ],
          1
        ],
        [
          "!",
          [
            "has",
            "claimed_by"
          ]
        ]
      ],
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#45474d",
        "line-opacity": [
          "interpolate",
          [
            "linear"
          ],
          [
            "zoom"
          ],
          0,
          0.4,
          4,
          1
        ],
        "line-width": [
          "interpolate",
          [
            "linear"
          ],
          [
            "zoom"
          ],
          3,
          1,
          5,
          1.2,
          12,
          3
        ]
      }
    },
    {
      "id": "boundary_disputed",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "boundary",
      "filter": [
        "all",
        [
          "!=",
          [
            "get",
            "maritime"
          ],
          1
        ],
        [
          "==",
          [
            "get",
            "disputed"
          ],
          1
        ]
      ],
      "paint": {
        "line-color": "#45474d",
        "line-dasharray": [
          1,
          2
        ],
        "line-width": [
          "interpolate",
          [
            "linear"
          ],
          [
            "zoom"
          ],
          3,
          1,
          5,
          1.2,
          12,
          3
        ]
      }
    }
  ]
};
