import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

def get_all_station_names():
    url = "http://travelstation.tokyo/station/kanto/kanto.htm"
    response = requests.get(url)

    soup = BeautifulSoup(response.content, "html.parser")

    station_pages = soup.find_all("ul", class_="stationnames")

    name = []
    url = []
    for page in station_pages:
        station_elements = page.find_all('a')
        station_names = [element.get_text() for element in station_elements]
        station_urls = [element.get('href') for element in station_elements]
        name += station_names
        url += station_urls

    return name, url

def get_station_location(url):
    prefectures = ["東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県"]
    url = f"http://travelstation.tokyo/station/kanto/{url}"
    response = requests.get(url)

    soup = BeautifulSoup(response.content, "html.parser")

    location_text = ''
    location = ''
    for dt in soup.find_all('dt'):
        if dt.get_text() == '所在地':
            location_text = dt.find_next_sibling('dd').get_text()
            for prefecture in prefectures:
                if prefecture in location_text:
                    location = prefecture
                    break
            break

    return location

if "__main__" == __name__:
    locations = []
    station_names, station_urls = get_all_station_names()
    for url in tqdm(station_urls):
        locations.append(get_station_location(url))
    df = pd.DataFrame({'station': station_names, 'location': locations})
    df.to_csv('data/all_station_name.csv', index=False)
    # print(df)
    print(len(station_names), len(locations))