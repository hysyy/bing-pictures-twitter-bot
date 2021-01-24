require('dotenv').config()
const fetch = require("node-fetch");
const request = require('request').defaults({ encoding: null });
const Twitter = require('twit');
const fs = require("fs")

const Tweet = new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_SECRET_KEY,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const dailyBingURL = "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US";

//Fetch the data from Bing
const getData = async () => {
    const responce = await fetch(dailyBingURL);
    const data = await responce.json()
    return data.images[0];
}

// Bot code
const tweetBot = async () => {
    const bingData = await getData();
    const tweetText = `"${bingData.title}"\r\n\r\n---------------------------------\r\n${bingData.copyright}`;

    //Image Fetch
    (async function (){
        request("https://www.bing.com" + bingData.url).pipe(fs.createWriteStream('bing.png'));
    })
    
    const filename = 'bing.png';
    const params = {
        encoding: 'base64'
    }
    const b64 = fs.readFileSync(filename, params);

    // (2) If image uploaded, post tweet
    const uploaded = (err, data, response) => {
        const id = data.media_id_string;
        const tweet = {
            status: tweetText,
            media_ids: [id]
        }
        console.log("Image Uploaded!");
        Tweet.post('statuses/update', tweet, tweeted);
    }

    // (3) If tweet posted, log response
    const tweeted = (err, data, response) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Tweet Sent!");
        }
    }

    // (1) Upload media to twitter
    Tweet.post('media/upload', {
        media_data: b64
    }, uploaded);

}

//Run the bot and set interval to 1 day
tweetBot();
setInterval(tweetBot, 86400000);