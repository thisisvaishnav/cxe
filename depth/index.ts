type Orderbook {
  bids: Record<string, number>;
  ask: Record<string, number>;
}

const orderbook: Orderbook = { bids: [], asks: [] };
// checks order is inittialized or not
const orderbookInitiated = false;
ws.connect("wss://backpack.exchange")
// connect to websocket
// fetch sol_usdt
ws.send(message: SUBSCRIBE, book: SOL);
ws.onMessage((msg) => {
  if (!orderbookInitiated) {


  } else {

  }
});

const buffer = []
ws.on("connect", () => {
  const res = axios.get("https://api.backpack.exchnage")
  const { bid, ask, ofset } = res.data;
  orderbook.bids = bid;
  orderbook.ask = ask;
  orderbookInitiated = true;


})
