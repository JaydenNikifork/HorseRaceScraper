const puppeteer = require("puppeteer");

let browser;
let page;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const login = async () => {
    try {
        browser = await puppeteer.launch({
            headless: false,
            // slowMo: 10,
            defaultViewport: null,
            // headless: true,
            args: ["--fast-start", "--disable-extensions", "--no-sandbox"],
            ignoreHTTPSErrors: true
            
        });
        
        page = await browser.newPage();
        
        //login
        await page.goto('https://www.hpibet.com/Account/SignIn', { waitUntil: 'networkidle2' });
        
        await page.$eval('#Username', el => el.value = 'swoosh');
        await page.$eval('#Password', el => el.value = 'mewTwo7!');
        const signInBtn = await page.waitForSelector('[value="Sign in"]');
        await signInBtn.click();
        console.log("Logged In");
        return 200;
    } catch (err) {
        return 400;
    }
}

const getDiffs = async () => {
    try {
        // get data
        try {
            await page.waitForSelector('[data-bind="click: $root.redirectToTrack, css: { clickable: $data.HasRaceInfo }"]');
            const divs = await page.$$('[data-bind="click: $root.redirectToTrack, css: { clickable: $data.HasRaceInfo }"]');
            let woodbine;
            
            for (const div of divs) {
                const innerText = await page.evaluate(el => el.innerText, div);

                if (RegExp(process.env.TRACK).test(innerText)) {
                    woodbine = div;
                    console.log("FOUND WOODBINE!");
                    break;
                }
            }

            await woodbine.click();
            console.log('CLICKED WOODBINE');
            await sleep(2000);
        } catch (err) {}

        await page.waitForSelector('#race-info-content');

        const poolTotalsBtn = await page.waitForSelector('#pooltotals-tab');
        await poolTotalsBtn.click();
        console.log('CLICKED POOLS TOTALS');

        await page.waitForSelector(`[data-bind="text: IsScratched ? '' : $data.WinPercent"]`);
        let winPays = await page.$$(`[data-bind="text: IsScratched ? '' : $data.WinPercent"]`);
        winPays = winPays.map(async (winPay) => (
            await page.evaluate(el => el.innerText, winPay)
        ));
        winPays = await Promise.all(winPays);

        const poolTotalsTbl = await page.$('[data-bind="grid: { data: runnersWithTotals(), modifyOriginal: false }"]');
        let winProbs = winPays.map(winPay => Number(winPay));

        console.log(winProbs);

        const myCalc = [];
        for (let a = 0; a < winProbs.length; ++a) {
            for (let b = 0; b < winProbs.length; ++b) {
                if (a == b || winProbs[a] == 0 || winProbs[b] == 0) myCalc.push(0);
                else myCalc.push(2 / ((winProbs[a] * 0.01) * (winProbs[b] * 0.01) / (1 - (winProbs[a] * 0.01))));
            }
        }

        const probablesTabBtn = await page.waitForSelector('#probables-tab');
        await probablesTabBtn.click();
        console.log('CLICKED PROBABLES TABLE');

        await page.waitForSelector('[data-bind="css: { active: tab.isSelected }, click: $root.setProbable"]');
        const probables = await page.$$('[data-bind="css: { active: tab.isSelected }, click: $root.setProbable"]');
        let exacta;
        for (const probable of probables) {
            const innerText = await page.evaluate(el => el.innerText, probable);

            if (/Exacta/.test(innerText)) {
                exacta = probable;
                console.log("FOUND EXACTA!");
                break;
            }
        }

        await exacta.click();

        await page.waitForSelector(`[data-bind="text: probable.IsScratched ? '' : Hpi.utilities.formatMoney(probable.Amount, 0), css: { scratched: probable.IsScratched, 'lowest-value lead': probable.IsLowest }, attr: {'aria-hidden': IsScratched}"]`);
        let exactaAmts = await page.$$(`[data-bind="text: probable.IsScratched ? '' : Hpi.utilities.formatMoney(probable.Amount, 0), css: { scratched: probable.IsScratched, 'lowest-value lead': probable.IsLowest }, attr: {'aria-hidden': IsScratched}"]`);
        exactaAmts = exactaAmts.map(async (exactaAmt) => (
            await page.evaluate(el => el.textContent, exactaAmt)
        ));
        exactaAmts = await Promise.all(exactaAmts);
        exactaAmts = exactaAmts.map(exactaAmt => Number(exactaAmt.replace(/\$|,/g, '')));

        console.log(exactaAmts);

        console.log(myCalc);
        const diffs = [];
        for (let a = 0; a < myCalc.length; ++a) {
            diffs.push(myCalc[a] !== 0 ? 100 * (exactaAmts[a] - myCalc[a]) / myCalc[a] : 0);
        }

        console.log(diffs);

        // display data

        return diffs;
    } catch (err) {
        console.error(err);
        return [];
    }
}

const close = async () => {
    await browser.close();
}

module.exports = {
    login,
    getDiffs,
    close
}