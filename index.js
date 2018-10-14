var request = require('request');
var cheerio = require('cheerio');
var moment  = require('moment');

//how long do we determine if it has taken too long to update the repo
var expireDuration = process.env.EXPIRE_DURATION;

//what is the url of the repo
var httpUrl = process.env.HTTP_LINK_URL;

//var expireDuration = 1000 * 60 * 60;
//var httpUrl = 'https://github.com/gamesbykevin/yak'

//print our variables
console.log('expireDuration: ' + expireDuration);
console.log('httpUrl: ' + httpUrl);

//create our handler so aws lambda can be invoked
exports.handler = function(event, context, callback) {

	//make the http request
	request(httpUrl, function(err, resp, html) {
		
		//make sure there wasn't an error
		if (!err){
			
		  //create dom reference
		  const $ = cheerio.load(html);
		  
		  //has the bot expired
		  var expired = true;
		  
		  //loop through each <time-ago> on the page
		  $('time-ago').each(function(i, elm) {
			
			//get the date from the website
			var date = moment($(this).attr('datetime')).format("YYYY-MM-DD HH:mm");
			
			//get the current time
			var now = new Date();
			
			//calculate the time elapsed
			var diff = now.getTime() - moment(date).local().toDate().getTime();
			
			//if the time was recent enough, assume our bot is still working
			if (diff < expireDuration) {
				console.log('Not expired: ' + diff);
				expired = false;
			} else {
				console.log('Expired: ' + diff);
			}
		  });
		  
		  if (!expired) {
			  callback(null, "successful test");
		  } else {
			  callback('Time has expired');
		  }
		} else {
			
			//if there was an error we want this to fail
			callback('error');
		}
	});
}