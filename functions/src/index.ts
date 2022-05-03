import * as functions from "firebase-functions";
import SpotifyWebApi = require("spotify-web-api-node");
import admin = require("firebase-admin");

admin.initializeApp();

export const createUserFirestoreRecord = functions.auth
  .user()
  .onCreate((user) => {
    admin.firestore().collection("users").add({
      user_name: user.displayName,
      uid: user.uid,
    });
  });

export const createUserWithSpotify = functions.https.onCall(
  async ({ token }) => {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(token);
    spotifyApi.getMe().then(
      (user) => {
        console.log("user", user);
      },
      (error) => {
        console.log("⚠there was an error", error);
      }
    );
  }
);

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
