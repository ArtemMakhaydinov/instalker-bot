'use strict'

const puppeteer = require('puppeteer');

module.exports = class InstagramScraper {
    constructor() {
        this.browserWSEndpoint = '';
        this.startURL = 'https://www.instagram.com/';
        this.logedIn = false;
        this.onLoad  = this.init();
        this.logingInNow = false;
    }

    async init() {
        this.logingInNow = true;
        const browser = await this.launchBrowser();
        const page = await this.loadPage(browser, this.startURL, 'input[name="username"]');
        const loged = await this.logIn(page);
        // await page.close();
        // await browser.disconnect();
        this.logingInNow = false;
    }

    async getImgUrls(username) {
        const url = `https://www.instagram.com/${username}/`
        const browser = await this.launchBrowser();
        const page = await this.loadPage(browser, url);
        const imgUrls = await this.scrapImgUrls(page);
        // await page.close();
        // await browser.disconnect();
        return imgUrls;
    }

    async launchBrowser() {
        const browser = this.browserWSEndpoint
            ? await puppeteer.connect({browserWSEndpoint: this.browserWSEndpoint})
            : await puppeteer.launch({
                headless: false,
                args: [
                    // "--incognito",
                    "--no-sandbox",
                    "--single-process",
                    "--no-zygote",
                    "--disable-dev-shm-usage",
                ],
            });

        this.browserWSEndpoint = browser.wsEndpoint();
        if (browser.connected) {
            return browser;
        } else {
            return new Error('Failed to launch browser.');
        }
    }

    async loadPage(browser, URL, selector, page) {
        if (!page) {
            page = await browser.newPage();
            await page.setViewport({ width: 800, height: 600 });
        }

        await page.goto(URL);
        if (selector) {
            await page.waitForSelector(selector);
        }

        return page;
    }

    async scrapImgUrls(page) {
        await page.waitForSelector('div._aagv > img');
        return await page.$$eval('div._aagv > img', (elements) => {
            return elements.map(e => e.src);
        });
    }

    async logIn(page) {
        try{
            const usernameInput = await page.$('input[name="username"]');
            const passwordInput = await page.$('input[name="password"]');
            if (usernameInput && passwordInput){
                await usernameInput.type(process.env.INSTAGRAM_LOGIN, { delay: 50 });
                await passwordInput.type(process.env.INSTAGRAM_PASSWORD, { delay: 100 });
                await page.click('button[type="submit"]');
            } else {
                throw new Error('Failed to login.');
            }

            const saveLoginScreen = await this.pushButton(page, 'svg[aria-label="Instagram"]', 'div[role="button"]');
            const turnNotificationsScreen = await this.pushButton(page, 'img[src="/images/instagram/xig/ico/xxhdpi_launcher.png?__d=www"]', 'button + button');
            
        } catch (err) {
            return err;
        }

        this.logedIn = true;
        return true;
    }

    async pushButton(page, waitSelector, buttonSelector) {
        try{
            await page.waitForSelector(waitSelector);
            const button = await page.$(buttonSelector);
            if (button) {
                await button.click();
            }
        } catch(err) {
            return new Error ('Failed to click button.')
        }
    }
}

// Instagram new Chromium launch screens order:
// 1. Login
// 2. Unusual activity ??
// 3. Phone/Whatsup code ??
// 4. Enter code ??
// 5. Save login
// 6. Turn on notifications
