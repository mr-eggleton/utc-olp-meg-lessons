const svgIcon = L.divIcon({
  html: `
<svg
  width="24"
  height="24"
  viewBox="0 0 100 100"
  version="1.1"
  preserveAspectRatio="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="M0 0 L50 100 L100 0 Z" fill="#7A8BE7"></path>
</svg>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

function makeMap(mapdiv) {
  var map = L.map(mapdiv);

  var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

  var Stamen_Toner = L.tileLayer(
    "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}",
    {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: "abcd",
      minZoom: 0,
      maxZoom: 20,
      ext: "png",
    }
  );

  var baseLayers = {
    "OpenStreetMap Mapnik": OpenStreetMap_Mapnik,
    "Stamen Toner": Stamen_Toner,
  };
  
  var overlays = {};

  OpenStreetMap_Mapnik.addTo(map); 
  L.control.layers(baseLayers, overlays).addTo(map);

  var runLayer;
  switch (map._container.dataset.type.toLowerCase()) {
    case "csv": // https://github.com/mapbox/csv2geojson
      runLayer = omnivore.csv(map._container.dataset.url);
      break;
    case "gpx": // https://www.topografix.com/gpx.asp
      runLayer = omnivore.gpx(map._container.dataset.url);
      break;
    case "kml": // https://developers.google.com/kml/documentation/
      runLayer = omnivore.kml(map._container.dataset.url);
      break;
    case "wkt": // https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry
      runLayer = omnivore.wkt(map._container.dataset.url);
      break;
    case "topojson": // https://github.com/topojson/topojson
      runLayer = omnivore.topojson(map._container.dataset.url);
      break;
    case "polyline": // https://github.com/mapbox/polyline
      runLayer = omnivore.polyline(map._container.dataset.url);
      break;
    case "geojson": // https://geojson.org/
    default:
      runLayer = omnivore.geojson(map._container.dataset.url);
  }
  runLayer
    .on("ready", function () {
      map.fitBounds(runLayer.getBounds());
      runLayer.eachLayer(function (layer) {
        layer.setIcon(svgIcon);
        layer.bindPopup(layer.feature.properties.name);
      });
    })
    .addTo(map);
}

var elements = document.querySelectorAll(".map");
elements.forEach(makeMap);
