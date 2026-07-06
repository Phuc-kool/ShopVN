# E-Commerce Platform — Spring Boot + ReactJS + MySQL

Hệ thống thương mại điện tử full-stack với thanh toán online qua VNPay Sandbox (IPN), thông báo email bất đồng bộ qua Mailtrap, containerize toàn bộ bằng Docker Compose, và Nginx làm reverse proxy phía trước.

## 1. Tech stack

| Layer | Công nghệ |
| :--- | :--- |
| **Backend** | Java 21, Spring Boot 3.x (Web, Data JPA, Validation, Async), Hibernate |
| **Frontend** | ReactJS (Vite), HTML5, CSS3, Axios |
| **Database** | MySQL 8 |
| **Cache** | Caffeine (in-process cache cho category listing) |
| **Payment** | VNPay Sandbox — thanh toán + IPN (Instant Payment Notification) |
| **Email** | JavaMailSender + Mailtrap SMTP sandbox (giả lập gửi mail, không gửi thật ra ngoài) |
| **Reverse Proxy** | Nginx (route `/api` → backend, `/` → frontend, terminate cổng 80) |
| **Containerization** | Docker, Docker Compose (3 service: backend, frontend, mysql + nginx) |
| **Tunneling (dev)**| ngrok http (expose localhost cho VNPay Sandbox gọi IPN callback) |
| **Load testing** | k6 (benchmark p95/avg latency, so sánh trước/sau tối ưu) |

## 2. High-level design

<p align="center">
  <img src="./1.png" alt="High-level Architecture Design" width="100%">
</p>

**Luồng tổng quan:** Users → Internet → Nginx (reverse proxy, container riêng) → phân luồng sang Front-end (ReactJS container) và Back-end (Spring Boot container). Back-end kết nối MySQL (container), gọi server-to-server tới VNPay để nhận IPN callback, và gửi email qua SMTP tới Mailtrap để test email. Toàn bộ Front-end, Back-end, MySQL nằm trong cùng một Docker Network, được bao bọc bởi Docker Environment.

## 3. Cấu trúc thư mục

```text
ecommerce-project/
├── backend/                 # Spring Boot app
│   ├── src/main/java/...
│   ├── src/main/resources/application.yml
│   ├── Dockerfile
│   └── run-local.sh         # inline-export env vars (Linux Mint fix)
├── frontend/                 # ReactJS app
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf            # (nếu build static serve riêng)
├── nginx/
│   └── nginx.conf             # reverse proxy config chính
├── docker-compose.yml
├── .env.example
└── README.md
4. Biến môi trường (.env)

Tạo file .env ở thư mục gốc dựa theo .env.example:

env# MySQL
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=ecommerce_db
MYSQL_USER=ecommerce_user
MYSQL_PASSWORD=your_password

# Backend
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/ecommerce_db
SPRING_DATASOURCE_USERNAME=ecommerce_user
SPRING_DATASOURCE_PASSWORD=your_password

# VNPay Sandbox
VNP_TMN_CODE=your_tmn_code
VNP_HASH_SECRET=your_hash_secret
VNP_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:8080/api/payment/vnpay-return
VNP_IPN_URL=https://<your-ngrok-subdomain>.ngrok-free.app/api/payment/vnpay-ipn

# Mailtrap SMTP (sandbox — email không gửi ra ngoài thật)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password

# Frontend
REACT_APP_API_BASE_URL=http://localhost/api


⚠️ VNP_IPN_URL phải là URL public (ngrok) vì VNPay Sandbox server cần gọi ngược vào máy bạn — xem mục 6.




5. Chạy hệ thống bằng Docker Compose

5.1 Yêu cầu


Docker & Docker Compose v2
ngrok account (free tier đủ dùng)


5.2 Build và chạy toàn bộ stack

bash# Clone project
git clone <repo-url>
cd ecommerce-project

# Copy và điền biến môi trường
cp .env.example .env
nano .env

# Build & chạy toàn bộ (backend, frontend, mysql, nginx)
docker compose up -d --build

# Xem log realtime
docker compose logs -f backend

5.3 Kiểm tra service

bashdocker compose ps

Truy cập:


Frontend: http://localhost
Backend API (qua Nginx proxy): http://localhost/api
MySQL: localhost:3306 (nếu expose port để debug)


5.4 Ví dụ docker-compose.yml (tóm tắt)

yamlversion: "3.9"
services:
  mysql:
    image: mysql:8
    env_file: .env
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      retries: 5

  backend:
    build: ./backend
    env_file: .env
    depends_on:
      mysql:
        condition: service_healthy
    expose:
      - "8080"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    expose:
      - "80"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
      - frontend

volumes:
  mysql_data:


6. Kết nối VNPay Sandbox qua ngrok

VNPay Sandbox chạy trên internet công cộng và không thể gọi trực tiếp vào localhost của máy bạn để bắn IPN (Instant Payment Notification) sau khi thanh toán. Do đó cần ngrok để tạo một public URL trỏ ngược vào máy local.

6.1 Cài đặt ngrok

bash# Ubuntu/Debian/Linux Mint — cài qua apt (khuyến nghị, tránh lỗi Snap)
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Xác thực authtoken (lấy tại dashboard.ngrok.com)
ngrok config add-authtoken <YOUR_AUTHTOKEN>

6.2 Mở tunnel trỏ vào Nginx (cổng 80)

bashngrok http 80

ngrok sẽ trả về một URL dạng:

Forwarding    https://abcd-1234.ngrok-free.app -> http://localhost:80

6.3 Cập nhật cấu hình IPN


Copy URL ngrok vừa nhận được.
Cập nhật vào .env:


env   VNP_IPN_URL=https://abcd-1234.ngrok-free.app/api/payment/vnpay-ipn


Restart backend để load lại biến môi trường:


bash   docker compose restart backend


Trong code tạo URL thanh toán gửi sang VNPay, đảm bảo tham số vnp_IpnUrl (hoặc cấu hình tương ứng trong application.yml) trỏ đúng vào URL ngrok này — đây là địa chỉ VNPay Sandbox sẽ POST callback về sau khi giao dịch hoàn tất.


6.4 Test luồng thanh toán end-to-end


Tạo đơn hàng trên frontend → nhận vnp_PayUrl từ backend.
Redirect sang trang thanh toán VNPay Sandbox, dùng thẻ test do VNPay cung cấp.
Sau khi thanh toán thành công, VNPay Sandbox gọi POST tới VNP_IPN_URL (qua ngrok) → backend verify checksum HMAC-SHA512 → cập nhật trạng thái đơn hàng → publish event AFTER_COMMIT → gửi email xác nhận qua Mailtrap (bất đồng bộ).
Kiểm tra email giả lập tại https://mailtrap.io (inbox sandbox, không gửi ra ngoài thật).
Có thể xem log request/response IPN trong ngrok Web Interface: http://127.0.0.1:4040.



Lưu ý: mỗi lần restart ngrok (bản free), subdomain sẽ đổi → phải cập nhật lại VNP_IPN_URL trong .env và cấu hình VNPay merchant (nếu khai báo cố định ở phía VNPay).




7. Load testing (k6)

bashcd backend/testing
k6 run load-test.js

So sánh p95/avg latency của endpoint IPN giữa 2 phiên bản (đồng bộ vs @Async) để có số liệu đưa vào báo cáo/CV.


8. Mailtrap — sandbox SMTP

Mailtrap dùng để chặn và giả lập gửi email trong môi trường dev/test — email không thực sự rời khỏi hệ thống, tất cả được giữ lại trong inbox ảo của Mailtrap để kiểm tra nội dung, header, và thời gian gửi mà không sợ spam người dùng thật. Cấu hình spring.mail.* trong application.yml trỏ tới sandbox.smtp.mailtrap.io:2525 với username/password lấy từ Mailtrap dashboard.


9. License

MIT
