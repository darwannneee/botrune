require("dotenv").config({ path: __dirname + "/.env" });
const { twitterClient } = require("./TwitterClient.js");

let latestSale = '';

const getRunesData = async () => {
  const proxyUrl = "http://your-proxy-url:port"; // Ganti dengan URL proxy Anda
  const response = await fetch("https://api-mainnet.magiceden.io/v2/ord/btc/activities?limit=20&offset=0&collectionSymbol=runestone&kind[]=buying_broadcasted&kind[]=offer_accepted_broadcasted&kind[]=coll_offer_fulfill_broadcasted", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,ms;q=0.6",
      "if-modified-since": "Thu, 14 Mar 2024 22:10:40 GMT",
      "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "referrer": "https://magiceden.io/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "omit",
  });


  const result = await response.json();

  return result.activities[0];
}

async function index() {
  try {
    const runes = await getRunesData();
    const id = runes.tokenId;
    const buyer = runes.buyerPaymentAddress;
    const tokenID = runes.token.inscriptionNumber;
    const price = parseFloat(runes.listedPrice / 100000000);

    if (price) {
      if (latestSale != tokenID) {
        sendTweet(price, buyer, tokenID, id);
        latestSale = tokenID;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function sendTweet(price, buyer, tokenID, id) {
  try {
    const text = `𝗡𝗲𝘄 𝐑𝐮𝐧𝐞𝐒𝐭𝐨𝐧𝐞 𝐒𝐚𝐥𝐞!
    
RuneStone #${tokenID} sold for ${price} BTC on https://magiceden.io/

Buyer
${buyer}

https://magiceden.io/ordinals/item-details/${id}`
    const tweet = await twitterClient.v2.tweet({
      text: text
    });

    if (tweet) {
      console.log('Tweet Success')
    }
  } catch (e) {
    console.log(e)
  }
}

setInterval(() => {
  index();
}, 600);
