import requests
from bs4 import BeautifulSoup


class TabelogScraper:
    def __init__(self):
        self.session = requests.Session()

    def get_restaurant_info(self, area, keyword):
        url = f"https://tabelog.com/rst/rstsearch/?LstKind=1&voluntary_search=1&lid=top_navi1&sa=%E5%A4%A7%E9%98%AA%E5%B8%82&sk={keyword}&vac_net=&search_date=2022%2F11%2F29%28%E7%81%AB%29&svd=20221129&svt=1900&svps=2&hfc=1&form_submit=&area_datatype=MajorMunicipal&area_id=27100&key_datatype=Genre3&key_id=40&sa_input={area}"
        response = self.session.get(url)
        content = response.content.decode('utf-8')

        soup = BeautifulSoup(content, 'html.parser')

        # 結果を辞書で返す
        results = {
            'title': soup.title.string,
            'search_word': soup.find('h2').find('strong').text,
            'restaurants': [name.text.strip() for name in soup.find_all('a', class_='list-rst__rst-name-target')]
        }

        return results

# 使用例
scraper = TabelogScraper()
info = scraper.get_restaurant_info('横浜', 'たこ焼き')
print(info)
