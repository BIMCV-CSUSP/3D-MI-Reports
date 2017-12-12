function Donut(div){

    var area = d3.select(div);

    var bb = area.node().getBoundingClientRect();

    var width = bb.width,
    height = bb.height,
    radius = Math.min(width, height) / 3;

    //var color = d3.scaleOrdinal()
    //    .range(["#8888FF", "#FF8888", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var color = {M:"#8888DD", F:"#F590E5", MO:"#AAAAFF", FO:"#F6A1F6", Male:"#8888DD", Female:"#F590E5", UNKNOWN:"#8822DD"};

    var arc = d3.arc()
        .cornerRadius(5)
        .padAngle(0.025)
        .outerRadius(radius - 10)
        .innerRadius(radius - 60);

    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.value; });

    var svg = area.append("div")
        .classed("svg-container", true)
        .style("width","100%")
        .style("padding-bottom", "82%")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width +" "+width*0.82)
        .classed("svg-content-responsive", true);
    svg.append("text")
        .attr("x",width / 2)
        .attr("y",height / 2 - radius)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Gender");

    svg = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var format = d3.format(".2%");

    var selected = [false,false];
    var keys;

    var on_change = null;

    this.set_on_change = function(f){
        on_change = f;
    };

    this.fill = function(data){
        //selected = data.map(function(v){return false;});
        keys = data.map(function(d){return d.key;});
        var g = svg.selectAll(".arc")
              .data(pie(data),function(d){return d.data.key;})
            .enter().append("g")
              .attr("class", "arc hoverable")
              .on("click",function(d,i){
                  if(selected[i]==false){
                      svg.selectAll(".arc").attr("class",function(d,j){
                          if(i==j) return "arc hoverable";
                          else return "arc hoverable deselected";
                      });
                      selected[i]=true;
                      selected[1-i]=false;
                  }
                  else{
                      svg.selectAll(".arc").attr("class","arc hoverable");
                      selected[i]=false;
                      selected[1-i]=false;
                  }
                  updated();
              });

        g.append("path")
            .attr("d", arc)
            .attr("fill", function(d) { return color[d.data.key]; });

        g.append("title")
            .text(function(d){return d.data.key + ": " + format((d.endAngle - d.startAngle)/(2*Math.PI)); });

        /*g.append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .text(function(d) { return d.data.key; });
            */

        var legendRectSize=15;

        var legendSpacing=7;
        var legendHeight=legendRectSize+legendSpacing;

        var legend=svg.selectAll('.legend')
            .data(data,function(d){return d.key;})
            .enter().append('g')
            .attr("class","legend")
            .attr("transform",function(d,i){ return 'translate(-20,' + ((i*legendHeight)-20) + ')';});

        legend.append('rect')
            .attr("width",legendRectSize)
            .attr("height",legendRectSize)
            .attr("rx",20)
            .attr("ry",20)
            .style("fill",function(d){ return  color[d.key];})
            .style("stroke",function(d){return color[d.key];});


        legend.append('text')
            .attr("x",30)
            .attr("y",15)
            .text(function(d){return d.key;})
            .style("fill","black")
            .style("font-size","12px");
    };

    this.update = function(data){

        var g = svg.selectAll(".arc")
            .data(pie(data),function(d){return d.data.key;});

        svg.selectAll("path")
            .data(pie(data),function(d){return d.data.key;})
            .transition()
            .attrTween("d", arcTween);

        svg.selectAll("title")
            .data(pie(data),function(d){return d.data.key;})
            .text(function(d){return d.data.key + ": " + format((d.endAngle - d.startAngle)/(2*Math.PI)) ;});


    };

    function updated(){
        if(on_change==null) return;

        var result = [];

        selected.forEach(function(v,i){
            if(v) result.push(keys[i]);

        });

        if(result.length==0){
            keys.forEach(function(v){ result.push(v); });
        }
        on_change(result);

    }

    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function (t) {
            return arc(i(t));
        };
    }
}
