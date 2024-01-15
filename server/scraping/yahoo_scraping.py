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

def statistic_info(time, fare, transfer_count):
    time_mean = int(sum(time) / len(time))
    fare_mean = int(sum(fare) / len(fare))
    transfer_count_mode = statistics.mode(transfer_count)
    return time_mean, fare_mean, transfer_count_mode

if "__main__" == __name__:
    page_num = [i for i in range(1, 7)]
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

    start = 2000
    df = pd.read_csv("data/top100_station.csv")
    # departure_stations = ["高野駅", "栄町駅", "山下駅", "京橋駅", "高松駅", "山田駅"] # エラーが出た駅
    departure_stations = ["江戸川駅", "天王洲アイル駅", "中野富士見町駅", "滝本駅", "御岳山駅"] # エラーが出た駅
    # destination_stations = ["三田駅"]
    # departure_stations = df["station"].values.tolist()[start:]
    destination_stations = df.query("flag == 1")["station"].values.tolist()

    sleep_count = 0
    try:
        for departure_station in tqdm(departure_stations):
            for destination_station in destination_stations:
                if sleep_count % 2000 == 0:
                    print("================ sleep 5 sec ================")
                    time.sleep(5)
                sleep_count += 1
                print(f"Now : {sleep_count}")
                if departure_station == destination_station:
                    continue
                print(f"出発駅：{departure_station}、到着駅：{destination_station}")
                departure_list.append(departure_station)
                destination_list.append(destination_station)
                departure = departure_station[:-1] + "(東京都)" #TODO 西武、京成、京急だと何故かバグる
                # destination = destination_station[:-1] + "(東京都)"
                # for num in page_num:
                #     time, count, fare = get_info(num, departure, destination)
                #     time_list.append(time)
                #     count_list.append(count)
                #     fare_list.append(fare)
                # time_mean, fare_mean, transfer_count_mode = statistic_info(time_list, fare_list, count_list)
                # time_, count, fare, url = get_info(1, departure_station, destination_station)
                time_, count, fare, url = get_info(1, departure, destination_station)
                result_time_list.append(time_)
                result_count_list.append(count)
                result_fare_list.append(fare)
                url_list.append(url)
                # result_name = result_name + "駅"
                # if departure_station != result_name:
                #     print(f"departure_station : {departure_station}")
                #     print(f"result_name : {result_name}")
                #     match_name.append(result_name)
                if sleep_count % 1000 == 0:
                    result = pd.DataFrame({"departure": departure_list, "destination": destination_list, "time": result_time_list, "count": result_count_list, "fare": result_fare_list})
                    result.to_csv("data/result_save_point.csv", index=False)
    except KeyboardInterrupt:
        if len(departure_list) - len(result_time_list) != 0:
            result_time_list.append("Error")
        if len(departure_list) - len(result_count_list) != 0:
            result_count_list.append("Error")
        if len(departure_list) - len(result_fare_list) != 0:
            result_fare_list.append("Error")
        print("KeyboardInterrupt")
        result = pd.DataFrame({"departure": departure_list, "destination": destination_list, "time": result_time_list, "count": result_count_list, "fare": result_fare_list})
        result.to_csv("data/result_save_point.csv", index=False)
    except Exception as Error:
        print(Error)
        if len(departure_list) - len(result_time_list) != 0:
            result_time_list.append("Error")
        if len(departure_list) - len(result_count_list) != 0:
            result_count_list.append("Error")
        if len(departure_list) - len(result_fare_list) != 0:
            result_fare_list.append("Error")
        result = pd.DataFrame({"departure": departure_list, "destination": destination_list, "time": result_time_list, "count": result_count_list, "fare": result_fare_list})
        result.to_csv(f"data/result{start+1}_{start+1+sleep_count//100}.csv", index=False)

    # print(departure_list)
    # print(destination_list)
    # print(result_time_list)
    # print(result_count_list)
    # print(result_fare_list)
    # print(url_list)
    result = pd.DataFrame({"departure": departure_list, "destination": destination_list, "time": result_time_list, "count": result_count_list, "fare": result_fare_list})
    result.to_csv(f"data/result{start+1}_{start+1+sleep_count//100}.csv", index=False)# Check point 値を変える # TODO ファイル名の書き換えがめんどいので、値を保持して、最後に書き込むようにする