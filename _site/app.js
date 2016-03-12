function currentUser() {
    return currentEndpoint().match(/http[s]*:\/\/([^.]*).*/)[1];
}


function render(year, coords, layer, style, spinner){
    var target = document.getElementById('map');
        spinner.spin(target);

            var xmin = coords[0].lng;
            var ymin = coords[0].lat;
            var xmax = coords[3].lng;
            var ymax = coords[2].lat;
            $.ajax({
                dataType: "json",
                url: "http://waterapp.enviro-service.appspot.com/crops?xmin="+xmin+"&xmax="+xmax+"&ymin="+ymin+"&ymax="+ymax+"&year="+year,
                    success: function(data) {
                        document.getElementById('texter').innerHTML = '<i>What covers this land?</i>    ' 

                        var sorted = data.results.sort(function(x, y) {
                            return parseFloat(y.area) - parseFloat(x.area)
                        });

                        res = 'In '+year+', <b>'+sorted[0]['landType']+'</b> ('+sorted[0]['area']+' acres) and <b>'+sorted[1]['landType']+'</b> ('+sorted[1]['area']+' acres).'

                        document.getElementById('texter').innerHTML = '<i>What covers this land?</i>    ' + res
                        spinner.stop(target);
                    }
            }).error(function() {spinner.stop(target);});
    }




function main() {
     $('#yearcontrol');

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
      // Disable dragging when user's cursor enters the element
    document.querySelector('#yearcontrol').addEventListener('mouseover', function () {
        map.dragging.disable();
    });

    // Re-enable dragging when user's cursor leaves the element
    document.querySelector('#yearcontrol').addEventListener('mouseout', function () {
        map.dragging.enable();
    });
     

    var pol_pgis = null;
    var year=2008;
    //slider.defaultValue=year;
    //slider.value=year;
    slider.onchange = function(){
    document.querySelector('#currentYear').value = this.value;
    year=this.value;
    render(year, pol_pgis, boundary, waterStyle,spinner)
    }
    
    // Create map
    var map = new L.Map('map', {
        zoomControl: true,
        drawnControl: true,
        center: [37.227638, -120.541387],
        zoom: 13
    });

    // Add CartoDB basemaps
    L.tileLayer('http://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGFuaGFtbWVyIiwiYSI6IkpyY19CNFkifQ.2Y7Un3COo3E_81ROBLKkSg', {
        attribution: '<a href="http://danham.me/r">Hammer</a> © 2015',
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
                    weight:2
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
                pol_pgis = coords
                break;
            
        }


        if (pol_pgis) {
            var xmin = coords[0].lng;
            var ymin = coords[0].lat;
            var xmax = coords[3].lng;
            var ymax = coords[2].lat;
            
            //var year=2001;
            drawnItems.clearLayers(); 
            spinner.spin(target)

            $.ajax({
                dataType: "json",
                url: "http://waterapp.enviro-service.appspot.com/crops?xmin="+xmin+"&xmax="+xmax+"&ymin="+ymin+"&ymax="+ymax+"&year="+year,
                    success: function(data) {

                        document.getElementById('texter').innerHTML = '<i>What covers this land?</i> ' 

                        var sorted = data.results.sort(function(x, y) {
                            return parseFloat(y.area) - parseFloat(x.area)
                        });

                        res = 'In '+year+', <b>'+sorted[0]['landType']+'</b> ('+sorted[0]['area']+' acres) and <b>'+sorted[1]['landType']+'</b> ('+sorted[1]['area']+' acres).'

                        document.getElementById('texter').innerHTML = '<i>What covers this land?</i>    ' + res
                        spinner.stop(target);
                    }
            }).error(function(errors) {spinner.stop(target);console.log (errors.statustext)});


        }


        drawnItems.addLayer(layer);
    });


    
    
    
    
    
}