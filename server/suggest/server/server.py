from concurrent import futures
import grpc
from suggestpb import suggest_pb2
from suggestpb import suggest_pb2_grpc

class SuggestService(suggest_pb2_grpc.SuggestServicer):
    def Suggest(self, request, context):
        # ビジネスロジックをここで実装します。
        # この例では、単純なダミーレスポンスを返します。
        print("リクエスト受信:", request)
        for shop in request.stations:
            print(f"店舗名: {shop.name}, 住所: {shop.address}")

        response = suggest_pb2.SuggestResponse(
            plan="プランA: おすすめのコース"
        )
        return response

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    suggest_pb2_grpc.add_SuggestServicer_to_server(SuggestService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("サーバー起動中。ポート: 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
