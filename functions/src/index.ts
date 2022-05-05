import * as functions from "firebase-functions";
import SpotifyWebApi = require("spotify-web-api-node");
import admin = require("firebase-admin");

admin.initializeApp();
// create user document in Firestore when a new
// user is added in Auth
export const createUserFirestoreRecord = functions.auth
  .user()
  .onCreate((user) => {
    admin.firestore().collection("users").add({
      displayName: user.displayName,
      uid: user.uid,
      email: user.email,
    });
  });

// add a user to auth when they login with Spotify
export const createUserWithSpotify = functions.https.onCall(
  async ({ token }) => {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(token);

    const user = await spotifyApi.getMe().then((data) => data.body);

    admin.auth().createUser({
      email: user.email,
      displayName: user.display_name,
    });

    return user;
  }
);

// search artists with a string and return the results
export const searchArtists = functions.https.onCall(async (data) => {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
  await spotifyApi.clientCredentialsGrant().then((data) => {
    spotifyApi.setAccessToken(data.body["access_token"]);
  });

  return spotifyApi.searchArtists(data);
});
