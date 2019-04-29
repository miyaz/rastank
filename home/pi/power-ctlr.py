import RPi.GPIO as GPIO
from time import sleep
import subprocess

SWITCH=17
state = 0 

GPIO.setmode(GPIO.BCM)
GPIO.setup(SWITCH, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

try:
    while True:
        if GPIO.input(SWITCH)==GPIO.HIGH:
            if state > 5:
                state = 0
                args = ['sudo', 'poweroff']
                subprocess.Popen(args)
            else:
                state += 1
        else:
            if (2 <= state and state <= 5):
                args = ['sudo', 'reboot']
                subprocess.Popen(args)
            state = 0

        sleep(0.5)

except KeyboardInterrupt:
    pass

GPIO.cleanup()
