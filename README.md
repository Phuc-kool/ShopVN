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
