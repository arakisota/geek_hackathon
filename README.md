# geek_hackathon
技育ハッカソン

## git 関連

### 自分の作業ブランチの変更をリモートに push する時

```
git add .
git commit -m "<変更内容>"
git push -u origin
```

### 最新の main ブランチを自分の作業ブランチに取り込む時

自分が作業している間に他の人の作業内容が main に merge された場合、自分の作業ブランチにも取り込んだ方がいい場合があります。

```
git fetch
git merge origin main
```

### 最新のブランチの情報を取り込む時

```
git fetch
git pull
```

### 新しい作業ブランチを作る時

基本的には最新の main を pull してから、main から switch するのが良いです。

```
git switch main
git fetch
git pull
git switch -c <新しい作業ブランチ名>
```

### branch運用について

- 新機能の実装は`feat/foobar`、修正は`fix/foobar`としてください。
- ブランチは`main`から切って、プルリクエストの向きも`main`に向けてください。

### プルリクエストに関して
- pull request の merge には、 チームメンバーによるレビュー（Approve）が必要。