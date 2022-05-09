import * as React from "react";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import * as queryString from "query-string";

const SpotifyLoginButton = () => {
  const router = useRouter();

  const spotifyQueryParams = {
    response_type: "code",
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    scope: "playlist-read-private playlist-modify-private user-read-email",
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
    state: uuidv4(),
  };
  const spotifyOAuthRoute =
    "https://accounts.spotify.com/authorize?" +
    queryString.stringify(spotifyQueryParams);

  const handleClick = (e) => {
    e.preventDefault();
    router.push(spotifyOAuthRoute);
  };

  return <button onClick={handleClick}>Login with Spotify</button>;
};

export default SpotifyLoginButton;
