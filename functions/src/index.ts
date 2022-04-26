import * as functions from "firebase-functions";
import SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(process.env.TEMPORARY_ACCESS_TOKEN || "");

export const helloWorld = functions.https.onCall(async (data, context) => {
  return spotifyApi.searchArtists("Love");
});
