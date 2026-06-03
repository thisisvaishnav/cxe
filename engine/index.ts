import { createClient } from "redis";

const BALANCES = {

}

const ORDERBOOKS = {
    SOL: {},
    BTC: {}
}

const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

while(1) {
    const response = await client.brPop("incoming-order", 1);
    console.log(response);
}
