require('dotenv').config()

const cheerio = require('cheerio');
const database = require('./database');
const email = require('./email');
const scraper = require('./scraper');

const fixRelativeImg = ($, rootUrl) => {
    $('img').each((i, e) => {
        const currentValue = $(e).attr('src');
        const url = new URL(currentValue, rootUrl);
        const newValue = url.href;
        $(e).attr('src', newValue);
    });
    return $;
}

const fixRelativeA = ($, rootUrl) => {
    $('a').each((i, e) => {
        const currentValue = $(e).attr('href');
        const url = new URL(currentValue, rootUrl);
        const newValue = url.href;
        $(e).attr('href', newValue);
    });
    return $;
}


scraper.push(
    {
        url: 'https://www.kolding.dk/borger/horinger-afgorelser-planer',
        handler: async (html, url) => {
            const $ = cheerio.load(html);
            fixRelativeImg($, url);
            fixRelativeA($, url);
            const cards = $('.card');
            for(let i = 0; i < cards.length; i++){
                const c = cards[i];
                const title = $(c).find('button').text();
                const content = $(c).find('.card-body').html();
                const didInsert = await database.insert(title, content);
                if (didInsert) {
                    console.log("sending email " + title);
                    await email.send(title, content);
                }
            };

            await database.logRun();
        }
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