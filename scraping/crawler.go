package main

import (
	"fmt"
	"net/http"
	"net/url"

	// "strings"
	"golang.org/x/net/html"
)

type TabelogScraper struct {
	Client *http.Client
}

func NewTabelogScraper() *TabelogScraper {
	return &TabelogScraper{
		Client: &http.Client{},
	}
}

func (scraper *TabelogScraper) GetRestaurantInfo(area string, keyword string) (map[string]interface{}, error) {
	baseUrl := "https://tabelog.com/rst/rstsearch/"
	query := url.Values{}
	query.Set("LstKind", "1")
	query.Set("voluntary_search", "1")
	query.Set("lid", "top_navi1")
	query.Set("sa", "大阪市")
	query.Set("sk", keyword)
	query.Set("sa_input", area)

	req, err := http.NewRequest("GET", baseUrl+"?"+query.Encode(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := scraper.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// HTML解析
	root, err := html.Parse(resp.Body)
	if err != nil {
		return nil, err
	}

	// データ抽出のロジックは省略（HTML構造に基づいて実装が必要）

	return map[string]interface{}{}, nil
}

func main() {
	scraper := NewTabelogScraper()
	info, err := scraper.GetRestaurantInfo("横浜", "たこ焼き")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println(info)
}
