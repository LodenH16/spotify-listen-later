import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { SpotifyAuth, Scopes } from "react-spotify-auth";
import SpotifyLoginButton from "../components/SpotifyLoginButton/index";
import ArtistProfile from "../components/ArtistProfile/ArtistProfile";
import styles from "../styles/Home.module.css";
import { app } from "../firebase/clientApp";
import { getApp } from "firebase/app";
import { signInWithGoogle } from "../firebase/clientApp";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { useForm } from "react-hook-form";

// init firebase services
const functions = getFunctions(app);
const db = getFirestore();
const auth = getAuth();
// connect firebase emulators
connectFunctionsEmulator(functions, "localhost", 5001);
connectFirestoreEmulator(db, "localhost", 8080);
connectAuthEmulator(auth, "http://localhost:9099");
//* uncomment the above lines to test firebase services locally

export default function Home() {
  const router = useRouter(); // Nextjs router to get url params for Spotify login
  // states
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [spotifyCode, setSpotifyCode] = useState(null);
  // Firebase Function Hooks https://github.com/CSFrequency/react-firebase-hooks
  const [searchArtists, searchArtistsExecuting, searchArtistsError] =
    useHttpsCallable(functions, "searchArtists");
  const [loginWithSpotify, loginWithSpotifyExecuting, loginWithSpotifyError] =
    useHttpsCallable(functions, "createUserWithSpotify");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(); // form hook https://react-hook-form.com/

  useEffect(() => {
    //console.log("spotify code here: ", spotifyCode);
    setSpotifyCode(router.query);

    // you have to define an async function in a useEffect
    const callLoginFunction = async () => {
      console.log("router params: ", router.query.code);
      await loginWithSpotify({ authCode: router.query.code }).then((user) =>
        setUser(user)
      );
    };

    if (router.query.code) {
      console.log("sending the login function ✈");
      callLoginFunction();
    }
  }, [router.query]);

  useEffect(() => {
    app.auth().onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const searchArtistsSubmit = async (values) => {
    setSearchResults(await searchArtists(values.artistName));
  };

  const handleSpotifyLogin = async (token) => {
    //console.log("token:", token);
  };

  //console.log(searchResults?.data || "nothing yet");
  //console.log("user: ", user);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/*!user && <button onClick={signInWithGoogle}>Sign in with Google</button>*/}
      {!user && <SpotifyLoginButton />}
      {user && (
        <>
          <p>user exists!</p>
        </>
      )}
      <form onSubmit={handleSubmit(searchArtistsSubmit)}>
        <input {...register("artistName")} placeholder="Artist Name" />
        <button type="submit" disabled={searchArtistsExecuting}>
          Search Artists
        </button>
      </form>
      {searchResults &&
        searchResults.data.body.artists.items.map((artist, index) => {
          return <ArtistProfile key={`searchResult${index}`} props={artist} />;
        })}
    </div>
  );
}
