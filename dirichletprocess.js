function uniformInference(data){
	if(data.length == 0){
		return [0,1];
	}
	else{
		return [Math.min.apply(null,data) - 1, Math.max.apply(null,data) + 1];
	}
}

function uniformPDF(point,parameters){
	if(point < parameters[0] || point > parameters[1]){
		return 0;
	}
	else{
		return 1/(parameters[1] - parameters[0]);
	}
}

function ClusterDistribution(inference,pdf){
	this.data = [];
	this.parameters = inference([]);
	this.inference = inference;
	this.pdf = function(point){return pdf(point,this.parameters)};
}

ClusterDistribution.prototype.add = function(point){
	this.data.push(point);
	this.parameters = this.inference(this.data);
}

ClusterDistribution.prototype.remove = function(point){
	this.data.splice($.inArray(point,this.data),1);
	this.parameters = this.inference(this.data);
}

ClusterDistribution.prototype.size = function(){
	return this.data.length;
}


function DirichletProcess(inference,pdf,alpha,data){
	this.distribution = function(){return new ClusterDistribution(inference,pdf)};
	this.alpha = alpha;
	this.data = data;

	this.clusters = [this.distribution()];
	this.assignments = [];
	for(var i = 0; i < this.data.length; i++){
		this.assignments.push(this.clusters[0]);
		this.clusters[0].add(this.data[i]);
	}
}

DirichletProcess.prototype.mixing = function(n){
	return n / (this.alpha * this.data.length - 1);
}

DirichletProcess.prototype.sampleFrom = function(likelihoods,clusters){
	//assuming likelihoods has one more than clusters (likelihood for a new cluster)
	var threshold = Math.random();
	var total = 0;
	for(var i = 0; i < likelihoods.length - 1; i++){
		total += likelihoods[i];
		if(total > threshold){
			return clusters[i];
		}
	}
	this.clusters.push(this.distribution());
	return this.clusters[this.clusters.length - 1];
}

DirichletProcess.prototype.gibbsSample = function(iterations){
	for(var i = 0; i < iterations; i++){
		this.gibbsStep();
	}
}

DirichletProcess.prototype.gibbsStep = function(){
	var remaining = [];
	for(var i = 0; i < this.data.length; i++){
		remaining.push(i);
	}

	//traverse data in random order (dirchlet process samples are exchangeable)
	while(remaining.length > 0){
		var index = remaining.pop(Math.floor(Math.random() * remaining.length));
		var cluster = this.assignments[index];
		var point = this.data[index];
		this.assignments[index] = null;
		cluster.remove(point);

		console.log(cluster.size());
		if(cluster.size() == 0){
			console.log($.inArray(cluster,this.clusters));
			this.clusters.splice($.inArray(cluster,this.clusters),1);
		}

		console.log(this.clusters);

		var likelihoods = this.clusters.map(function(cluster){
			return cluster.pdf(point) * this.mixing(cluster.size());
		},this);
		console.log(likelihoods);
		var new_likelihood = this.mixing(this.alpha); //TODO: no prior right now
		likelihoods.push(new_likelihood);

		var sum = likelihoods.reduce(function(a,b){return a + b;},0);
		var normalized_likelihoods = function(x){return x / sum;}.apply(null,likelihoods);

		var assignment = this.sampleFrom(normalized_likelihoods,this.clusters);
		assignment.add(point);
		this.assignments[index] = assignment;

	}
}