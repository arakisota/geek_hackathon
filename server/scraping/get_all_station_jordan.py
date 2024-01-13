import pykakasi
import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm


def get_all_station_names():
    # url = f"https://mb.jorudan.co.jp/os/eki/menu_tyo/list_{initial_string}/"
    url = "https://mb.jorudan.co.jp/os/eki/menu_tyo/list_aa/"
    response = requests.get(url)
    print(response.status_code)
    print(response)
    soup = BeautifulSoup(response.content, "html.parser")
    print(soup)

    kana_pages = soup.find_all("span", class_="kana")
    station_pages = soup.find_all("span", class_="name")
    # print(kana_pages)
    # print(station_pages)
    rubi = []
    for page in kana_pages:
        rubi.append(page.get_text())

    name = []
    for page in station_pages:
        name.append(page.get_text())

    return rubi, name


def hiragana_to_alphabet(string):
    kakasi = pykakasi.kakasi()  # インスタンスの作成
    kakasi.setMode('H', 'a')
    conversion = kakasi.getConverter()
    result = conversion.do(string)
    if result in {"a", "i", "u", "e", "o"}:
        result = "a" + result
    return result


if "__main__" == __name__:
    rubi_list = []
    name_list = []

    japanese_list = ["あ","い","う","え","お",\
        "か","き","く","け","こ",\
        "さ","し","す","せ","そ",\
        "た","ち","つ","て","と",\
        "な","に","ぬ","ね","の",\
        "は","ひ","ふ","へ","ほ",\
        "ま","み","む","め","も",\
        "や","ゆ","よ",\
        "ら","り","る","れ","ろ",\
        "わ","を","ん"]

    get_all_station_names()
    # for hiragana in tqdm(japanese_list):
    # for hiragana in ["aa", "ai", "au", "ae", "ao"]:
    #     string = hiragana_to_alphabet(hiragana)
    #     rubi, name = get_all_station_names(string)
    #     rubi_list += rubi
    #     name_list += name

    # print(rubi_list)
    # print(name_list)

    # locations = ["東京都"] * len(rubi_list)
    # df = pd.DataFrame({
    #     'station': name_list,
    #     'rubi': rubi_list,
    #     'location': locations
    # })
    # df.to_csv('data/all_station_name.csv', index=False)
    # print(df)
