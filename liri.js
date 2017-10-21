const request = require("request");
const fs = require("fs");
const Twitter = require('twitter');
const Spotify = require('node-spotify-api');
const myKeys = require('./keys.js');

let inpArrCat = process.argv[2]; //gets the input category
let inpArrLen = process.argv.length; //gets the length to see how many parameters are being passed

/** 
 *This function adds result history to the log.txt file.
 */
let addToLog = inputToLog => {
  fs.appendFile('log.txt', inputToLog, (error) => {
    if (error)
      console.log(`Error: ${error}`);
  });
};

/** 
 * This function calls the omdb api via 'request' and displays the result
 * using console log. 
 */

let movieTitle = ""; //initializes movie title variable
let moviesUrl = ""; //initializes omdb api url variable

let callMovieApi = movieTitleInput => {
  moviesUrl = `http://www.omdbapi.com/?&apikey=40e9cece&t=${movieTitleInput}`;
  request(moviesUrl, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let result = JSON.parse(body);
      let rottRating = '';
      addToLog(`\n${body}`);
      for (let x in result.Ratings) {
        let source = result.Ratings[x].Source;
        if (source === 'Rotten Tomatoes') {
          rottRating = result.Ratings[x].Value;
          break;
        } else
          rottRating = 'N/A';
      } //ends for loop
      console.log(`\nTitle: ${result.Title}`);
      console.log(`Year: ${result.Year}`);
      console.log(`IMDB Rating: ${result.imdbRating}`);
      console.log(`Rotten Tomatoes Rating: ${rottRating}`);
      console.log(`Country: ${result.Country}`);
      console.log(`Language: ${result.Language}`);
      console.log(`Plot: ${result.Plot}`);
      console.log(`Actors: ${result.Actors}`);
    } else {
      console.log(`Error: ${error}`);
      console.log(`Status code: ${response.statusCode}`);
    } //ends if/else
  }); //ends request
}; //ends function

/**  
 * Gets the movie title and passes it to the 'callMovieApi' function. If
 * there is spaces in the title it will fill the blanks with '+' sign. If
 * no parameters 'Mr. Nobody' will be displayed.
 */
let setMovieTitleFunction = () => {
  if (inpArrLen === 3) {
    callMovieApi('Mr+Nobody');
  } else if (inpArrLen === 4) {
    movieTitle = process.argv[3];
    callMovieApi(movieTitle);
  } else if (inpArrLen > 4) {
    for (let i = 3; i < inpArrLen; i++)
      if (!movieTitle)
        movieTitle += process.argv[i];
      else
        movieTitle += `+${process.argv[i]}`;
    callMovieApi(movieTitle);
  }
};

/**
 * This function calls the Twitter API and retrieves the last 20 tweets.
 */
let twitterFunction = () => {

  let client = new Twitter(myKeys.twitterKeys); //Create a new Twitter instance with imported keys.
  let params = { //set Twitter parameters username and count
    screen_name: '@dogrock2lnx',
    count: 20
  };

  client.get('statuses/user_timeline', params, function (error, tweets, response) {
    if (!error)
      for (let x in tweets) {
        console.log(`\nTweet: ${tweets[x].text}`);
        console.log(`Date: ${tweets[x].created_at}`);
        addToLog(`\nTweet: ${tweets[x].text} `);
        addToLog(`Date: ${tweets[x].created_at}`);
      }
  });
};

/**
 * Reads and executes the command in the random.txt
 */
let randomExecute = () => {
  fs.readFile("random.txt", "utf8", function (error, data) {
    let dataSplit = '';
    let randComm = '';
    let randValPreformatted = '';
    let randValArr = '';
    let randVal = '';
    if (!error) {
      dataSplit = data.split(',');
      randComm = dataSplit[0];
      randValPreformatted = dataSplit[1].substring(1, dataSplit[1].length - 1);
      randValArr = randValPreformatted.split(' ');
      for (let x in randValArr)
        randVal += randValArr[x] + '+';
      randVal = randVal.substring(0, randVal.length - 1);
      if (randComm === "movie-this")
        callMovieApi(randVal);
      if (randComm === "spotify-this-song")
        spotifyApiCall(randVal);
      if (randComm === "my-tweets")
        twitterFunction();
    }
  });
};

/**
 * Calls the spotify API and gets data by songs name.
 */
let spotifyApiCall = songName => {

  let spotify = new Spotify(myKeys.spotifyKeys);

  spotify.request(`https://api.spotify.com/v1/search?q=track:${songName}&type=track&limit=1`).then(function (data) {
    let artistsCnt = data.tracks.items[0].artists.length;
    let artistList = [];
    let title = data.tracks.items[0].name;
    let preview = data.tracks.items[0].external_urls.spotify;
    let album = data.tracks.items[0].album.name;
    for (let x in data.tracks.items[0].artists)
      artistList.push(data.tracks.items[0].artists[x].name);
    console.log(`\nArtist(s): ${artistList}`);
    console.log(`Title: ${title}`);
    console.log(`Preview: ${preview}`);
    console.log(`Album: ${album}\n`);
    addToLog(`\nArtist(s): ${artistList}`);
    addToLog(`Title: ${title}`);
    addToLog(`Preview: ${preview}`);
    addToLog(`Album: ${album}`);

  }).catch(function (err) {
    console.error(`Error: ${err}`);
  });

};

/**
 * Makes calls depending on input
 */
if (inpArrCat === "movie-this") {
  setMovieTitleFunction();
} else if (inpArrCat === "my-tweets") {
  twitterFunction();
} else if (inpArrCat === "spotify-this-song") {
  let inputSongName = '';
  if (inpArrLen > 3) {
    for (let i = 3; i < inpArrLen; i++)
      if (!inputSongName)
        inputSongName += process.argv[i];
      else
        inputSongName += `+${process.argv[i]}`;
    spotifyApiCall(inputSongName);
  } else if (inpArrLen === 3)
    spotifyApiCall('The+Sign+Ace+of+Base');
} else if (inpArrCat === "do-what-it-says") {
  randomExecute();
}