package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"server/suggest/client/suggestpb"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	// サーバーへの接続設定
	conn, err := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("サーバーへの接続に失敗しました: %v", err)
	}
	defer conn.Close()

	client := suggestpb.NewSuggestClient(conn)

	stores := []*suggestpb.Stores{
		{
			Stores: []*suggestpb.Store{
				{
					Name:       "がぶ飲みワインと肉 ビストロ千住MEAT",
					Address:    "東京都足立区千住２-36-8トリイビル１階",
					Access:     "ＪＲ常磐線・東武伊勢崎線・地下鉄各線北千住駅 西口より徒歩3分",
					Latitude:   35.7490712575,
					Longitude:  139.8021757238,
					Budget:     "3800円(通常)3480円(ご宴会）",
					Open:       "月～木、日、祝日: 16:00～23:00 （料理L.O. 22:00 ドリンクL.O. 22:30）金、土、祝前日: 16:00～23:30 （料理L.O. 22:30 ドリンクL.O. 23:00）",
					Genre:      &suggestpb.Genre{Catch: "北千住駅近★お肉にこだわったワインバル★", Name: "居酒屋"},
					CouponUrls: "https://www.hotpepper.jp/strJ001154247/map/?vos=nhppalsa000016",
					ImageUrl:   "https://imgfp.hotp.jp/IMGH/78/55/P039217855/P039217855_238.jpg",
				},
				{
					Name:       "仙台牛タンと博多野菜巻き串 京ノ庭 北千住店",
					Address:    "東京都足立区千住２-36-8トリイビル１階",
					Access:     "ＪＲ常磐線・東武伊勢崎線・地下鉄各線北千住駅 西口より徒歩3分",
					Latitude:   35.7490712575,
					Longitude:  139.8021757238,
					Budget:     "3800円(通常)3480円(ご宴会）",
					Open:       "月～木、日、祝日: 16:00～23:00 （料理L.O. 22:00 ドリンクL.O. 22:30）金、土、祝前日: 16:00～23:30 （料理L.O. 22:30 ドリンクL.O. 23:00）",
					Genre:      &suggestpb.Genre{Catch: "北千住駅近★お肉にこだわったワインバル★", Name: "居酒屋"},
					CouponUrls: "https://www.hotpepper.jp/strJ001154247/map/?vos=nhppalsa000016",
					ImageUrl:   "https://imgfp.hotp.jp/IMGH/78/55/P039217855/P039217855_238.jpg",
				},
			},
		},
	}

	// gRPCリクエストの作成
	request := &suggestpb.SuggestRequest{
		Option: &suggestpb.Option{
			PeopleNum:  4,
			ArriveTime: "18:00",
			Category:   "イタリアン",
		},
		Stores: stores,
	}
	// リクエストの送信とレスポンスの受け取り
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	response, err := client.Suggest(ctx, request)
	fmt.Println(response)
	if err != nil {
		log.Fatalf("リクエストの送信に失敗しました: %v", err)
	}

	log.Printf("受け取ったレスポンス: %v", response)
}
