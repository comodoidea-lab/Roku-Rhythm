# AltStoreでiPhone実機検証する

この手順は、GitHub Actionsで作成した未署名IPAをAltStoreで再署名し、
iPhoneへ一時的にインストールするためのものです。Apple Developer
Programの有料登録は、最初の実機検証には不要です。

## 1. 未署名IPAを取得する

1. GitHubの **Actions** を開く。
2. **iOS unsigned IPA for AltStore** を開く。
3. 必要なら **Run workflow** から `codex/native-app` を実行する。
4. 完了した実行の **Artifacts** から
   `roku-rhythm-altstore-unsigned-ipa` をダウンロードする。
5. ダウンロードしたZIPを展開し、
   `Roku-Rhythm-unsigned.ipa` が入っていることを確認する。

Actionsの成果物は、ストレージ消費を抑えるため1日で削除されます。
消えた場合は同じワークフローを再実行してください。

## 2. MacとiPhoneを準備する

1. MacへAltServerをインストールする。
2. iPhoneをMacへ接続して「このコンピュータを信頼」を許可する。
3. FinderでiPhoneの「Wi-FiがオンになっているときにこのiPhoneを表示」
   を有効にする。
4. AltServerのメニューからiPhoneへAltStoreをインストールする。
5. iOS 16以降では、iPhoneの
   **設定 > プライバシーとセキュリティ > デベロッパモード**
   を有効にする。

Apple Accountの認証情報はAltStore/AltServerでのみ入力します。
GitHubのSecretsやこのリポジトリには保存しません。

## 3. Roku Rhythmをインストールする

1. iPhoneへ`Roku-Rhythm-unsigned.ipa`を送る。
2. ファイルAppでIPAを長押しして共有し、AltStoreで開く。
   またはAltStoreの **My Apps** にある `+` からIPAを選ぶ。
3. AltStoreが署名とインストールを終えるまで待つ。
4. ホーム画面の **Roku Rhythm** を起動する。

無料のApple Accountで署名したアプリは7日ごとの更新が必要です。
MacのAltServerとiPhoneが同じネットワークにいる状態で、AltStoreから
期限前に更新してください。

## 4. 実機確認項目

- アイコン、起動画面、初回起動が正常
- 名前を空欄のまま使える
- 生年月日の不正入力が拒否される
- 六曜結果を共有できる
- 通知許可の「許可」「許可しない」の両方で操作を続けられる
- 毎朝8時の通知設定をオン・オフできる
- 保存データを削除できる
- ライトモードとダークモードで表示が崩れない

このIPAはAltStore実機検証専用の未署名ビルドです。TestFlightや
App Store提出用の署名済みIPAではありません。公開中のPWAと
Vercel設定は変更しません。
