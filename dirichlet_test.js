var constant_theta = 1;
var linear_theta = 1;
var gaussian_theta = 1;
var exp_theta = 1;
var exp_width = -0.5;
var matern_theta = 1;
var matern_width = 1;

$(function(){
	$('#train').click(function(){
		clusterer.gibbsSample(10);
		replot();
	})
	replot();
})

var data = []
for(var i = 0; i < 10; i++){
	data.push(Math.random() * 2 + 5);
	data.push(Math.random() * 4 - 2);
}

var clusterer = new DirichletProcess(uniformInference,uniformPDF,0.01,data);

function replot(){
	console.log(data);
	var prettied_data = [];
	for(var i = 0; i < data.length; i++){
		prettied_data.push([data[i],0]);
	}
	var plot_data = [ { data: prettied_data, lines: { show : false}, points: {show : true} }];
	for(var i = 0; i < clusterer.clusters.length; i++){
		var params = clusterer.clusters[i].parameters;
		plot_data.push({data:[[params[0],1],[params[1],1]]});
	}
	

    $.plot($("#placeholder"), plot_data); 
}