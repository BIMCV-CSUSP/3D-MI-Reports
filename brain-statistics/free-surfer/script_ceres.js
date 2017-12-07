selections = {
    "gender":null,
    "ages":null,
    "departments":null
};

var gender_donut = new Donut("#gender");
gender_donut.set_on_change( function(values){
    selections.gender=values;
    update_graph(d3.select('input[name="selector"]:checked').node().value);

});

var ages_hist = new Ages("#ages");
ages_hist.set_on_change(function(values){
    selections.ages=values;
    update_graph(d3.select('input[name="selector"]:checked').node().value);

});

var part_histogram = new PartHistogram("#charts");
create_map("#map");



//fill the initial page
fill_graph(d3.select('input[name="selector"]:checked').node().value);

d3.selectAll("input[name='selector']")
    .on("change",function(){
        update_graph(this.value);
    });

function fill_graph(option){
    var file_name = "data/CERES.csv";


    d3.queue()
    	.defer(d3.csv, file_name)
    	.await(load_data);



    function load_data(error,file){

        console.log(file);

        var gender = d3.nest()
            .key(function(d) { return d["Sex"];})
            .sortKeys(d3.ascending)
            .rollup(function(d) {
                return d.length;
                //return d3.sum(d, function(g) {return g.value; });
            })
            .entries(file);
        console.log("columns");

        var ages =[];
        file.forEach(function(d) {
            ages.push(d["Age"]);
        });

        var columns = [ "I-II", "III", "IV", "VI", "Crus I", "Crus II", "VIIB", "VIIIA", "VIIIB", "IX", "X" ];
        var averages = [];
        console.log(columns);

        columns.forEach(function(column) {
            averages.push({
                key: column,
                value_lh: d3.mean(file, function(d) { return +d[""+column+" "+option]; }),
                value_rh: d3.mean(file, function(d) { return +d[""+column+" "+option]; }),
                max_lh: d3.max(file, function(d) { return +d[""+column+" "+option]; }),
                max_rh: d3.max(file, function(d) { return +d[""+column+" "+option]; }),
                min_lh: d3.min(file, function(d) { return +d[""+column+" "+option]; }),
                min_rh: d3.min(file, function(d) { return +d[""+column+" "+option]; }),
            });

        });
        console.log(averages);

        //console.log(averages[0]);



        gender_donut.fill(gender);
        ages_hist.fill(ages);
        part_histogram.fill(averages);
    }
}


var updating_data=false;
function update_graph(option){
    if(updating_data) return; //check if not updating

    var file_name = "data/CERES.csv";

    updating_data = true; //mark as updating to avoid performance issues


    d3.queue()
        .defer(d3.csv, file_name)
    	.await(load_data);



    function load_data(error, file){

        console.log(file);
        var gender = d3.nest()
            .key(function(d) { return d["Sex"];})
            //.sortKeys(function (a,b){return a-b;})
            .rollup(function(d) {
                return d.length;
                //return d3.sum(d, function(g) {return g.value; });
            })
            .sortKeys(d3.ascending)
            .entries(file.filter(function(v){
                if(selections.ages==null || (selections.ages[0]<=v["Age"] && selections.ages[1]>=v["Age"]))
                    return v;
            }));


        var ages =[];
        file.forEach(function(v) {
            if(selections.gender==null || selections.gender.indexOf(v["Sex"])>=0 )
                ages.push(v["Age"]);
        });




        file=file.filter(function(v){
            if((selections.ages==null || (selections.ages[0]<=v["Age"] && selections.ages[1]>=v["Age"])) &&
               (selections.gender==null || selections.gender.indexOf(v["Sex"])>=0 )){
                return v;
            }
        });

        var columns = [ "I-II", "III", "IV", "VI", "Crus I", "Crus II", "VIIB", "VIIIA", "VIIIB", "IX", "X" ];
        var averages = [];
        console.log(columns);

        columns.forEach(function(column) {
            averages.push({
                key: column,
                value_lh: d3.mean(file, function(d) { return +d[column+" "+option]; }),
                value_rh: d3.mean(file, function(d) { return +d[column+" "+option]; }),
                max_lh: d3.max(file, function(d) { return +d[column+" "+option]; }),
                max_rh: d3.max(file, function(d) { return +d[column+" "+option]; }),
                min_lh: d3.min(file, function(d) { return +d[column+" "+option]; }),
                min_rh: d3.min(file, function(d) { return +d[column+" "+option]; }),
            });

        });

        console.log(averages);

        //console.log(averages[0]);



        gender_donut.update(gender);
        ages_hist.update(ages);
        part_histogram.update(averages);

        updating_data=false;
    }
}
