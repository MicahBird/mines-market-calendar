const puppeteer = require('puppeteer');
const ics = require('ics')
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({"headless": "new"});
  const page = await browser.newPage();
  const url = 'https://menus.sodexomyway.com/BiteMenu/Menu?menuId=14978&locationId=75204001&whereami=http://minesdining.sodexomyway.com/menu';

  await page.goto(url);
  await page.waitForSelector('body');

  // Extract the value of the "nd" variable from the page's JavaScript
  const ndValue = await page.evaluate(() => {
    return nd;
  });
  
  // Opinionated Good Food Array for adding to the title, feel free to add more with a PR ;)
  let goodFood = [
    'Burger',
    'Kielbasa Sausage Sandwich',
    'Grilled',
    'Chicken',
    'Patty',
    'Steak',
    'Quesadilla',
    'Toast',
    'Eggs',
    'Fish',
  ]
  
  // Convert the array to a JSON string
  const ndValueJSON = JSON.stringify(ndValue);
  
  // Convert JSON string to JSON object
  const menu = JSON.parse(ndValueJSON);
  
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

      // Set the title of the event to "[MEAL] -"
      let title = `[${dayPart.dayPartName}] -`;

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
              // Check if item has a description and change the format accordingly
              if (menuItem.description == '' || menuItem.description == null) {
                description += ` - ${menuItem.formalName}\n`;
              } else {
                description += ` - ${menuItem.formalName}: ${menuItem.description}\n`;
              }
              // If the menu item's formal name contains any word from the good food array, add it to the title
              for (let food of goodFood) {
                if (menuItem.formalName.includes(food)) {
                  title += ` ${menuItem.formalName},`;
                  break;  // exit the loop once we've found a match
                }
              }
            }
          }
        }
      }
      
      // Remove the last comma from the title if there is one
      if (title[title.length - 1] == ',') {
        title = title.slice(0, -1);
      }

      // Create the event
      let event = { start, end, title, description };

      events.push(event);
    }
  }

  // Create the calendar data
  const { error, value } = ics.createEvents(events);

  if (error) {
    console.log(error);
    return;
  }
  
  browser.close();

  // Write the calendar data to a .ics file
  fs.writeFileSync('menu.ics', value);
})();