# 🛒 Campus Marketplace

A full-stack web application that enables students within the same campus to **buy, sell, and rent second-hand items** — creating a sustainable and affordable ecosystem for university communities.

---

## 🚀 Live Demo
> Coming soon / [Add your deployed link here]

---

## 📌 Features

- 🔐 **Secure Authentication** — JWT-based login/signup with Bcrypt password hashing
- 🛍️ **Product Listings** — Add, edit, and delete product posts with images and descriptions
- 🔍 **Real-time Search & Filtering** — Instantly filter products by category, price, or keyword
- 🛒 **Shopping Cart** — Synchronized cart management using React Context API
- 🔄 **Rental Services** — Students can list items available for rent, not just sale
- 📱 **Responsive UI** — Mobile-friendly design built with Tailwind CSS

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React.js, Tailwind CSS               |
| Backend    | Node.js, Express.js                  |
| Database   | MongoDB (Mongoose ODM)               |
| Auth       | JWT (JSON Web Tokens), Bcrypt        |
| Tools      | Git, GitHub, Postman, VS Code        |

---

## 📁 Project Structure
```
Campus_Marketplace/
├── Frontend/         # React.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
├── server/           # Node.js + Express backend
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   └── middleware/
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation
```bash
# Clone the repository
git clone https://github.com/mohit234563/Campus_Marketplace.git
cd Campus_Marketplace
```

### Run the Backend
```bash
cd server
npm install
nodemon server
```

### Run the Frontend
```bash
cd Frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file in the `/server` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

---

## 🙋‍♂️ Author

**Mohit Vijayvargiya**  
[LinkedIn](https://www.linkedin.com/in/mohit-vijay-24b182291) • [GitHub](https://github.com/mohit234563)

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
