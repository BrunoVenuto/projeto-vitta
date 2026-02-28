import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("vittahorta.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'client'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    unit TEXT DEFAULT 'kg'
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity REAL,
    delivery_date TEXT,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS efficiency_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_name TEXT,
    price_in_natura REAL,
    labor_hours REAL,
    waste_percent REAL,
    calculated_savings REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run("admin@vittahorta.com", "admin123", "Admin Vitta", "admin");
  db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run("cliente@restaurante.com", "cliente123", "Restaurante Sabor", "client");
  
  const products = ["Cebola Picada", "Batata em Cubos", "Cenoura Ralada", "Alface Higienizada", "Tomate Fatiado"];
  const insertProduct = db.prepare("INSERT INTO products (name) VALUES (?)");
  products.forEach(p => insertProduct.run(p));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT id, email, name, role FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  });

  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.get("/api/orders", (req, res) => {
    const { userId, role, date } = req.query;
    let query = "SELECT o.*, p.name as product_name, u.name as client_name FROM orders o JOIN products p ON o.product_id = p.id JOIN users u ON o.user_id = u.id";
    const params: any[] = [];

    if (role === 'client' && userId) {
      query += " WHERE o.user_id = ?";
      params.push(userId);
    } else if (role === 'admin' && date) {
      query += " WHERE o.delivery_date = ?";
      params.push(date);
    }

    const orders = db.prepare(query).all(...params);
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const { userId, productId, quantity, deliveryDate } = req.body;
    const result = db.prepare("INSERT INTO orders (user_id, product_id, quantity, delivery_date) VALUES (?, ?, ?, ?)").run(userId, productId, quantity, deliveryDate);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/orders/:id", (req, res) => {
    db.prepare("DELETE FROM orders WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/efficiency", (req, res) => {
    const { userId, productName, priceInNatura, laborHours, wastePercent, calculatedSavings } = req.body;
    const result = db.prepare("INSERT INTO efficiency_logs (user_id, product_name, price_in_natura, labor_hours, waste_percent, calculated_savings) VALUES (?, ?, ?, ?, ?, ?)").run(userId, productName, priceInNatura, laborHours, wastePercent, calculatedSavings);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/efficiency/:userId", (req, res) => {
    const logs = db.prepare("SELECT * FROM efficiency_logs WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
    res.json(logs);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
