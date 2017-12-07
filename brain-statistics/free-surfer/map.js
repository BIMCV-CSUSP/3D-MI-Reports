function create_map(div){
    var map ={
    "proportion":1.6521739130434783,
    "departments":[
    { "NUM": "1","NAME": "1 - H. Comarcal de Vinaròs","geometry": [[0.6956521739130435,0],[0.7391304347826086,0.02631578947368421],[0.8695652173913043,0.02631578947368421],[0.9130434782608695,0.05263157894736842],[0.9565217391304348,0.05263157894736842],[1,0.07894736842105263],[0.9565217391304348,0.10526315789473684],[0.9565217391304348,0.13157894736842105],[0.8695652173913043,0.18421052631578946],[0.8695652173913043,0.21052631578947367],[0.782608695652174,0.15789473684210525],[0.782608695652174,0.13157894736842105],[0.8260869565217391,0.10526315789473684],[0.782608695652174,0.10526315789473684],[0.7391304347826086,0.13157894736842105],[0.7391304347826086,0.10526315789473684],[0.6956521739130435,0.07894736842105263],[0.6521739130434783,0.07894736842105263],[0.6086956521739131,0.10526315789473684],[0.6086956521739131,0.07894736842105263],[0.5652173913043478,0.05263157894736842],[0.6086956521739131,0.05263157894736842],[0.6086956521739131,0.02631578947368421],[0.6521739130434783,0.02631578947368421]]},
    { "NUM": "2","NAME": "2 - H. General de Castelló","geometry": [[0.6086956521739131,0.10526315789473684],[0.6521739130434783,0.07894736842105263],[0.6956521739130435,0.07894736842105263],[0.7391304347826086,0.10526315789473684],[0.7391304347826086,0.13157894736842105],[0.782608695652174,0.10526315789473684],[0.8260869565217391,0.10526315789473684],[0.782608695652174,0.13157894736842105],[0.782608695652174,0.15789473684210525],[0.8695652173913043,0.21052631578947367],[0.8260869565217391,0.23684210526315788],[0.782608695652174,0.23684210526315788],[0.782608695652174,0.2631578947368421],[0.7391304347826086,0.2894736842105263],[0.7391304347826086,0.3157894736842105],[0.6956521739130435,0.2894736842105263],[0.6521739130434783,0.2894736842105263],[0.5652173913043478,0.23684210526315788],[0.5217391304347826,0.23684210526315788],[0.4782608695652174,0.21052631578947367],[0.4782608695652174,0.18421052631578946],[0.5217391304347826,0.18421052631578946],[0.6086956521739131,0.13157894736842105]]},
    { "NUM": "3","NAME": "3 - H. de La Plana","geometry": [[0.7391304347826086,0.3157894736842105],[0.6956521739130435,0.2894736842105263],[0.6521739130434783,0.2894736842105263],[0.5652173913043478,0.23684210526315788],[0.5217391304347826,0.23684210526315788],[0.4782608695652174,0.21052631578947367],[0.43478260869565216,0.23684210526315788],[0.4782608695652174,0.2631578947368421],[0.5217391304347826,0.2631578947368421],[0.5217391304347826,0.2894736842105263],[0.5652173913043478,0.2894736842105263],[0.5652173913043478,0.3157894736842105],[0.6086956521739131,0.34210526315789475],[0.6956521739130435,0.34210526315789475]]},
    { "NUM": "4","NAME": "4 - H. de Sagunto","geometry": [[0.6956521739130435,0.34210526315789475],[0.6086956521739131,0.34210526315789475],[0.5652173913043478,0.3157894736842105],[0.5652173913043478,0.2894736842105263],[0.5217391304347826,0.2894736842105263],[0.5217391304347826,0.2631578947368421],[0.4782608695652174,0.2631578947368421],[0.43478260869565216,0.23684210526315788],[0.43478260869565216,0.2631578947368421],[0.34782608695652173,0.2631578947368421],[0.34782608695652173,0.3157894736842105],[0.391304347826087,0.3157894736842105],[0.43478260869565216,0.34210526315789475],[0.5217391304347826,0.34210526315789475],[0.5217391304347826,0.3684210526315789],[0.5652173913043478,0.3684210526315789],[0.5652173913043478,0.39473684210526316],[0.6086956521739131,0.42105263157894735],[0.6086956521739131,0.39473684210526316],[0.6521739130434783,0.39473684210526316],[0.6521739130434783,0.3684210526315789]]},
    { "NUM": "5","NAME": "5 - H. La Malva-Rosa \n7 - H. Universitario y Politécnico La Fe \n10 - H. Universitario Dr. Peset","geometry": [[0.5652173913043478,0.39473684210526316],[0.6086956521739131,0.42105263157894735],[0.6086956521739131,0.5],[0.5652173913043478,0.5],[0.5217391304347826,0.47368421052631576],[0.5652173913043478,0.4473684210526316]]},
    { "NUM": "6","NAME": "6 - H. Arnau de Vilanova","geometry": [[0.5652173913043478,0.3684210526315789],[0.5217391304347826,0.3684210526315789],[0.5217391304347826,0.34210526315789475],[0.43478260869565216,0.34210526315789475],[0.391304347826087,0.3157894736842105],[0.30434782608695654,0.3157894736842105],[0.30434782608695654,0.2894736842105263],[0.21739130434782608,0.2894736842105263],[0.17391304347826086,0.2631578947368421],[0.21739130434782608,0.2631578947368421],[0.21739130434782608,0.23684210526315788],[0.17391304347826086,0.23684210526315788],[0.13043478260869565,0.21052631578947367],[0.08695652173913043,0.21052631578947367],[0.043478260869565216,0.23684210526315788],[0.08695652173913043,0.2631578947368421],[0.17391304347826086,0.2631578947368421],[0.21739130434782608,0.2894736842105263],[0.17391304347826086,0.2894736842105263],[0.17391304347826086,0.34210526315789475],[0.21739130434782608,0.3684210526315789],[0.21739130434782608,0.39473684210526316],[0.2608695652173913,0.39473684210526316],[0.30434782608695654,0.42105263157894735],[0.5217391304347826,0.42105263157894735],[0.5652173913043478,0.4473684210526316]]},
    { "NUM": "8","NAME": "8 - H. de Requena","geometry": [[0.17391304347826086,0.34210526315789475],[0.13043478260869565,0.34210526315789475],[0.13043478260869565,0.39473684210526316],[0.043478260869565216,0.39473684210526316],[0.043478260869565216,0.42105263157894735],[0,0.42105263157894735],[0,0.47368421052631576],[0.043478260869565216,0.47368421052631576],[0.08695652173913043,0.5],[0.17391304347826086,0.5],[0.17391304347826086,0.5526315789473685],[0.13043478260869565,0.5789473684210527],[0.13043478260869565,0.6052631578947368],[0.17391304347826086,0.6052631578947368],[0.21739130434782608,0.631578947368421],[0.30434782608695654,0.631578947368421],[0.34782608695652173,0.6052631578947368],[0.30434782608695654,0.5789473684210527],[0.30434782608695654,0.5526315789473685],[0.34782608695652173,0.5526315789473685],[0.34782608695652173,0.5263157894736842],[0.2608695652173913,0.47368421052631576],[0.30434782608695654,0.47368421052631576],[0.34782608695652173,0.4473684210526316],[0.2608695652173913,0.39473684210526316],[0.21739130434782608,0.39473684210526316],[0.21739130434782608,0.3684210526315789]]},
    { "NUM": "9","NAME": "9 - Consorcio H. General Universitario de Valencia","geometry": [[0.5652173913043478,0.4473684210526316],[0.43478260869565216,0.4473684210526316],[0.4782608695652174,0.47368421052631576],[0.391304347826087,0.47368421052631576],[0.391304347826087,0.5],[0.30434782608695654,0.5],[0.34782608695652173,0.5263157894736842],[0.34782608695652173,0.5526315789473685],[0.391304347826087,0.5526315789473685],[0.43478260869565216,0.5263157894736842],[0.43478260869565216,0.5],[0.5652173913043478,0.5],[0.5217391304347826,0.47368421052631576]]},
    { "NUM": "11","NAME": "11 - H. Universitario de La Ribera","geometry": [[0.6086956521739131,0.5],[0.43478260869565216,0.5],[0.43478260869565216,0.5263157894736842],[0.391304347826087,0.5526315789473685],[0.43478260869565216,0.5526315789473685],[0.43478260869565216,0.5789473684210527],[0.6086956521739131,0.5789473684210527],[0.6086956521739131,0.5526315789473685],[0.6521739130434783,0.5789473684210527],[0.6521739130434783,0.5263157894736842]]
    },
    { "NUM": "12","NAME": "12 - H. Francesc de Borja de Gandía","geometry": [[0.6086956521739131,0.5526315789473685],[0.7391304347826086,0.631578947368421],[0.6956521739130435,0.6578947368421053],[0.5652173913043478,0.6578947368421053],[0.5652173913043478,0.631578947368421],[0.6086956521739131,0.631578947368421],[0.6086956521739131,0.6052631578947368],[0.5652173913043478,0.5789473684210527],[0.6086956521739131,0.5789473684210527]]},
    { "NUM": "13","NAME": "13 - H. de Dénia","geometry": [[0.7391304347826086,0.631578947368421],[0.782608695652174,0.631578947368421],[0.8260869565217391,0.6578947368421053],[0.8695652173913043,0.6578947368421053],[0.8695652173913043,0.6842105263157895],[0.782608695652174,0.7368421052631579],[0.7391304347826086,0.7105263157894737],[0.6956521739130435,0.7105263157894737],[0.6086956521739131,0.6578947368421053],[0.6956521739130435,0.6578947368421053]]},
    { "NUM": "14","NAME": "14 - H. Lluis Alcanyís de Xàtiva","geometry": [[0.43478260869565216,0.5526315789473685],[0.30434782608695654,0.5526315789473685],[0.30434782608695654,0.5789473684210527],[0.34782608695652173,0.6052631578947368],[0.30434782608695654,0.631578947368421],[0.2608695652173913,0.631578947368421],[0.30434782608695654,0.6578947368421053],[0.30434782608695654,0.6842105263157895],[0.391304347826087,0.6842105263157895],[0.43478260869565216,0.7105263157894737],[0.4782608695652174,0.7105263157894737],[0.5217391304347826,0.6842105263157895],[0.4782608695652174,0.6578947368421053],[0.5652173913043478,0.6578947368421053],[0.5652173913043478,0.631578947368421],[0.6086956521739131,0.631578947368421],[0.6086956521739131,0.6052631578947368],[0.5652173913043478,0.5789473684210527],[0.43478260869565216,0.5789473684210527]]},
    { "NUM": "15","NAME": "15 - H. Virgen de Los Lirios","geometry": [[0.4782608695652174,0.6578947368421053],[0.6086956521739131,0.6578947368421053],[0.6521739130434783,0.6842105263157895],[0.6086956521739131,0.7105263157894737],[0.6086956521739131,0.7368421052631579],[0.5217391304347826,0.7368421052631579],[0.4782608695652174,0.7631578947368421],[0.4782608695652174,0.7894736842105263],[0.43478260869565216,0.7631578947368421],[0.391304347826087,0.7631578947368421],[0.43478260869565216,0.7368421052631579],[0.391304347826087,0.6842105263157895],[0.43478260869565216,0.7105263157894737],[0.4782608695652174,0.7105263157894737],[0.5217391304347826,0.6842105263157895]]
    },
    { "NUM": "16","NAME": "16 - H. de La Marina Baixa","geometry": [[0.6521739130434783,0.6842105263157895],[0.6956521739130435,0.7105263157894737],[0.7391304347826086,0.7105263157894737],[0.782608695652174,0.7368421052631579],[0.7391304347826086,0.7368421052631579],[0.7391304347826086,0.7631578947368421],[0.6521739130434783,0.7631578947368421],[0.6086956521739131,0.7894736842105263],[0.6086956521739131,0.7631578947368421],[0.5652173913043478,0.7631578947368421],[0.5652173913043478,0.7368421052631579],[0.6086956521739131,0.7368421052631579],[0.6086956521739131,0.7105263157894737]]},
    { "NUM": "17","NAME": "17 - H. Universitario San Juan de Alicante","geometry": [[0.6115942028985507,0.7631578947368421],[0.5652173913043478,0.7631578947368421],[0.5652173913043478,0.7368421052631579],[0.5217391304347826,0.7368421052631579],[0.4782608695652174,0.7631578947368421],[0.4782608695652174,0.7894736842105263],[0.5217391304347826,0.7894736842105263],[0.5217391304347826,0.8157894736842105],[0.5652173913043478,0.8157894736842105],[0.6115942028985507,0.7894736842105263]]},
    { "NUM": "18","NAME": "18 - H. General de Elda-Virgen de la Salud","geometry": [[0.30434782608695654,0.6842105263157895],[0.391304347826087,0.6842105263157895],[0.43478260869565216,0.7368421052631579],[0.391304347826087,0.7631578947368421],[0.43478260869565216,0.7631578947368421],[0.4782608695652174,0.7894736842105263],[0.43478260869565216,0.7894736842105263],[0.391304347826087,0.8157894736842105],[0.43478260869565216,0.8421052631578947],[0.391304347826087,0.8421052631578947],[0.34782608695652173,0.868421052631579],[0.30434782608695654,0.868421052631579],[0.21739130434782608,0.8157894736842105],[0.2608695652173913,0.7894736842105263],[0.2608695652173913,0.7368421052631579],[0.30434782608695654,0.7105263157894737]]},
    { "NUM": "19","NAME": "19 - H. General Universitario de Alicante","geometry": [[0.5652173913043478,0.8157894736842105],[0.5217391304347826,0.8157894736842105],[0.5217391304347826,0.7894736842105263],[0.43478260869565216,0.7894736842105263],[0.391304347826087,0.8157894736842105],[0.43478260869565216,0.8421052631578947],[0.4782608695652174,0.8421052631578947],[0.5217391304347826,0.868421052631579],[0.5217391304347826,0.8421052631578947]]},
    { "NUM": "20","NAME": "20 - H. General de Elche","geometry": [[0.391304347826087,0.8421052631578947],[0.4782608695652174,0.8421052631578947],[0.5217391304347826,0.868421052631579],[0.5217391304347826,0.8947368421052632],[0.4782608695652174,0.8947368421052632]]},
    { "NUM": "21","NAME": "21 - H. de la Agència Valenciana de Salut Vega Baja","geometry": [[0.30434782608695654,0.868421052631579],[0.2608695652173913,0.8947368421052632],[0.2608695652173913,0.9210526315789473],[0.30434782608695654,0.9473684210526315],[0.34782608695652173,0.9473684210526315],[0.391304347826087,0.9210526315789473],[0.391304347826087,0.8947368421052632],[0.34782608695652173,0.868421052631579]]},
    { "NUM": "22","NAME": "22 - H. de Torrevieja","geometry": [[0.391304347826087,0.8947368421052632],[0.43478260869565216,0.8947368421052632],[0.4782608695652174,0.9210526315789473],[0.4782608695652174,0.9473684210526315],[0.391304347826087,1],[0.30434782608695654,0.9473684210526315],[0.34782608695652173,0.9473684210526315],[0.391304347826087,0.9210526315789473]]},
    { "NUM": "23","NAME": "23 - H. de Manises","geometry": [[0.5217391304347826,0.42105263157894735],[0.30434782608695654,0.42105263157894735],[0.34782608695652173,0.4473684210526316],[0.30434782608695654,0.47368421052631576],[0.2608695652173913,0.47368421052631576],[0.30434782608695654,0.5],[0.391304347826087,0.5],[0.391304347826087,0.47368421052631576],[0.4782608695652174,0.47368421052631576],[0.43478260869565216,0.4473684210526316],[0.5652173913043478,0.4473684210526316]]},
    { "NUM": "24","NAME": "24 - H. del Vinalopó","geometry": [[0.391304347826087,0.8421052631578947],[0.34782608695652173,0.868421052631579],[0.391304347826087,0.8947368421052632],[0.43478260869565216,0.8947368421052632],[0.4782608695652174,0.9210526315789473],[0.4782608695652174,0.8947368421052632]]},
    ]
    };


    var area = d3.select(div);

    margin = 6;
    var bb = area.node().getBoundingClientRect();
    var real_width = bb.width-margin*2;
    var real_height = bb.height-margin*2;

    var width,height;
    if(real_width*map.proportion>real_height){
        height = real_height;
        width = real_height / map.proportion;
    }
    else{
        width = real_width;
        height = real_width * map.proportion;
    }


    var scale_x = d3.scaleLinear()
        .domain([0,1])
        .range([0,width]);
    var scale_y = d3.scaleLinear()
        .domain([0,1])
        .range([0,height]);

    var lineFunction = d3.line()
         //.curve(d3.curveBasis)
         .x(function(d) { return scale_x(+d[0]); })
         .y(function(d) { return scale_y(+d[1]); });

    var selected = map.departments.map(function(d){return false;});
    //The SVG Container
    var svgContainer = area.append("svg")
       .attr("width", width)
       .attr("height", height)
       .attr("transform", "translate(" + ((real_width/2 - width/2)+margin) + "," + ((real_height/2-height/2)+margin) + ")");



    div = area.append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var g = svgContainer.selectAll("path")
        .data(map.departments)
        .enter().append("g")
        .attr("class", "dep hoverable")
        .on("click",function(d,i){
            if(selected.every(function(v){return v==false;})){
                svgContainer.selectAll("g").attr("class","dep hoverable deselected");
            }
            if(selected[i]==false)
                d3.select(this).attr("class","dep hoverable");
            else
                d3.select(this).attr("class","dep hoverable deselected");
            selected[i]=!selected[i];
            if(selected.every(function(v){return v==false;})){
                svgContainer.selectAll("g").attr("class","dep hoverable");
            }
            updated();
        });
    var lineGraph = g.append("path")
        .attr("d", function(d){return lineFunction(d.geometry)+'Z'; })
        .attr("fill","#e08465")
        .attr("stroke-width","1px")
        .style("stroke","white");

        /*.on("mouseover", function(d) {
            div.transition()
               .duration(200)
               .style("opacity", .9);
            div.html(d.NAME)
               .style("left", (d3.event.pageX) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })*/
    g.append("title")
        .text(function(d){return d.NAME;});

    var on_change = null;

    this.set_on_change = function(f){
        on_change = f;
    };

    function updated(){
        if(on_change==null) return;

        on_change(selected);

    }
}
