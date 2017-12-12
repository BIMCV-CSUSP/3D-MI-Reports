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
    var file_name_lh = "data/aparc-lh-"+option+"-cvars.csv";
    var file_name_rh = "data/aparc-rh-"+option+"-cvars.csv";

    d3.queue()
    	.defer(d3.csv, file_name_lh)
    	.defer(d3.csv, file_name_rh)
    	.await(load_data);



    function load_data(error,lh,rh){

        var gender = d3.nest()
            .key(function(d) { return d["Patient Sex"];})
                .sortKeys(d3.ascending)
                .rollup(function(d) {
                return d.length;
                //return d3.sum(d, function(g) {return g.value; });
            })
            .entries(lh);


        var ages =[];
        lh.forEach(function(d) {
            ages.push(d["Patient Age"]);
        });

        //var columns = [ "caudalanteriorcingulate", "caudalmiddlefrontal", "cuneus", "entorhinal", "fusiform", "inferiorparietal", "inferiortemporal", "isthmuscingulate", "lateraloccipital", "lateralorbitofrontal", "lingual", "medialorbitofrontal", "middletemporal", "parahippocampal", "paracentral", "parsopercularis", "parsorbitalis", "parstriangularis", "pericalcarine", "postcentral", "posteriorcingulate", "precentral", "precuneus", "rostralanteriorcingulate", "rostralmiddlefrontal", "superiorfrontal", "superiorparietal", "superiortemporal", "supramarginal", "frontalpole", "temporalpole", "transversetemporal", "insula", "WhiteSurfArea", "bankssts"];
        var columns = [ "caudalanteriorcingulate", "caudalmiddlefrontal", "cuneus", "entorhinal", "fusiform", "inferiorparietal", "inferiortemporal", "isthmuscingulate", "lateraloccipital", "lateralorbitofrontal", "lingual", "medialorbitofrontal", "middletemporal", "parahippocampal", "paracentral", "parsopercularis", "parsorbitalis", "parstriangularis", "pericalcarine", "postcentral", "posteriorcingulate", "precentral", "precuneus", "rostralanteriorcingulate", "rostralmiddlefrontal", "superiorfrontal", "superiorparietal", "superiortemporal", "supramarginal", "frontalpole", "temporalpole", "transversetemporal", "insula", "bankssts"];
        var averages = [];

        columns.forEach(function(column) {
            averages.push({
                key: column,
                value_lh: d3.mean(lh, function(d) { return +d["lh_"+column+"_"+option]; }),
                value_rh: d3.mean(rh, function(d) { return +d["rh_"+column+"_"+option]; }),
                max_lh: d3.max(lh, function(d) { return +d["lh_"+column+"_"+option]; }),
                max_rh: d3.max(rh, function(d) { return +d["rh_"+column+"_"+option]; }),
                min_lh: d3.min(lh, function(d) { return +d["lh_"+column+"_"+option]; }),
                min_rh: d3.min(rh, function(d) { return +d["rh_"+column+"_"+option]; }),
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
    if(updating_data) return; //check if not updating

    var file_name_lh = "data/aparc-lh-"+option+"-cvars.csv";
    var file_name_rh = "data/aparc-rh-"+option+"-cvars.csv";
    updating_data = true; //mark as updating to avoid performance issues


    d3.queue()
    	.defer(d3.csv, file_name_lh)
    	.defer(d3.csv, file_name_rh)
    	.await(load_data);



    function load_data(error,lh,rh){


        var gender = d3.nest()
            .key(function(d) { return d["Patient Sex"];})
            //.sortKeys(function (a,b){return a-b;})
            .rollup(function(d) {
                return d.length;
                //return d3.sum(d, function(g) {return g.value; });
            })
            .sortKeys(d3.ascending)
            .entries(lh.filter(function(v){
                if(selections.ages==null || (selections.ages[0]<=v["Patient Age"] && selections.ages[1]>=v["Patient Age"]))
                    return v;
            }));


        var ages =[];
        lh.forEach(function(v) {
            if(selections.gender==null || selections.gender.indexOf(v["Patient Sex"])>=0 )
                ages.push(v["Patient Age"]);
        });


        lh=lh.filter(function(v){
            if((selections.ages==null || (selections.ages[0]<=v["Patient Age"] && selections.ages[1]>=v["Patient Age"])) &&
               (selections.gender==null || selections.gender.indexOf(v["Patient Sex"])>=0 )){
                return v;
            }
        });


        rh=rh.filter(function(v){
            if((selections.ages==null || (selections.ages[0]<=v["Patient Age"] && selections.ages[1]>=v["Patient Age"])) &&
               (selections.gender==null || selections.gender.indexOf(v["Patient Sex"])>=0 )){
                return v;
            }
        });
        //var columns = [ "caudalanteriorcingulate", "caudalmiddlefrontal", "cuneus", "entorhinal", "fusiform", "inferiorparietal", "inferiortemporal", "isthmuscingulate", "lateraloccipital", "lateralorbitofrontal", "lingual", "medialorbitofrontal", "middletemporal", "parahippocampal", "paracentral", "parsopercularis", "parsorbitalis", "parstriangularis", "pericalcarine", "postcentral", "posteriorcingulate", "precentral", "precuneus", "rostralanteriorcingulate", "rostralmiddlefrontal", "superiorfrontal", "superiorparietal", "superiortemporal", "supramarginal", "frontalpole", "temporalpole", "transversetemporal", "insula", "WhiteSurfArea", "bankssts"];
        var columns = [ "caudalanteriorcingulate", "caudalmiddlefrontal", "cuneus", "entorhinal", "fusiform", "inferiorparietal", "inferiortemporal", "isthmuscingulate", "lateraloccipital", "lateralorbitofrontal", "lingual", "medialorbitofrontal", "middletemporal", "parahippocampal", "paracentral", "parsopercularis", "parsorbitalis", "parstriangularis", "pericalcarine", "postcentral", "posteriorcingulate", "precentral", "precuneus", "rostralanteriorcingulate", "rostralmiddlefrontal", "superiorfrontal", "superiorparietal", "superiortemporal", "supramarginal", "frontalpole", "temporalpole", "transversetemporal", "insula", "bankssts"];
        var averages = [];

        columns.forEach(function(column) {
            averages.push({
                key: column,
                value_lh: d3.mean(lh, function(d) { return +d["lh_"+column+"_"+option]; }),
                value_rh: d3.mean(rh, function(d) { return +d["rh_"+column+"_"+option]; }),
                max_lh: d3.max(lh, function(d) { return +d["lh_"+column+"_"+option]; }),
                max_rh: d3.max(rh, function(d) { return +d["rh_"+column+"_"+option]; }),
                min_lh: d3.min(lh, function(d) { return +d["lh_"+column+"_"+option]; }),
                min_rh: d3.min(rh, function(d) { return +d["rh_"+column+"_"+option]; }),
            });

        });

        //console.log(averages[0]);



        gender_donut.update(gender);
        ages_hist.update(ages);
        part_histogram.fill(averages);

        updating_data=false;
    }
}
