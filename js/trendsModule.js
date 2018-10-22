const trends = require('./trendApi.js');
module.exports = {
	main: function (weeks, print, terms){
		//var terms = ['Bitcoin', 'Ethereum', 'Litecoin'];
		var region = 'US';
		var days, entries, valueCount, searchTime, startDate, endDate, millisecs;
		var termMap = new Map();
		var devMap = new Map();

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
			days = entries;
			hours = days * 24;
			valueCount = 24;
			millisecs = 60*60*1000-1;
		}
		else{
			entries = weeks;
			days = (weeks * 7)+1;
			valueCount = 7;
			hours = days * 24;
			millisecs = 60*60*1000;
		}
		
		searchTime = hours * millisecs;
		startDate = new Date(Date.now() - searchTime);
		endDate = new Date(Date.now());
		
		var res = getData()
		
		// returns a promise so main program can execute synchronously
		return(res.then(function(){
			console.log("trends Module finished successfully...\n")
			//returns the map with all the information
			return devMap
		}).catch(console.error))
		
		
		// This function is used to get all the data from all the search terms
		function getData(){
			var confirmEntries;
			console.log("trendsModule Running...\n\n");
			promises = terms.map(function(term){
				return new Promise((resolve, reject) => {
					if (weeks <= 1){
						var result = getTrendsData(term).then((result) => {
							termMap.set(term, result);
							resolve();
						})
					}
					else{
						var json = getTrendsData(term).then((result) => {
							if ((weeks*7) == (result.default.timelineData.length)){
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
					setDevMap()
			}).catch(console.error))
		}
		
		/*
			This function is used to get the data for each term from the google-trends-api
		*/
		async function getTrendsData(term){
			var json = await trends.getTrends(startDate, endDate, region, term);
			if (weeks > 1){
				if (json.default.timelineData.length != (weeks * 7)){
					hours = ((weeks*7)+2) * 24;
					searchTime = hours * millisecs;
					startDate = new Date(Date.now() - searchTime);
					json = await trends.getTrends(startDate, endDate, region, term);
				}
			}
			return json;
		}

		/* 	This function calls getArray() in order to get an array 
			containing all the data for each search term 
			It then stores all data into a hashmap using each search terms as keys
			Finally, it calls printResults() if 'print' variable was turned on by the user
		*/
		function setDevMap(){
			for (var i = 0; i < terms.length; i++) {
				devMap.set(terms[i], getTermArray(i));
			}
			if (print){
				printResults();
			}
		}


		/* 	This function calls getEntryArray() in order to get an array 
			containing the data for each entry of the term requested by setDevMap()
			It then calls getFullEntryArray() in order to get an array containing the full data
			for each entry
			Finally, it stores the data into another array containing the full data for a search term
		*/
		function getTermArray(num){
			var termArray = [];
			for (var i = 0; i < entries; i++) {
				termArray[i] = getPartialEntryArray(termMap.get(terms[num]), i);
			}
			termArray = getFullEntryArray(termArray);
			return termArray;
		}

		
		/*	This function uses the previous partial entry array to create the full entry array
			containing all the data for each entry.
			The array index for the data is as follows:
				[0] a string containing the start date and end date for the entry
				[1] a hashmap containing all the values for that entry. Dates are used as keys
				[2] the avarage of both standard deviations
				[3] the deviation change between this entry and the previous entry
				[4] an integer showing the sample standard deviation
				[5] an integer showing the population standard deviation	
			
		*/
		function getFullEntryArray(array){
			var res, temp;
			
			for (var i = 0; i < entries; i++){
				temp = array[i][3];
				array[i][5] = temp;
				temp = array[i][2];
				array[i][2] = array[i][4];
				array[i][4] = temp;
				if (i == 0){
					array[i][3] = 0;
				}
				else{
					res = (array[i][2])-(array[i-1][2]);
					array[i][3] = res;
				}
			}
			return array;
		}


		/*	This function creates an array containing the data for each entry.
			The array index for the data is as follows:
				[0] a string containing the start date and end date for the entry
				[1] a hashmap containing all the values for that entry. Dates are used as keys
				[2] an integer showing the sample standard deviation
				[3] an integer showing the population standard deviation
				[4] the avarage of both standard deviations
			It then gets the sample and population standard deviation per week using the following calculations:
				1. Work out the Mean (sum of values / amount of values)
				2. Then for each number: subtract the Mean and square the result
				3. Then work out the mean of those squared differences. [for sample deviation use (sum of values / amount of values - 1)]
				4. Take the square root of that and we are done!
		*/
		function getPartialEntryArray(parsedResult, num){
			var mean, avg, sampleDev, popDev;
			var sum = 0;
			var newSet = [];
			var entryArray = [];
			var valueArray = [];
			var valueMap = new Map();
			var string = "";
			var values = "";
			var length = parsedResult.default.timelineData.length;
			var i = (valueCount*num);
			var index = 0;
			
			do {
				valueArray[index] = parsedResult.default.timelineData[i].value;
				valueMap.set(parsedResult.default.timelineData[i].formattedAxisTime, 
							 parsedResult.default.timelineData[i].value);
				values += valueArray[i];
				if (i == (valueCount*num)){
					string += parsedResult.default.timelineData[i].formattedAxisTime;
					string += " - ";
				}
				
				if (i == (valueCount*num)+(valueCount-1)){
					string += parsedResult.default.timelineData[i].formattedAxisTime;
				}
				else {
					values += ", ";
				}
				
				// Add all the new values together
				sum += parseInt(parsedResult.default.timelineData[i].value);
				index++;
				i++;
			} while(i < ((valueCount*num)+ valueCount));
			// Step 1: Work out the mean
			mean = sum / valueCount;
			
			// Reset variables
			i = (valueCount*num);
			sum = 0;
			do {
				// Step 2: Subtract mean from each number and sqaure the result
				newSet[i] = ((parseInt(parsedResult.default.timelineData[i].value) - mean) * 
							 (parseInt(parsedResult.default.timelineData[i].value) - mean));
				// Add all the new values together
				sum += newSet[i];
				i++;
			} while(i < ((valueCount*num) + valueCount));
			// Sample standard deviation Step 3
			mean = sum / (valueCount-1);
			// Sample standard deviation Step 3
			sampleDev = Math.sqrt(mean);
			
			// Population standard deviation Step 3
			mean = sum / (valueCount);
			// Population standard deviation Step 3
			popDev = Math.sqrt(mean);
			
			avg = (sampleDev + popDev) / 2;
			
			entryArray[0] = string;
			entryArray[1] = valueMap;
			entryArray[2] = popDev;
			entryArray[3] = sampleDev;
			entryArray[4] = avg;
			
			return entryArray;
		}

		
		/* This function prints the results in a weekly basis in the following format:
		//		Search Term							e.g			Bitcoin
		//		start of week - end of week						Sep 17 - Sep 23
		//		values of each week day							87, 89, 87, 81, 100, 84, 74
		//		average of both deviations						7.663054116836143
		//		deviation change from previous week				+1.365675756434341
		*/
		function printResults(){
			var bitArray;
			var string = '';
			for (var i = 0; i < terms.length; i++){
				console.log(terms[i]);
				for (var j = 0; j < entries; j++){
					for(var k = 0; k < devMap.get(terms[i])[j].length; k++){
						if(k == 0){
							console.log(devMap.get(terms[i])[j][k]);
						}
						else if (k == 1){
							string += "Values: ";
							for (var value of (devMap.get(terms[i])[j][k]).values()) {
								string += value;
								string += " ";
							}
							console.log(string);
							string = '';
						}
						else if(k == 2){
							console.log("Standard Deviation: " + devMap.get(terms[i])[j][k]);
						}
						else if(k == 3){
							console.log("Deviation Change: " + devMap.get(terms[i])[j][k]);
						}
					}
					console.log();
				}
				console.log('\n');
			}
		}
	}
};
