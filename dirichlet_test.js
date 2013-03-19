var constant_theta = 1;
var linear_theta = 1;
var gaussian_theta = 1;
var exp_theta = 1;
var exp_width = -0.5;
var matern_theta = 1;
var matern_width = 1;

$(function(){
	$('#train').click(function(){
		clusterer.gibbsSample(1);
		replot();
	})
	replot();
})

var data = []
for(var i = 0; i < 10; i++){
	data.push(Math.random() * 2 + 5);
	data.push(Math.random() * 4 - 2);
}



var clusterer = new DirichletProcess(gaussianInference,gaussianPDF,0.01,data);

function replot(){
	console.log(data);
	var prettied_data = [];
	for(var i = 0; i < data.length; i++){
		prettied_data.push([data[i],0]);
	}
	var plot_data = [ { data: prettied_data, lines: { show : false}, points: {show : true} }];
	for(var i = 0; i < clusterer.clusters.length; i++){
		console.log(clusterer.clusters[i].parameters)
		plot_data.push({data:gaussianToPlot(clusterer.clusters[i],[-2,8])});
	}
	

    $.plot($("#placeholder"), plot_data); 
}

function gaussianToPlot(cluster,range){
	var result = [];
	for(var i = range[0]; i < range[1]; i += 0.1){
		result.push([i,cluster.pdf(i)]);
	}
	return result;
}


console.log(gaussianInference([0,1]));