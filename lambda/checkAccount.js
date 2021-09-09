'use strict';

const okta = require('@okta/okta-sdk-nodejs');

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
      console.log('User Exists:', idpUser);
      // Redirect to Bookmark URL
      return {
        statusCode: 302,
        headers: {
          Location: 'https://google.com',
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

