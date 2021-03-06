import * as functions from "firebase-functions";
import SpotifyWebApi = require("spotify-web-api-node");
import admin = require("firebase-admin");
import { v4 as uuidv4 } from "uuid";
import { User } from "../../types/index";

admin.initializeApp();

// firebase types stuff https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
const converter = {
  toFirestore: (data: User) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
    snap.data() as User,
};

// add a user to auth when they login with Spotify
export const createUserWithSpotify = functions.https.onCall(
  async ({ authCode }) => {
    let tokenExpirationEpoch = 1;
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
      .withConverter(converter)
      .get();

    if (!existingUser.empty) {
      console.log("returning existingUser");
      return existingUser.docs[0].data();
    } else {
      console.log("creating new user");
      return await admin
        .firestore()
        .collection("users")
        .withConverter(converter)
        .add({
          displayName: spotifyUser.display_name || "",
          uid: uuidv4(),
          email: spotifyUser.email,
          spotifyUser: spotifyUser,
          tokenExpiresIn: tokenExpirationEpoch,
          spotifyCredentials: spotifyApi.getCredentials(),
        })
        .then((doc) => {
          return doc.get().then((data) => {
            return data.data();
          });
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
