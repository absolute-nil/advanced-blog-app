//! Later use selenium for integration tests
const puppeteer = require('puppeteer');

let browser;
let page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
  });

  page = await browser.newPage();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await browser.close();
});

test('check if header text is correct', async () => {
  const text = await page.$eval('a.brand-logo', (el) => el.innerHTML);

  expect(text).toEqual('Blogster');
});

test('on login click should lead to oauth flow', async () => {
  await page.click('.right a');

  const url = await page.url();

  expect(url).toMatch('/accounts.google.com');
});

test.only('when signed in shows logout button', async () => {
  const id = '5f6efda39d369a503a2f8997';
  const Buffer = require('safe-buffer').Buffer;

  const sessionBuffer = {
    passport: {
      user: id,
    },
  };

  const sessionString = Buffer.from(JSON.stringify(sessionBuffer)).toString(
    'base64'
  );

  const KeyGrip = require('keygrip');

  const keys = require('../config/keys');

  const keyGrip = new KeyGrip([keys.cookieKey]);
  const sig = keyGrip.sign('session=' + sessionString);

  await page.setCookie({ name: 'session', value: sessionString });
  await page.setCookie({ name: 'session.sig', value: sig });
  await page.goto('localhost:3000');

  await page.waitFor('a[href="/auth/logout"]');

  const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);

  expect(text).toEqual('Logout');
});
