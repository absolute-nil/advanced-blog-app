Number.prototype._called = {};

//! Later use selenium for integration tests
const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
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

test('when signed in shows logout button', async () => {
  await page.login();

  const text = await page.getContentsOf('a[href="/auth/logout"]');

  expect(text).toEqual('Logout');
});
