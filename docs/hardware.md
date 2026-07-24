ESP32 DevKit V1

GPIO 2

LED Strip

GPIO 4

Player1 Buttons

GPIO 16
GPIO 17
GPIO 18
GPIO 19

Player2 Buttons

GPIO 21
GPIO 22
GPIO 23
GPIO 25

Control Buttons

GPIO 26
GPIO 27
GPIO 14

Buzzer

GPIO 13





Hardware Specification v1.0
ESP32 DevKit V1

ใช้บอร์ด

ESP32 DevKit V1 (38 Pin)
อุปกรณ์
อุปกรณ์	จำนวน
ESP32 DevKit V1	1
LED สีแดง 5mm	1
LED สีเขียว 5mm	1
LED สีน้ำเงิน 5mm	1
LED สีเหลือง 5mm	1
ตัวต้านทาน 220Ω	4
Push Button Player 1	4
Push Button Player 2	4
Push Button Control	3
Active Buzzer	1
Breadboard	1
Jumper Wire	หลายเส้น
สาย USB	1
GPIO Mapping
LED
สี	GPIO
🔴 Red	GPIO2
🟢 Green	GPIO4
🔵 Blue	GPIO5
🟡 Yellow	GPIO12
Player 1 Buttons
สี	GPIO
🔴 Red	GPIO16
🟢 Green	GPIO17
🔵 Blue	GPIO18
🟡 Yellow	GPIO19
Player 2 Buttons
สี	GPIO
🔴 Red	GPIO21
🟢 Green	GPIO22
🔵 Blue	GPIO23
🟡 Yellow	GPIO25
Control Buttons
ปุ่ม	GPIO
▲ UP	GPIO26
▼ DOWN	GPIO27
START	GPIO14
Buzzer
อุปกรณ์	GPIO
Active Buzzer	GPIO13
การต่อ LED

LED ทุกดวงต้องมีตัวต้านทาน

ตัวอย่าง LED สีแดง

GPIO2

 │

220Ω

 │

Anode (+)

LED

Cathode (-)

 │

GND

ทำเหมือนกันทุกสี

GPIO4 -> 220Ω -> LED Green -> GND

GPIO5 -> 220Ω -> LED Blue -> GND

GPIO12 ->220Ω -> LED Yellow -> GND
การต่อปุ่ม Player 1

ใช้ INPUT_PULLUP

GPIO16

 │

Button

 │

GND

เหมือนกันทุกปุ่ม

GPIO17 -> Button -> GND

GPIO18 -> Button -> GND

GPIO19 -> Button -> GND
การต่อปุ่ม Player 2
GPIO21 -> Button -> GND

GPIO22 -> Button -> GND

GPIO23 -> Button -> GND

GPIO25 -> Button -> GND
การต่อปุ่ม Control
GPIO26 -> Button -> GND

GPIO27 -> Button -> GND

GPIO14 -> Button -> GND
การต่อ Buzzer
GPIO13

 │

Buzzer +

Buzzer -

 │

GND
การจ่ายไฟ

ESP32

USB

หรือ

VIN 5V

LED

ใช้ไฟจาก ESP32 ได้ เพราะเป็น LED ธรรมดาเพียง 4 ดวง

Pin Summary
GPIO	อุปกรณ์
2	LED Red
4	LED Green
5	LED Blue
12	LED Yellow
13	Buzzer
14	START
16	P1 Red
17	P1 Green
18	P1 Blue
19	P1 Yellow
21	P2 Red
22	P2 Green
23	P2 Blue
25	P2 Yellow
26	UP
27	DOWN
Layout Hardware
                 LED

        🔴   🟢   🔵   🟡


P1                               P2

🔴 🟢 🔵 🟡            🔴 🟢 🔵 🟡


          ▲   ▼

         START
การทำงานของ Hardware
1. เปิดเครื่อง

ESP32 เชื่อม Wi-Fi

↓

เชื่อม Backend

↓

เข้าสู่ Waiting

2. Login

ผู้เล่น 1

สแกน LINE

↓

ผู้เล่น 2

สแกน LINE

↓

Backend ยืนยัน

↓

ESP32 รอเลือกโหมด

3. เลือกโหมด

กด

▲

↓

▼

เพื่อเลือก

Easy
Medium
Hard

แล้วกด

START

4. Countdown
3

↓

2

↓

1

↓

GO
5. แสดงลำดับสี

ตัวอย่าง

🔴

↓

🟢

↓

🔵

↓

🟡

ระหว่างนี้

ปุ่มทุกปุ่มของผู้เล่นจะไม่ทำงาน

6. รับ Input

หลังจาก LED ดับหมด

Backend ส่งคำสั่ง

INPUT_ENABLED

ESP32 จึงเปิดให้กดปุ่ม

Player 1

🔴

↓

🟢

↓

🔵

↓

🟡

Player 2

กดพร้อมกันได้

ESP32 บันทึก

ผู้เล่น
สีที่กด
ลำดับ
เวลาที่ใช้

แล้วส่งข้อมูลทั้งหมดไปยัง Backend

7. Backend ตรวจสอบ

Backend ตรวจ

ลำดับสีถูกหรือไม่
กดครบหรือไม่
เวลาเร็วกว่าใคร
คำนวณผู้ชนะของรอบ

จากนั้นส่งผลกลับ

Round Winner

Player1

Score

1-0
8. Best of 3

ถ้ายังไม่มีใครได้ 2 คะแนน

กลับไปเริ่มรอบใหม่

ถ้ามีผู้เล่นได้ 2 คะแนน

จบเกม

9. จบเกม

Frontend แสดง

ผู้ชนะ
รูปโปรไฟล์ LINE
ชื่อ
คะแนน (2-1)
เวลาเฉลี่ย
ความแม่นยำ

Backend บันทึกลง PostgreSQL

อัปเดต Leaderboard

10. Reset

Backend ล้าง

Session
ผู้เล่น
คะแนน
ข้อมูลชั่วคราว

Frontend กลับหน้า Waiting

ESP32 กลับสู่ Waiting

พร้อมให้ผู้เล่นคู่ใหม่มาเล่นทันที