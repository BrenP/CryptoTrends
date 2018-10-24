const st = require('stocktwits');
//const sentiment = require('sentimentApi');
st.get('streams/symbol/btc.x', function (err, res) {
    var json = res;
	for (var i = 0; i < json.body.messages.length; i++){
		console.log("ID: \t\t" + json.body.messages[i].id);
		console.log("Created: \t" + json.body.messages[i].created_at);
		console.log("Twit: \t\t" + json.body.messages[i].body);
		
		if(json.body.messages[i].entities.sentiment == null){
			console.log("Sentiment: \t" + json.body.messages[i].entities.sentiment + "\n");
		}
		else{
			console.log("Sentiment: \t" + json.body.messages[i].entities.sentiment.basic + "\n");
		}
	}
});
