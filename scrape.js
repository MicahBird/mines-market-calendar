const puppeteer = require('puppeteer');
const ics = require('ics')
const fs = require('fs');

(async () => {
  // const browser = await puppeteer.launch({headless: true});
  // const page = await browser.newPage();
  // const url = 'https://menus.sodexomyway.com/BiteMenu/Menu?menuId=14978&locationId=75204001&whereami=http://minesdining.sodexomyway.com/menu';

  // await page.goto(url);
  // await page.waitForSelector('body');

  // // Extract the value of the "nd" variable from the page's JavaScript
  // const ndValue = await page.evaluate(() => {
  //   return nd;
  // });
  
  // Read local json file for testing
  const ndValue = require('./formatted-example.json');

  // console.log('Value of "nd" variable:', ndValue);

  // Convert the array to a JSON string
  const ndValueJSON = JSON.stringify(ndValue);
  
  // Convert JSON string to JSON object
  const menu = JSON.parse(ndValueJSON);
  
  console.log(menu);
  
  // Iterate through menu and create events
  let events = [];
  for (let i = 0; i < menu.length; i++) {
    // Obtain the start and end times for each meal using the "dayParts" JSON object
    for (let j = 0; j < menu[i].dayParts.length; j++) {
      let dayPart = menu[i].dayParts[j];

      // Parse the start and end times to the format required by the ics library
      let startTime = new Date(dayPart.courses[0].menuItems[0].startTime);
      let endTime = new Date(dayPart.courses[0].menuItems[0].endTime);
      let start = [startTime.getFullYear(), startTime.getMonth() + 1, startTime.getDate(), startTime.getHours(), startTime.getMinutes()];
      let end = [endTime.getFullYear(), endTime.getMonth() + 1, endTime.getDate(), endTime.getHours(), endTime.getMinutes()];

      
      // Parse through the menu items and add them to the description
      let description = '';
      for (let k = 0; k < dayPart.courses.length; k++) {
        if (dayPart.courses[k].courseName != '-' && dayPart.courses[k].courseName != 'MISCELLANEOUS') {
          let course = dayPart.courses[k];
          description += `${course.courseName}:\n`;
          for (let l = 0; l < course.menuItems.length; l++) {
            // If the menu item is "Have A Nice Day!" skip it
            if (course.menuItems[l].formalName != 'Have A Nice Day!') {
              let menuItem = course.menuItems[l];
              // Check if item has a description
              description += ` - ${menuItem.formalName}: ${menuItem.description}\n`;
            }
          }
        }
      }

      // Set the title of the event to "[MEAL] -"
      let title = `[${dayPart.dayPartName}] -`;



      // Create the event
      let event = { start, end, title, description };
      console.log(event);

      events.push(event);
    }
  }

  // Create the calendar data
  const { error, value } = ics.createEvents(events);

  if (error) {
    console.log(error);
    return;
  }

  // Write the calendar data to a .ics file
  fs.writeFileSync('menu.ical', value);

  console.log('Events written to events.ical');
})();
