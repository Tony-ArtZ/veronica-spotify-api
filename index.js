import express from "express";
import "dotenv/config";
import { getTokenAuthorization, getTokenRefresh } from "./utils/accessToken.js";
import { authRoute } from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 8080;

let accessToken = null;
let refresh_token = null;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/auth", authRoute);

//Get refresh_token from the database
const getRefreshToken = async () => {
  const response = await fetch("https://veronica-db-server.onrender.com/storetoken/refreshtoken");
  const data = await response.json();
  const { token } = data;

  refresh_token = token;
  await getAccessTokenFromRefreshToken();
};

//Get the access token
const getAccessTokenFromRefreshToken = async () => {
  const tokenResponse = await getTokenRefresh(refresh_token);
  accessToken = tokenResponse.access_token;
  console.log(accessToken);
};

getRefreshToken();
//refresh the access token every one hour
setInterval(getAccessTokenFromRefreshToken, 3500 * 1000);

app.post("/next", (req, res) => {
  const { action } = req.body;
  if(action == "next") {
    nextTrack();
  }

  res.json({message: "success"});
})

//functions
const nextTrack = async () => {
  const response = await fetch("https://api.spotify.com/v1/me/player/next", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
