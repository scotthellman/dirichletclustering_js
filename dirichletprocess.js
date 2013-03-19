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
	this.pdf = function(point){return pdf(point,this.parameters)};
}

ClusterDistribution.prototype.add(point){
	this.data.push(point);
	this.parameters = this.inference(this.data);
}

ClusterDistribution.prototype.remove(point){
	data.pop($.inArray(point,data));
	this.parameters = this.inference(this.data);
}

ClusterDistribution.prototype.size(){
	return this.data.length;
}


function DirichletProcess(inference,pdf,alpha,data){
	this.distribution = function(){return distribution(inference,pdf)};
	this.alpha = alpha;
	this.data = data;

	this.clusters = [this.distribution()];
	this.assignments = [];
	for(var i = 0; i < this.data.length; i++){
		this.assignments.push(this.clusters[0]);
	}
}

DirichletProcess.prototype.mixing(n){
	return n / (this.alpha * this.data.length - 1);
}

DirichletProcess.prototype.sampleFrom(likelihoods,clusters){
	//assuming likelihoods has one more than clusters (likelihood for a new cluster)
	var threshold = Math.random();
	var total = 0;
	for(var i = 0; i < likelihoods.length - 1; i++){
		total += likelihoods[i];
		if(total > threshold){
			return clusters[i];
		}
	}
	this.clusters.append(this.distribution());
	return this.clusters[this.clusters.length - 1];
}

DirichletProcess.gibbsSample(iterations){
	for(var i = 0; i < iterations; i++){
		this.gibbsStep();
	}
}

DirichletProcess.gibbsStep(){
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

		if(cluster.size() == 0){
			this.clusters.pop($.inArray(cluster,this.clusters));
		}

		var likelihoods = this.getLikelihoods();
		var new_likelihood = this.mixing(this.alpha); //TODO: no prior right now
		likelihoods.push(new_likelihood);

		var sum = likelihoods.reduce(function(a,b){return a + b;},0);
		var normalized_likelihoods = function(x){return x / sum;}.apply(null,likelihoods);

		var assignment = this.sampleFrom(normalized_likelihoods,this.clusters);
		assignment.add(point);
		this.assignments[index] = assignment;

	}
}