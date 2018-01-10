function BinnedHistogram(div){

    var margin = {top: 20, right: 30, bottom: 40, left: 30};

    var formatCount = d3.format(",.0f");

    var area = d3.select(div);
    var bb = area.node().getBoundingClientRect();

    var width = bb.width,
    height = bb.height,
    radius = Math.min(width, height) / 3;

    //var color = d3.scaleOrdinal()
    //    .range(["#8888FF", "#FF8888", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);



    var svg = area.append("div")
        .classed("svg-container", true)
        .style("width","100%")
        .style("padding-bottom", "125%")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 "+ width + " " + width*1.25)
        .classed("svg-content-responsive", true);

    svg.append("text")
        .attr("x",width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Age of Subjects (Drag to filter)");

    var brush = d3.brushX()
        .extent([[margin.left, margin.top], [width-margin.right, height-margin.bottom]])
        .on("start", brush_start)
        .on("brush", brush_move)
        .on("end", brush_end);

    var g = svg.append('g');


    var x;
    var x_bins;
    var bins;
    var selected;
//        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var on_change = null;

    this.set_on_change = function(f){
        on_change = f;
    };

    this.resize = function(){
        var bb = area.node().getBoundingClientRect();

        var width = bb.width;

        var svgContainer = area.select(".svg-content-responsive")
            .attr("viewBox", "0 0 "+ width + " " + width*1.25);

    };

    this.fill = function(data){

        var [min, max] = d3.extent(data);

        x = d3.scaleLinear()
            .rangeRound([margin.left, width-margin.right])
            .domain([0,109]);
        bins = data;
        /*bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(20))
            (data);*/
        selected=data.map(function(v){return false;});

        x_bins = d3.scaleQuantize()
            .domain(x.domain())
            .range(data.map(function(d){return d.x0;}));

        var max_y = d3.max(data, function(d) { return d.length; });

        var y = d3.scaleLinear()
            .domain([0,max_y+max_y/3])
            .range([height-margin.bottom, margin.top]);

        //console.log(bins)
        var colors = d3.scaleLinear()
            .domain([0, data.length/2,data.length])
            .range(["#DD5555", "#FFCC77","#99FF99"]);

        var bar = g.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

        bar.append("rect")
            .attr("fill",function(d,i){return colors(i);})
            .attr("x", 1)
            .attr("width", function (d){return x(d.x1)-x(d.x0)-1;} /*x(bins[0].x1) - x(bins[0].x0)*/ )
            .attr("height", function(d) { return height - y(d.length) - margin.bottom; });

        bar.append("text")
            .style("font", "10px sans-serif")
            .attr("fill", "#666666")
            .attr("dy", ".75em")
            .attr("y", -12)
            .attr("x", function (d){return (x(d.x1)-x(d.x0)-1)/2;})
            .attr("text-anchor", "middle")
            .text(function(d) { return formatCount(d.length); });

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height-margin.bottom) + ")")
            .style("fill","none")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate("+ margin.left +", 0)")
            .style("fill","none")
            .call(d3.axisLeft(y).ticks(0));

        var gBrush = g.append("g")
            .attr("class", "brush")
            .call(brush);

    };

    this.update = function(data){

        /*var bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(20))
            (data);*/

        var max_y = d3.max(data, function(d) { return d.length; });

        var y = d3.scaleLinear()
            .domain([0,max_y+max_y/3])
            .range([height-margin.bottom, margin.top]);

        var colors = d3.scaleLinear()
            .domain([0, data.length/2,data.length])
            .range(["#DD5555", "#FFCC77","#99FF99"]);

        var bar = g.selectAll(".bar")
            .data(data)
            .transition()
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });


        bar.select("rect")
            //.transition()
            .attr("height", function(d) { return height - y(d.length) - margin.bottom; });

        bar.select("text")
            .transition()
            .text(function(d) { return formatCount(d.length); });

    };

    function brush_move(){
        if (d3.event.sourceEvent.type === "brush") return;

        var s = d3.event.selection;

        d1 = s.map(x.invert).map(x_bins);
        //d1 = d0.map(Math.round);

        if (d1[0] < d1[1]) {

            r=d1.map(x);
            d3.select(this).call(d3.event.target.move, r);

            svg.selectAll("g.bar").classed("deselected", function(d,i) {
                var half = x(d.x0) + (x(d.x1)-x(d.x0)-1)/2;
                selected[i]=!(r[0] > half || half > r[1]);
                return r[0] > half || half > r[1];

            });
            updated();
        }
        else{
            svg.selectAll("g.bar").classed("deselected", false);
            d3.select(this).call(d3.event.target.move, null);
            selected=selected.map(function(v){return false;});
            updated();

        }

    }

    function brush_start(){

    }

    function brush_end(){

        var s = d3.event.selection;
        if (!s){
            selected=selected.map(function(v){return false;});
            svg.selectAll("g.bar").classed("deselected", false);
            updated();
        }
        else{
            //selected.forEach(function(v,i){console.log(i,v);});

        }
    }

    function updated(){
        if(on_change==null) return;

        var result = [];

        var min=null,max=null;
        var i=0;
        for(;i<selected.length;i++){
            if( selected[i] ){
                min=i;
                break;
            }
        }

        for(;i<selected.length;i++){
            if( !selected[i] ){
                max=i-1;
                break;
            }
        }

        if(max==null){
            max=selected.length-1;
        }

        if(min==null){
            min=0;
        }
        //console.log(min,max, [bins[min].x0,bins[max].x1-1]);
        on_change([bins[min].x0,bins[max].x1-1]);

    }

}
