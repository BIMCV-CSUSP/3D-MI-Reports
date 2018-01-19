selections = {
    "gender":null,
    "ages":null,
    "departments":null,
};

var gender_donut = new Donut("#gender");
gender_donut.set_on_change( function(values){
    selections.gender=values;
    update_graph(null);

});

var ages_hist = new BinnedHistogram("#ages");
ages_hist.set_on_change(function(values){
    selections.ages=values;
    update_graph(null);

});

var part_histogram = new PartHistogram("#cerchart_1");
var part_histogram2 = new PartHistogram("#cerchart_2");
var part_histogram3 = new PartHistogram("#cerchart_3");
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
    var file_name = "data/CERES_pre.csv";


    d3.queue()
    	.defer(d3.csv, file_name)
    	.await(load_data);



    function load_data(error,file){

        var g_conversor = {"Female":"F","Male":"M", "UNKNOWN":"U"};

        var gender = d3.nest()
            .key(function(d) { return g_conversor[d.Sex];})
            .sortKeys(d3.ascending)
            .rollup(function(d) {
                //return d.length;
                return d3.sum(d, function(g) {return g.count; });
            })
            .entries(file);

        /*var ages =[];
        file.forEach(function(d) {
            ages.push(d.Age);
        });*/

        var ages = d3.nest()
            .key(function(d) { return d.Age;})
            .rollup(function(d) {
                //return d.length;
                return d3.sum(d, function(g) {return g.count; });
            })
            .entries(file)
            .filter(function(v){if( !isNaN(v.key) ) return v;})
            .map(function(group){
                return {x0: parseInt(group.key),
                        x1: parseInt(group.key) + 5,
                        length: group.value};

            });
        ages.sort(function(a,b){return a.x0-b.x0;});


        var columns = [ "I-II", "III", "IV", "V", "VI", "Crus I", "Crus II", "VIIB", "VIIIA", "VIIIB", "IX", "X" ];
        var names = {"I-II":"Lobules I,II", "III": "Lobule III", "IV": "Lobule IV", "V": "Lobule V", "VI": "Lobule VI", "Crus I": "Crus I" , "Crus II": "Crus II", "VIIB":"Lobule VIIB", "VIIIA":"Lobule VIIIA", "VIIIB":"Lobule VIIIB", "IX":"Lobule IX", "X":"Lobule X"};
        var averages = [];
        var averages_2 = [];
        var averages_3 = [];

        var num_subjects = d3.sum(file, function(d){ return +d.count;});

        columns.forEach(function(column) {
            averages.push({
                key: names[column],
                value_lh: d3.sum(file, function(d) { return +d["average_"+column+" left "+"cm3"]*(+d.count/num_subjects); }),
                value_rh: d3.sum(file, function(d) { return +d["average_"+column+" right "+"cm3"]*(+d.count/num_subjects); }),
                max_lh: d3.max(file, function(d) { return +d["max_"+column+" left "+"cm3"]; }),
                max_rh: d3.max(file, function(d) { return +d["max_"+column+" right "+"cm3"]; }),
                min_lh: d3.min(file, function(d) { return +d["min_"+column+" left "+"cm3"]; }),
                min_rh: d3.min(file, function(d) { return +d["min_"+column+" right "+"cm3"]; }),
            });

            averages_2.push({
                key: names[column],
                value_lh: d3.sum(file, function(d) { return +d["average_"+column+" left "+"grey matter cm3"]*(+d.count/num_subjects); }),
                value_rh: d3.sum(file, function(d) { return +d["average_"+column+" right "+"grey matter cm3"]*(+d.count/num_subjects); }),
                max_lh: d3.max(file, function(d) { return +d["max_"+column+" left "+"grey matter cm3"]; }),
                max_rh: d3.max(file, function(d) { return +d["max_"+column+" right "+"grey matter cm3"]; }),
                min_lh: d3.min(file, function(d) { return +d["min_"+column+" left "+"grey matter cm3"]; }),
                min_rh: d3.min(file, function(d) { return +d["min_"+column+" right "+"grey matter cm3"]; }),
            });

            averages_3.push({
                key: names[column],
                value_lh: d3.sum(file, function(d) { return +d["average_"+column+" left "+"cortical thickness"]*(+d.count/num_subjects); }),
                value_rh: d3.sum(file, function(d) { return +d["average_"+column+" right "+"cortical thickness"]*(+d.count/num_subjects); }),
                max_lh: d3.max(file, function(d) { return +d["max_"+column+" left "+"cortical thickness"]; }),
                max_rh: d3.max(file, function(d) { return +d["max_"+column+" right "+"cortical thickness"]; }),
                min_lh: d3.min(file, function(d) { return +d["min_"+column+" left "+"cortical thickness"]; }),
                min_rh: d3.min(file, function(d) { return +d["min_"+column+" right "+"cortical thickness"]; }),
            });
        });

        //console.log(averages[0]);



        gender_donut.fill(gender);
        ages_hist.fill(ages);
        part_histogram.fill(averages);
        part_histogram2.fill(averages_2);
        part_histogram3.fill(averages_3);
    }
}


var updating_data=false;
function update_graph(option){
    if(updating_data) return; //check if not updating

    var file_name = "data/CERES_pre.csv";

    updating_data = true; //mark as updating to avoid performance issues


    d3.queue()
        .defer(d3.csv, file_name)
    	.await(load_data);



    function load_data(error, file){

        var g_conversor = {"Female":"F","Male":"M", "UNKNOWN":"U"};

        var gender = d3.nest()
            .key(function(d) { return g_conversor[d.Sex];})
            //.sortKeys(function (a,b){return a-b;})
            .rollup(function(d) {
                //return d.length;
                return d3.sum(d, function(g) {return g.count; });
            })
            .sortKeys(d3.ascending)
            .entries(file.filter(function(v){
                if( (selections.ages==null || (selections.ages[0]<=v.Age && selections.ages[1]>=v.Age) ) &&
                        ( selections.departments==null || selections.departments.indexOf(v.Department)>=0  ) )
                    return v;
            }));


        /*var ages =[];
        file.forEach(function(v) {
            if((selections.gender==null || selections.gender.indexOf(g_conversor[v.Sex])>=0 ) && ( selections.departments==null || selections.departments.indexOf(v.Department)>=0 ) )
                ages.push(v.Age);
        });*/
        var ages = d3.nest()
            .key(function(d) { return d.Age;})
            .rollup(function(d) {
                //return d.length;
                return d3.sum(d, function(g) {return g.count; });
            })
            .entries(file.filter(function(v){
                if((selections.gender==null || selections.gender.indexOf(g_conversor[v.Sex])>=0 ) &&
                ( selections.departments==null || selections.departments.indexOf(v.Department)>=0  ))
                    return v;
            }))
            .filter(function(v){if( !isNaN(v.key) ) return v;})
            .map(function(group){
                return {x0: parseInt(group.key),
                        x1: parseInt(group.key) + 5,
                        length: group.value};

            });
        ages.sort(function(a,b){return a.x0-b.x0;});



        file=file.filter(function(v){
            if((selections.ages==null || (selections.ages[0]<=v.Age && selections.ages[1]>=v.Age)) &&
               (selections.gender==null || selections.gender.indexOf(g_conversor[v.Sex])>=0 ) &&
               ( selections.departments==null || selections.departments.indexOf(v.Department)>=0  )){
                return v;
            }
        });

        var columns = [ "I-II", "III", "IV", "V", "VI", "Crus I", "Crus II", "VIIB", "VIIIA", "VIIIB", "IX", "X" ];
        var names = {"I-II":"Lobules I,II", "III": "Lobule III", "IV": "Lobule IV", "V": "Lobule V", "VI": "Lobule VI", "Crus I": "Crus I" , "Crus II": "Crus II", "VIIB":"Lobule VIIB", "VIIIA":"Lobule VIIIA", "VIIIB":"Lobule VIIIB", "IX":"Lobule IX", "X":"Lobule X"};
        var averages = [];
        var averages_2 = [];
        var averages_3 = [];

        var num_subjects = d3.sum(file, function(d){ return +d.count;});

        columns.forEach(function(column) {
            columns.forEach(function(column) {
                averages.push({
                    key: names[column],
                    value_lh: d3.sum(file, function(d) { return +d["average_"+column+" left "+"cm3"]*(+d.count/num_subjects); }),
                    value_rh: d3.sum(file, function(d) { return +d["average_"+column+" right "+"cm3"]*(+d.count/num_subjects); }),
                    max_lh: d3.max(file, function(d) { return +d["max_"+column+" left "+"cm3"]; }),
                    max_rh: d3.max(file, function(d) { return +d["max_"+column+" right "+"cm3"]; }),
                    min_lh: d3.min(file, function(d) { return +d["min_"+column+" left "+"cm3"]; }),
                    min_rh: d3.min(file, function(d) { return +d["min_"+column+" right "+"cm3"]; }),
                });

                averages_2.push({
                    key: names[column],
                    value_lh: d3.sum(file, function(d) { return +d["average_"+column+" left "+"grey matter cm3"]*(+d.count/num_subjects); }),
                    value_rh: d3.sum(file, function(d) { return +d["average_"+column+" right "+"grey matter cm3"]*(+d.count/num_subjects); }),
                    max_lh: d3.max(file, function(d) { return +d["max_"+column+" left "+"grey matter cm3"]; }),
                    max_rh: d3.max(file, function(d) { return +d["max_"+column+" right "+"grey matter cm3"]; }),
                    min_lh: d3.min(file, function(d) { return +d["min_"+column+" left "+"grey matter cm3"]; }),
                    min_rh: d3.min(file, function(d) { return +d["min_"+column+" right "+"grey matter cm3"]; }),
                });

                averages_3.push({
                    key: names[column],
                    value_lh: d3.sum(file, function(d) { return +d["average_"+column+" left "+"cortical thickness"]*(+d.count/num_subjects); }),
                    value_rh: d3.sum(file, function(d) { return +d["average_"+column+" right "+"cortical thickness"]*(+d.count/num_subjects); }),
                    max_lh: d3.max(file, function(d) { return +d["max_"+column+" left "+"cortical thickness"]; }),
                    max_rh: d3.max(file, function(d) { return +d["max_"+column+" right "+"cortical thickness"]; }),
                    min_lh: d3.min(file, function(d) { return +d["min_"+column+" left "+"cortical thickness"]; }),
                    min_rh: d3.min(file, function(d) { return +d["min_"+column+" right "+"cortical thickness"]; }),
                });
            });

        });


        //console.log(averages[0]);



        gender_donut.fill(gender);
        ages_hist.fill(ages);
        part_histogram.fill(averages);
        part_histogram2.fill(averages_2);
        part_histogram3.fill(averages_3);

        updating_data=false;
    }
}
