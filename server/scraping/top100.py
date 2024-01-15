import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm


def get_top100_station_names(page_num):
    url = f"https://shingakunet.com/area/ranking_station-users/tokyo/?page={page_num}"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")
    station_list = []
    # ranking_pages = soup.find("table", class_="data_ranking mb20 top3")
    if page_num == 1:
        ranking_pages = soup.find("table", class_="data_ranking mb10")
    name_pages = ranking_pages.find_all("td", class_="name")
    for page in tqdm(name_pages):
        station = page.find("a").get_text()
        station_list.append(station)

    return station_list

if "__main__" == __name__:
    result = []
    page_nums = [i for i in range(1, 6)]
    # for page_num in page_nums:
    #     station_list = get_top100_station_names(page_num)
    #     result += station_list
    station_list = get_top100_station_names(page_nums[0])
    result += station_list
    df = pd.DataFrame({
        'station': station_list,
    })
    df.to_csv('data/station_top100.csv', index=False)
