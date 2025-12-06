import { 
    origindata,
} from "./data.js";

import { redBlue } from "./util.js";

const container = d3.select('#container4')
const graphCanvas = d3.select("#graphCanvas");

const width = +graphCanvas.attr("width");
let height = +graphCanvas.attr("height");
const marginTop = 50;
const marginRight = 50;
const marginBottom = 50;
let marginLeft = 100;
const margin = {marginTop, marginRight, marginBottom, marginLeft};
const barSize = 10;

let data;

async function drawGraph() {


    const barHeight = 20;
    const barSpacing = 1.5;
    graphCanvas.attr('viewBox', '0 0 1000 ' + height);
    
    // Declare the y (vertical position) scale.
    const yscale = d3.scaleLinear()
        .domain([0, 0.5])
        .range([height - marginBottom, marginTop]);

    const totalMax = d3.max(data, function(d) { 
        return d.total; });

    console.log(totalMax)

    // Declare the y (vertical position) scale.
    const xscale = d3.scaleLog()
        .domain([1000000, 10])
        .range([width - marginRight, marginLeft]);

    const bAxis = d3.axisBottom(xscale).ticks(5);
        
    graphCanvas.append("g")
        .attr("transform", "translate(0," + (height - marginBottom) + ")")
        .call(bAxis);

    graphCanvas.append("g")
        .attr("transform", "translate(" + marginLeft + ", 0)")
        .call(d3.axisLeft(yscale).ticks(5));

  // Add dots
  graphCanvas.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return xscale(d.total); } )
      .attr("cy", function (d) { return yscale(d.delayed / d.total); } )
      .attr("r", 5)
      .style("fill", redBlue(0.2))
      .on('mouseover', function (event, d) { // Handle 'mouseover' events
        const group = graphCanvas.append('g')
            .attr('class', 'hoverdata');
        const text = group.append("text").attr("x", 0).attr("y", 0);         // add text element into group
        text.append("tspan").attr("x", 0).attr("dy", "1.2em").text(d.key); // add text spans into text, with line spacing `dy`
        const bbox = group.node().getBBox();
        let tooltip_x = xscale(d.total) + width * 0.5 - bbox.width * 0.5;
        if(tooltip_x < 0) tooltip_x = marginLeft;
        group.attr('transform',
            "translate(" + (xscale(d.total) + 10) + ", " + yscale(d.delayed / d.total) + ")"
        );
        group.insert('rect', ':first-child') // create background rectangle
        .attr("x", -2)
        .attr("y",  2)
        .attr("width", bbox.width + 4)
        .attr("height", bbox.height + 4);
    })
    .on('mouseout', function(event, d) {
        graphCanvas.selectAll('.hoverdata').remove()    // Remove all ptLabels
    });

    graphCanvas.selectAll(".tick text").style("font-size", "20px");

    console.log(data);
}

export async function plotPoints() {
    data = await origindata;

    // generate initial legend
    drawGraph();

    // handle on click event
    d3.select('#menuDiv')
    .on('change', function() {
        drawGraph();
    });
}
