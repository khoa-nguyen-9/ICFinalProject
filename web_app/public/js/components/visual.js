var svg = d3.select("svg");

var color = d3.scale.category20();

function createGraph(graph) {
  var links = graph.links;
  var nodes = graph.nodes;

  var width = 960,
      height = 500;

  var force = d3.layout.force()
      .nodes(nodes)
      .links(links)
      .size([width, height])
      .linkDistance(60)
      .charge(-300)
      .on("tick", tick)
      .start();

  // Per-type markers, as they don't inherit styles.
  svg.append("defs").selectAll("marker")
      .data(["suit", "licensing", "resolved"])
    .enter().append("marker")
      .attr("id", function(d) { return d; })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M0,-5L10,0L0,5");

  var path = svg.append("g").selectAll(".link")
      .data(force.links())
    .enter().append("path")
      .attr("id",function(d,i) { return "linkId_" + i; })
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
      .on("mouseover", function(d) {
        alert(d.sentence);
      });

  var circle = svg.append("g").selectAll("circle")
      .data(force.nodes())
    .enter()
      .append("a")
        .attr("xlink:href", function(d) {return 'http://www.yeastgenome.org/locus/' + d.url +'/overview'})
      .append("circle")
      .attr("r", 6)
      .style("fill", function (d) {return color(d.group);})
      .call(force.drag);

  var text = svg.append("g").selectAll("text")
      .data(force.nodes())
    .enter().append("text")
      .attr("x", 8)
      .attr("y", ".31em")
      .text(function(d) { return d.id; });

  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    path.attr("d", linkArc);
    circle.attr("transform", transform);
    text.attr("transform", transform);
  }

  function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  }

  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }

}

function highlightAnswer(text) {
  var table = document.getElementById("answers");
  var noRows = table.rows.length;
  for (var i = 0; i < noRows; i++) {
    var innerHTML = table.rows[i].innerHTML;
    var index = innerHTML.toUpperCase().indexOf(text);
    if ( index >= 0 ) { 
      innerHTML = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index,index+text.length) + "</span>" + innerHTML.substring(index + text.length);
      table.rows[i].innerHTML = innerHTML;
    }
  }
}



