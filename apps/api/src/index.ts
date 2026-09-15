import { createApp } from "./app.js";
import { env } from "./env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`AutoDoc API listening on ${env.API_URL} (port ${env.PORT})`);
});
