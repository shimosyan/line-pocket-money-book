# LINE - Pocket Money Book

LINEで使えるお小遣い帳です。

## 使い方

Node.js及びnpmがインストールされているものとします。

### 1. リポジトリの入手

以下のコマンドでリポジトリをクローンします。

```shell
git clone git@github.com:shimosyan/line-pocket-money-book.git <project_name>
cd <project_name>
```

### 2. LINE Developersの登録

LINE Developersに登録し、BOTを作成します。トークンはロングタームを使用してください。

### 3. 必要なものをインストールする

```shell
npm i @google/clasp -g
npm install
```

### 4. 必要事項を記入する

新規スプレッドシートを作成します。シート名には「管理シート」と名前をつけておきます。

.clasp.json.sampleを.clasp.jsonとしてコピーし、Google App Scriptのscript_idを登録します。

ScriptIDはスクリプトエディタを開いたURLの[ https://script.google.com/a/macros/ecdesk.jp/d/\<script_id\>/edit～ ]の部分です。

(デプロイに失敗する場合はスクリプトプロジェクトを作り直してみてください。)

```javascript
.clasp.json

{
  "scriptId": "<script_id>",
  "rootDir": "dist"
}
```

続いて、.env.sampleを.envとしてコピーし、LINEのBOTのトークンを入力します。

```javascript
.env

LINE_TOKEN="BOTのトークン"
```

### 5. Google App Scriptにデプロイする

#### 5-1. ビルドする

```shell
npm run build
```

#### 5-2. Google App Scriptにデプロイする (claspとgoogleアカウントを紐付ける)

以下のコマンドを実行し画面の指示に従いclaspにgoogleアカウントを紐付ける。

```shell
clasp login
```

続いて、以下のアドレスにアクセスしGoogle App Script APIを有効にする。

https://script.google.com/home/usersettings

以下のコマンドでGoogle App Scriptにデプロイする。

```shell
clasp push
```

#### 5-3. Google App ScriptをWebAPPとして公開する

Google App Scriptエディタの「公開」→「ウェブアプリケーションとして公開」を選択し、以下の内容で設定してください。

- プロジェクト バージョン: New
- 次のユーザーとしてアプリケーションを実行: 自分
- アプリケーションにアクセスできるユーザー: 全員(匿名ユーザー含む)

ウェブアプリケーションとして公開したら、そのURLをLINEのBOTのWebhook欄に設定してください。