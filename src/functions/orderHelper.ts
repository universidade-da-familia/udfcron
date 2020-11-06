import CryptoJS from 'crypto-js';
import Base64 from 'crypto-js/enc-base64';

export default function oauthHelper() {
    const NETSUITE_ACCOUNT_ID = "5260046";
    const BASE_URL =
        "https://5260046.restlets.api.netsuite.com/app/site/hosting/restlet.nl";
    const HTTP_METHOD = "POST";
    const SCRIPT_ID = "220";
    const OAUTH_VERSION = "1.0";
    const SCRIPT_DEPLOYMENT_ID = "1";
    const TOKEN_ID =
        "9e9f1fa9cd43eb39ce8740cec7c80e4668ee63d62c862860f6a91a45f9e2f84c";
    const TOKEN_SECRET =
        "14010c62c07470f4a433ba99072bfa92c4e7f4d5503cceef2965131c5911dd61";
    const CONSUMER_KEY =
        "ae45c0c498ae3de7697a8f6ba3265f67f0c2cb3bfa81e62d64f3ccf2ba9341b3";
    const CONSUMER_SECRET =
        "86a200c48a6ce8f20d274fcd53c7492d34e0aa90fa10866873eb4e4e3e9ea066";
    var text = "";
    const length = 32;
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    const OAUTH_NONCE = text;
    const TIME_STAMP = Math.round(+new Date() / 1000);

    const data = `deploy=${SCRIPT_DEPLOYMENT_ID}&oauth_consumer_key=${CONSUMER_KEY}&oauth_nonce=${OAUTH_NONCE}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${TIME_STAMP}&oauth_token=${TOKEN_ID}&oauth_version=${OAUTH_VERSION}&script=${SCRIPT_ID}`;

    const encodedData = encodeURIComponent(data);

    const completeData = `${HTTP_METHOD}&${encodeURIComponent(
        BASE_URL
    )}&${encodedData}`;

    // const completeData =
    //   HTTP_METHOD + "&" + encodeURIComponent(BASE_URL) + "&" + encodedData;
    const hmacsha1Data = CryptoJS.HmacSHA1(
        completeData,
        CONSUMER_SECRET + "&" + TOKEN_SECRET
    );
    const base64EncodedData = Base64.stringify(hmacsha1Data);
    const oauth_signature = encodeURIComponent(base64EncodedData);

    const OAuth = `OAuth oauth_signature="${oauth_signature}",oauth_version="1.0",oauth_nonce="${OAUTH_NONCE}",oauth_signature_method="HMAC-SHA1",oauth_consumer_key="${CONSUMER_KEY}",oauth_token="${TOKEN_ID}",oauth_timestamp="${TIME_STAMP}",realm="${NETSUITE_ACCOUNT_ID}"`;

    return OAuth;
}
