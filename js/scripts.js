// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = 'pk.eyJ1IjoiY21jMTIyNCIsImEiOiJjbGc1cWE0aWswNXZzM2ZsaW16cmYzb3BkIn0.6GQ2v6YsggVcqkW-VpgidA';

const NYC_Coordinates = [-73.96577309926411, 40.78300683969073]
const restaurant_icon = document.createElement('div');

const map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/cmc1224/clgp71znh001901qmer86ham4', // style URL
    center: NYC_Coordinates, // starting position [lng, lat]
    zoom: 13, // starting zoom
    pitch: 0
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
    map.loadImage('img/meal-food-icon.png', (error, image) => {
        if (error) throw error;

        map.addImage('food-icon', image);
        map.addSource('dprconcessions', {
            type: 'geojson',
            data: dprconcessions,
        }),

            map.addLayer({
                id: 'point-dprconcessions',
                type: 'symbol',
                source: 'dprconcessions',
                layout: {
                    'icon-image': 'food-icon',
                    'icon-size': 0.04,
                },
            });
    });
})
map.on('load', function () {

    // add the point source and layer
    map.addSource('EatingSquirrels', {
        type: 'geojson',
        data: EatingSquirrels,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 40 // Radius of each cluster when clustering points (defaults to 50)
    })

    map.addLayer({
        id: 'cluster-squirrel-data',
        type: 'circle',
        source: 'EatingSquirrels',
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': '#D09259',
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                10,
                10,
                20,
                50,
                30
            ]
        },
    })

    map.addLayer({
        id: 'cluster-count-squirrel-data',
        type: 'symbol',
        source: 'EatingSquirrels',
        layout: {
            'text-field': ['get', 'point_count'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-allow-overlap':true,
        },
        paint: {
            'text-color': '#562A0E'
        }
    });

    map.addLayer({
        id: 'unclustered-squirrel-data',
        type: 'circle',
        source: 'EatingSquirrels',
        paint: {
            'circle-color': [
                'match',
                ['get', 'primary_fur_color'],
                'Gray',
                '#a19999',
                'Black',
                '#121212',
                'Cinnamon',
                '#942a19',
        /* other */ '#D09259'
            ],
        },
        minzoom: 15,

    });
})




map.on('click', 'unclustered-squirrel-data', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const running =
        e.features[0].properties.running === 'true' ? 'Yes' : 'No';
    const chasing =
        e.features[0].properties.chasing === 'true' ? 'Yes' : 'No';
    const climbing =
        e.features[0].properties.climbing === 'true' ? 'Yes' : 'No';
    const eating =
        e.features[0].properties.eating === 'true' ? 'Yes' : 'No';
    const foraging =
        e.features[0].properties.foraging === 'true' ? 'Yes' : 'No';

    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(
            `<dl>What was the squirrel doing?</dl> 
            <dt> Running? 
            <dd> ${running} 
            <dt>Chasing another squirrel?  
            <dd>${chasing} 
            <dt>Climbing something?
            <dd>${climbing} 
            <dt> Eating? 
            <dd>${eating} 
            <dt> Foraging? 
            <dd>${foraging}`
        )
        .addTo(map);
});