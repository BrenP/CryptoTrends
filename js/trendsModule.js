// trendsModule.js 
const trends = require('./trendsApi.js');
var region = 'US';
var days, entries, valueCount, searchTime, startDate, endDate, millisecs, terms;
var termMap = new Map();
var devMap = new Map();

module.exports = {
	getMap: function (weeks, compare, termArray){
		if(weeks == -1){
			entries = 12;
			hours = 2;
			valueCount = 10;
			millisecs = 60*60*1000;
		}
		else if(weeks == 0){
			entries = 12;
			days = 0;
			hours = 4;
			valueCount = 20;
			millisecs = 60*60*1000;
		}
		else if(weeks == 1){
			entries = 7;
			days = 7;
			hours = days * 24;
			valueCount = 24;
			millisecs = 60*60*1000-1;
		}
		else if(weeks <= 38){
			entries = weeks;
			days = (weeks * 7)+1;
			valueCount = 7;
			hours = days * 24;
			millisecs = 60*60*1000;
		}
		else{
			entries = weeks;
			days = (weeks * 7);
			valueCount = 1;
			hours = days * 24;
			millisecs = 60*60*1000;
		}
		
		terms = termArray;
		searchTime = hours * millisecs;
		startDate = new Date(Date.now() - searchTime);
		endDate = new Date(Date.now());
		if (compare == 1){
			var res = getComparedData(terms, weeks, compare);
		}
		else {
			var res = getData(terms, weeks, compare);
		}
		
		// returns a promise so main app program can execute synchronously
		return(res.then(function(){
			console.log("trends Module finished successfully...\n");
			//returns the map with all the information
			return devMap;
		}).catch(function(){
			return new Promise((resolve, reject) => {
					return reject()
				})
			}))
	},//end of getMap()
	
	//	This function gets a new map with the requested hourly rate
	getRequestedRate: function(rate, map, terms, weeks, compare){
		var previousValCount = valueCount;
		var previousEntries = entries;
		valueCount = rate;
		entries = 168 / rate;
		var valIterator, keyIterator;
		var string = '';
		var sum = 0;
		var key, value;
		var newTerms = [];
		newTerms[0] = '';
		var mainMap = new Map()
		if (compare == 1){
			for (var i = 0; i < terms.length; i++){
				newTerms[0] += terms[i];
				if (i < terms.length -1){
					newTerms[0] += " vs "
				}
			}
		}
		else{
			newTerms = terms
		}
		for (var termsI = 0; termsI < newTerms.length; termsI++){
			var termArray = [];
			var tempArray = [];
			var tempIndex = 0;
			var map2 = new Map();
			// get individual entries into array of maps
			for (prevEntryI = 0; prevEntryI < previousEntries; prevEntryI++){
				var tempArray2 = map.get(newTerms[termsI])[prevEntryI];
				tempArray2[1].forEach((value, key, map) => {
					map2.set(key, value)
				})
			}
			valIterator = map2.values();
			keyIterator = map2.keys();
			for (var h = 0; h < entries; h++){
				var map3 = new Map();
				var array = [];
				for (var i = 0; i < valueCount; i++){
					key = keyIterator.next().value;
					value = valIterator.next().value;
					if (i == 0){
						string = key;
					}
					sum += parseInt(value);
					map3.set(key, value);
				}
				avg = sum / rate;
				avg = Math.round(avg);
				sum = 0;
				
				array[0] = string;
				array[1] = map3;
				array = getDeviations(array);
				termArray[h]=array;
			}
			termArray = getDeviationChange(termArray, weeks);
			mainMap.set(newTerms[termsI], termArray);
		}
		return mainMap;
	},//end of getRequestedRate()
	
	
	// 	This function prints the data map to console
	printToConsole: function(terms, devMap, compare){
		var bitArray;
		var string = '';
		var newTerms = []
		newTerms[0] = ''
		if (compare == 1){
			for (var i = 0; i < terms.length; i++){
				newTerms[0] += terms[i];
				if (i < terms.length -1){
					newTerms[0] += " vs "
				}
			}
		}
		else{
			newTerms = terms
		}
		for (var i = 0; i < newTerms.length; i++){
			console.log(newTerms[i]);
			for (var j = 0; j < devMap.get(newTerms[i]).length; j++){
				for(var k = 0; k < devMap.get(newTerms[i])[j].length; k++){
					if(k == 0){
						console.log(devMap.get(newTerms[i])[j][k]);
					}
					else if (k == 1){
						string += "Values: ";
						for (var value of (devMap.get(newTerms[i])[j][k]).values()) {
							string += "[";
							string += value;
							string += "] ";
						}
						console.log(string);
						string = '';
					}
					else if(k == 2){
						console.log("Standard Deviation: " + devMap.get(newTerms[i])[j][k]);
					}
					else if(k == 3){
						console.log("Deviation Change: " + devMap.get(newTerms[i])[j][k]);
					}
				}
				console.log();
			}
			console.log('\n');
		}
	}//end of prontToConsole()
};


// This function is used to get all the data from all the search terms
function getData(terms, weeks, compare){
	console.log("trendsModule Running...\n\n");
	promises = terms.map(function(term){
		return new Promise((resolve, reject) => {
			if (weeks <= 1){
				var result = getTrendsData(term, weeks, compare).then((result) => {
					if (result == 0){
						return reject()
					}
					else{
						termMap.set(term, result);
						resolve();
					}
				})
			}
			else{
				var result = getTrendsData(term, weeks, compare).then((result) => {
					if (result == 0){
						return reject()
					}
					else if ((weeks*7) == (result.default.timelineData.length)){
						termMap.set(term, result);
						resolve();
					}
				})
			}
		});
	});
	// returns a promise after all Json has been returned by google trends
	return(Promise.all(promises)
	.then(function(){
			// calls getDevMap() after the promises for all trends have been returned
			setDevMap(terms, weeks)
	}).catch(function(){
		console.log("trendsModule failed...")
		return new Promise((resolve, reject) => {return reject()});
	}))
}

// This function is used to get all the data from all the search terms if the user wants to compare them
function getComparedData(terms, weeks, compare){
	console.log("trendsModule compare Running...\n\n");
	response = new Promise((resolve, reject) => {
			if (weeks <= 1){
				var result = getTrendsData(terms, weeks, compare).then((result) => {
					if (result == 0){
						return reject()
					}
					else{
						var string = [];
						string[0] = '';
						for (var i = 0; i < terms.length; i++){
							string[0] += terms[i];
							if (i < terms.length -1){
								string[0] += " vs "
							}
						}
						terms = string;
						termMap.set(terms[0], result);
						resolve();
					}
				})
			}
			else{
				var result = getTrendsData(terms, weeks, compare).then((result) => {
					if (result == 0){
						return reject()
					}
					else if ((weeks*7) == (result.default.timelineData.length)){
						var string = [];
						string[0] = '';
						for (var i = 0; i < terms.length; i++){
							string[0] += terms[i];
							if (i < terms.length -1){
								string[0] += " vs "
							}
						}
						terms = string;
						termMap.set(terms[0], result);
						resolve();
					}
				})
			}
		});
	// returns a promise after all Json has been returned by google trends
	return(response
	.then(function(){
			// calls getDevMap() after the promises for all trends have been returned
			setDevMap(terms, weeks)
	}).catch(function(){
		console.log("trendsModule failed...")
		return new Promise((resolve, reject) => {return reject()});
	}))
}



// This function is used to get the data for each term from the google-trends-api
async function getTrendsData(term, weeks, compare){
	var json = await trends.getTrends(startDate, endDate, region, term);
	if (weeks > 1){
		if (json.default.timelineData.length != (weeks * 7)){
			hours = ((weeks*7)+2) * 24;
			searchTime = hours * millisecs;
			startDate = new Date(Date.now() - searchTime);
			json = await trends.getTrends(startDate, endDate, region, term);
		}
	}
	
	if (json.default.timelineData.length == 0){
		return json.default.timelineData.length;
	}
	return json;
}


/* 	This function calls getArray() in order to get an array 
	containing all the data for each search term 
	It then stores all data into a hashmap using each search terms as keys
*/
function setDevMap(terms, weeks){
	//console.log("setDevMap() running...");
	for (var i = 0; i < terms.length; i++) {
		devMap.set(terms[i], getTermArray(i, terms, weeks));
	}
}


/* 	This function calls getEntryArray() in order to get an array 
	containing the data for each entry of the term requested by setDevMap()
	It then calls getFullEntryArray() in order to get an array containing the full data
	for each entry
	Finally, it stores the data into another array containing the full data for a search term
*/
function getTermArray(num, terms, weeks){
	var termArray = [];
	for (var i = 0; i < entries; i++) {
		termArray[i] = getPartialEntryArray(termMap.get(terms[num]), i);
	}
	return getDeviationChange(termArray, weeks);
}


// This function is used to get the first two values of the entry array
function getPartialEntryArray(parsedResult, num){
	var entryArray = [];
	var valueMap = new Map();
	var string = "";
	var length = parsedResult.default.timelineData.length;
	var i = (valueCount*num);
	var index = 0;
	do {
		valueMap.set(parsedResult.default.timelineData[i].formattedAxisTime, 
					 parsedResult.default.timelineData[i].value);
		if (i == (valueCount*num)){
			string += parsedResult.default.timelineData[i].formattedAxisTime;
		}
		index++;
		i++;
	} while(i < ((valueCount*num)+ valueCount));
	
	entryArray[0] = string;
	entryArray[1] = valueMap;
	return getDeviations(entryArray);
}


// This function is used to get the standard deviation for each entry array
function getDeviations(entryArray){
	var newSet = [];
	var length = entryArray[1].values().next().value.length;
	var popDev = [];
	var samDev = [];
	var avgDev = [];
	var sum = [];
	var mean = [];
	for (var i = 0; i < length; i++){
		sum[i] = 0;
	}
	if (valueCount == 1){
		var iterator = entryArray[1].values();
		var val = iterator.next().value
		for (var i = 0; i < length; i++){
			popDev[i] = val[i];
			sampleDev[i] = popDev[i];
			avgDev[i] = popDev[i];
		}
	}
	else {
		//Add all entries together
		entryArray[1].forEach((value) => {
			for (var i = 0; i < length; i++){
				sum[i] += parseInt(value[i]);
			}
		})
		// Step 1: Work out the mean
		for (var i = 0; i < length; i++){
			mean[i] = sum[i] / valueCount;
			sum[i] = 0;
		}
		
		entryArray[1].forEach((value) => {
			for (var i = 0; i < length; i++){
				newSet[i] = (parseInt(value[i]) - mean[i]) * (parseInt(value[i]) - mean[i]);
				
				sum[i] += newSet[i];
			}
		})
		
		// standard deviation Step 3
		for (var i = 0; i < length; i++){
			mean[i] = sum[i] / (valueCount);
			popDev[i] = Math.sqrt(mean[i]);
			
			mean[i] = sum[i] / (valueCount-1);
			samDev[i] = Math.sqrt(mean[i]);
			
			sum[i] = 0;
			avgDev[i] = (samDev[i] + popDev[i]) / 2;
		}
	}
	//entryArray[2] = avg;
	//entryArray[3] = sampleDev;
	entryArray[2] = popDev;
	return entryArray;
}


// This function gets the deviation change from the previous entry
function getDeviationChange(array, weeks){
	var res, temp;
	var length = array[0][2].length
	var res = [];
	if (weeks < 39){
		for (var i = 0; i < entries; i++){
			var arr = [];
			for (var j = 0; j < length; j++){
				if (i == 0){
					arr[j] = 0;
				}
				else{
					res[j] = (array[i][2][j])-(array[i-1][2][j]);
					arr[j] = res[j];
				}
			}
			array[i][3] = arr;
		}
	}
	else{
		return array;
	}
	return array;
}
