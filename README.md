# 🍨 Goods Funding Service

### *A platform that connects buyers and creators*

Welcome to the **Goods Funding Service**, a platform designed to seamlessly connect buyers with creators offering a wide range of goods — from diaries and stationery to anime merchandise, gift desserts, and more.

---

## 🚀 Key Features

### 🛒 Funding-Based Goods Purchase

During the funding period, users can browse and purchase various creator-made goods.

### 🔐 Simple Authentication

* **Sign Up** and **Find ID** with ease.

### 👤 User Login & Session Management

* Secure login powered by user session creation and storage.

### ⏱️ Funding Status Scheduler

Automated scheduling system that updates funding status in real time:

* **Scheduled**
* **In Progress**
* **Completed**

### ⚡ High-Traffic Funding Start Queue

Handles heavy traffic during funding start moments using queue-based processing.

### 🔑 JWT Security

Robust token-based authentication:

* Generate **Access** and **Refresh Tokens**
* Validate and refresh access tokens
* Validate refresh tokens & handle logout
* Prevent simultaneous logins

### 💳 Payment Processing (Redis & Lua Script)

Ensures atomic operations for buyers and sellers when updating quantities and option selections.

---

## 🎨 Tech Stack

### 🧩 Backend

* Java
* Spring Boot

### 💻 Frontend

* JavaScript
* React

### 🗄️ Database

* MySQL
* Redis

### 🛠️ Tools

* IntelliJ IDEA
* Visual Studio Code

### 🔐 Security

* Spring Security
* JWT
* Social Login (OAuth)

### 🔌 External APIs

* PortOne
* ...

---

Feel free to contribute, suggest improvements, or explore the project further!
