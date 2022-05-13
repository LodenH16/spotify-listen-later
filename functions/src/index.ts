import * as functions from "firebase-functions";
import SpotifyWebApi = require("spotify-web-api-node");
import admin = require("firebase-admin");
import { v4 as uuidv4 } from "uuid";

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
  async ({ authCode }) => {
    let tokenExpirationEpoch;
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI,
    });
    // access token grant with auth code
    // https://github.com/thelinmichael/spotify-web-api-node/blob/master/examples/access-token-refresh.js
    await spotifyApi
      .authorizationCodeGrant(authCode)
      .then((data) => {
        // set access token and refresh token
        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"]);
        // calculate token expiration
        tokenExpirationEpoch =
          new Date().getTime() / 1000 + data.body["expires_in"];
      })
      .catch((err) => console.error(err));

    const spotifyUser = await spotifyApi.getMe().then((data) => data.body);

    const existingUser = await admin
      .firestore()
      .collection("users")
      .where("email", "==", spotifyUser.email)
      .get();

    if (!existingUser.empty) {
      console.log("returning existingUser");
      return existingUser;
    } else {
      console.log("creating new user");
      return await admin
        .firestore()
        .collection("users")
        .add({
          displayName: spotifyUser.display_name,
          uid: uuidv4(),
          email: spotifyUser.email,
          spotifyUser: spotifyUser,
          tokenExpiresIn: tokenExpirationEpoch,
          spotifyCredentials: spotifyApi,
        })
        .then((doc) => {
          return doc.get();
        });
    }
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
