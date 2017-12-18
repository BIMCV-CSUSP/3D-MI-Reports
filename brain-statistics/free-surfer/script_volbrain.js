selections = {
    "gender":null,
    "ages":null,
    "departments":null
};

var gender_donut = new Donut("#gender");
gender_donut.set_on_change( function(values){
    selections.gender=values;
    update_graph(null);

});

var ages_hist = new Ages("#ages");
ages_hist.set_on_change(function(values){
    selections.ages=values;
    update_graph(null);

});

var part_histogram = new PartHistogram("#charts");
var map = new create_map("#map");

map.set_on_change(function(values){
    selections.departments = values;

    update_graph(null);
});


//fill the initial page
fill_graph(null);

d3.selectAll("input[name='selector']")
    .on("change",function(){
        update_graph(this.value);
    });

function fill_graph(option){
    var file_name = "data/volBrain.csv";


    d3.queue()
    	.defer(d3.csv, file_name)
    	.await(load_data);



    function load_data(error,file){

        var gender = d3.nest()
            .key(function(d) { return d.Sex;})
                .sortKeys(d3.ascending)
                .rollup(function(d) {
                return d.length;
                //return d3.sum(d, function(g) {return g.value; });
            })
            .entries(file);


        var ages =[];
        file.forEach(function(d) {
            ages.push(d.Age);
        });

        var columns = [ "Lateral ventricles", "Caudate", "Putamen", "Thalamus", "Globus Pallidus", "Hippocampus", "Amygdala", "Accumbens"];
        var averages = [];

        columns.forEach(function(column) {
            averages.push({
                key: column,
                value_lh: d3.mean(file, function(d) { return +d[""+column+" "+"Left"+" cm3"]; }),
                value_rh: d3.mean(file, function(d) { return +d[""+column+" "+"Right"+" cm3"]; }),
                max_lh: d3.max(file, function(d) { return +d[""+column+" "+"Left"+" cm3"]; }),
                max_rh: d3.max(file, function(d) { return +d[""+column+" "+"Right"+" cm3"]; }),
                min_lh: d3.min(file, function(d) { return +d[""+column+" "+"Left"+" cm3"]; }),
                min_rh: d3.min(file, function(d) { return +d[""+column+" "+"Right"+" cm3"]; }),
            });

        });

        //console.log(averages[0]);



        gender_donut.fill(gender);
        ages_hist.fill(ages);
        part_histogram.fill(averages);
    }
}


var updating_data=false;
function update_graph(option){
    var file_name = "data/volBrain.csv";


    d3.queue()
    	.defer(d3.csv, file_name)
    	.await(load_data);

    updating_data = true;

    function load_data(error,file){


        var gender = d3.nest()
            .key(function(d) { return d.Sex;})
            //.sortKeys(function (a,b){return a-b;})
            .rollup(function(d) {
                return d.length;
                //return d3.sum(d, function(g) {return g.value; });
            })
            .sortKeys(d3.ascending)
            .entries(file.filter(function(v){
                if((selections.ages==null || (selections.ages[0]<=v.Age && selections.ages[1]>=v.Age)) &&
                ( selections.departments==null || selections.departments.indexOf(v.Department)>=0  ))
                    return v;
            }));


        var ages =[];
        file.forEach(function(v) {
            if((selections.gender==null || selections.gender.indexOf(v.Sex)>=0 ) &&
            ( selections.departments==null || selections.departments.indexOf(v.Department)>=0  ))
                ages.push(v.Age);
        });


        file=file.filter(function(v){
            if((selections.ages==null || (selections.ages[0]<=v.Age && selections.ages[1]>=v.Age)) &&
               (selections.gender==null || selections.gender.indexOf(v.Sex)>=0 )&&
               ( selections.departments==null || selections.departments.indexOf(v.Department)>=0  )){
                return v;
            }
        });

        var columns = [ "Lateral ventricles", "Caudate", "Putamen", "Thalamus", "Globus Pallidus", "Hippocampus", "Amygdala", "Accumbens" ];
        var averages = [];

        columns.forEach(function(column) {
            averages.push({
                key: column,
                value_lh: d3.mean(file, function(d) { return +d[""+column+" "+"Left"+" cm3"]; }),
                value_rh: d3.mean(file, function(d) { return +d[""+column+" "+"Right"+" cm3"]; }),
                max_lh: d3.max(file, function(d) { return +d[""+column+" "+"Left"+" cm3"]; }),
                max_rh: d3.max(file, function(d) { return +d[""+column+" "+"Right"+" cm3"]; }),
                min_lh: d3.min(file, function(d) { return +d[""+column+" "+"Left"+" cm3"]; }),
                min_rh: d3.min(file, function(d) { return +d[""+column+" "+"Right"+" cm3"]; }),
            });

        });

        //console.log(averages[0]);



        gender_donut.fill(gender);
        ages_hist.update(ages);
        part_histogram.fill(averages);

        updating_data=false;
    }
}
