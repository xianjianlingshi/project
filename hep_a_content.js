//Global Variables
var nameByID = [
  "NaN","Alabama","Alaska","NaN","Arizona","Arkansas",
  "California","NaN","Colorado","Connecticut","Delaware",
  "District of Columbia","Florida","Georgia","NaN","Hawaii",
  "Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska",
  "Nevada","New Hampshire","New Jersey","New Mexico","New York",
  "North Carolina","North Dakota","Ohio","Oklahoma","Oregon",
  "Pennsylvania","NaN","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","NaN","Washington",
  "West Virginia","Wisconsin","Wyoming"
];

var centered1 = null,
    centered2 = null,
    sel1 = null,
    sel1id = null,
    sel2 = null,
    sel2id = null,
    line21f,
    line22f,
    line21,
    line22,
    numActive;

//US Map Code
var mapWidth = 500,
    mapHeight = 350;

var projection = d3.geo.albersUsa()
    .scale(630)
    .translate([mapWidth / 2, mapHeight / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#maphere").append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

svg.append("rect")
    .attr("class", "background")
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .on("click", clicked);

var g = svg.append("g");

d3.json("../us.json", function(error, us) {
  g.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .on("click", clicked);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);

});

//Plot code
//1 is focus
//2 is context
var margin = {top: 10, right: 10, bottom: 100, left: 40},
    margin2 = {top: 430, right: 10, bottom: 20, left: 40},
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

var parseDate = d3.time.format("%m/%d/%Y").parse;

var vaccDate = parseDate("1/1/1995");

var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).tickSize(6, 0).orient("left");

var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);

var svg2 = d3.select("#plothere").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg2.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg2.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg2.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

focus.append("g")
    .attr("class", "y axis")
    .call(yAxis)
	.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Incidence (cases per 100000)");

context.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);

context.append("g")
    .attr("class", "x brush")
    .call(brush)
  .selectAll("rect")
    .attr("y", -6)
    .attr("height", height2 + 7);

//init x axis
d3.csv("hep_a.csv", type, function(data) {
  adjXAxis(data);

  context
    .append("line")
    .attr("x1", x2(vaccDate))
    .attr("x2", x2(vaccDate))
    .attr("y1", 0)
    .attr("y2", height2)
    .style("stroke", "black")
    .style("stroke-width", "2");

  focus.append("line")
      .attr("class", "vaccLine")
      .attr("x1", x(vaccDate))
      .attr("x2", x(vaccDate))
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", "black")
      .style("stroke-width", "2");
    
  focus.append("text")
      .attr("class", "vaccText")
      .attr("text-anchor", "end")
      .attr("transform", "translate(" + x(vaccDate) + ", 0) rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .text("Hepatitis A Vaccine Introduced")
      .style("fill", "black");

});


//bar chart
var m = [30, 10, 10, 100],
    w = 400 - m[1] - m[3],
    h = 850 - m[0] - m[2];

var xbar = d3.scale.linear().range([0, w]),
    ybar = d3.scale.ordinal().rangeRoundBands([0, h], .1);

var xAxisbar = d3.svg.axis().scale(xbar).orient("top"),
    yAxisbar = d3.svg.axis().scale(ybar).orient("left");

var svgbar = d3.select("#barhere").append("svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

d3.csv("hep_a.csv", type, function(data) {

  console.log(data)

  var means = [];

  means.push({ "name": "Alabama", "id": 1, "value": d3.mean(data, function(d) { return +d.ALABAMA })});
  means.push({ "name": "Alaska", "id": 2, "value": d3.mean(data, function(d) { return +d.ALASKA })});
  means.push({ "name": "Arizona", "id": 4, "value": d3.mean(data, function(d) { return +d.ARIZONA })});
  means.push({ "name": "Arkansas", "id": 5, "value": d3.mean(data, function(d) { return +d.ARKANSAS })});
  means.push({ "name": "California", "id": 6, "value": d3.mean(data, function(d) { return +d.CALIFORNIA })});
  means.push({ "name": "Colorado", "id": 8, "value": d3.mean(data, function(d) { return +d.COLORADO })});
  means.push({ "name": "Connecticut", "id": 9, "value": d3.mean(data, function(d) { return +d.CONNECTICUT })});
  means.push({ "name": "Delaware", "id": 10, "value": d3.mean(data, function(d) { return +d.DELAWARE })});
  means.push({ "name": "Florida", "id": 12, "value": d3.mean(data, function(d) { return +d.FLORIDA })});
  means.push({ "name": "Georgia", "id": 13, "value": d3.mean(data, function(d) { return +d.GEORGIA })});
  means.push({ "name": "Hawaii", "id": 15, "value": d3.mean(data, function(d) { return +d.HAWAII })});
  means.push({ "name": "Idaho", "id": 16, "value": d3.mean(data, function(d) { return +d.IDAHO })});
  means.push({ "name": "Illinois", "id": 17, "value": d3.mean(data, function(d) { return +d.ILLINOIS })});
  means.push({ "name": "Indiana", "id": 18, "value": d3.mean(data, function(d) { return +d.INDIANA })});
  means.push({ "name": "Iowa", "id": 19, "value": d3.mean(data, function(d) { return +d.IOWA })});
  means.push({ "name": "Kansas", "id": 20, "value": d3.mean(data, function(d) { return +d.KANSAS })});
  means.push({ "name": "Kentucky", "id": 21, "value": d3.mean(data, function(d) { return +d.KENTUCKY })});
  means.push({ "name": "Louisiana", "id": 22, "value": d3.mean(data, function(d) { return +d.LOUISIANA })});
  means.push({ "name": "Maine", "id": 23, "value": d3.mean(data, function(d) { return +d.MAINE })});
  means.push({ "name": "Maryland", "id": 24, "value": d3.mean(data, function(d) { return +d.MARYLAND })});
  means.push({ "name": "Massachusetts", "id": 25, "value": d3.mean(data, function(d) { return +d.MASSACHUSETTS })});
  means.push({ "name": "Michigan", "id": 26, "value": d3.mean(data, function(d) { return +d.MICHIGAN })});
  means.push({ "name": "Minnesota", "id": 27, "value": d3.mean(data, function(d) { return +d.MINNESOTA })});
  means.push({ "name": "Mississippi", "id": 28, "value": d3.mean(data, function(d) { return +d.MISSISSIPPI })});
  means.push({ "name": "Missouri", "id": 29, "value": d3.mean(data, function(d) { return +d.MISSOURI })});
  means.push({ "name": "Montana", "id": 30, "value": d3.mean(data, function(d) { return +d.MONTANA })});
  means.push({ "name": "Nebraska", "id": 31, "value": d3.mean(data, function(d) { return +d.NEBRASKA })});
  means.push({ "name": "Nevada", "id": 32, "value": d3.mean(data, function(d) { return +d.NEVADA })});
  means.push({ "name": "New Hampshire", "id": 33, "value": d3.mean(data, function(d) { return +d.NEWHAMPSHIRE })});
  means.push({ "name": "New Jersey", "id": 34, "value": d3.mean(data, function(d) { return +d.NEWJERSEY })});
  means.push({ "name": "New Mexico", "id": 35, "value": d3.mean(data, function(d) { return +d.NEWMEXICO })});
  means.push({ "name": "New York", "id": 36, "value": d3.mean(data, function(d) { return +d.NEWYORK })});
  means.push({ "name": "North Carolina", "id": 37, "value": d3.mean(data, function(d) { return +d.NORTHCAROLINA })});
  means.push({ "name": "North Dakota", "id": 38, "value": d3.mean(data, function(d) { return +d.NORTHDAKOTA })});
  means.push({ "name": "Ohio", "id": 39, "value": d3.mean(data, function(d) { return +d.OHIO })});
  means.push({ "name": "Oklahoma", "id": 40, "value": d3.mean(data, function(d) { return +d.OKLAHOMA })});
  means.push({ "name": "Oregon", "id": 41, "value": d3.mean(data, function(d) { return +d.OREGON })});
  means.push({ "name": "Pennsylvania", "id": 42, "value": d3.mean(data, function(d) { return +d.PENNSYLVANIA })});
  means.push({ "name": "Rhode Island", "id": 44, "value": d3.mean(data, function(d) { return +d.RHODEISLAND })});
  means.push({ "name": "South Carolina", "id": 45, "value": d3.mean(data, function(d) { return +d.SOUTHCAROLINA })});
  means.push({ "name": "South Dakota", "id": 46, "value": d3.mean(data, function(d) { return +d.SOUTHDAKOTA })});
  means.push({ "name": "Tennessee", "id": 47, "value": d3.mean(data, function(d) { return +d.TENNESSEE })});
  means.push({ "name": "Texas", "id": 48, "value": d3.mean(data, function(d) { return +d.TEXAS })});
  means.push({ "name": "Utah", "id": 49, "value": d3.mean(data, function(d) { return +d.UTAH })});
  means.push({ "name": "Vermont", "id": 50, "value": d3.mean(data, function(d) { return +d.VERMONT })});
  means.push({ "name": "Virginia", "id": 51, "value": d3.mean(data, function(d) { return +d.VIRGINIA })});
  means.push({ "name": "Washington", "id": 53, "value": d3.mean(data, function(d) { return +d.WASHINGTON })});
  means.push({ "name": "West Virginia", "id": 54, "value": d3.mean(data, function(d) { return +d.WESTVIRGINIA })});
  means.push({ "name": "Wisconsin", "id": 55, "value": d3.mean(data, function(d) { return +d.WISCONSIN })});
  means.push({ "name": "Wyoming", "id": 56, "value": d3.mean(data, function(d) { return +d.WYOMING })});

  console.log(means)

  means.forEach(function (d) {d.value = d3.round(d.value, 3)})

  means.sort(function(a, b) { return b.value - a.value; });
  
  // Set the scale domain.
  xbar.domain([0, d3.max(means, function(d) { return d.value * 1.15; })]);
  ybar.domain(means.map(function(d) { return d.name; }));

  var bar = svgbar.selectAll("g.bar")
      .data(means)
    .enter().append("g")
      .attr("class", function(d) { return "bar " + d.name.toUpperCase().replace(/\s+/g, '')})
      .attr("transform", function(d) { return "translate(0," + ybar(d.name) + ")"; })
      .on("click", clicked);

  bar.append("rect")
      .attr("width", function(d) { return xbar(d.value); })
      .attr("height", ybar.rangeBand());

  bar.append("text")
      .attr("class", "value")
      .attr("x", function(d) { return xbar(d.value); })
      .attr("y", ybar.rangeBand() / 2)
      .attr("dx", 3)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .text(function(d) { return d.value; });

  svgbar.append("g")
      .attr("class", "x axis")
      .call(xAxisbar);

  svgbar.append("g")
      .attr("class", "y axis")
      .call(yAxisbar);

      svgbar.append("text")
      .attr("x", 300)
      .attr("y", 815)
      .attr("dx", -3)
      .attr("text-anchor", "end")
      .text("Average Incidence (cases per 100000) in Selected Time Period");
});


//Function Block
function type(d) {
  d.date = parseDate(d.date);
  d.ALABAMA = isNaN(d.ALABAMA) ? null:+d.ALABAMA;
  d.ALASKA = isNaN(d.ALASKA) ? null:+d.ALASKA;
  d.ARIZONA = isNaN(d.ARIZONA) ? null:+d.ARIZONA;
  d.ARKANSAS = isNaN(d.ARKANSAS) ? null:+d.ARKANSAS;
  d.CALIFORNIA = isNaN(d.CALIFORNIA) ? null:+d.CALIFORNIA;
  d.COLORADO = isNaN(d.COLORADO) ? null:+d.COLORADO;
  d.CONNECTICUT = isNaN(d.CONNECTICUT) ? null:+d.CONNECTICUT;
  d.DELAWARE = isNaN(d.DELAWARE) ? null:+d.DELAWARE;
  d.DISTRICTOFCOLUMBIA = isNaN(d.DISTRICTOFCOLUMBIA) ? null:+d.DISTRICTOFCOLUMBIA;
  d.FLORIDA = isNaN(d.FLORIDA) ? null:+d.FLORIDA;
  d.GEORGIA = isNaN(d.GEORGIA) ? null:+d.GEORGIA;
  d.HAWAII = isNaN(d.HAWAII) ? null:+d.HAWAII;
  d.IDAHO = isNaN(d.IDAHO) ? null:+d.IDAHO;
  d.ILLINOIS = isNaN(d.ILLINOIS) ? null:+d.ILLINOIS;
  d.INDIANA = isNaN(d.INDIANA) ? null:+d.INDIANA;
  d.IOWA = isNaN(d.IOWA) ? null:+d.IOWA;
  d.KANSAS = isNaN(d.KANSAS) ? null:+d.KANSAS;
  d.KENTUCKY = isNaN(d.KENTUCKY) ? null:+d.KENTUCKY;
  d.LOUISIANA = isNaN(d.LOUISIANA) ? null:+d.LOUISIANA;
  d.MAINE = isNaN(d.MAINE) ? null:+d.MAINE;
  d.MARYLAND = isNaN(d.MARYLAND) ? null:+d.MARYLAND;
  d.MASSACHUSETTS = isNaN(d.MASSACHUSETTS) ? null:+d.MASSACHUSETTS;
  d.MICHIGAN = isNaN(d.MICHIGAN) ? null:+d.MICHIGAN;
  d.MINNESOTA = isNaN(d.MINNESOTA) ? null:+d.MINNESOTA;
  d.MISSISSIPPI = isNaN(d.MISSISSIPPI) ? null:+d.MISSISSIPPI;
  d.MISSOURI = isNaN(d.MISSOURI) ? null:+d.MISSOURI;
  d.MONTANA = isNaN(d.MONTANA) ? null:+d.MONTANA;
  d.NEBRASKA = isNaN(d.NEBRASKA) ? null:+d.NEBRASKA;
  d.NEVADA = isNaN(d.NEVADA) ? null:+d.NEVADA;
  d.NEWHAMPSHIRE = isNaN(d.NEWHAMPSHIRE) ? null:+d.NEWHAMPSHIRE;
  d.NEWJERSEY = isNaN(d.NEWJERSEY) ? null:+d.NEWJERSEY;
  d.NEWMEXICO = isNaN(d.NEWMEXICO) ? null:+d.NEWMEXICO;
  d.NEWYORK = isNaN(d.NEWYORK) ? null:+d.NEWYORK;
  d.NORTHCAROLINA = isNaN(d.NORTHCAROLINA) ? null:+d.NORTHCAROLINA;
  d.NORTHDAKOTA = isNaN(d.NORTHDAKOTA) ? null:+d.NORTHDAKOTA;
  d.OHIO = isNaN(d.OHIO) ? null:+d.OHIO;
  d.OKLAHOMA = isNaN(d.OKLAHOMA) ? null:+d.OKLAHOMA;
  d.OREGON = isNaN(d.OREGON) ? null:+d.OREGON;
  d.PENNSYLVANIA = isNaN(d.PENNSYLVANIA) ? null:+d.PENNSYLVANIA;
  d.RHODEISLAND = isNaN(d.RHODEISLAND) ? null:+d.RHODEISLAND;
  d.SOUTHCAROLINA = isNaN(d.SOUTHCAROLINA) ? null:+d.SOUTHCAROLINA;
  d.SOUTHDAKOTA = isNaN(d.SOUTHDAKOTA) ? null:+d.SOUTHDAKOTA;
  d.TENNESSEE = isNaN(d.TENNESSEE) ? null:+d.TENNESSEE;
  d.TEXAS = isNaN(d.TEXAS) ? null:+d.TEXAS;
  d.UTAH = isNaN(d.UTAH) ? null:+d.UTAH;
  d.VERMONT = isNaN(d.VERMONT) ? null:+d.VERMONT;
  d.VIRGINIA = isNaN(d.VIRGINIA) ? null:+d.VIRGINIA;
  d.WASHINGTON = isNaN(d.WASHINGTON) ? null:+d.WASHINGTON;
  d.WESTVIRGINIA = isNaN(d.WESTVIRGINIA) ? null:+d.WESTVIRGINIA;
  d.WISCONSIN = isNaN(d.WISCONSIN) ? null:+d.WISCONSIN;
  d.WYOMING = isNaN(d.WYOMING) ? null:+d.WYOMING
  return d;
}

function updateBars(dd){

  svgbar.selectAll(".bar").remove()

  data = dd.filter(function(d){ return (d.date > x.domain()[0] && d.date < x.domain()[1])})

  var means = [];

  means.push({ "name": "Alabama", "id": 1, "value": d3.mean(data, function(d) { return +d.ALABAMA })});
  means.push({ "name": "Alaska", "id": 2, "value": d3.mean(data, function(d) { return +d.ALASKA })});
  means.push({ "name": "Arizona", "id": 4, "value": d3.mean(data, function(d) { return +d.ARIZONA })});
  means.push({ "name": "Arkansas", "id": 5, "value": d3.mean(data, function(d) { return +d.ARKANSAS })});
  means.push({ "name": "California", "id": 6, "value": d3.mean(data, function(d) { return +d.CALIFORNIA })});
  means.push({ "name": "Colorado", "id": 8, "value": d3.mean(data, function(d) { return +d.COLORADO })});
  means.push({ "name": "Connecticut", "id": 9, "value": d3.mean(data, function(d) { return +d.CONNECTICUT })});
  means.push({ "name": "Delaware", "id": 10, "value": d3.mean(data, function(d) { return +d.DELAWARE })});
  means.push({ "name": "Florida", "id": 12, "value": d3.mean(data, function(d) { return +d.FLORIDA })});
  means.push({ "name": "Georgia", "id": 13, "value": d3.mean(data, function(d) { return +d.GEORGIA })});
  means.push({ "name": "Hawaii", "id": 15, "value": d3.mean(data, function(d) { return +d.HAWAII })});
  means.push({ "name": "Idaho", "id": 16, "value": d3.mean(data, function(d) { return +d.IDAHO })});
  means.push({ "name": "Illinois", "id": 17, "value": d3.mean(data, function(d) { return +d.ILLINOIS })});
  means.push({ "name": "Indiana", "id": 18, "value": d3.mean(data, function(d) { return +d.INDIANA })});
  means.push({ "name": "Iowa", "id": 19, "value": d3.mean(data, function(d) { return +d.IOWA })});
  means.push({ "name": "Kansas", "id": 20, "value": d3.mean(data, function(d) { return +d.KANSAS })});
  means.push({ "name": "Kentucky", "id": 21, "value": d3.mean(data, function(d) { return +d.KENTUCKY })});
  means.push({ "name": "Louisiana", "id": 22, "value": d3.mean(data, function(d) { return +d.LOUISIANA })});
  means.push({ "name": "Maine", "id": 23, "value": d3.mean(data, function(d) { return +d.MAINE })});
  means.push({ "name": "Maryland", "id": 24, "value": d3.mean(data, function(d) { return +d.MARYLAND })});
  means.push({ "name": "Massachusetts", "id": 25, "value": d3.mean(data, function(d) { return +d.MASSACHUSETTS })});
  means.push({ "name": "Michigan", "id": 26, "value": d3.mean(data, function(d) { return +d.MICHIGAN })});
  means.push({ "name": "Minnesota", "id": 27, "value": d3.mean(data, function(d) { return +d.MINNESOTA })});
  means.push({ "name": "Mississippi", "id": 28, "value": d3.mean(data, function(d) { return +d.MISSISSIPPI })});
  means.push({ "name": "Missouri", "id": 29, "value": d3.mean(data, function(d) { return +d.MISSOURI })});
  means.push({ "name": "Montana", "id": 30, "value": d3.mean(data, function(d) { return +d.MONTANA })});
  means.push({ "name": "Nebraska", "id": 31, "value": d3.mean(data, function(d) { return +d.NEBRASKA })});
  means.push({ "name": "Nevada", "id": 32, "value": d3.mean(data, function(d) { return +d.NEVADA })});
  means.push({ "name": "New Hampshire", "id": 33, "value": d3.mean(data, function(d) { return +d.NEWHAMPSHIRE })});
  means.push({ "name": "New Jersey", "id": 34, "value": d3.mean(data, function(d) { return +d.NEWJERSEY })});
  means.push({ "name": "New Mexico", "id": 35, "value": d3.mean(data, function(d) { return +d.NEWMEXICO })});
  means.push({ "name": "New York", "id": 36, "value": d3.mean(data, function(d) { return +d.NEWYORK })});
  means.push({ "name": "North Carolina", "id": 37, "value": d3.mean(data, function(d) { return +d.NORTHCAROLINA })});
  means.push({ "name": "North Dakota", "id": 38, "value": d3.mean(data, function(d) { return +d.NORTHDAKOTA })});
  means.push({ "name": "Ohio", "id": 39, "value": d3.mean(data, function(d) { return +d.OHIO })});
  means.push({ "name": "Oklahoma", "id": 40, "value": d3.mean(data, function(d) { return +d.OKLAHOMA })});
  means.push({ "name": "Oregon", "id": 41, "value": d3.mean(data, function(d) { return +d.OREGON })});
  means.push({ "name": "Pennsylvania", "id": 42, "value": d3.mean(data, function(d) { return +d.PENNSYLVANIA })});
  means.push({ "name": "Rhode Island", "id": 44, "value": d3.mean(data, function(d) { return +d.RHODEISLAND })});
  means.push({ "name": "South Carolina", "id": 45, "value": d3.mean(data, function(d) { return +d.SOUTHCAROLINA })});
  means.push({ "name": "South Dakota", "id": 46, "value": d3.mean(data, function(d) { return +d.SOUTHDAKOTA })});
  means.push({ "name": "Tennessee", "id": 47, "value": d3.mean(data, function(d) { return +d.TENNESSEE })});
  means.push({ "name": "Texas", "id": 48, "value": d3.mean(data, function(d) { return +d.TEXAS })});
  means.push({ "name": "Utah", "id": 49, "value": d3.mean(data, function(d) { return +d.UTAH })});
  means.push({ "name": "Vermont", "id": 50, "value": d3.mean(data, function(d) { return +d.VERMONT })});
  means.push({ "name": "Virginia", "id": 51, "value": d3.mean(data, function(d) { return +d.VIRGINIA })});
  means.push({ "name": "Washington", "id": 53, "value": d3.mean(data, function(d) { return +d.WASHINGTON })});
  means.push({ "name": "West Virginia", "id": 54, "value": d3.mean(data, function(d) { return +d.WESTVIRGINIA })});
  means.push({ "name": "Wisconsin", "id": 55, "value": d3.mean(data, function(d) { return +d.WISCONSIN })});
  means.push({ "name": "Wyoming", "id": 56, "value": d3.mean(data, function(d) { return +d.WYOMING })});
  means.sort(function(a, b) { return b.value - a.value; });

  means.forEach(function (d) {d.value = d3.round(d.value, 3)})

  xbar.domain([0, d3.max(means, function(d) { return d.value * 1.15; })]);
  ybar.domain(means.map(function(d) { return d.name; }));

  svgbar.select(".x.axis").transition().call(xAxisbar);
  svgbar.select(".y.axis").call(yAxisbar);

  bar = svgbar.selectAll("g.bar")
      .data(means)
    .enter().append("g")
      .attr("class", function(d) { return "bar " + d.name.toUpperCase().replace(/\s+/g, '')})
      .attr("transform", function(d) { return "translate(0," + ybar(d.name) + ")"; })
      .on("click", clicked);

  bar.append("rect").transition()
      .attr("width", function(d) { return xbar(d.value); })
      .attr("height", ybar.rangeBand());

  bar.append("text").transition()
      .attr("class", "value")
      .attr("x", function(d) { return xbar(d.value); })
      .attr("y", ybar.rangeBand() / 2)
      .attr("dx", 3)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .text(function(d) { return d.value; });

  svgbar.selectAll("." + sel1).selectAll("rect")
      .classed("active1", true);
  svgbar.selectAll("." + sel2).selectAll("rect")
      .classed("active2", true);
}

function brushed() {

  //get brush parameters
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  console.log(x.domain())
  //move dots
  focus.selectAll(".act1")
      .attr("cx", function(d){ return x(d.date) })
      .attr("cy", function(d){ return d[sel1]===null ? 0:y(d[sel1]) });
  focus.selectAll(".act2")
      .attr("cx", function(d){ return x(d.date) })
      .attr("cy", function(d){ return d[sel2]===null ? 0:y(d[sel2]) });
    
  //move lines
  line21f = d3.svg.line()
      .defined(function(d) { return d[sel1]!=null; }) //Ignores null values
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d[sel1]); });
    
  line22f = d3.svg.line()
      .defined(function(d) { return d[sel2]!=null; }) //Ignores null values
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d[sel2]); });
    
  d3.selectAll(".act1focusline")
        .attr("d", line21f);
    
  d3.selectAll(".act2focusline")
        .attr("d", line22f);

  focus.selectAll(".vaccLine")
    .attr("x1", x(vaccDate))
    .attr("x2", x(vaccDate));

  focus.selectAll(".vaccText")
    .attr("transform", "translate(" + x(vaccDate) + ", 0) rotate(-90)");

  //redraw axis
  focus.select(".x.axis").call(xAxis);

  //redraw Barchart
  d3.csv("hep_a.csv", type, function(error, data){
    updateBars(data);
  });

}

function clicked(d) {

  console.log(d)

  console.log(sel1);
  console.log(sel2);

  var stateClicked = nameByID[d.id];

  //If clicking on a selection, deselect

  if (sel1id === d.id){
    console.log("ass1")
    sel1 = null;
    sel1id = null;
    removeActive1();
  }else if (sel2id === d.id){
    console.log("ass2")
    sel2 = null;
    sel2id = null;
    removeActive2();
  }

  //extremely complicated selection logic
  else if (sel1 == null && sel2 != null){
    sel1 = nameByID[d.id].toUpperCase().replace(/\s+/g, '');
    sel1id = d.id;
    addActive1(d);
  }else if (sel1 != null && sel2 == null){
    sel2 = nameByID[d.id].toUpperCase().replace(/\s+/g, '');
    sel2id = d.id;
    addActive2(d);
  }else if (sel1 == null && sel2 == null){
    sel1 = nameByID[d.id].toUpperCase().replace(/\s+/g, '');
    sel1id = d.id;
    addActive1(d);
  }

  g.selectAll("path")
      .classed("active1", function(d) { return d.id === sel1id ; })
      .classed("active2", function(d) { return d.id === sel2id; });

  svgbar.selectAll("." + sel1).selectAll("rect")
      .classed("active1", true);
  svgbar.selectAll("." + sel2).selectAll("rect")
      .classed("active2", true);
}

function removeActive1(dd){

  svg2.selectAll(".act1").transition().duration(500)
  .attr("r", 0).remove();
  svg2.selectAll(".act1line").transition().delay(100).remove();
  d3.selectAll(".act1focusline").transition().delay(100).remove();

  d3.csv("hep_a.csv", type, function(error, data) {
    adjYAxis(data);
    adjXAxis(data)
  });

  svgbar.selectAll("rect")
      .classed("active1", false);

}

function removeActive2(dd){
  svg2.selectAll(".act2").transition().duration(500)
  .attr("r", 0).remove();
  svg2.selectAll(".act2line").transition().delay(100).remove();   
  d3.selectAll(".act2focusline").transition().delay(100).remove();
    
  d3.csv("hep_a.csv", type, function(error, data) {
    adjYAxis(data);
    adjXAxis(data);
  });

    svgbar.selectAll("rect")
      .classed("active2", false);
}

function adjXAxis(dd){
  //If nothing is selected
  if (sel1 === null && sel2 === null){
    x2.domain(d3.extent(dd.map(function(d) { return d.date; })));
    x.domain(x2.domain());
	
	focus.selectAll(".vaccLine")
      .attr("x1", x(vaccDate))
      .attr("x2", x(vaccDate));
    focus.selectAll(".vaccText")
      .attr("transform", "translate(" + x(vaccDate) + ", 0) rotate(-90)");
	
    d3.selectAll(".brush").call(brush.clear());
  } else if (sel2 === null){
    x2.domain(d3.extent(dd.map(function(d) { return d.date; })));
    x.domain(brush.empty() ? x2.domain() : brush.extent());
  } else if (sel1 === null){
    x2.domain(d3.extent(dd.map(function(d) { return d.date; })));
    x.domain(brush.empty() ? x2.domain() : brush.extent());
  }

  focus.select(".x.axis").call(xAxis);
  context.select(".x.axis").call(xAxis);
}

function adjYAxis(dd){

  //If nothing is selected
  if (sel1 === null && sel2 === null){
    //do nothing

  //If there is only an active2
  }else if (sel2 === null && sel1 != null) {
    console.log("rem2")
    y.domain([0, d3.max(dd.map(function(d) { return d[sel1]; })) * 1.1]);
    y2.domain(y.domain());
    focus.select(".y.axis").transition().duration(250).call(yAxis);
    context.select(".y.axis").transition().duration(250).call(yAxis);
  focus.selectAll(".act1").transition().duration(250)
      .attr("cy", function(d){ return d[sel1]===null ? 0:y(d[sel1]) });
  focus.selectAll(".act1focusline").transition().duration(500).attr("d", line21f);
  context.selectAll(".act1line").transition().duration(500).attr("d", line21);
  
  //If there is only an active1
  }else if (sel1 === null && sel2 != null) {
    y.domain([0, d3.max(dd.map(function(d) { return d[sel2]; })) * 1.1]);
    y2.domain(y.domain());
    focus.select(".y.axis").transition().duration(250).call(yAxis);
    context.select(".y.axis").transition().duration(250).call(yAxis);
    focus.selectAll(".act2").transition().duration(250)
      .attr("cy", function(d){ return d[sel2]===null ? 0:y(d[sel2]) });
  focus.selectAll(".act2focusline").transition().duration(250).attr("d", line22f);
  context.selectAll(".act2line").transition().duration(250).attr("d", line22);
  
  //If there are both
  }else{
    console.log("both")

    //Adjust y axis domain
    y.domain([0, d3.max(dd.map(function(d) { return Math.max(d[sel2],d[sel1]); })) * 1.1]);
    y2.domain(y.domain());

    //Adjust the physical axis
    focus.select(".y.axis").transition().duration(250).call(yAxis);
    context.select(".y.axis").transition().duration(250).call(yAxis);

    //adjust the lines
    context.selectAll(".act2line").attr("d", line22);
    context.selectAll(".act1line").attr("d", line21);
    focus.selectAll(".act2focusline").attr("d", line22f);
    focus.selectAll(".act1focusline").attr("d", line21f);
    console.log("I moved the lines")
  
    //adjust the points
    focus.selectAll(".act2").transition().duration(250)
      .attr("cy", function(d){ return d[sel2]===null ? 0:y(d[sel2]) });
    focus.selectAll(".act1").transition().duration(250)
      .attr("cy", function(d){ return d[sel1]===null ? 0:y(d[sel1]) });

    
  }
  
}

function addActive1(dd){

  d3.csv("hep_a.csv", type, function(error, data) {

    adjXAxis(data);
    adjYAxis(data);

    line21 = d3.svg.line()
      .defined(function(d) { return d[sel1]!=null; }) //Ignores null values
      .x(function(d) { return x2(d.date); })
      .y(function(d) { return y2(d[sel1]); });
    
    line21f = d3.svg.line()
      .defined(function(d) { return d[sel1]!=null; }) //Ignores null values
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d[sel1]); });

    //add points
    focus.selectAll(".act1")
        .data(data)
      .enter().append("circle")
        .attr("class", "act1")
        .attr("r", 0).transition().delay(250).duration(500)
        .attr("r", 2)
        .attr("cx", function(d){ return x(d.date) })
        .attr("cy", function(d){ return d[sel1]===null ? -10:y(d[sel1]) })
        .style("opacity", function(d){ return d[sel1]===null ? 0:1 });

      context.append("path")
        .datum(data).transition().delay(250).duration(500)
        .attr("class", "act1line")
        .attr("d", line21);
    
    focus.append("path")
        .datum(data).transition().delay(250).duration(500)
        .attr("class", "act1focusline")
        .attr("d", line21f);
  });
}

function addActive2(dd){

  d3.csv("hep_a.csv", type, function(error, data) {

    adjXAxis(data);
    adjYAxis(data);

    line22 = d3.svg.line()
      .defined(function(d) { return d[sel2]!=null; }) //Ignores null values
      .x(function(d) { return x2(d.date); })
      .y(function(d) { return y2(d[sel2]); });
    
     line22f = d3.svg.line()
      .defined(function(d) { return d[sel2]!=null; }) //Ignores null values
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d[sel2]); });

    //add points
    focus.selectAll(".act2")
        .data(data)
      .enter().append("circle")
        .attr("class", "act2")
        .attr("r", 0).transition().delay(250).duration(500)
        .attr("r", 2)
        .attr("cx", function(d){ return x(d.date) })
        .attr("cy", function(d){ return d[sel2]===null ? -10:y(d[sel2]) })
        .style("opacity", function(d){ return d[sel2]===null ? 0:1 });

    context.append("path")
      .datum(data).transition().delay(250).duration(500)
      .attr("class", "act2line")
      .attr("d", line22);
    
    focus.append("path")
      .datum(data).transition().delay(250).duration(500)
      .attr("class", "act2focusline")
      .attr("d", line22f);
  });
}










