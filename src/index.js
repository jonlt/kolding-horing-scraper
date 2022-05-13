require('dotenv').config()

const cheerio = require('cheerio');
const database = require('./database');
const email = require('./email');
const scraper = require('./scraper');

const fixRelativeUrl = (relativeUrl, rootUrl) => {
    const url = new URL(relativeUrl, rootUrl);
    const absoluteUrl = url.href;
    return absoluteUrl;
}

const detailsHandler = async (html, url) => {
    const $ = cheerio.load(html);
    const titleElements = $('bui-hero-slim')
    const title = titleElements[0].attribs.heading;

    const mainElement = $('bui-container[slot=main] > bui-raw');
    let content = mainElement.html();

    const locationElements = $('bui-meta-info[title=Område]');
    const location = locationElements[0].attribs.subtitle;
    const categoryElements = $('bui-meta-info[title=Kategori]');
    const category = categoryElements[0].attribs.subtitle;

    const didInsert = await database.insert(title, content, url, location, category);
    if (didInsert) {
        console.log("sending email " + title);
        content = `<h3><a href="${url}">LINK</a></h3>` + content;
        content = `<h3>Kategory: ${category}</h3>` + content;
        content = `<h3>Område: ${location}</h3>` + content;
        await email.send(title, content);
    }
}

const listHandler = async (html, url) => {
    const $ = cheerio.load(html);
    const cards = $('bui-card');
    for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const link = c.attribs.url;
        const absUrl = fixRelativeUrl(link, url);
        scraper.push({
            url: absUrl,
            handler: detailsHandler
        });
    };
    await database.logRun();
}

scraper.push({
    url: 'https://www.kolding.dk/borger/horinger-og-afgorelser/',
    handler: listHandler
});

async function main() {
    console.log("start");
    await email.init();
    await database.open();
    await database.init();
    await scraper.run();
    console.log("done");
}

main().catch(e => console.error(e));