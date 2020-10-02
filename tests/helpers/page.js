const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

// ! rename to Page later
class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    });

    const page = await browser.newPage();

    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        return customPage[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('localhost:3000/blogs');

    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return await this.page.$eval(selector, (el) => el.innerHTML);
  }

  get(path) {
    // path cant be accessed directly like fetch(path, because evaluate
    // will turn the request into json so the value of path
    // will not be there as it is in our local machine not in browser
    // because it executed in the browser
    // to solve this you will have to provide path as a second
    // argument like }, path); and then accept it in argument
    // like .evaluate((_path) => {
    return this.page.evaluate((_path) => {
      return fetch(_path, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());
    }, path);
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(_data),
        }).then((res) => res.json());
      },
      path,
      data
    );
  }
}

module.exports = CustomPage;
