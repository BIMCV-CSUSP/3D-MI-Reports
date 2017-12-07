function PartHistogram(div){

    palette = ['#bdd7e7','#6baed6','#3182bd','#08519c','#bae4b3','#74c476','#31a354','#006d2c','#fcae91','#fb6a4a','#de2d26','#a50f15','#cbc9e2','#9e9ac8','#756bb1','#54278f','#fdbe85','#fd8d3c','#e6550d','#a63603','#a1dab4','#41b6c4','#2c7fb8','#253494'];

    var area = d3.select(div);
    var bb = area.node().getBoundingClientRect();

    var width = bb.width,
        height = 4*bb.height/5,
        radius = Math.min(width, height) / 3,
        label_area = 0.3;

    var svg = area.append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    svg.append("text")
        .attr("x",width / 2-width*label_area/2)
        .attr("y", bb.height/12)
        .attr("text-anchor", "end")
        .style("font-weight", "bold")
        .text("Left Hemisphere");

    svg.append("text")
        .attr("x",width / 2+width*label_area/2)
        .attr("y", bb.height/12)
        .attr("text-anchor", "start")
        .style("font-weight", "bold")
        .text("Right Hemisphere");

    svg = svg.append("g").attr("transform","translate(0,"+(bb.height/2-height/2)+")");

    var lines_section = svg.append("g");


    var x_left = d3.scaleLinear()
        .range([0,(5*width/6)/2-width*label_area/2]);
    var x_right = d3.scaleLinear()
        .range([0,(5*width/6)/2-width*label_area/2]);

    //var color = d3.scaleOrdinal()
    //    .range(["#8888FF", "#FF8888", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var y =d3.scaleBand()
        .rangeRound([0, height], 0.1)
		.paddingInner(0.1);

    var f = d3.format(".2s");

    this.fill = function(data){





        colors = d3.scaleOrdinal()
            .domain(data.map(function(d){return d.key;}))
            .range(palette);

        var max = d3.max([d3.max(data, function(d) { return d.value_lh; }),d3.max(data, function(d) { return d.value_rh; })]);
        x_left.domain([0, max]);
        x_right.domain([0, max]);
        y.domain(data.map(function(d) { return d.key; }));



        //generation of lines
        var line_pos = [];
        var increments = max > 10 ? max > 100 ? 500 : 1 : 0.1;
        for (var x = 0; x <= max; x+=increments ){
            line_pos.push(x);
        }

        lines_section.selectAll("g.line_right")
            .data(line_pos, function(d){return d;})
            .enter()
            .append("g")
            .attr("class","line_right")
            .attr("transform", function(d){return "translate("+ (width/2 + width*label_area/2 + x_left(d))  +", 0)";})
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height)
            .attr("stroke-width", 1)
            .attr("stroke", "lightgray");

        lines_section.selectAll("g.line_left")
            .data(line_pos, function(d){return d;})
            .enter()
            .append("g")
            .attr("class","line_left")
            .attr("transform", function(d){return "translate("+ (width/2 - width*label_area/2 - x_left(d))  +", 0)";})
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height)
            .attr("stroke-width", 1)
            .attr("stroke", "lightgray");



        var bar = svg.selectAll(".bar")
                .data(data)
            .enter().append("g")
            .attr("class","bar hoverable");

        //left
        bar.append("rect")
            .attr("class","left")
            .style("fill",function(d,i){return colors(d.key);})
            .attr("height", y.bandwidth())
            .attr("width", function (d) {
                return x_left(d.value_lh);
            })
            .attr("x", function (d) {
                return width/2 - width*label_area/2 - x_left(d.value_lh);
            })
            .attr("y", function (d) {
                return y(d.key);
            })
            .append("title")
                .text(function(d){return "min: "+f(d.min_lh)+"\naverage: " + f(d.value_lh)+ "\nmax: "+f(d.max_lh);});

        /*bar.append("text")
            .attr("x", function (d) {
                return width/2 - width*label_area/2 - x_left(d.value_lh)-20;
            })
            .attr("y", function (d) {
                return y(d.key) + y.bandwidth()-2;
            })
            .attr("text-anchor", "end")
            .style("font-size",(y.bandwidth()-2)+"px")
            .text(function(d){return f(d.value_lh);});*/

        //right
        bar.append("rect")
            .attr("class","right")
            .style("fill",function(d,i){return colors(d.key);})
            .attr("height", y.bandwidth())
            .attr("width", function (d) {
                return x_left(d.value_rh);
            })
            .attr("x", width/2 + width*label_area/2)
            .attr("y", function (d) {
                return y(d.key);
            })
            .append("title")
                .text(function(d){return "min: "+f(d.min_rh)+"\naverage: " + f(d.value_rh)+ "\nmax: "+f(d.max_rh);});

        /*bar.append("text")
            .attr("x", function (d) {
                return width/2 + width*label_area/2 + x_left(d.value_lh)+20;
            })
            .attr("y", function (d) {
                return y(d.key) + y.bandwidth()-2;
            })
            .attr("text-anchor", "end")
            .style("font-size",(y.bandwidth()-2)+"px")
            .text(function(d){return f(d.value_rh);});*/

        //center
        bar.append("text")
            .attr("x", function (d) {
                return width/2;
            })
            .attr("y", function (d) {
                return y(d.key) + y.bandwidth()-2;
            })
            .attr("text-anchor", "middle")
            .style("font-size",(y.bandwidth()-2)+"px")
            .text(function(d){return d.key;});





    };

    this.update = function(data){
        var bars = svg.selectAll("g.bar").data(data);
        /*bars.exit().remove();
        bars.enter.*/
        //bars.transition();

        var max=d3.max(
            [d3.max(data, function(d) { return d.value_lh; }),
            d3.max(data, function(d) { return d.value_rh; })]);

        //x_left.domain([0, d3.max(data, function(d) { return d.value_lh; })]);
        //x_right.domain([0, d3.max(data, function(d) { return d.value_rh; })]);

        x_left.domain([0, max]);
        x_right.domain([0,max]);





        //update of lines
        var line_pos = [];
        var increments = max > 10 ? max > 100 ? 500 : 1 : 0.1;
        for (var x = 0; x <= max; x+=increments ){
            line_pos.push(x);//compute the index of each one
        }

        var line_right_selection = lines_section.selectAll("g.line_right")
            .data(line_pos, function(d){return d;}); //assign new data


        line_right_selection.exit() //select the lines that don't exists anymore
            .style("stroke-opacity",1) //set a start transparency of 1
            .transition()
            .attr("transform", function(d){return "translate("+ (width)  +", 0)";}) //move the line to the end
            .style("stroke-opacity",0) //while fadding out
            .remove(); //last, remove the line from the page

        line_right_selection.transition() //update the existing lines
            .attr("transform", function(d){return "translate("+ (width/2 + width*label_area/2 + x_left(d))  +", 0)";});

        var new_lines_right = line_right_selection.enter() // select the new lines and add the starting attributes
            .append("g")
            .attr("class","line_right")
            .attr("transform", function(d){return "translate("+ (width)  +", 0)";})
            .style("stroke-opacity",0);


        new_lines_right.transition() // append the proper lline element
            .attr("transform", function(d){return "translate("+ (width/2 + width*label_area/2 + x_left(d))  +", 0)";})
            .style("stroke-opacity",1);


        new_lines_right.append("line") // animate the line container to get in the correct position
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height)
            .attr("stroke-width", 1)
            .attr("stroke", "lightgray");


        //do the same for the left side
        var line_left_selection = lines_section.selectAll("g.line_left")
            .data(line_pos, function(d){return d;}); //assign new data


        line_left_selection.exit() //select the lines that don't exists anymore
            .style("stroke-opacity",1) //set a start transparency of 1
            .transition()
            .attr("transform", function(d){return "translate(0, 0)";}) //move the line to the end
            .style("stroke-opacity",0) //while fadding out
            .remove(); //last, remove the line from the page

        line_left_selection.transition() //update the existing lines
            .attr("transform", function(d){return "translate("+ (width/2 - width*label_area/2 - x_left(d))  +", 0)";});

        var new_lines_left = line_left_selection.enter() // select the new lines and add the starting attributes
            .append("g")
            .attr("class","line_left")
            .attr("transform", function(d){return "translate( 0, 0)";})
            .style("stroke-opacity",0);


        new_lines_left.transition() // animate the line container to get in the correct position
            .attr("transform", function(d){return "translate("+ (width/2 - width*label_area/2 - x_left(d))  +", 0)";})
            .style("stroke-opacity",1);


        new_lines_left.append("line") // append the proper line element
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height)
            .attr("stroke-width", 1)
            .attr("stroke", "lightgray");








        bars.select("rect.left")
            .transition()
                .attr("width", function (d) {
                    var value = x_left(d.value_lh);
                    return isNaN(value)?0:value;
                })
                .attr("x", function (d) {
                    var value = width/2 - width*label_area/2 - x_left(d.value_lh);
                    return isNaN(value)?width/2 - width*label_area/2:value;
                })
                .select("title")
                    .text(function(d){
                        return "min: "+f(d.min_lh)+"\naverage: " + f(d.value_lh)+ "\nmax: "+f(d.max_lh);
                    });

        bars.select("rect.right")
            .transition()
                .attr("width", function (d) {
                    var value = x_left(d.value_rh);
                    return isNaN(value)?0:value;
                })
                .select("title")
                    .text(function(d){return "min: "+f(d.min_rh)+"\naverage: " + f(d.value_rh)+ "\nmax: "+f(d.max_rh);});
        bars.select("text")
            .text(function(d){return d.key;});

    };

}
