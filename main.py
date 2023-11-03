import requests
from bs4 import beautifulsoup
from ics import calendar, event
import json
import re

def scrape_menu():
    url = "https://menus.sodexomyway.com/bitemenu/menu?menuid=14978&locationid=75204001&whereami=http://minesdining.sodexomyway.com/menu"
    response = requests.get(url)
    if response.status_code != 200:
        raise exception(f"failed to retrieve the page: {response.status_code}")

    soup = beautifulsoup(response.content, "html.parser")
    script_tag = soup.find("script", text=re.compile(r"window\.__preloaded_state__"))
    if script_tag is none:
        raise exception("failed to find the json data")

    json_text = re.search(r"window\.__preloaded_state__ = (.+?);", script_tag.string).group(1)
    data = json.loads(json_text)

    return data

def create_calendar_events(data):
    calendar = calendar()

    for day, meals in data['days'].items():
        for meal, items in meals.items():
            if meal != "have a nice day!":
                event = event()
                event.name = meal
                event.begin = f"{day} {items['start_time']}"
                event.end = f"{day} {items['end_time']}"
                event.description = ", ".join(item['name'] for item in items['menu'])
                calendar.events.add(event)

    with open("menu.ical", "w") as f:
        f.write(str(calendar))

if __name__ == "__main__":
    data = scrape_menu()
    create_calendar_events(data)