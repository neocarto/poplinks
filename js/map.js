var width = 800;
var height = 850;

d3.select("svg")
    .attr("id","map")	
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("class","back")
    .attr("viewBox", "0 0 " + width + " " + height)
    .style("background","#DDD");

var projection = d3.geoOrthographic()
.scale(380)
.translate([width / 2 , height / 2 + 20])
.clipAngle(90)
.precision(.1);


var path = d3.geoPath().projection(projection); 

svg.selectAll(".graticule").datum(graticule).attr("d", path);
svg.selectAll(".land").attr("d", path);
svg.selectAll(".links").attr("d", path);
svg.selectAll(".dots").attr("d", path);

if(svg.selectAll(".sphere").empty()){


// Graticule

var radialGradient = svg.append("defs").append("radialGradient").attr("id", "radial-gradient");
radialGradient.append("stop").attr("offset", "50%").attr("stop-color", "#63b0af");
radialGradient.append("stop").attr("offset", "100%").attr("stop-color", "#428c8b");

var sphere = svg.append("g")
         .attr("id","sphere")
	 .attr("class", "sphere");

var graticule = d3.geoGraticule().step([10, 10]);

var sphere1 = sphere.append("path")
        .datum(graticule.outline)
        .style("fill", "url(#radial-gradient)")
        .attr("class", "sphere")
        .attr("d", path);

sphere.append("path")
        .datum(graticule)
        .attr("d", path);

// Countries

var land = svg.append("g")
     .attr("id","land")
     .attr("class","land");  

land.selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("class","land")
        .attr("d", path);

// Links

var links = svg.append("g")
    .attr("id","links");

// Dots

var dots = svg.append("g")
     .attr("id","dots");

// Texts

var title  =  svg.append("g")
     .attr("id","title");

title.append("text").text("Map Design: Nicolas Lambert, 2019")
      .attr("x", 10).attr("y", 825)
      .attr("class", "note");

title.append("text").text("Data sources: Gridded Population of the World (GPW), v4, 2020")
      .attr("x", 10).attr("y", 840)
      .attr("class", "note");

var help1 = "Rotate";
var help2 = "the Globe";
var help3 = "to Change";
var help4 = "the View";
delta  = 20;
x = 707
y = 23
title.append("polygon").attr("fill","#CCCCCC").attr("points", "690,0, 800,0, 800,100 700,100 650,130 690,85");
title.append("text").text(help1).attr("text-anchor", "start").attr("x", x).attr("y", y).attr("class","txthelp");
title.append("text").text(help2).attr("text-anchor", "start").attr("x", x).attr("y", y+delta).attr("class","txthelp");
title.append("text").text(help3).attr("text-anchor", "start").attr("x", x).attr("y", y+delta*2).attr("class","txthelp");
title.append("text").text(help4).attr("text-anchor", "start").attr("x", x).attr("y", y+delta*3).attr("class","txthelp");



}

// ----------------------------------------------------------------

// Links

svg.selectAll(".links").remove();
svg.selectAll("#links").selectAll('path')
    .data(r2d3.data[1].features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class","links");

// Dots

var tanaka  = 1.5;
var filter = svg.append("defs").append("filter").attr("id", "blur").append("feGaussianBlur").attr("stdDeviation", 7);
var defs = svg.append("defs");
var filter2 = defs.append("filter").attr("id", "drop-shadow").attr("height", "130%");
filter2.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", tanaka).attr("result", "blur");
filter2.append("feOffset").attr("in", "blur").attr("dx", tanaka).attr("dy", tanaka).attr("result", "offsetBlur");
var feMerge = filter2.append("feMerge");
feMerge.append("feMergeNode").attr("in", "offsetBlur")
feMerge.append("feMergeNode").attr("in", "SourceGraphic");

d3.selectAll(".tooltip").remove();
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

svg.selectAll(".dots").remove();
svg.selectAll("#dots").selectAll('path')
    .data(r2d3.data[0].features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class","dots")
    .style("filter", "url(#drop-shadow)")
 .on("mouseover", function(d) {
	d3.select(this).style("fill", "#ffc400").style("stroke","#65627a").style("stroke-width",3);		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div.html(d.properties.pop + " thousands inh.")	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 50) + "px");	
            })					
        .on("mouseout", function(d) {
	d3.select(this).style("fill", "#d90266").style("stroke","#594306").style("stroke-width",1.5);		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });

// Title

svg.selectAll(".maptitle1").remove();
svg.selectAll(".maptitle2").remove();
svg.selectAll("#title").append("text").text(r2d3.data[2] + " %")
.attr("x", 10).attr("y", 60)
.attr("class","maptitle1");
svg.selectAll("#title").append("text").text("of the world population")
.attr("x", 10).attr("y", 85)
.attr("class","maptitle2");
svg.selectAll("#title").append("text").text("is represented on")
.attr("x", 10).attr("y", 105)
.attr("class","maptitle2");
svg.selectAll("#title").append("text").text("the globe.")
.attr("x", 10).attr("y", 125)
.attr("class","maptitle2");

// Interactivity and rotation

            const λ = d3.scaleLinear()
              .domain([0, width])
              .range([-180, 180]);

            const φ = d3.scaleLinear()
              .domain([0, height])
              .range([90, -90]);

              var drag = d3.drag().subject(function() {
                  var r = projection.rotate();
                  return {
                      x: λ.invert(r[0]),
                      y: φ.invert(r[1])
                  };
              }).on("drag", function() {
		  var x = λ(d3.event.x);
		  var y = φ(d3.event.y);
                  projection.rotate([λ(d3.event.x), φ(d3.event.y)]);

                  svg.selectAll(".graticule")
                      .datum(graticule)
                      .attr("d", path);

                  svg.selectAll(".land")
                      .attr("d", path);

                 svg.selectAll(".links")
			.attr("d", path);

                 svg.selectAll(".dots")
			.attr("d", path);
              });

              svg.call(drag);
