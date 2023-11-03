const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://menus.sodexomyway.com/BiteMenu/Menu?menuId=14978&locationId=75204001&whereami=http://minesdining.sodexomyway.com/menu';

  await page.goto(url);
  await page.waitForSelector('body');

  // Extract the value of the "nd" variable from the page's JavaScript
  const ndValue = await page.evaluate(() => {
    return nd;
  });

  console.log('Value of "nd" variable:', ndValue);

  // Convert the array to a JSON string
  const ndValueJSON = JSON.stringify(ndValue);

  // Write the JSON string to a text file
  fs.writeFileSync('nd_variable.json', ndValueJSON);

  console.log('Value of "nd" variable written to nd_variable.json');

  await browser.close();
})();
