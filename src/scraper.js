const axios = require('axios');

const queue = [];

const push = async (scrape) => {
    queue.push(scrape);
}

const run = async () => {
    let scrape = queue.pop();
    while (scrape) {
        let response = await axios.get(scrape.url);
        if (response.status == 200) {
            const html = response.data;
            try {
                await scrape.handler(html, scrape.url);
            } catch (error) {
                console.log("[scraper] error in handler", error)
            }
        } else {
            console.log("[scraper] non-OK response", response);
        }
        scrape = queue.pop();
    }
}

exports.push = push;
exports.run = run;