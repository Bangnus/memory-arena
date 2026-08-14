# Memory Arena (เมมโมรี่ อารีน่า)

เกมต่อสู้ฝึกความจำแบบผู้เล่น 2 คนผ่านอุปกรณ์ IoT ที่พัฒนาขึ้นสำหรับการจัดแสดงนิทรรศการและพอร์ตโฟลิโอ

---

## 📌 ภาพรวมโครงการ (Project Overview)

ผู้เล่นทำการยืนยันตัวตนเพื่อเข้าเล่นเกมโดยใช้ **LINE Login** ผ่านเว็บแอปพลิเคชัน Next.js อุปกรณ์ควบคุมหลักของเกมควบคุมผ่านบอร์ด **ESP32** ที่เขียนโปรแกรมด้วยเฟรมเวิร์ก Arduino บน PlatformIO บริการฝั่งหลังบ้าน (Backend) ขับเคลื่อนด้วย **NestJS** และเชื่อมต่อฐานข้อมูล **PostgreSQL** ผ่าน **Prisma ORM**

```
┌────────────────────────┐         ┌────────────────────────┐
│  Next.js 15 (Frontend) │ ◄─────► │   NestJS (Backend)     │
│   (Port 3001)          │ Socket  │   (Port 3000 / REST)   │
└────────────────────────┘ & REST  └───────────┬────────────┘
                                               │
                                 ┌─────────────┴────────────┐
                                 │   PostgreSQL (Port 5432) │
                                 └──────────────────────────┘
                                               ▲
                                  I2C / Socket │ USB Serial
                                               ▼
                                   ┌──────────────────────┐
                                   │ ESP32 + PCF8575(IoT) │
                                   │ (12 LEDs + 12 BTNs)  │
                                   └──────────────────────┘
```

---

## 🎮 กติกาการเล่นเกมและระบบการแข่งขัน (Game Rules & Mechanics)

Memory Battle เป็นเกมแข่งขันความจำระดับมิลลิวินาทีที่รองรับการเล่น **4 สีหลัก** (**แดง, เขียว, น้ำเงิน, เหลือง**) แข่งขันกันในรูปแบบชนะ 2 ใน 3 รอบ (**Best of 3**)

### ระดับความยาก (Difficulty Modes)
ผู้เล่นสามารถกดปรับเลือกความยากผ่านปุ่มควบคุมบนบอร์ดก่อนเริ่มเกมได้ 3 ระดับ:
* **Easy (ง่าย):** สุ่มลำดับโจทย์ 3 ขั้นตอน สว่างดวงละ 1.0 วินาที
* **Medium (ปานกลาง):** สุ่มลำดับโจทย์ 4 ขั้นตอน สว่างดวงละ 0.75 วินาที
* **Hard (ยาก):** สุ่มลำดับโจทย์ 6 ขั้นตอน สว่างดวงละ 0.5 วินาที

### กติการอบแข่งขันและกรณีพิเศษ (Round Rules & Edge Cases)
1. **เฟสแสดงโจทย์ (Sequence Phase):** ผู้เล่นต้องจดจำสัญญาณไฟตามจังหวะ ห้ามกดปุ่มตอบในขณะที่สัญญาณไฟกำลังติดอยู่ (ระบบจะไม่รับข้อมูลจังหวะนี้)
2. **เฟสตอบคำถาม (Input Phase):** เมื่อสัญญาณโจทย์จบลง ระบบจะปลดล็อกให้กดตอบคำตอบ ปุ่มกดจะสว่างตอบสนองทันทีที่กดพิน
3. **การตัดสินความเร็ว (Tie Breaker):** หากผู้เล่นทั้งสองคนกดถูกต้องเหมือนกันทั้งหมด **ผู้ที่กดถูกต้องครบลำดับได้เร็วที่สุด (มีเวลา Elapsed Time น้อยที่สุด) จะเป็นผู้ชนะในรอบนั้น**
4. **กดผิดแพ้ทันที (Instant Strike Out):** หากผู้เล่นคนใดคนหนึ่งกดผิดลำดับจากโจทย์แม้แต่ปุ่มเดียว จะปรับตกรอบและให้แต้มกับฝั่งตรงข้ามทันที
5. **การหมดเวลา / ตอบผิดคู่ (Timeout / Draw):** ผู้เล่นมีเวลา 15 วินาทีในการตอบคำตอบ หากไม่มีการกดหรือกดผิดทั้งคู่ รอบนั้นจะถือเป็นโมฆะและระบบจะทำการสุ่มโจทย์เริ่มรอบนั้นใหม่
6. **การตัดรอบเร็ว (Early Termination):** เมื่อคนใดคนหนึ่งกดถูกต้องครบถ้วนและได้แต้มชนะไปเรียบร้อยแล้ว ระบบจะสั่งจบรอบทันทีโดยไม่ต้องรอผู้เล่นที่ทำเวลารองลงมา
7. **ปุ่มเริ่มเกมใหม่ทั้งหมด (Restart Game):** เมื่อกดปุ่ม **RESTART** บนบอร์ดระบบจะล้างข้อมูลเกมทั้งหมดใน Database และเด้งหน้าเว็บกลับไปที่หน้าแรกเพื่อบังคับ LINE Login ใหม่อีกครั้งทันที

---

## 🛠️ เทคโนโลยีหลัก (Tech Stack)

### ฝั่งหน้าบ้าน (Frontend)
- **Next.js 15** + **React 19**
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **TanStack Query v5**
- **Socket.IO Client**

### ฝั่งหลังบ้าน (Backend)
- **NestJS 11**
- **Prisma ORM** + **PostgreSQL**
- **Socket.IO** (Real-time Event Gateway)
- **SerialPort** (USB Serial Communication)
- **JWT** + **LINE Login (OAuth2)**
- **Swagger API Docs**

### ฝั่งบอร์ดควบคุม (IoT)
- **ESP32 Dev Module (ESP32-WROOM-32)**
- **PCF8575 I/O Expander** (I2C 16-Channel ขยายคุมไฟ 12 LEDs)
- **Arduino Framework** บน **PlatformIO**

---

## 📦 สิ่งที่ต้องติดตั้งก่อนเริ่มต้น (Prerequisites)

ก่อนเริ่มรันระบบ กรุณาตรวจสอบและติดตั้งโปรแกรมดังต่อไปนี้:

| โปรแกรม / เครื่องมือ | เวอร์ชันที่แนะนำ | ลิงก์ดาวน์โหลด | วัตถุประสงค์ |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.x` หรือ `22.x LTS` | [nodejs.org](https://nodejs.org/) | รัน Next.js และ NestJS |
| **Docker & Docker Compose** | ล่าสุด (Docker Desktop) | [docker.com](https://www.docker.com/) | รันฐานข้อมูล PostgreSQL / Container |
| **Git** | ล่าสุด | [git-scm.com](https://git-scm.com/) | จัดการ Source Code |
| **PlatformIO Core / CLI** | ล่าสุด | [platformio.org](https://platformio.org/) หรือ VS Code Extension | คอมไพล์และแฟลชโค้ด ESP32 |
| **Ngrok** *(ตัวเลือก)* | ล่าสุด | [ngrok.com](https://ngrok.com/) | Forward URL สำหรับทดสอบ LINE Login Callback |

---

## 🚀 คู่มือการติดตั้งและการรันระบบ (Step-by-Step Guide)

### ขั้นตอนที่ 1: Clone โครงการและติดตั้ง Dependencies

```bash
# 1. Clone repository
git clone https://github.com/Bangnus/memory-arena.git
cd memory-arena

# 2. ติดตั้ง Dependencies ของ Root และ Monorepo
npm install

# 3. ติดตั้ง Dependencies ของ Backend
cd apps/backend
npm install
cd ../..

# 4. ติดตั้ง Dependencies ของ Frontend
cd apps/frontend
npm install
cd ../..
```

---

### ขั้นตอนที่ 2: ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)

#### 2.1 Backend (`apps/backend/.env`)
สร้างไฟล์ `apps/backend/.env` โดยคัดลอกจากตัวอย่าง:
```bash
cp apps/backend/.env.example apps/backend/.env
```
ตัวอย่างการตั้งค่า:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/memory_battle?schema=public"
JWT_SECRET=your_jwt_secret_key_here
LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CALLBACK_URL=http://localhost:3000/auth/line/callback
FRONTEND_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3001
HARDWARE_MODE=USB # หรือ WIFI
SERIAL_PORT=COM3  # หรือ /dev/ttyUSB0 (ตรวจสอบพอร์ต ESP32 ของคุณ)
SERIAL_BAUD_RATE=115200
```

#### 2.2 Frontend (`apps/frontend/.env.local`)
สร้างไฟล์ `apps/frontend/.env.local`:
```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```
ตัวอย่างการตั้งค่า:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

#### 2.3 IoT Firmware (`apps/iot/.env`)
สร้างไฟล์ `apps/iot/.env` สำหรับตั้งค่า WiFi/Backend URL:
```env
WIFI_SSID=Your_WiFi_SSID
WIFI_PASSWORD=Your_WiFi_Password
BACKEND_URL=http://192.168.1.100:3000
DEVICE_NAME=ESP32_ARENA_01
HARDWARE_MODE=USB # ตั้งเป็น USB หรือ WIFI
```

---

### ขั้นตอนที่ 3: เลือกวิธีการรันระบบ

#### 🟢 วิธีที่ 1: รันแบบ Local Development (เร็วที่สุด แนะนำสำหรับการพัฒนา)

1. **เริ่มฐานข้อมูล PostgreSQL ผ่าน Docker**:
   ```bash
   docker compose up -d postgres
   ```

2. **รัน Prisma Migration เพื่อสร้างตารางฐานข้อมูล**:
   ```bash
   cd apps/backend
   npx prisma migrate dev
   cd ../..
   ```

3. **เปิดรัน Backend (Terminal ที่ 1)**:
   ```bash
   cd apps/backend
   npm run start:dev
   ```

4. **เปิดรัน Frontend (Terminal ที่ 2)**:
   ```bash
   cd apps/frontend
   npm run dev
   ```

> ⚡ **คำสั่งลัดสำหรับผู้ใช้ Windows**:  
> สามารถพิมพ์คำสั่งเดียวเพื่อเปิดทุกอย่างพร้อมกัน:
> ```bash
> make run-local
> ```

---

#### 🐳 วิธีที่ 2: รันผ่าน Docker Compose ทั้งหมด (Full Docker)

1. **เริ่มต้นระบบบริการทั้งหมด**:
   ```bash
   make dev
   # หรือ docker compose -f docker-compose.dev.yml up -d
   ```

2. **รัน Migration ฐานข้อมูลภายใน Container**:
   ```bash
   make db-migrate
   ```

3. **ดูสถานะและ Log การทำงาน**:
   ```bash
   make logs          # ดู Log ทั้งหมด
   make backend-logs   # ดู Log เฉพาะ Backend
   make frontend-logs  # ดู Log เฉพาะ Frontend
   ```

4. **หยุดการทำงานของระบบ**:
   ```bash
   make stop
   ```

---

### ขั้นตอนที่ 4: การคอมไพล์และอัปโหลดโค้ด ESP32 (IoT Firmware)

1. เสียบสาย USB ระหว่างบอร์ด **ESP32** เข้ากับคอมพิวเตอร์
2. เข้าไปที่โฟลเดอร์ `apps/iot`:
   ```bash
   cd apps/iot
   ```
3. **คอมไพล์โค้ด (Build)**:
   ```bash
   pio run
   ```
4. **อัปโหลดเฟิร์มแวร์ลงบอร์ด ESP32 (Upload)**:
   ```bash
   pio run -t upload
   ```
5. **เปิด Serial Monitor ดู Log ของ ESP32**:
   ```bash
   pio run -t monitor
   ```

> 📖 **ดูแผนผังการต่อสายไฟของฮาร์ดแวร์ฉบับสมบูรณ์ได้ที่**: [`docs/PIN.md`](docs/PIN.md)

---

## 🌐 พอร์ตและช่องทางเข้าใช้งานระบบ (Service Endpoints)

| บริการ | URL / Port | คำอธิบาย |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:3001` | หน้าเว็บเล่นเกม, Leaderboard, และ Admin Dashboard |
| **Backend REST API** | `http://localhost:3000` | บริการ API หลังบ้าน |
| **Swagger API Docs** | `http://localhost:3000/api` | เอกสารทดสอบ API และ Interactive Documentation |
| **Socket.IO Gateway** | `ws://localhost:3000` | Real-time WebSocket สำหรับสถานะเกมและปุ่มกด |
| **PostgreSQL Database** | `localhost:5432` | ฐานข้อมูลหลักของระบบ |

---

## 🛠️ สรุปคำสั่งใน Makefile

| คำสั่ง | รายละเอียดการทำงาน |
| :--- | :--- |
| `make dev` | รันระบบบริการสำหรับการพัฒนาผ่าน Docker |
| `make start` | รันระบบบริการสำหรับ Production |
| `make stop` | หยุดการทำงานของคอนเทนเนอร์ทั้งหมด |
| `make restart` | รีสตาร์ทคอนเทนเนอร์ทั้งหมด |
| `make logs` | แสดงผลดูประวัติ Log ของคอนเทนเนอร์ทั้งหมด |
| `make clean` | ลบคอนเทนเนอร์และ Volume ทั้งหมด |
| `make db-migrate` | รัน Prisma Migration จัดระบบตารางฐานข้อมูล |
| `make db-reset` | ล้างและรีเซ็ตฐานข้อมูลใหม่ทั้งหมด |
| `make db-seed` | รันข้อมูลตัวอย่างจำลองเข้าสู่ฐานข้อมูล |
| `make run-local` | สตาร์ท PostgreSQL ใน Docker + รัน NestJS, Next.js, Ngrok บนเครื่อง |
| `make status` | ตรวจสอบสถานะการทำงานของ Services ทั้งหมด (DB, Backend, Frontend, Ngrok) |

---

## 📁 โครงสร้างโฟลเดอร์โครงการ (Folder Structure)

```
Memory-Battle/
├── apps/
│   ├── frontend/          # หน้าบ้าน Next.js 15 + Tailwind CSS v4
│   ├── backend/           # หลังบ้าน NestJS 11 + Prisma ORM + Socket.IO
│   └── iot/               # เฟิร์มแวร์ ESP32 บน PlatformIO + PCF8575 Driver
├── packages/
│   └── shared/            # Type definitions, Constants และ DTO ร่วม
├── docs/
│   └── PIN.md             # แผนผังการต่อสายไฟฮาร์ดแวร์ (Hardware Wiring Pinout)
├── docker-compose.yml     # การรันระบบ Production
├── docker-compose.dev.yml # การรันระบบ Development
├── Makefile               # คำสั่งอำนวยความสะดวกในการควบคุมระบบ
└── README.md
```

---

## 📄 ลิขสิทธิ์ระบบ (License)

MIT License

## 👨‍💻 ผู้จัดทำ (Authors)

**Nus Peerapat**
