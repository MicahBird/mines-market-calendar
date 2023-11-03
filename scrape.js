const puppeteer = require('puppeteer'); // puppeteer module
const fs = require('fs'); // file system module

(async () => {
  const browser = await puppeteer.launch({headless: new Boolean(process.env.HEADLESS)}); // putting headless: new because it won't delay the entire script with some message
  const page = await browser.newPage();
  const url = 'https://menus.sodexomyway.com/BiteMenu/Menu?menuId=14978&locationId=75204001&whereami=http://minesdining.sodexomyway.com/menu'; // update if needed

  await page.goto(url); // self explanatory
  await page.waitForSelector('body'); // wait for the page to load (variable loads after page loads)

  // Extract the value of the "nd" variable from the page's JavaScript
  const ndValue = await page.evaluate(() => {
    return nd; // return the thing that holds all of our data from mines market
  });

  // Convert the array to a JSON string
  const ndValueJSON = JSON.stringify(ndValue); // convert the nd value to a json string

  // Write the JSON string to a text file
  fs.writeFileSync('dinner.json', ndValueJSON); // write the nd value, which holds a massive json object, to a file

  console.log('Dinner values outputted as dinner.json'); // success message in console

  // TODO: format scrape to ical format

  await browser.close(); // close the browser
})();
