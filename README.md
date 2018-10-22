"# CryptoTrends" 
# CryptoTrends Webpage

1) Download all the files and save in a folder
2) open with notepad or any other text editing software if you wish to make any edits
3) save and upload the files

to run: simply double click the crypto.html which is the main page

index.html = main page

bitcoin.html = bitcoin page

litecoin.html = litecoin page

ethereum.html = ethereum page

disc.html = disclosure and pp page

crypto.css = styling css doc

# GoogleTrends Module
To run trends module: 
1) download app.js, trendsModule.js, trendsApi.js and save them in one folder
2) install Node Js and restart computer
3) open command prompt
4) install google-trends-api using: npm install google-trends-api
5) install async api using: npm install --save async
6) in command prompt go to folder containing the .js files
7) run app.js using: node app.js

Optional: app.js can accept user input. To do this simply run app using: node app.js [number of weeks] [1 or 0 (to print result)] [1 or 0(to compare two search terms)] [search term]...[search term]

example: Node app.js 4 1 0 Bitcoin Ethereum Litecoin

note: number of weeks must be less than 39. If weeks is more than 1 it will retrieve the daily data. If week is set to 1 it will display retrieve the hourly data. If week is set to 0 or less it will display the data by the minute. 
It can retrive as many terms as inputted by the user. However, if compare is set to 1 it will compare the first two terms only.
