// app.js 
const trends = require('./trendsModule.js');
const async = require('async');
var args = +process.argv.length;
var weeks, rate, print, compare;
var terms = [];
var trendsMap;
var mainMap;

function assignTrendValues(){
	if (args < 3){
		weeks = 4;
		rate = 0;
		print = 1;
		compare = 0;
		terms = ['Bitcoin', 'Ethereum', 'Litecoin'];
	}
	else{
		weeks = +process.argv[2];
		if (args > 3){
			if(weeks == 1){
				rate = +process.argv[3];
				if (rate == 0){
					rate = 24;
				}
			}
			else{
				rate = 0;
			}
			if(args > 4){
				print = +process.argv[4]
				if (args > 5){
					compare = +process.argv[5]
					if (args > 6){
						var index = 0;
						for (var i = 6; i < args; i++){
							terms[index] = process.argv[i];
							index++;
						}
					}
				}
			}
		}
	}
}


async function getTrends(){
	mainMap = await trends.getMap(weeks, compare, terms);
	//const mymap = await trends.getMap(weeks, print, terms);
	return mainMap;
}
assignTrendValues();
getTrends().then((map) => {
  //console.log(map)
  if (rate == 0){
	  if (print == 1){
		  trends.printToConsole(terms, map, compare);
	  }
  }
  else{
	  trendsMap = trends.getRequestedRate(rate, map, terms, weeks, compare);
	   if (print == 1){
		  trends.printToConsole(terms, trendsMap, compare);
	  }
  }
}).then(() => {
	// runs after we obtain the correct map
}).catch(() => {
	//console.log()
})
