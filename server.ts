import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let currentDbName = "analytics.db";
let db = new Database(path.join(DATA_DIR, currentDbName));

function initDb(database: any) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product TEXT,
      category TEXT,
      amount REAL,
      price REAL,
      region TEXT,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product TEXT,
      stock_level INTEGER,
      warehouse TEXT,
      unit_cost REAL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      segment TEXT,
      country TEXT,
      total_spend REAL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT,
      amount REAL,
      date TEXT,
      department TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      status TEXT,
      total_amount REAL,
      order_date TEXT
    );
  `);

  // Seed data if empty
  const rowCount = database.prepare("SELECT COUNT(*) as count FROM sales").get() as { count: number };
  if (rowCount.count === 0) {
    // Sales
    const insertSale = database.prepare("INSERT INTO sales (product, category, amount, price, region, date) VALUES (?, ?, ?, ?, ?, ?)");
    const salesData = [
      ['Enterprise Server', 'Hardware', 5000, 2500, 'North', '2024-02-01'],
      ['Cloud Subscription', 'Software', 1200, 100, 'Global', '2024-02-02'],
      ['Consulting Service', 'Services', 3000, 150, 'West', '2024-02-03'],
      ['Workstation Pro', 'Hardware', 2500, 1250, 'East', '2024-02-04'],
      ['Security Suite', 'Software', 800, 400, 'South', '2024-02-05'],
      ['Network Switch', 'Hardware', 1500, 750, 'North', '2024-02-06'],
      ['CRM License', 'Software', 450, 45, 'Global', '2024-02-07'],
      ['Training Workshop', 'Services', 2000, 500, 'West', '2024-02-08'],
      ['Backup Drive', 'Hardware', 300, 150, 'East', '2024-02-09'],
      ['Analytics Tool', 'Software', 950, 475, 'South', '2024-02-10'],
    ];
    for (const sale of salesData) insertSale.run(...sale);

    // Inventory
    const insertInventory = database.prepare("INSERT INTO inventory (product, stock_level, warehouse, unit_cost) VALUES (?, ?, ?, ?)");
    const inventoryData = [
      ['Enterprise Server', 15, 'Central-Hub', 3500],
      ['Workstation Pro', 40, 'Central-Hub', 1800],
      ['Network Switch', 25, 'East-Hub', 900],
      ['Backup Drive', 100, 'West-Hub', 150],
      ['Laptop Pro', 60, 'Central-Hub', 800],
    ];
    for (const item of inventoryData) insertInventory.run(...item);

    // Customers
    const insertCustomer = database.prepare("INSERT INTO customers (name, email, segment, country, total_spend) VALUES (?, ?, ?, ?, ?)");
    const customerData = [
      ['Acme Corp', 'contact@acme.com', 'Enterprise', 'USA', 15000],
      ['Global Tech', 'info@globaltech.io', 'Enterprise', 'UK', 22000],
      ['Startup Inc', 'hello@startup.co', 'SMB', 'Canada', 5000],
      ['Edu Systems', 'admin@edusys.edu', 'Public Sector', 'Germany', 12000],
      ['Retail Hub', 'sales@retailhub.com', 'SMB', 'Australia', 8000],
    ];
    for (const customer of customerData) insertCustomer.run(...customer);

    // Expenses
    const insertExpense = database.prepare("INSERT INTO expenses (category, amount, date, department) VALUES (?, ?, ?, ?)");
    const expenseData = [
      ['Marketing', 5000, '2024-01-10', 'Sales'],
      ['Rent', 12000, '2024-01-01', 'Operations'],
      ['Cloud Hosting', 2500, '2024-01-15', 'IT'],
      ['Salaries', 45000, '2024-01-28', 'HR'],
      ['Office Supplies', 800, '2024-01-20', 'Admin'],
    ];
    for (const expense of expenseData) insertExpense.run(...expense);

    // Orders
    const insertOrder = database.prepare("INSERT INTO orders (customer_id, status, total_amount, order_date) VALUES (?, ?, ?, ?)");
    const orderData = [
      [1, 'Shipped', 5000, '2024-02-01'],
      [2, 'Processing', 1200, '2024-02-02'],
      [3, 'Delivered', 300, '2024-01-25'],
      [4, 'Pending', 4500, '2024-02-05'],
      [5, 'Shipped', 1500, '2024-02-03'],
    ];
    for (const order of orderData) insertOrder.run(...order);
  }
}

// Initialize the default DB
initDb(db);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API: List Data Sources
  app.get("/api/datasources", (req, res) => {
    try {
      const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".db"));
      res.json({ 
        datasources: files.map(f => ({ name: f, active: f === currentDbName })),
        active: currentDbName
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // API: Select Data Source
  app.post("/api/datasources/select", (req, res) => {
    const { name } = req.body;
    if (!name || !name.endsWith(".db")) {
      return res.status(400).json({ error: "Invalid database name" });
    }

    const dbPath = path.join(DATA_DIR, name);
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: "Database not found" });
    }

    try {
      db.close();
      currentDbName = name;
      db = new Database(dbPath);
      res.json({ message: `Switched to ${name}`, active: currentDbName });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // API: Create Data Source
  app.post("/api/datasources/create", (req, res) => {
    let { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    
    if (!name.endsWith(".db")) name += ".db";
    const dbPath = path.join(DATA_DIR, name);

    if (fs.existsSync(dbPath)) {
      return res.status(400).json({ error: "Database already exists" });
    }

    try {
      const newDb = new Database(dbPath);
      // Optionally initialize with sample tables or keep empty
      // initDb(newDb); 
      newDb.close();
      res.json({ message: `Database ${name} created` });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // API: Delete Data Source
  app.delete("/api/datasources/:name", (req, res) => {
    const { name } = req.params;
    if (name === currentDbName) {
      return res.status(400).json({ error: "Cannot delete the active database" });
    }
    if (name === "analytics.db") {
      return res.status(400).json({ error: "Cannot delete the default database" });
    }

    const dbPath = path.join(DATA_DIR, name);
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      res.json({ message: `Database ${name} deleted` });
    } else {
      res.status(404).json({ error: "Database not found" });
    }
  });

  // API: Get DB Schema
  app.get("/api/schema", (req, res) => {
    try {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
      const schema: Record<string, string[]> = {};
      
      for (const table of tables) {
        const columns = db.prepare(`PRAGMA table_info("${table.name}")`).all() as { name: string }[];
        schema[table.name] = columns.map(c => c.name);
      }
      
      res.json({ schema, activeDb: currentDbName });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // API: Execute SQL
  app.post("/api/query", (req, res) => {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: "SQL query is required" });

    try {
      // Basic security check: only allow SELECT
      const trimmedSql = sql.trim().toUpperCase();
      const sqlWithoutComments = trimmedSql.replace(/--.*$/gm, '').trim();
      
      if (!sqlWithoutComments.startsWith("SELECT")) {
        return res.status(403).json({ error: "Only SELECT queries are allowed for security reasons." });
      }

      const results = db.prepare(sql).all();
      res.json({ results });
    } catch (error) {
      console.error("SQL Error:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // API: Upload CSV
  app.post("/api/upload", (req, res) => {
    const { tableName, data } = req.body;
    if (!tableName || !data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    try {
      const columns = Object.keys(data[0]);
      const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '_');
      
      db.exec(`DROP TABLE IF EXISTS "${sanitizedTableName}"`);
      const colDefs = columns.map(col => `"${col}" TEXT`).join(", ");
      db.exec(`CREATE TABLE "${sanitizedTableName}" (${colDefs})`);

      const placeholders = columns.map(() => "?").join(", ");
      const insert = db.prepare(`INSERT INTO "${sanitizedTableName}" (${columns.map(c => `"${c}"`).join(", ")}) VALUES (${placeholders})`);
      
      const insertMany = db.transaction((rows) => {
        for (const row of rows) {
          insert.run(columns.map(col => row[col]));
        }
      });

      insertMany(data);
      res.json({ message: `Table ${sanitizedTableName} created with ${data.length} rows in ${currentDbName}.` });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      app.get("*", (req, res) => {
        res.status(404).send("Production build not found. Please run npm run build.");
      });
    }
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({ 
      error: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
