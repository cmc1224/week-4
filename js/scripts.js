// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = 'pk.eyJ1IjoiY21jMTIyNCIsImEiOiJjbGc1cWE0aWswNXZzM2ZsaW16cmYzb3BkIn0.6GQ2v6YsggVcqkW-VpgidA';

const NYC_Coordinates = [-73.96577309926411, 40.78300683969073]

const map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: NYC_Coordinates, // starting position [lng, lat]
    zoom: 12, // starting zoom
    pitch: 0
});

map.on('load', function () {

    // add the point source and layer
    map.addSource('SquirrelData', {
        type: 'geojson',
        data: SquirrelData,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    })

    map.addLayer({
        id: 'cluster-squirrel-data',
        type: 'circle',
        source: 'SquirrelData',
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                10,
                '#f1f075',
                100,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                10,
                10,
                20,
                100,
                30
            ]
        }
    })

    map.addLayer({
        id: 'cluster-count-squirrel-data',
        type: 'symbol',
        source: 'SquirrelData',
        layout: {
            'text-field': ['get', 'point_count'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-squirrel-data',
        type: 'circle',
        source: 'SquirrelData',
        paint: {
            'circle-color': [
                'match',
                ['get', 'primary_fur_color'],
                'Gray',
                '#545559',
                'Black',
                '#121212',
                'Cinnamon',
                '#942a19',
        /* other */ '#c5dbe3'
            ],
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        },
        minzoom: 15
    });

}
)
map.on('click', 'unclustered-squirrel-data', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const running =
        e.features[0].properties.running === 'true' ? 'yes' : 'no';
    const chasing =
        e.features[0].properties.chasing === 'true' ? 'yes' : 'no';
    const climbing =
        e.features[0].properties.climbing === 'true' ? 'yes' : 'no';
    const eating =
        e.features[0].properties.eating === 'true' ? 'yes' : 'no';
    const foraging =
        e.features[0].properties.foraging === 'true' ? 'yes' : 'no';

    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(
            `What was the squirrel doing? <br> Running?: ${running} <br> Chasing another squirrel?: ${chasing}
            <br> Climbing something?: ${climbing} <br> Eating?: ${eating} <br> Foraging?: ${foraging}`
        )
        .addTo(map);
})

map.on('click', 'cluster-squirrel-data', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
    layers: ['cluster-squirrel-data']
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('SquirrelData').getClusterExpansionZoom(
    clusterId,
    (err, zoom) => {
    if (err) return;
     
    map.easeTo({
    center: features[0].geometry.coordinates,
    zoom: zoom
    });
    }
    );
    });

$('#cluster-zoom').on('click', function () {
    map.flyTo({
        center: NYC_Coordinates,
        zoom: 12,
    })
})

$('#point-zoom').on('click', function () {
    map.flyTo({
        center: NYC_Coordinates,
        zoom: 15,
    })
})