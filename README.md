# rastank
ラズパイで作ったラジコンのタンクのやつ

[Cloud on the BEACH 2019](https://jaws-ug-okinawa.doorkeeper.jp/events/88202)で話した
[LT(ラズタンク！)](https://www.slideshare.net/ShinjiMiyazato/ss-142254040)で紹介したやつの
ファイルを雑に残しておくリポジトリ

[この本](https://www.amazon.co.jp/dp/4062579774/)を参考に作ったラズパイラジコンにいくつか機能追加した。


## ファイル説明

* ./home/pi/power-ctlr.py
  * トグルスイッチでラズパイ停止／再起動できるようにするデーモン
  * 3~5秒で話せば再起動。5秒以上押し続けると停止します
  * rc.localで起動時にバックグラウンド起動して使う
* ./home/pi/ws-commander.py
  * LT資料にある操作中継デーモン
  * WebSocketで繋いで受信したコマンドに基づいて webiopiにリクエストを飛ばすやつ
* ./etc/systemd/system/mjpg_streamer.service
  * MJPG-streamerのsystemd用自動起動スクリプト
  * 書籍ではrc.localで起動しているがたまに落ちるのでsystemd使って自動起動するようにした
* ./etc/rc.local
  * OS起動時に必要なスクリプトをバックグラウンド起動している
* ./www/bb/08/
  * webiopiで公開されるWebのディレクトリ(wwwがpulicなルートパス)
  * script.pyをwebiopiのconfigに指定して、同時に起動するようにする
* ./rpi_record_nodisplay.py
  * [こちら](http://funofdiy.blogspot.com/2018/08/deep-learning-with-raspberry-pi-real.html?m=1)にしたがってYOLOv3-tinyをインストール
  * インストール後darknetディレクトリに配置して、rc.localからバックグラウンド実行しするスクリプト
* ./rastank-skill
  * ラズタンクを声で操作するためのAlexaSkill一式


上記以外にWebSocketをserverless repogitryのサンプルで作った記憶があるが、場所忘れた。

