# Roku Rhythm TestFlight 配布設定

既存の `iOS unsigned IPA for AltStore` はそのまま残し、`iOS TestFlight` を署名・配布専用として使用します。

## 1. Apple側で用意するもの

1. Apple DeveloperのCertificates, Identifiers & Profilesで、Bundle ID `com.comodoidealab.rokurhythm` を登録する。
2. Apple Distribution証明書を作成し、秘密鍵を含む `.p12` として書き出す。
3. 同じBundle ID用のApp Store Distribution Provisioning Profileを作成し、`.mobileprovision` を保存する。
4. App Store ConnectでRoku Rhythmのアプリレコードを作成する。
5. App Store Connectの「ユーザとアクセス > 統合」でAPIキーを作成し、`.p8` を一度だけダウンロードする。

## 2. GitHub Actions Secrets

リポジトリの `Settings > Secrets and variables > Actions` に以下を登録します。

| Secret | 内容 |
| --- | --- |
| `APPLE_TEAM_ID` | Apple Developerの10文字のTeam ID |
| `IOS_DISTRIBUTION_CERTIFICATE_BASE64` | `.p12` をBase64化した文字列 |
| `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD` | `.p12` 書き出し時のパスワード |
| `IOS_PROVISIONING_PROFILE_BASE64` | `.mobileprovision` をBase64化した文字列 |
| `APP_STORE_CONNECT_API_KEY_ID` | App Store Connect APIのKey ID |
| `APP_STORE_CONNECT_API_ISSUER_ID` | App Store Connect APIのIssuer ID |
| `APP_STORE_CONNECT_API_PRIVATE_KEY_BASE64` | `.p8` をBase64化した文字列 |
| `IOS_TEMP_KEYCHAIN_PASSWORD` | 任意の一時キーチェーン用パスワード（省略可） |

macOSでファイルをBase64化する例:

```sh
base64 -i DistributionCertificate.p12 | pbcopy
base64 -i RokuRhythm_AppStore.mobileprovision | pbcopy
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
```

## 3. 実行

GitHub Actionsから `iOS TestFlight` を選び、`Run workflow` を実行します。

- `upload_to_testflight: true`: 署名IPAを作成し、検証後にTestFlightへアップロード
- `upload_to_testflight: false`: 署名IPAの作成だけを行い、Actions Artifactへ保存

ビルド番号にはGitHub Actionsの `run_number` を使うため、再実行でもApp Store Connect上のビルド番号が重複しません。アプリの表示バージョンは現在の `1.0` を維持します。

## 4. 初回アップロード後

App Store Connectで処理完了を待ち、輸出コンプライアンスの質問に回答してから内部テスターへ配布します。アップロード成功とTestFlightでの処理完了は別工程です。
