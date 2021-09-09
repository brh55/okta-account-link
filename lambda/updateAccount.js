'use strict';

const okta = require('@okta/okta-sdk-nodejs');
const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
    clientId: process.env.REACT_APP_OKTA_CLIENT_ID,
    issuer: `${process.env.REACT_APP_OKTA_ORG_URL}/oauth2/default`,
});

const client = new okta.Client({
  orgUrl: process.env.OKTA_HUB_URL,
  token: process.env.OKTA_API_TOKEN    // Obtained from Developer Dashboard
});

module.exports.handler = async (event) => {
  try {
    const users = await client.listUsers({
      search: 'profile.sfdc_id eq "122223"'
    });

    let idpUser;
    // Once user found, end iterator
    await users.each((user) => {
      idpUser = user;
      return false;
    });

    if (idpUser) {
      // Redirect to Bookmark URL
      return {
        statusCode: 302,
        headers: {
          Location: 'https://dev-656962.oktapreview.com/home/bookmark/0oa11gaha3zFVvo9P0h8/1280'
        }
      };
    } else {
      // Redirect to account claim sign in page
      return {
        statusCode: 302,
        headers: {
          Location: 'https://google.com',
        }
      };

    }
  } catch (err) {
    console.warn(err);
  }
};

