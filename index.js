const axios = require('axios');
const cheerio = require('cheerio');
const mcBase = "https://www.moneycontrol.com";
const mcIndustries = mcBase + "/stocks/marketstats/industry-classification/bse/abrasives.html";
const ALLOW_DELAY = false;
const DELAY_TIME = 100;
const MIN_RATING = 90;
const MAX_RATING = 101;

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetchWebsiteData(url, page) {
    // console.log("Crawling data...")
    // make http call to url  
    let response = await axios(url).catch((err) => {
        console.log("Error", err.cause)
    });

    if (response?.status !== 200) {
        console.log("Error occurred while fetching data");
        return;
    }
    response.page = page
    return response;
}
async function fetchMCScore(url) {
    // console.log("fetchMCScore:", url)
    if (ALLOW_DELAY) {
        await delay(DELAY_TIME);
    }
    const res = await fetchWebsiteData(url)
    if (res?.data) {
        const html = res.data;
        const $ = cheerio.load(html);
        const stock = $("#stockName > h1").text();
        const scoreText = $('#mcessential_div > div > div > div')
        const score = $(scoreText).text().substring(0, 2)
        // console.log("score:" + score)
        // console.log("MIN_RATING:" + MIN_RATING, score >= MIN_RATING)
        // console.log("MAX_RATING:" + MAX_RATING, score < MAX_RATING)
        if (score >= MIN_RATING && score < MAX_RATING) {
            console.log(url + " : " + stock + " : " + score)
        }
    }

}

async function fetchStocks(url) {
    // console.log("fetchStocks:", url)
    if (ALLOW_DELAY) {
        await delay(DELAY_TIME);
    }
    const res = await fetchWebsiteData(url)
    if (res?.data) {
        const html = res.data;
        const $ = cheerio.load(html);
        const stocksList = $('section > div > div > div > div > table > tbody > tr > td > span > a')
        // console.log("stocksList: ", stocksList)
        stocksList.each(function () {
            // console.log("stocksList: ", $(this).attr("href"))
            fetchMCScore($(this).attr("href"))
        });
    }
}
async function start(url) {
    // console.log("start:", url)
    // fetch industries
    const res = await fetchWebsiteData(url)
    if (res?.data) {
        const html = res.data;
        const $ = cheerio.load(html);
        const industryList = $("section > div > div > div > ul > li > a");
        // console.log("industryList: ", industryList[0].attribs.href)
        // Test to check only first page
        // fetchStocks(mcBase + industryList[0].attribs.href)

        industryList.each(function () {
            // console.log("industryList: ", $(this).attr("href"))
            const href = $(this).attr("href")
            if (href) {
                fetchStocks(mcBase + $(this).attr("href"))
            }
        });
    }

}
start(mcIndustries)
