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

var ages_hist = new BinnedHistogram("#ages");
ages_hist.set_on_change(function(values){
    selections.ages=values;
    update_graph(null);

});

var histogram = new HorizontalHistogram("#volchart_1");
var part_histogram = new PartHistogram("#volchart_2");
var part_histogram_2 = new PartHistogram("#volchart_3");
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
    var file_name = "data/volBrain_pre.csv";


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

        console.log(ages)
        var num_subjects = d3.sum(file, function(d){ return +d.count;});

        var generic_columns = ["Tissue GM", "Tissue WM", "Tissue CSF", "Tissue Brain", "Tissue IC"];
        var converter = {"Tissue WM":"White Matter(WM)", "Tissue GM":"Grey Matter (GM)", "Tissue CSF":"Cerebro Spinal Fluid", "Tissue Brain":"Brain (WM + GM)", "Tissue IC":"Intracranial Cavity"};
        var generic_averages=[];
        generic_columns.forEach(function(column) {
            var ave = d3.sum(file, function(d) { return +d["average_"+column+" cm3"]*(+d.count/num_subjects); });
            var max = d3.max(file, function(d) { return +d["max_"+column+" cm3"]; });
            var min = d3.min(file, function(d) { return +d["min_"+column+" cm3"]; });
            generic_averages.push({
                key: converter[column],
                value_lh: ave,
                value_rh: ave,
                max_lh: max,
                max_rh: max,
                min_lh: min,
                min_rh: min,
            });

        });


        var columns = [ "Cerebrum", "Cerebelum"];
        var subcolumns = ["GM","WM"];
        var averages = [];

        columns.forEach(function(column) {
            subcolumns.forEach(function(sub){
                averages.push({
                    key: column+" "+sub,
                    value_lh: d3.sum(file, function(d) { return +d["average_"+column+" "+"L" + " "+sub+" cm3"]*(+d.count/num_subjects); }),
                    value_rh: d3.sum(file, function(d) { return +d["average_"+column+" "+"R"+ " "+sub +" cm3"]*(+d.count/num_subjects); }),
                    max_lh: d3.max(file, function(d) { return +d["max_"+column+" "+"L"+ " "+sub +" cm3"]; }),
                    max_rh: d3.max(file, function(d) { return +d["max_"+column+" "+"R" + " "+sub +" cm3"]; }),
                    min_lh: d3.min(file, function(d) { return +d["min_"+column+" "+"L" + " "+sub +" cm3"]; }),
                    min_rh: d3.min(file, function(d) { return +d["min_"+column+" "+"R"+ " "+sub +" cm3"]; }),
                });

            });


        });
        var b_average = d3.sum(file, function(d) { return +d["average_Brainstem cm3"]*(+d.count/num_subjects); });
        var b_max = d3.max(file, function(d) { return +d["max_" + "Brainstem cm3"]; });
        var b_min = d3.min(file, function(d) { return +d["min_" + "Brainstem cm3"]; });
        averages.push({
            key: "Brainstem*",
            value_lh: b_average,
            value_rh: b_average,
            max_lh: b_max,
            max_rh: b_max,
            min_lh: b_min,
            min_rh: b_min,
        });

        var columns2 = [ "Lateral ventricles", "Caudate", "Putamen", "Thalamus", "Globus Pallidus", "Hippocampus", "Amygdala", "Accumbens"];
        var averages_2 = [];

        columns2.forEach(function(column) {

            averages_2.push({
                key: column,
                value_lh: d3.sum(file, function(d) { return +d["average_"+column+" "+"Left"+" cm3"]*(+d.count/num_subjects); }),
                value_rh: d3.sum(file, function(d) { return +d["average_"+column+" "+"Right"+" cm3"]*(+d.count/num_subjects); }),
                max_lh: d3.max(file, function(d) { return +d["max_"+column+" "+"Left"+" cm3"]; }),
                max_rh: d3.max(file, function(d) { return +d["max_"+column+" "+"Right"+" cm3"]; }),
                min_lh: d3.min(file, function(d) { return +d["min_"+column+" "+"Left"+" cm3"]; }),
                min_rh: d3.min(file, function(d) { return +d["min_"+column+" "+"Right"+" cm3"]; }),
            });

        });


        //console.log(averages[0]);



        gender_donut.fill(gender);
        ages_hist.fill(ages);

        histogram.fill(generic_averages);
        part_histogram.fill(averages);
        part_histogram_2.fill(averages_2);
    }
}


var updating_data=false;
function update_graph(option){
    var file_name = "data/volBrain_pre.csv";


    d3.queue()
    	.defer(d3.csv, file_name)
    	.await(load_data);

    updating_data = true;

    function load_data(error,file){

        var g_conversor = {"Female":"F","Male":"M", "UNKNOWN":"U"};

        var gender = d3.nest()
            .key(function(d) { return g_conversor[d.Sex];})
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


        /*var ages =[];
        file.forEach(function(v) {
            if((selections.gender==null || selections.gender.indexOf(g_conversor[v.Sex])>=0 ) &&
            ( selections.departments==null || selections.departments.indexOf(v.Department)>=0  ))
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
               (selections.gender==null || selections.gender.indexOf(g_conversor[v.Sex])>=0 )&&
               ( selections.departments==null || selections.departments.indexOf(v.Department)>=0  )){
                return v;
            }
        });

        var num_subjects = d3.sum(file, function(d){ return +d.count;});

        var generic_columns = ["Tissue GM", "Tissue WM", "Tissue CSF", "Tissue Brain", "Tissue IC"];
        var converter = {"Tissue WM":"White Matter(WM)", "Tissue GM":"Grey Matter (GM)", "Tissue CSF":"Cerebro Spinal Fluid", "Tissue Brain":"Brain (WM + GM)", "Tissue IC":"Intracranial Cavity"};
        var generic_averages=[];
        generic_columns.forEach(function(column) {
            var ave = d3.sum(file, function(d) { return +d["average_"+column+" cm3"]*(+d.count/num_subjects); });
            var max = d3.max(file, function(d) { return +d["max_"+column+" cm3"]; });
            var min = d3.min(file, function(d) { return +d["min_"+column+" cm3"]; });
            generic_averages.push({
                key: converter[column],
                value_lh: ave,
                value_rh: ave,
                max_lh: max,
                max_rh: max,
                min_lh: min,
                min_rh: min,
            });

        });


        var columns = [ "Cerebrum", "Cerebelum"];
        var subcolumns = ["GM","WM"];
        var averages = [];

        columns.forEach(function(column) {
            subcolumns.forEach(function(sub){
                averages.push({
                    key: column+" "+sub,
                    value_lh: d3.sum(file, function(d) { return +d["average_"+column+" "+"L" + " "+sub+" cm3"]*(+d.count/num_subjects); }),
                    value_rh: d3.sum(file, function(d) { return +d["average_"+column+" "+"R"+ " "+sub +" cm3"]*(+d.count/num_subjects); }),
                    max_lh: d3.max(file, function(d) { return +d["max_"+column+" "+"L"+ " "+sub +" cm3"]; }),
                    max_rh: d3.max(file, function(d) { return +d["max_"+column+" "+"R" + " "+sub +" cm3"]; }),
                    min_lh: d3.min(file, function(d) { return +d["min_"+column+" "+"L" + " "+sub +" cm3"]; }),
                    min_rh: d3.min(file, function(d) { return +d["min_"+column+" "+"R"+ " "+sub +" cm3"]; }),
                });

            });


        });
        var b_average = d3.sum(file, function(d) { return +d["average_Brainstem cm3"]*(+d.count/num_subjects); });
        var b_max = d3.max(file, function(d) { return +d["max_" + "Brainstem cm3"]; });
        var b_min = d3.min(file, function(d) { return +d["min_" + "Brainstem cm3"]; });
        averages.push({
            key: "Brainstem*",
            value_lh: b_average,
            value_rh: b_average,
            max_lh: b_max,
            max_rh: b_max,
            min_lh: b_min,
            min_rh: b_min,
        });

        var columns2 = [ "Lateral ventricles", "Caudate", "Putamen", "Thalamus", "Globus Pallidus", "Hippocampus", "Amygdala", "Accumbens"];
        var averages_2 = [];

        columns2.forEach(function(column) {

            averages_2.push({
                key: column,
                value_lh: d3.sum(file, function(d) { return +d["average_"+column+" "+"Left"+" cm3"]*(+d.count/num_subjects); }),
                value_rh: d3.sum(file, function(d) { return +d["average_"+column+" "+"Right"+" cm3"]*(+d.count/num_subjects); }),
                max_lh: d3.max(file, function(d) { return +d["max_"+column+" "+"Left"+" cm3"]; }),
                max_rh: d3.max(file, function(d) { return +d["max_"+column+" "+"Right"+" cm3"]; }),
                min_lh: d3.min(file, function(d) { return +d["min_"+column+" "+"Left"+" cm3"]; }),
                min_rh: d3.min(file, function(d) { return +d["min_"+column+" "+"Right"+" cm3"]; }),
            });

        });

        //console.log(averages[0]);



        gender_donut.fill(gender);
        ages_hist.fill(ages);

        histogram.fill(generic_averages);
        part_histogram.fill(averages);
        part_histogram_2.fill(averages_2);

        updating_data=false;
    }
}
