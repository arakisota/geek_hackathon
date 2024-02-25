package main

import (
	"context"
	"log"
	"time"

	"server/suggest/client/suggestpb"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	// サーバーへの接続を設定します。
	conn, err := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("サーバーへの接続に失敗しました: %v", err)
	}
	defer conn.Close()

	c := suggestpb.NewSuggestClient(conn)

	// タイムアウトを設定します。
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	// サーバーにリクエストを送信します。
	r, err := c.Suggest(ctx, &suggestpb.SuggestRequest{
		Stations: []*suggestpb.Shop{
			{
				Name:       "Shop A",
				Address:    "123 Main St",
				Access:     "Near the station",
				Latitude:   35.6895,
				Longitude:  139.6917,
				Budget:     "Budget",
				Open:       "9:00 - 21:00",
				Genre:      &suggestpb.Genre{Name: "Cafe", Catch: "Cozy place"},
				CouponUrls: "http://example.com/coupons",
				ImageUrl:   "http://example.com/image.jpg",
			},
			{
				Name:       "Shop B",
				Address:    "456 Second St",
				Access:     "5 minutes from the park",
				Latitude:   35.6896,
				Longitude:  139.6918,
				Budget:     "Moderate",
				Open:       "10:00 - 22:00",
				Genre:      &suggestpb.Genre{Name: "Italian", Catch: "Authentic Italian cuisine"},
				CouponUrls: "http://example.com/couponsB",
				ImageUrl:   "http://example.com/imageB.jpg",
			},
		},
	})
	if err != nil {
		log.Fatalf("リクエストの実行に失敗しました: %v", err)
	}
	log.Printf("受け取ったプラン: %s", r.GetPlan())
}
