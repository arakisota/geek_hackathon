import re
import time
import requests
import statistics
import pandas as pd
from bs4 import BeautifulSoup
from tqdm import tqdm

def url_encode(departure_station, destination_station):
    params = {
        "from": departure_station,
        "to": destination_station,
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
        "sr": "0"
    }

    # URLのベース部分
    base_url = "https://transit.yahoo.co.jp/search/print"

    # クエリパラメータをURLエンコードしてURLを構築
    encoded_params = "&".join(f"{key}={value}" for key, value in params.items())
    url = f"{base_url}?{encoded_params}"

    return url

def extract_duration(text):
    # 所要時間のパターンを正規表現でマッチング
    match = re.search(r'(\d+)時間(\d+)分', text)
    if match:
        # "時間"と"分"の両方がある場合
        hours = int(match.group(1))
        minutes = int(match.group(2))
        return hours * 60 + minutes
    else:
        # "分"のみの場合
        match = re.search(r'(\d+)分', text)
        return int(match.group(1)) if match else None

def extract_price(text):
    # 金額のパターンを正規表現でマッチング（カンマがあるかないかの両方に対応）
    match = re.search(r'(\d+),?(\d+)?円', text)
    if match:
        # カンマで区切られた金額を結合して整数に変換
        # カンマがない場合は、最初のグループのみを使用
        return int(match.group(1) + (match.group(2) if match.group(2) else ''))
    else:
        return None


def get_info(num, departure_station, destination_station):
    #経路の取得先URL
    # url = f"https://transit.yahoo.co.jp/search/print?from={departure_station}&flatlon=&to={destination_station}&no={num}"
    url = url_encode(departure_station, destination_station)
    url = f"{url}&no={num}"

    # print(url)

    route_response = requests.get(url)
    route_soup = BeautifulSoup(route_response.text, 'html.parser')

    route_summary = route_soup.find("div",class_ = "routeSummary")
    # result_name = route_soup.find("div", class_ = "labelSearchResult").find("h1").get_text().split("→")[0]

    #所要時間を取得
    required_time = route_summary.find("li",class_ = "time").get_text()
    time = extract_duration(required_time)
    #乗り換え回数を取得
    transfer_count = route_summary.find("li", class_ = "transfer").get_text()
    count = int(transfer_count.split("回")[0][-1])
    #料金を取得
    fare = route_summary.find("li", class_ = "fare").get_text()
    fare = extract_price(fare)

    return time, count, fare, url

if "__main__" == __name__:
    time_list = []
    count_list = []
    fare_list = []
    result_time_list = []
    result_count_list = []
    result_fare_list = []
    departure_list = []
    destination_list = []
    url_list = []
    match_name = []

    start = 0
    # df = pd.read_csv("/Users/sotaaraki/geek_hackathon/server/data/converted_station_cd_2.csv")
    df = pd.read_csv("../data/bug.csv")
    # print(len(df))

    # departure_stations = df["station_cd1_name"].values.tolist()[start:]
    # destination_stations = df["station_cd2_name"].values.tolist()[start:]

    sleep_count = 0
    try:
        for i in tqdm(range(len(df))):
            try:
                departure_station = df["station_cd1_name"].values.tolist()[i] + "駅"
                destination_station = df["station_cd2_name"].values.tolist()[i] + "駅"
                print(departure_station, destination_station)
                if sleep_count % 2000 == 0:
                    print("================ sleep 5 sec ================")
                    time.sleep(5)
                sleep_count += 1
                print(f"Now : {sleep_count}")
                # if departure_station == destination_station:
                #     continue
                print(f"出発駅：{departure_station}、到着駅：{destination_station}")
                departure_list.append(departure_station)
                destination_list.append(destination_station)
                departure = departure_station[:-1]
                destination = destination_station[:-1]
                # departure = departure_station[:-1] + "()" #TODO 西武、京成、京急だと何故かバグる
                # destination = destination_station[:-1] + "(東京都)"
                time_, count, fare, url = get_info(1, departure, destination_station)
                result_time_list.append(time_)
                result_count_list.append(count)
                result_fare_list.append(fare)
                url_list.append(url)

                if sleep_count % 1000 == 0:
                    result = pd.DataFrame({"departure": departure_list, "destination": destination_list, "time": result_time_list, "count": result_count_list, "fare": result_fare_list})
                    result.to_csv("../data/result_save_point.csv", index=False)
            except AttributeError as Error:
                print(Error)
                result_time_list.append("Error")
                result_count_list.append("Error")
                result_fare_list.append("Error")
                url_list.append("Error")
            except Exception as Error:
                print("error : ", Error)
                if len(departure_list) - len(result_time_list) != 0:
                    result_time_list.append("Error")
                if len(departure_list) - len(result_count_list) != 0:
                    result_count_list.append("Error")
                if len(departure_list) - len(result_fare_list) != 0:
                    result_fare_list.append("Error")
                result = pd.DataFrame({"departure": departure_list, "destination": destination_list, "time": result_time_list, "count": result_count_list, "fare": result_fare_list})
                result.to_csv(f"../data/result{start+1}_{start+1+sleep_count//100}.csv", index=False)
    except KeyboardInterrupt:
        print("keyboardInterrupt")
        if len(departure_list) - len(result_time_list) != 0:
            result_time_list.append("Error")
        if len(departure_list) - len(result_count_list) != 0:
            result_count_list.append("Error")
        if len(departure_list) - len(result_fare_list) != 0:
            result_fare_list.append("Error")
        print("KeyboardInterrupt")
        result = pd.DataFrame({"departure": departure_list, "destination": destination_list, "time": result_time_list, "count": result_count_list, "fare": result_fare_list})
        result.to_csv("../data/result_save_point.csv", index=False)

    result = pd.DataFrame({"departure": departure_list, "destination": destination_list, "time": result_time_list, "count": result_count_list, "fare": result_fare_list})
    result.to_csv(f"../data/result{start+1}_{start+1+sleep_count//100}.csv", index=False)# Check point 値を変える # TODO ファイル名の書き換えがめんどいので、値を保持して、最後に書き込むようにする