//https://stackoverflow.com/questions/24784302/wrapping-text-in-d3
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 5, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                .append("tspan")
                .attr("x", x + "px")
                .attr("y", x + "px")
                .attr("dy", dy + "px");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x + "px")
                    .attr("y", x + "px")
                    .attr("dy", (++lineNumber * lineHeight + dy) + "px")
                    .text(word);
            }
        }
    });
}


function simulate(data,svg)
{
    const tooltip = d3.select("#tooltip");
    const width = parseInt(svg.attr("viewBox").split(' ')[2])
    const height = parseInt(svg.attr("viewBox").split(' ')[3])
    const main_group = svg.append("g")
        .attr("transform", "translate(0, 50)")

    //calculate degree of the nodes:
    let node_degree={}; //initiate an object
    d3.map(data.links, (d)=>{
        if(d.source in node_degree)
        {
            node_degree[d.source]++
        }
        else{
            node_degree[d.source]=0
        }
        if(d.target in node_degree)
        {
            node_degree[d.target]++
        }
        else{
            node_degree[d.target]=0
        }
    })

    // console.log(Object.values(node_degree))
    // console.log(node_degree)


    const scale_radius = d3.scaleSqrt()
        // .domain(d3.extent(Object.values(node_degree)))
        .domain(d3.extent(data.nodes, d => { return d.Citations}))
        .range([3,11])
    const scale_link_stroke_width = d3.scaleSqrt()
        .domain(d3.extent(data.links, d=> {
            // console.log(d.value)
            return d.value
        }))
        .range([1,5])

    // const color = d3.scaleOrdinal(d3.schemeCategory10);
    //https://observablehq.com/@d3/working-with-color
    //https://d3-graph-gallery.com/graph/custom_color.html
    //https://mokole.com/palette.html
    //https://medialab.github.io/iwanthue/
    const color = d3.scaleOrdinal(
            ["#742000",
            "#40ff5e",
            "#d128e1",
            "#00db55",
            "#f65aff",
            "#179d00",
            "#0149e5",
            "#fbe100",
            "#8c00ac",
            "#e1ff62",
            "#000364",
            "#b8ff87",
            "#ca64ff",
            "#118600",
            "#ff41d3",
            "#01b55b",
            "#f573ff",
            "#7bffa8",
            "#600086",
            "#ffd440",
            "#0133a2",
            "#d8a100",
            "#6182ff",
            "#ff8811",
            "#018fe4",
            "#ff3d17",
            "#02ffd8",
            "#c00095",
            "#91ffc0",
            "#8c0071",
            "#00c290",
            "#b80023",
            "#00cfe4",
            "#93000f",
            "#8bf8ff",
            "#970034",
            "#007e36",
            "#ff8af0",
            "#005a05",
            "#a80060",
            "#fffe9d",
            "#330043",
            "#d0fff4",
            "#090024",
            "#ff8540",
            "#7ea6ff",
            "#6e6a00",
            "#e1baff",
            "#00491a",
            "#ff7d90",
            "#01746f",
            "#5f0033",
            "#f2f7ff",
            "#070000",
            "#ffd4da",
            "#300100",
            "#a3d3ff",
            "#865e00",
            "#00244b",
            "#ffb597",
            "#014970",
            "#2c2800",
            "#0190a8",
            "#003737"]
    );


    const link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke-width", d=> scale_link_stroke_width(d.value))
        .attr("class",function (d){
            // console.log("gr_"+d.group.toString())
            return "grl_"+d.value.toString()
        })
        .on("mouseenter",function (d,data){
        })
        .on("mouseleave", (d,data)=>{
        })


    function linkMute(node) {
        link_elements.each(d => {
            if ((node.id === d.source.id || node.id === d.target.id)) {
                d3.selectAll(".grl_"+node.group.toString()).classed("lineInactive",false)
            }
        })

    }


    const node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append('g')
        .attr("class",function (d){
            // console.log("gr_"+d.group.toString())
            return "gr_"+d.group.toString()
        })
        .on("mouseenter",function (d,data){
            link_elements.classed("lineInactive",true)
            node_elements.classed("inactive",true)
            d3.selectAll(".gr_"+data.group.toString()).classed("inactive",false)
            linkMute(data)


            // console.log(data)
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html(
                "<div>"+"             Title: " + data['Title'] + "</div>" +
                "<div>"+"         Publisher: "+  data['Publisher'] + "</div>" +
                "<div>"+"   1st Author Name: "+  data['First_author_name'] + "</div>" +
                "<div>"+"1st Author Country: "+  data['First_author_Country'] + "</div>" +
                "<div>"+"         Citations: "+  data['Citations'] + "</div>" +
                "<div>"+"              Year: "+  data['Year'] + "</div>"
            ).style("z-index","99");
            d3.select(this).style("cursor", "pointer");
        })
        .on("mouseleave", (d,data)=>{
            d3.selectAll(".inactive").classed("inactive",false)
            link_elements.classed("lineInactive",false)
            tooltip.style("opacity", .9)
        })
        .on("mouseout", (m, d) => {
            tooltip.transition()
                .duration(18000)
                .style("opacity", 0)

        })

    node_elements.append("circle")
        .attr("r",  (d,i)=>{
            // return scale_radius(Object.values(node_degree)[i])
            return scale_radius(d.Citations)
        })
        .attr("fill",  d=> color(d.group))
    // console.log(Object.keys(node_degree).length)
    // console.log(node_elements.size())
    // console.log(Object.values(node_degree)[1])
    // console.log(Object.values(node_degree)[2])
    // console.log(Object.values(node_degree)[3])
    // console.log(Object.values(node_degree)[4])
    // console.log(Object.values(node_degree)[5])
    // console.log(scale_radius(1))
    // console.log(scale_radius(node_degree[1]))


    node_elements.append("text")
        .attr("class","label")
        .attr("text-anchor","middle")
        .attr("x",0)
        .attr("y",0)
        .text(d=>d.First_author_name)
        .attr("fill","white")




    // console.log("Nodes")
    // console.log(data.nodes)
    // console.log("LINKS")
    // console.log(data.links)
    //
    // console.log(data.links[0])
    // for (const link in data.links) {
    //     if (data.links[link].index == 0) {
    //         console.log(data.links[link])
    //         console.log(data.links[link].index)
    //     }
    // }
    //
    // for (const link in data.nodes) {
    //     if (data.nodes[link].id == "2-s2.0-85086464158") {
    //         console.log("IS FOUND!!!!!!!")
    //         console.log(data.nodes[link])
    //         console.log("IS FOUND!!!!!!!")
    //     }
    // }

    let ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide",
            // d3.forceCollide().radius((d,i)=>{return scale_radius(node_degree[i])*2.9}))
            // d3.forceCollide().radius((d,i)=>{return scale_radius(i['Citations'])*2.9}))
            d3.forceCollide().radius((d,i)=>{return scale_radius(i.Citations)}))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(d=> {
                return d.id
            })
            // .distance(d=>d.index/1993)
            // .strength(d=>d.index*0.0001999999999999999999)
            .distance(d=>d.value)
            .strength(d=>d.value*0.01)
        )
        .on("tick", ticked);


    function ticked()
    {
        node_elements
            .attr('transform', (d)=>`translate(${d.x},${d.y})`)
        link_elements
            .attr("x1",d=>d.source.x)
            .attr("x2",d=>d.target.x)
            .attr("y1",d=>d.source.y)
            .attr("y2",d=>d.target.y)

    }

    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 20])
        .on("zoom", zoomed));
    function zoomed({transform}) {
        main_group.attr("transform", transform);
    }




}
