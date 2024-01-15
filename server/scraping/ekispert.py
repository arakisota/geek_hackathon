# -*- coding: utf-8 -*-
import requests
import statistics
from bs4 import BeautifulSoup
from tqdm import tqdm

def url_encode(from_station, to_station):
    params = {
        "from": from_station,
        "to": to_station,
        "y": "2024",
        "m": "01",
        "d": "10",
        "hh": "08",
        "m1": "3",
        "m2": "0",
        "type": "1",
        "ticket": "ic",
        "expkind": "1",
        "userpass": "1",
        "ws": "3",
        "s": "0",
        "al": "0",
        "shin": "0",  # 新幹線を含まない
        "ex": "0",    # 特急を含まない
        "hb": "0",
        "lb": "0",
        "sr": "1"
    }

    # URLのベース部分
    base_url = "https://transit.yahoo.co.jp/search/result"

    # クエリパラメータをURLエンコードしてURLを構築
    encoded_params = "&".join(f"{key}={value}" for key, value in params.items())
    url13 = f"{base_url}?{encoded_params}&fl=1&tl=3"
    url46 = f"{base_url}?{encoded_params}&fl=4&tl=6"

    print(url13)
    print(url46)

    return url13, url46

def get_route(url):
    route_response = requests.get(url)
    route_soup = BeautifulSoup(route_response.content, 'html.parser')
    print(route_soup)
    routes = route_soup.find("ul", id_="tabflt")
    # routes = route_soup.find("div", class_="navPriority")
    # aタグにあるhref属性を取得
    route_urls = []
    print(routes)
    for route in routes:
        route_url = route.find("a").get("href")
        route_urls.append(route_url)

    return route_urls

def get_route_info(url):
    time = []
    fare = []
    transfer_count = []
    route_response = requests.get(url)
    route_soup = BeautifulSoup(route_response.content, 'html.parser')
    routes = route_soup.find("ul", id_="rsltlst", class_="routeList").find_all("li")
    for route in routes:
        time.append(int(route.find("li", class_="time").find("span", class_="small").get_text()[:-1]))
        fare.append(int(route.find("li", class_="fare").find("span", class_="mark").get_text()))
        transfer_count.append(int(route.find("li", class_="transfer").find("span", class_="mark").get_text()))

    return time, fare, transfer_count

def statistic_info(time, fare, transfer_count):
    time_mean = int(sum(time) / len(time))
    fare_mean = int(sum(fare) / len(fare))
    transfer_count_mode = statistics.mode(transfer_count)
    return time_mean, fare_mean, transfer_count_mode

if "__main__" == __name__:
    from_station = "東京"
    to_station = "新宿"
    url13, url46 = url_encode(from_station, to_station)
    route_urls13 = get_route(url13)
    print(route_urls13)
    # route_urls46 = get_route(url46)
    # #出発駅の入力
    # departure_station = input("出発駅を入力してください：")
    # #到着駅の入力
    # destination_station = input("到着駅を入力してください：")

    # #経路の取得先URL
    # url = "https://transit.yahoo.co.jp/search/print?from="+departure_station+"&flatlon=&to="+ destination_station
    # route_urls = get_route(url)
    # print(route_urls)

    # time13, fare13, transfer_count13 = [], [], []
    # time46, fare46, transfer_count46 = [], [], []
    # print(f"From {from_station} to {to_station}...")
    # print("Route1〜Route3 getting...")
    # for route_url in tqdm(route_urls13):
    #     time, fare, transfer_count = get_route_info(route_url)
    #     time13 += time
    #     fare13 += fare
    #     transfer_count13 += transfer_count

    # print("Route4〜Route6 getting...")
    # for route_url in tqdm(route_urls46):
    #     time, fare, transfer_count = get_route_info(route_url)
    #     time46 += time
    #     fare46 += fare
    #     transfer_count46 += transfer_count

    # time_mean13, fare_mean13, transfer_count_mode13 = statistic_info(time13, fare13, transfer_count13)
    # time_mean46, fare_mean46, transfer_count_mode46 = statistic_info(time46, fare46, transfer_count46)
    # print(time_mean13, fare_mean13, transfer_count_mode13)
    # print(time_mean46, fare_mean46, transfer_count_mode46)