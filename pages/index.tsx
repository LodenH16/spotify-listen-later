import React, { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { app } from "../firebase/clientApp";
import { getApp } from "firebase/app";
import { signInWithGoogle } from "../firebase/clientApp";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { useForm } from "react-hook-form";

const functions = getFunctions(app);
connectFunctionsEmulator(functions, "localhost", 5001);

export default function Home() {
  const [searchResults, setSearchResults] = useState(null);
  const [searchArtists, searchArtistsExecuting, searchArtistsError] =
    useHttpsCallable(functions, "searchArtists");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const searchArtistsSubmit = async (values) => {
    setSearchResults(await searchArtists(values.artistName));
  };

  console.log(searchResults?.data.body.artists || "nothing yet");

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <button onClick={signInWithGoogle}>Sign in to Google</button>
      <form onSubmit={handleSubmit(searchArtistsSubmit)}>
        <input {...register("artistName")} placeholder="Artist Name" />
        <button type="submit" disabled={searchArtistsExecuting}>
          Search Artists
        </button>
      </form>
    </div>
  );
}
