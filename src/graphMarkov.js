
// 16:9
const w = 550;
const h = 550;

const linkDistance=100;
const charge = -2000

var colors = d3.scale.category20();

// use the public github file instead of local file to get around Chrome blocking CORS/XMLHttp (without an extension)
function graphMarkovChain(dataset) {
  console.log(linkDistance, charge);
  
    // Remove the old svg
    d3.select("#markov-container svg").remove();
    var svg = d3.select("#markov-container").append("svg").attr({"width":w,"height":h});

    var force = d3.layout.force()
    .nodes(dataset.nodes)
    .links(dataset.edges)
    .size([w,h])
    .linkDistance([linkDistance])
    .charge([charge])
    .theta(0.1)
    .gravity(0.2)
    .start();

    var edges = svg.selectAll("line")
    .data(dataset.edges)
    .enter()
    .append("line")
    .attr('marker-end','url(#arrowhead)')
    .style("stroke","#ccc")
    .style("pointer-events", "none");

    var edgepaths = svg.selectAll(".edgepath")
    .data(dataset.edges)
    .enter()
    .append('path')
    .attr({ 'd': d => 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y,
            'class':'edgepath',
            'fill-opacity':0,
            'stroke-opacity':0.4,
            'fill':'blue',
            'stroke':'grey',
            'stroke-width': d => String(d.weight*10).concat('px')})
    .style("pointer-events", "none");

    var nodes = svg.selectAll("circle")
    .data(dataset.nodes)
    .enter()
    .append("circle")
    .attr({"r":10})
    .style("fill", (d,i) => colors(i))
    .call(force.drag)

    var nodelabels = svg.selectAll(".nodelabel") 
    .data(dataset.nodes)
    .enter()
    .append("text")
    .attr({"x":d => d.x,
            "y":d => d.y,
            "class":"nodelabel",
            "stroke":"black",
            "stroke-width":'.7px'})
    .text(d => d.word);

    svg.append('defs').append('marker')
        .attr({'id':'arrowhead',
            'viewBox':'-0 -5 10 10',
            'refX':20,
            'refY':0,
            'orient':'auto',
            'markerWidth':10,
            'markerHeight':10,
            'xoverflow':'visible'})
        .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#ccc')
            .attr('stroke','#ccc');

        force.on("tick", function(){

            edges.attr({"x1": d => d.source.x,
                        "y1": d => d.source.y,
                        "x2": d => d.target.x,
                        "y2": d => d.target.y
            });

            nodes.attr({"cx": d => d.x,
                        "cy": d => d.y
            });

            nodelabels.attr("x", d => d.x) 
                      .attr("y", d => d.y);

            edgepaths.attr('d', d => 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y);        
        });

};
