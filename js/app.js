const trends = require('./trendsModule.js');
const async = require('async');
var args = +process.argv.length;
var weeks, print;
var terms = [];
var trendsMap;

function assignTrendValues(){
	if (args < 3){
		weeks = 4;
		print = 1;
	}
	else{
		weeks = +process.argv[2];
		if (args > 3){
			print = +process.argv[3];
			if(args > 4){
				var index = 0;
				for (var i = 4; i < args; i++){
					terms[index] = process.argv[i];
					index++;
				}
			}
		}
	}
}


async function main(){
	const mymap = await trends.main(weeks, print, terms);
	return mymap;
}
assignTrendValues();
main().then((map) => {
  // code that runs after map has been returned from threndsModule
});

