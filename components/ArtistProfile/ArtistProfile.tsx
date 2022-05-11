import * as React from "react";
import Image from "next/image";
import { ArtistCard } from "./styles";

export default function ArtistProfile({ props }) {
  const { name, images, genres, uri } = props;

  return (
    <ArtistCard>
      {images[0]?.url && (
        <Image
          src={images[0].url}
          alt={`${name} profile image`}
          width={200}
          height={200}
        />
      )}
      <p>{name}</p>
      <p>
        Genres:{" "}
        {genres.map((genre, index) => {
          return <p key={`${name}genre${index}`}>{genre}</p>;
        })}
      </p>
    </ArtistCard>
  );
}
