import express from "express";
import * as db from "./db.js";

const app = express();
app.use(express.json());

// Initialize Database Function
async function initDb() {
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      role TEXT DEFAULT 'client'
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT,
      unit TEXT DEFAULT 'kg'
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      product_id INTEGER,
      quantity REAL,
      delivery_date TEXT,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS efficiency_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      product_name TEXT,
      price_in_natura REAL,
      labor_hours REAL,
      waste_percent REAL,
      calculated_savings REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

    // Seed initial data if empty
    const userCount = await db.get("SELECT count(*) as count FROM users");
    if (parseInt(userCount.count) === 0) {
        await db.run("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)", ["admin@vittahorta.com", "admin123", "Admin Vitta", "admin"]);
        await db.run("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)", ["cliente@restaurante.com", "cliente123", "Restaurante Sabor", "client"]);

        const products = ["Cebola Picada", "Batata em Cubos", "Cenoura Ralada", "Alface Higienizada", "Tomate Fatiado"];
        for (const p of products) {
            await db.run("INSERT INTO products (name) VALUES (?)", [p]);
        }
    }
}

// Routes
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.get("SELECT id, email, name, role FROM users WHERE email = ? AND password = ?", [email, password]);
        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ error: "Credenciais inválidas" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/products", async (req, res) => {
    try {
        const products = await db.query("SELECT * FROM products");
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/orders", async (req, res) => {
    try {
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

        const orders = await db.query(query, params);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/orders", async (req, res) => {
    try {
        const { userId, productId, quantity, deliveryDate } = req.body;
        const result = await db.run("INSERT INTO orders (user_id, product_id, quantity, delivery_date) VALUES (?, ?, ?, ?)", [userId, productId, quantity, deliveryDate]);
        res.json({ id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/api/orders/:id", async (req, res) => {
    try {
        await db.run("DELETE FROM orders WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/efficiency", async (req, res) => {
    try {
        const { userId, productName, priceInNatura, laborHours, wastePercent, calculatedSavings } = req.body;
        const result = await db.run("INSERT INTO efficiency_logs (user_id, product_name, price_in_natura, labor_hours, waste_percent, calculated_savings) VALUES (?, ?, ?, ?, ?, ?)", [userId, productName, priceInNatura, laborHours, wastePercent, calculatedSavings]);
        res.json({ id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/efficiency/:userId", async (req, res) => {
    try {
        const logs = await db.query("SELECT * FROM efficiency_logs WHERE user_id = ? ORDER BY created_at DESC", [req.params.userId]);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// For Vercel, we need to export the app
// We also need to run initDb, but in serverless it's better to do it per request 
// or once if the instance is warm.
let initialized = false;
export default async (req: any, res: any) => {
    if (!initialized) {
        await initDb();
        initialized = true;
    }
    return app(req, res);
};
