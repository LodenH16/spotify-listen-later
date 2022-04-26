import * as functions from "firebase-functions";
import SpotifyWebApi = require("spotify-web-api-node");

export const helloWorld = functions.https.onCall(async (data, context) => {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
  await spotifyApi.clientCredentialsGrant().then((data) => {
    spotifyApi.setAccessToken(data.body["access_token"]);
  });

  return spotifyApi.searchArtists("Love");
});
