#!/usr/bin/env python3

from datetime import datetime
import threading
import json
import websocket
import time
import random
import urllib.request
import re

# [command pattern]
# back              -> b [0~100] [duration(ms)]
# forward           -> f [0~100] [duration(ms)]
# curve(right|left) -> (cr|cl) [0~100] [duration(ms)]
# turn(right|left)  -> (tr|tl) [0~100] [duration(ms)]
# stop              -> s
# angle             -> a [0~100] 
# shakehead         -> sh
# nod               -> nd
# dance             -> d
# session start     -> ss
# session end       -> se
ARG1_PATTERN = '(s|sh|nd|d|ss|se)'
ARG2_PATTERN = 'a +([\d]+)'
ARG3_PATTERN = '(cr|cl|tr|tl|f|b) +([\d]+) +([\d]+)'
CMD_PATTERN = '^(' + ARG1_PATTERN + '|' + ARG2_PATTERN + '|' + ARG3_PATTERN + ')$'

valid_stop_dt = 0.0

# websocketを使ってラズパイ操作をリアルタイム取得
class WsRealtimeTicker(object):
    def __init__(self, symbol):
        self.symbol = symbol
        self.connect()

    def connect(self):
        #websocket.enableTrace(True)
        self.ws = websocket.WebSocketApp(
            'wss://hogehoge.execute-api.ap-northeast-1.amazonaws.com/Prod', header=None,
            on_open = self.on_open, on_message = self.on_message,
            on_error = self.on_error, on_close = self.on_close)
        self.ws.keep_running = True
        self.thread = threading.Thread(target=lambda: self.ws.run_forever(ping_interval=10, ping_timeout=5))
        self.thread.daemon = True
        self.thread.start()

    def is_connected(self):
        return self.ws.sock and self.ws.sock.connected

    def disconnect(self):
        self.ws.keep_running = False
        self.ws.close()

    def on_message(self, message):
        print(message)
        result = re.match(CMD_PATTERN, message)
        if result:
            print('detect command: '+result.group())
            thread = threading.Thread(target=lambda: msg2cmd(result.group()))
            thread.daemon = False
            thread.start()

    def on_error(self, error):
        self.disconnect()
        time.sleep(0.5)
        self.connect()

    def on_close(self):
        print('Websocket disconnected')

    def on_open(self):
        print('Websocket connected')

def msg2cmd(message):
    setledrgb([0, 1, 0])
    result = re.match(CMD_PATTERN, message)
    params = result.group().split()
    command = params[0]
    if len(params) == 1:
        if command == 's':
            pwm4write([0, 0, 0, 0])
        elif command == 'sh':
            shakehead()
        elif command == 'nd':
            nod()
        elif command == 'd':
            dance()
        elif command == 'ss':
            setledrgb([0,1,0])
        elif command == 'se':
            setledrgb([1,0,0])
            time.sleep(1)
            setledrgb([0,0,0])
    if len(params) > 1:
        percent = float(params[1]) if float(params[1]) < 100 else 100
        if len(params) == 2:
            if command == 'a':
                sethwpwm(100-percent)
        else:
            duration = float(params[2]) if float(params[2]) < 10000 else 10000
            if command in ['tr', 'tl']:
                direction(command, percent, duration)
            else:
                move(command, percent, duration)

def shakehead():
    print('shakehead')
    pwm4write([0.9, 0, 0, 0.9])
    shakehead_wait(3)
    pwm4write([0, 0.9, 0.9, 0])
    shakehead_wait(6)
    pwm4write([0.9, 0, 0, 0.9])
    shakehead_wait(6)
    pwm4write([0, 0.9, 0.9, 0])
    shakehead_wait(3)
    pwm4write([0, 0, 0, 0])
    setledrgb([0, 1, 0])

def shakehead_wait(cnt):
    for val in range(0, cnt):
        setledrgb([random.random(), random.random(), random.random()])
        time.sleep(0.1)

def nod():
    print('nod')
    division = 7
    for cnt in range(0, 2):
        for val in range(0, division):
            sethwpwm(val*100/division)
            setledrgb([random.random(), random.random(), random.random()])
            time.sleep(1/division/2)
        for val in range(0, division):
            sethwpwm(100-val*100/division)
            setledrgb([random.random(), random.random(), random.random()])
            time.sleep(1/division/2)
    sethwpwm(50)
    setledrgb([0, 1, 0])

def dance():
    print('dance')
    division = 4
    for cnt in range(0, 4):
        pwm4write([random.random(), 0, 0, random.random()])
        for val in range(0, division):
            sethwpwm(val*100/division)
            setledrgb([random.random(), random.random(), random.random()])
            time.sleep(1/division/2)
        pwm4write([0, random.random(), random.random(), 0])
        for val in range(0, division):
            sethwpwm(100-val*100/division)
            setledrgb([random.random(), random.random(), random.random()])
            time.sleep(1/division/2)
    sethwpwm(50)
    pwm4write([0, 0, 0, 0])
    setledrgb([0, 1, 0])

def direction(command, percent, duration):
    global valid_stop_dt
    stop_dt = datetime.now().timestamp()+duration/1000
    valid_stop_dt = stop_dt
    print('direction: '+command+','+str(percent)+','+str(duration))
    if command == 'tr':
        pwm4write([val(percent, 0.0, 0.9), 0, 0, val(percent, 0.0, 0.9)])
    elif command == 'tl':
        pwm4write([0, val(percent, 0.0, 0.9), val(percent, 0.0, 0.9), 0])
    time.sleep(duration/1000)
    if valid_stop_dt == stop_dt:
        pwm4write([0, 0, 0, 0])

def move(command, percent, duration):
    global valid_stop_dt
    stop_dt = datetime.now().timestamp()+duration/1000
    valid_stop_dt = stop_dt
    print('move: '+command+','+str(percent)+','+str(duration))
    if command == 'cr':
        pwm4write([val(percent, 0.0, 1.0), 0, val(percent/3, 0.0, 1.0), 0])
    elif command == 'cl':
        pwm4write([val(percent/3, 0.0, 1.0), 0, val(percent, 0.0, 1.0), 0])
    elif command == 'f':
        pwm4write([val(percent, 0.0, 1.0), 0, val(percent, 0.0, 1.0), 0])
    elif command == 'b':
        pwm4write([0, val(percent, 0.0, 1.0), 0, val(percent, 0.0, 1.0)])
    time.sleep(duration/1000)
    if valid_stop_dt == stop_dt:
        pwm4write([0, 0, 0, 0])

def sethwpwm(percent):
    # safariキャッシュ対策だが直接API叩くので同じ値でよい
    cmdid = '0'
    post('/macros/setHwPWM/'+str(val(percent, 0.1, 0.9))+','+cmdid)

def pwm4write(params):
    # safariキャッシュ対策だが直接API叩くので同じ値でよい
    cmdid = '0'
    post('/macros/pwm4Write/'+','.join(map(str,params))+','+cmdid)

def setledrgb(params):
    post('/macros/setLedRGB/'+','.join(map(str,params)))

def val(percent, min, max):
    num = (percent * (max - min) / 100) + min
    if num > max:
        return max
    return num

def post(req_path):
    url = 'http://localhost:8000'+req_path
    req = urllib.request.Request(url, {})
    try:
        with urllib.request.urlopen(req) as res:
            res_body = res.read().decode("utf-8")
    except urllib.error.HTTPError as err:
        print(err.code)
    except urllib.error.URLError as err:
        print(err.reason)

if __name__ == '__main__':
    try:
        wfrt = WsRealtimeTicker('test')
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        setledrgb([0,0,0])
