// --- Servidor Express para o login OAuth2 ---
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());

app.get("/discord/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send("Nenhum código recebido.");

  try {
    const params = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: "https://api.recai.shop/discord/callback",
    });

    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      params,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = userResponse.data;

    res.redirect(`https://recai.shop/?user=${encodeURIComponent(JSON.stringify(user))}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao autenticar com Discord.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API OAuth rodando na porta ${PORT}`));
