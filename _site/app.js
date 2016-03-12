function currentUser() {
    return currentEndpoint().match(/http[s]*:\/\/([^.]*).*/)[1];
}

function currentEndpoint() {
    return "http://wri-01.cartodb.com/api/v1/map";
}

function render(year, coords,layer,style,spinner){
    var target = document.getElementById('map');
        spinner.spin(target);

        console.log(year);
    };


function main() {

     $('#controls').on('click dblclick mousedown mousewheel', function(e) {
        e.stopPropagation();
     });


     // set the spinner opts
     var opts = {
          lines: 13, // The number of lines to draw
          length: 20, // The length of each line
          width: 10, // The line thickness
          radius: 30, // The radius of the inner circle
          corners: 0.3, // Corner roundness (0..1)
          rotate: 0, // The rotation offset
          direction: -1, // 1: clockwise, -1: counterclockwise
          color: '#74776B', // #rgb or #rrggbb or array of colors
          speed: 1, // Rounds per second
          trail: 60, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: true, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: '50%', // Top position relative to parent
          left: '50%' // Left position relative to parent
        };
        var target = document.getElementById('map');
        var spinner = new Spinner(opts);
    
    // Create map
    var map = new L.Map('map', {
        zoomControl: true,
        drawnControl: true,
        center: [37.677816, -121.372880],
        zoom: 13
    });

    // Add CartoDB basemaps
    // https://cartodb-basemaps-a.global.ssl.fastly.net/light_nolabels
    // https://1.maps.nlp.nokia.com/maptile/2.1/maptile/newest/satellite.day
    // http://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGFuaGFtbWVyIiwiYSI6IkpyY19CNFkifQ.2Y7Un3COo3E_81ROBLKkSg
    L.tileLayer('http://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGFuaGFtbWVyIiwiYSI6IkpyY19CNFkifQ.2Y7Un3COo3E_81ROBLKkSg', {
        attribution: '<a href="http://www.earthgenome.org">Earth Genome</a> © 2015',
        maxZoom: 18
    }).addTo(map);

    var waterStyle = {
        "color": "#00F",
        "weight": 1,
        "opacity": 0.65
    };


    var boundary = new L.geoJson();
            boundary.addTo(map);
            boundary.setStyle(waterStyle);

    
    // Add drawn controls
    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    var drawControl = new L.Control.Draw({
        position: 'bottomleft',
        draw: {
            polyline: false,// Turns off this drawing tool
            marker: false,
            polygon: false,
            
            rectangle: {
                shapeOptions: {
                    color: '#a63b55',
                    fill:false,
                    weight:3.5
                },
                showArea: true
            },
             circle: false,
            
            
        },
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawControl);
    //$("#yearcontrol").appendTo(".leaflet-control-container");
    
    //map.on('draw:edited', function(e){map.trigger()})
    // Handle draw actions
    map.on('draw:created', function (e) {
        var type = e.layerType,
            layer = e.layer;
        
        pol_pgis = null;
        
        switch(type) {
                
            // Create a Rectangle geometry in PostGIS
            case 'rectangle':
                var coords = layer.getLatLngs();
                

                pol_pgis = "[["+ 
                    coords[0].lng +","+coords[0].lat+"],["+ 
                    coords[1].lng +","+coords[1].lat+"],["+ 
                    coords[2].lng +","+coords[2].lat+"],["+ 
                    coords[3].lng +","+coords[3].lat+"]]";
               
                break;
            
        }

        if (pol_pgis) {
            var xmin = coords[0].lng;
            var ymin = coords[0].lat;
            var xmax = coords[3].lng;
            var ymax = coords[2].lat;

            console.log("http://localhost:8080/crops?xmin="+xmin+"&xmax="+xmax+"&ymin="+ymin+"&ymax="+ymax+"&year=2014");

            $.ajax({
                dataType: "json",
                url: "http://localhost:8080/crops?xmin="+xmin+"&xmax="+xmax+"&ymin="+ymin+"&ymax="+ymax+"&year=2014",
                    success: function(data) {
                        console.log(data);
                        document.getElementById('taggers').innerHTML = ''
                        var div = document.getElementById('taggers');
                        document.getElementById('taggers').style.fontSize = "18px"

                        var sorted = data.results.sort(function(x, y) {
                            return parseFloat(y.area) - parseFloat(x.area)
                        });
                        var croptext = "";
                        for (i = 0; i < 3; i++) {
                            croptext += sorted[i]['area'] + ' acres of ' + sorted[i]['landType'] + ', ';
                        }
                        croptext += 'and ' + sorted[3]['area'] + ' acres of ' + sorted[3]['landType'] + '.';
                        text1 = 'The drawn area is ' + data.totalAcreage + ' acres.  In 2014, there were ' + data.count + ' crops planted in the area, including ';
                        div.innerHTML = text1 + croptext;
                    }
            });

        }



        
        else {
            layer.bindPopup("Could not get value!");
        }
        
        drawnItems.addLayer(layer);
    });


    
    
    
    
    
}