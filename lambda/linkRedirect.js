'use strict';

const okta = require('@okta/okta-sdk-nodejs');
const jwtDecode = require('jwt-decode');
const { Buffer } = require('buffer');

const client = new okta.Client({
  orgUrl: process.env.OKTA_HUB_URL,
  token: process.env.OKTA_HUB_API_TOKEN    // Obtained from Developer Dashboard
});

module.exports.handler = async (event) => {
  try {
    if (event.body === null || event.body === undefined) {
      throw new Error("Expecting idToken in payload");
    }

    // HTTP API encodes form data in base64encoding
    // decode the data, and parse the raw form data (body: "id_token=xxxx")
    if (event.isBase64Encoded) {
      event.body = Buffer.from(event.body, 'base64').toString('utf-8');
      event.body = {
        id_token: event.body.split('=')[1]
      }
    }

    const { id_token } = event.body;
    const claims = jwtDecode(id_token);
    const { seiAttribute } = claims;

    console.log("Sei Attribute from OIDC Token =", seiAttribute);
    const users = await client.listUsers({
      search: `profile.seiAttribute eq "${seiAttribute}"`
    });

    let idpUser;
    // Once user found, end iterator
    await users.each((user) => {
      idpUser = user;
      return false;
    });

    if (idpUser) {
      console.log('User found --> redirecting to target url');
      // Redirect to Bookmark URL
      return {
        statusCode: 302,
        headers: {
          Location: process.env.TARGET_REDIRECT_URL,
        }
      };
    } else {
      console.log('User not found --> redirect to claim app');
      // Redirect to account claim sign in page
      return {
        statusCode: 302,
        headers: {
          Location: process.env.ACCOUNT_CLAIM_URL,
        }
      };

    }
  } catch (err) {
    console.warn(err);
    return {
      statusCode: 500,
      body: err
    };

  }
};

