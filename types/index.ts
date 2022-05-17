export interface User {
  displayName: string;
  uid: string;
  email: string;
  spotifyUser: object;
  tokenExpiresIn: number;
  spotifyCredentials: object;
}
