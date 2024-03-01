from concurrent import futures
import grpc
import logging
from suggestpb import suggest_pb2
from suggestpb import suggest_pb2_grpc

class SuggestService(suggest_pb2_grpc.SuggestServicer):

    def Suggest(self, request, context):
        # リクエスト内容を出力
        print("受け取ったリクエスト内容:")
        print("オプション:", request.option)
        for store_list in request.stores:
            for store in store_list.stores:
                print("店舗名:", store.name)
                # 他の店舗情報も出力できます

        # # ダミーレスポンスデータの生成
        # # 正しいStoresオブジェクトの使用例
        # store_list = suggest_pb2.Stores(stores=[
        #     suggest_pb2.Store(
        #         name="イタリアン・トラットリア",
        #         address="東京都新宿区...",
        #         access="新宿駅から徒歩5分",
        #         latitude=35.6895,
        #         longitude=139.6917,
        #         budget="3000円",
        #         open="11:00 - 23:00",
        #         genre=suggest_pb2.Genre(catch="本格イタリアン", name="イタリアン"),
        #         coupon_urls="http://example.com/coupons/1",
        #         image_url="http://example.com/images/1.jpg"
        #     ),
        #     suggest_pb2.Store(
        #         name="カフェ・デ・アミーゴ",
        #         address="東京都渋谷区...",
        #         access="渋谷駅から徒歩10分",
        #         latitude=35.6581,
        #         longitude=139.7017,
        #         budget="2000円",
        #         open="10:00 - 20:00",
        #         genre=suggest_pb2.Genre(catch="くつろぎカフェ", name="カフェ"),
        #         coupon_urls="http://example.com/coupons/2",
        #         image_url="http://example.com/images/2.jpg"
        #     )
        # ])
        plans = [suggest_pb2.Plan(plan="プラン1: 新宿で楽しむイタリアンディナー", stores=[store_list])]
        station_plan = suggest_pb2.StationPlan(plans=plans)
        return suggest_pb2.SuggestResponse(station=[station_plan])

def serve():
    logging.basicConfig(level=logging.INFO)
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    suggest_pb2_grpc.add_SuggestServicer_to_server(SuggestService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("サーバー起動中。ポート: 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()