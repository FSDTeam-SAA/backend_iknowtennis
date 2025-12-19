import app from "./app";
import { dbConfig } from "./config/db";
import { serverPort } from "./config/index";
import { connectRedis } from "./config/redis";

dbConfig();
connectRedis();

app.listen(serverPort, () => console.log(`http://localhost:${serverPort}`));
