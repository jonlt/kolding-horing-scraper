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
            await scrape.handler(html, scrape.url);
        } else {
            console.log("ERROR", response);
        }
        scrape = queue.pop();
    }
}

exports.push = push;
exports.run = run;