import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm


def get_all_station_names():
    url = "https://www.homemate-research-station.com/search-list/13/"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")
    station_list = []
    kana_pages = soup.find_all("ul", class_="areaul")
    for page in tqdm(kana_pages):
        station_pages = page.find_all("li")
        for station in station_pages:
            station = station.find("a")
            station_list.append(station.get_text())

    return station_list

if "__main__" == __name__:
    station_list = get_all_station_names()
    locations = ["東京都"] * len(station_list)
    df = pd.DataFrame({
        'station': station_list,
        'location': locations
    })
    df.to_csv('data/all_station_name_yukisaki.csv', index=False)
