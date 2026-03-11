const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

let db = null

function getDbPath() {
  try {
    const { app } = require('electron')
    if (app.isPackaged) {
      return path.join(app.getPath('userData'), 'database.db')
    }
  } catch (e) {}
  return path.join(__dirname, 'database.db')
}

function getDb() {
  if (!db) {
    const dbPath = getDbPath()
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

function initializeDatabase() {
  try {
    const database = getDb()
    console.log('Initializing database at:', getDbPath())

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier',
      full_name TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      unit TEXT DEFAULT 'piece',
      color TEXT DEFAULT '#1e40af',
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      unit TEXT DEFAULT 'piece',
      description TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number TEXT NOT NULL,
      capacity INTEGER DEFAULT 4,
      status TEXT DEFAULT 'available',
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS waiters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS delivery_boys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      token_number INTEGER,
      order_type TEXT DEFAULT 'dine_in',
      status TEXT DEFAULT 'pending',
      table_id INTEGER,
      table_number TEXT,
      waiter_id INTEGER,
      waiter_name TEXT,
      delivery_boy_id INTEGER,
      delivery_boy_name TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      subtotal REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'cash',
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      item_id INTEGER,
      item_name TEXT NOT NULL,
      category_name TEXT,
      unit TEXT DEFAULT 'piece',
      quantity REAL NOT NULL DEFAULT 1,
      price REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL DEFAULT 0,
      date TEXT NOT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS daily_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      total_orders INTEGER DEFAULT 0,
      total_sales REAL DEFAULT 0,
      dine_in_sales REAL DEFAULT 0,
      takeaway_sales REAL DEFAULT 0,
      delivery_sales REAL DEFAULT 0,
      total_expenses REAL DEFAULT 0,
      net_profit REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `)

  // Check if already seeded
  const adminUser = database.prepare("SELECT id FROM users WHERE username = 'admin'").get()
  if (!adminUser) {
    seedDefaultData(database)
  }
  console.log('Database initialization complete')
  } catch (err) {
    console.error('Database initialization error:', err)
    throw err
  }
}

function seedDefaultData(database) {
  // Hash passwords
  const adminHash = bcrypt.hashSync('admin123', 10)
  const cashierHash = bcrypt.hashSync('cashier123', 10)

  // Insert default users
  database.prepare(`
    INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)
  `).run('admin', adminHash, 'admin', 'Administrator')

  database.prepare(`
    INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)
  `).run('cashier', cashierHash, 'cashier', 'Cashier')

  // Insert default categories
  const categories = [
    { name: 'Karahi', unit: 'kg', color: '#dc2626', sort_order: 1 },
    { name: 'Daal', unit: 'plate', color: '#d97706', sort_order: 2 },
    { name: 'BBQ', unit: 'kg', color: '#7c3aed', sort_order: 3 },
    { name: 'Biryani', unit: 'plate', color: '#059669', sort_order: 4 },
    { name: 'Roti', unit: 'piece', color: '#0284c7', sort_order: 5 },
    { name: 'Beverages', unit: 'unit', color: '#0891b2', sort_order: 6 },
    { name: 'Desserts', unit: 'piece', color: '#db2777', sort_order: 7 },
  ]

  const insertCategory = database.prepare(`
    INSERT INTO categories (name, unit, color, sort_order) VALUES (?, ?, ?, ?)
  `)

  categories.forEach(cat => {
    insertCategory.run(cat.name, cat.unit, cat.color, cat.sort_order)
  })

  const cats = database.prepare("SELECT id, name FROM categories").all()
  const catMap = {}
  cats.forEach(c => { catMap[c.name] = c.id })

  // Insert default items
  const items = [
    { category: 'Karahi', name: 'Chicken Karahi', price: 1200, unit: 'kg' },
    { category: 'Karahi', name: 'Mutton Karahi', price: 2200, unit: 'kg' },
    { category: 'Karahi', name: 'Beef Karahi', price: 1800, unit: 'kg' },
    { category: 'Daal', name: 'Daal Makhani', price: 250, unit: 'plate' },
    { category: 'Daal', name: 'Daal Tadka', price: 200, unit: 'plate' },
    { category: 'BBQ', name: 'Seekh Kabab', price: 800, unit: 'kg' },
    { category: 'BBQ', name: 'Tikka Boti', price: 1000, unit: 'kg' },
    { category: 'BBQ', name: 'Malai Boti', price: 1200, unit: 'kg' },
    { category: 'Biryani', name: 'Chicken Biryani', price: 350, unit: 'plate' },
    { category: 'Biryani', name: 'Mutton Biryani', price: 500, unit: 'plate' },
    { category: 'Roti', name: 'Naan', price: 30, unit: 'piece' },
    { category: 'Roti', name: 'Tandoori Roti', price: 20, unit: 'piece' },
    { category: 'Roti', name: 'Paratha', price: 50, unit: 'piece' },
    { category: 'Beverages', name: 'Soft Drink', price: 80, unit: 'unit' },
    { category: 'Beverages', name: 'Water Bottle', price: 50, unit: 'unit' },
    { category: 'Beverages', name: 'Lassi', price: 150, unit: 'unit' },
    { category: 'Desserts', name: 'Gulab Jamun', price: 100, unit: 'piece' },
    { category: 'Desserts', name: 'Kheer', price: 150, unit: 'piece' },
  ]

  const insertItem = database.prepare(`
    INSERT INTO items (category_id, name, price, unit) VALUES (?, ?, ?, ?)
  `)

  items.forEach(item => {
    const catId = catMap[item.category]
    if (catId) insertItem.run(catId, item.name, item.price, item.unit)
  })

  // Insert tables 1-20
  const insertTable = database.prepare(`INSERT INTO tables (table_number, capacity) VALUES (?, ?)`)
  for (let i = 1; i <= 20; i++) {
    insertTable.run(`T${i}`, 4)
  }

  // Insert waiters
  const insertWaiter = database.prepare(`INSERT INTO waiters (name) VALUES (?)`)
  ;['Bilal', 'Sajjad', 'Saif'].forEach(name => insertWaiter.run(name))

  // Insert delivery boys
  const insertDelivery = database.prepare(`INSERT INTO delivery_boys (name) VALUES (?)`)
  ;['Ahmed', 'Hassan'].forEach(name => insertDelivery.run(name))

  // Insert default settings
  const insertSetting = database.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`)
  const defaultSettings = {
    restaurant_name: 'GM Hotel',
    address: 'Main Street',
    phone: '',
    currency: 'PKR',
    paper_size: '80mm',
    tax_enabled: 'false',
    tax_rate: '0',
  }
  Object.entries(defaultSettings).forEach(([key, value]) => {
    insertSetting.run(key, value)
  })
}

// Auth functions
function login(username, password) {
  try {
    const database = getDb()
    const user = database.prepare("SELECT * FROM users WHERE username = ? AND active = 1").get(username)
    if (!user) return { success: false, message: 'Invalid username or password' }

    const valid = bcrypt.compareSync(password, user.password)
    if (!valid) return { success: false, message: 'Invalid username or password' }

    const { password: _, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function changePassword(userId, currentPassword, newPassword) {
  try {
    const database = getDb()
    const user = database.prepare("SELECT * FROM users WHERE id = ?").get(userId)
    if (!user) return { success: false, message: 'User not found' }

    const valid = bcrypt.compareSync(currentPassword, user.password)
    if (!valid) return { success: false, message: 'Current password is incorrect' }

    const newHash = bcrypt.hashSync(newPassword, 10)
    database.prepare("UPDATE users SET password = ? WHERE id = ?").run(newHash, userId)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function resetPassword(userId, newPassword) {
  try {
    const database = getDb()
    const newHash = bcrypt.hashSync(newPassword, 10)
    database.prepare("UPDATE users SET password = ? WHERE id = ?").run(newHash, userId)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Categories CRUD
function getCategories() {
  try {
    const database = getDb()
    const rows = database.prepare("SELECT * FROM categories ORDER BY sort_order, name").all()
    return { success: true, data: rows }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function createCategory(data) {
  try {
    const database = getDb()
    const result = database.prepare(`
      INSERT INTO categories (name, unit, color, sort_order) VALUES (?, ?, ?, ?)
    `).run(data.name, data.unit || 'piece', data.color || '#1e40af', data.sort_order || 0)
    return { success: true, id: result.lastInsertRowid }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function updateCategory(id, data) {
  try {
    const database = getDb()
    database.prepare(`
      UPDATE categories SET name=?, unit=?, color=?, sort_order=?, active=? WHERE id=?
    `).run(data.name, data.unit, data.color, data.sort_order, data.active !== false ? 1 : 0, id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function deleteCategory(id) {
  try {
    const database = getDb()
    database.prepare("DELETE FROM categories WHERE id=?").run(id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Items CRUD
function getItems() {
  try {
    const database = getDb()
    const rows = database.prepare(`
      SELECT i.*, c.name as category_name FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY c.sort_order, i.name
    `).all()
    return { success: true, data: rows }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function getItemsByCategory(categoryId) {
  try {
    const database = getDb()
    const rows = database.prepare(`
      SELECT i.*, c.name as category_name FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.category_id = ? AND i.active = 1
      ORDER BY i.name
    `).all(categoryId)
    return { success: true, data: rows }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function createItem(data) {
  try {
    const database = getDb()
    const result = database.prepare(`
      INSERT INTO items (category_id, name, price, unit, description) VALUES (?, ?, ?, ?, ?)
    `).run(data.category_id, data.name, data.price, data.unit || 'piece', data.description || '')
    return { success: true, id: result.lastInsertRowid }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function updateItem(id, data) {
  try {
    const database = getDb()
    database.prepare(`
      UPDATE items SET category_id=?, name=?, price=?, unit=?, description=?, active=? WHERE id=?
    `).run(data.category_id, data.name, data.price, data.unit, data.description || '', data.active !== false ? 1 : 0, id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function deleteItem(id) {
  try {
    const database = getDb()
    database.prepare("DELETE FROM items WHERE id=?").run(id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Waiters CRUD
function getWaiters() {
  try {
    const database = getDb()
    const rows = database.prepare("SELECT * FROM waiters WHERE active=1 ORDER BY name").all()
    return { success: true, data: rows }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function createWaiter(data) {
  try {
    const database = getDb()
    const result = database.prepare("INSERT INTO waiters (name, phone) VALUES (?, ?)").run(data.name, data.phone || '')
    return { success: true, id: result.lastInsertRowid }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function updateWaiter(id, data) {
  try {
    const database = getDb()
    database.prepare("UPDATE waiters SET name=?, phone=?, active=? WHERE id=?").run(data.name, data.phone || '', data.active !== false ? 1 : 0, id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function deleteWaiter(id) {
  try {
    const database = getDb()
    database.prepare("DELETE FROM waiters WHERE id=?").run(id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Delivery Boys CRUD
function getDeliveryBoys() {
  try {
    const database = getDb()
    const rows = database.prepare("SELECT * FROM delivery_boys WHERE active=1 ORDER BY name").all()
    return { success: true, data: rows }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function createDeliveryBoy(data) {
  try {
    const database = getDb()
    const result = database.prepare("INSERT INTO delivery_boys (name, phone) VALUES (?, ?)").run(data.name, data.phone || '')
    return { success: true, id: result.lastInsertRowid }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function updateDeliveryBoy(id, data) {
  try {
    const database = getDb()
    database.prepare("UPDATE delivery_boys SET name=?, phone=?, active=? WHERE id=?").run(data.name, data.phone || '', data.active !== false ? 1 : 0, id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function deleteDeliveryBoy(id) {
  try {
    const database = getDb()
    database.prepare("DELETE FROM delivery_boys WHERE id=?").run(id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Tables CRUD
function getTables() {
  try {
    const database = getDb()
    const rows = database.prepare("SELECT * FROM tables WHERE active=1 ORDER BY table_number").all()
    return { success: true, data: rows }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function createTable(data) {
  try {
    const database = getDb()
    const result = database.prepare("INSERT INTO tables (table_number, capacity) VALUES (?, ?)").run(data.table_number, data.capacity || 4)
    return { success: true, id: result.lastInsertRowid }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function updateTable(id, data) {
  try {
    const database = getDb()
    database.prepare("UPDATE tables SET table_number=?, capacity=?, active=? WHERE id=?").run(data.table_number, data.capacity || 4, data.active !== false ? 1 : 0, id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function deleteTable(id) {
  try {
    const database = getDb()
    database.prepare("DELETE FROM tables WHERE id=?").run(id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Users CRUD
function getUsers() {
  try {
    const database = getDb()
    const rows = database.prepare("SELECT id, username, role, full_name, active, created_at FROM users ORDER BY username").all()
    return { success: true, data: rows }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function createUser(data) {
  try {
    const database = getDb()
    const hash = bcrypt.hashSync(data.password, 10)
    const result = database.prepare(`
      INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)
    `).run(data.username, hash, data.role || 'cashier', data.full_name || '')
    return { success: true, id: result.lastInsertRowid }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function updateUser(id, data) {
  try {
    const database = getDb()
    if (data.password) {
      const hash = bcrypt.hashSync(data.password, 10)
      database.prepare("UPDATE users SET username=?, password=?, role=?, full_name=?, active=? WHERE id=?")
        .run(data.username, hash, data.role, data.full_name || '', data.active !== false ? 1 : 0, id)
    } else {
      database.prepare("UPDATE users SET username=?, role=?, full_name=?, active=? WHERE id=?")
        .run(data.username, data.role, data.full_name || '', data.active !== false ? 1 : 0, id)
    }
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function deleteUser(id) {
  try {
    const database = getDb()
    database.prepare("DELETE FROM users WHERE id=?").run(id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Orders
function generateOrderNumber() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const time = now.getTime().toString().slice(-6)
  return `ORD-${date}-${time}`
}

function getNextTokenNumber() {
  try {
    const database = getDb()
    const today = new Date().toISOString().slice(0, 10)
    const result = database.prepare(`
      SELECT MAX(token_number) as max_token FROM orders
      WHERE date(created_at) = ?
    `).get(today)
    const nextToken = (result.max_token || 0) + 1
    return { success: true, token: nextToken }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function getOrders(filters = {}) {
  try {
    const database = getDb()
    let query = `
      SELECT o.*, GROUP_CONCAT(oi.id) as item_ids
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `
    const params = []

    if (filters.status) {
      query += ` AND o.status = ?`
      params.push(filters.status)
    }
    if (filters.date) {
      query += ` AND date(o.created_at) = ?`
      params.push(filters.date)
    }
    if (filters.order_type) {
      query += ` AND o.order_type = ?`
      params.push(filters.order_type)
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC`

    if (filters.limit) {
      query += ` LIMIT ?`
      params.push(filters.limit)
    }

    const orders = database.prepare(query).all(...params)

    return { success: true, data: orders }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function getOrderById(id) {
  try {
    const database = getDb()
    const order = database.prepare("SELECT * FROM orders WHERE id=?").get(id)
    if (!order) return { success: false, message: 'Order not found' }

    const items = database.prepare("SELECT * FROM order_items WHERE order_id=?").all(id)
    order.items = items
    return { success: true, data: order }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function createOrder(data) {
  try {
    const database = getDb()
    const tokenResult = getNextTokenNumber()
    const tokenNumber = tokenResult.success ? tokenResult.token : 1
    const orderNumber = generateOrderNumber()

    const insertOrder = database.prepare(`
      INSERT INTO orders (
        order_number, token_number, order_type, status,
        table_id, table_number, waiter_id, waiter_name,
        delivery_boy_id, delivery_boy_name,
        customer_name, customer_phone,
        subtotal, discount, total, payment_method, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertItem = database.prepare(`
      INSERT INTO order_items (order_id, item_id, item_name, category_name, unit, quantity, price, total, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const transaction = database.transaction(() => {
      const result = insertOrder.run(
        orderNumber, tokenNumber,
        data.order_type || 'dine_in',
        data.status || 'pending',
        data.table_id || null, data.table_number || null,
        data.waiter_id || null, data.waiter_name || null,
        data.delivery_boy_id || null, data.delivery_boy_name || null,
        data.customer_name || null, data.customer_phone || null,
        data.subtotal || 0, data.discount || 0, data.total || 0,
        data.payment_method || 'cash',
        data.notes || null, data.created_by || null
      )

      const orderId = result.lastInsertRowid
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach(item => {
          insertItem.run(
            orderId, item.item_id || null, item.item_name,
            item.category_name || null, item.unit || 'piece',
            item.quantity, item.price, item.total,
            item.notes || null
          )
        })
      }

      return orderId
    })

    const orderId = transaction()
    return { success: true, id: orderId, order_number: orderNumber, token_number: tokenNumber }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function updateOrder(id, data) {
  try {
    const database = getDb()

    const updateOrderStmt = database.prepare(`
      UPDATE orders SET
        order_type=?, status=?,
        table_id=?, table_number=?, waiter_id=?, waiter_name=?,
        delivery_boy_id=?, delivery_boy_name=?,
        customer_name=?, customer_phone=?,
        subtotal=?, discount=?, total=?,
        payment_method=?, notes=?,
        updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `)

    const deleteItems = database.prepare("DELETE FROM order_items WHERE order_id=?")
    const insertItem = database.prepare(`
      INSERT INTO order_items (order_id, item_id, item_name, category_name, unit, quantity, price, total, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const transaction = database.transaction(() => {
      updateOrderStmt.run(
        data.order_type, data.status,
        data.table_id || null, data.table_number || null,
        data.waiter_id || null, data.waiter_name || null,
        data.delivery_boy_id || null, data.delivery_boy_name || null,
        data.customer_name || null, data.customer_phone || null,
        data.subtotal || 0, data.discount || 0, data.total || 0,
        data.payment_method || 'cash', data.notes || null, id
      )

      deleteItems.run(id)
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach(item => {
          insertItem.run(
            id, item.item_id || null, item.item_name,
            item.category_name || null, item.unit || 'piece',
            item.quantity, item.price, item.total,
            item.notes || null
          )
        })
      }
    })

    transaction()
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function updateOrderStatus(id, status) {
  try {
    const database = getDb()
    database.prepare("UPDATE orders SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").run(status, id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function getTodayStats() {
  try {
    const database = getDb()
    const today = new Date().toISOString().slice(0, 10)

    const stats = database.prepare(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) as total_sales,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(CASE WHEN order_type = 'dine_in' AND status != 'cancelled' THEN total ELSE 0 END) as dine_in_sales,
        SUM(CASE WHEN order_type = 'takeaway' AND status != 'cancelled' THEN total ELSE 0 END) as takeaway_sales,
        SUM(CASE WHEN order_type = 'delivery' AND status != 'cancelled' THEN total ELSE 0 END) as delivery_sales
      FROM orders WHERE date(created_at) = ?
    `).get(today)

    return { success: true, data: stats }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Expenses
function getExpenses(filters = {}) {
  try {
    const database = getDb()
    let query = "SELECT * FROM expenses WHERE 1=1"
    const params = []

    if (filters.date) {
      query += " AND date = ?"
      params.push(filters.date)
    }
    if (filters.month) {
      query += " AND strftime('%Y-%m', date) = ?"
      params.push(filters.month)
    }

    query += " ORDER BY created_at DESC"
    const rows = database.prepare(query).all(...params)
    return { success: true, data: rows }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function createExpense(data) {
  try {
    const database = getDb()
    const result = database.prepare(`
      INSERT INTO expenses (category, description, amount, date, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.category, data.description || '', data.amount, data.date, data.created_by || null)
    return { success: true, id: result.lastInsertRowid }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function updateExpense(id, data) {
  try {
    const database = getDb()
    database.prepare(`
      UPDATE expenses SET category=?, description=?, amount=?, date=? WHERE id=?
    `).run(data.category, data.description || '', data.amount, data.date, id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function deleteExpense(id) {
  try {
    const database = getDb()
    database.prepare("DELETE FROM expenses WHERE id=?").run(id)
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Reports
function getDailySummary(date) {
  try {
    const database = getDb()
    const targetDate = date || new Date().toISOString().slice(0, 10)

    const orderStats = database.prepare(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) as total_sales,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
        SUM(CASE WHEN order_type = 'dine_in' AND status != 'cancelled' THEN total ELSE 0 END) as dine_in_sales,
        SUM(CASE WHEN order_type = 'takeaway' AND status != 'cancelled' THEN total ELSE 0 END) as takeaway_sales,
        SUM(CASE WHEN order_type = 'delivery' AND status != 'cancelled' THEN total ELSE 0 END) as delivery_sales
      FROM orders WHERE date(created_at) = ?
    `).get(targetDate)

    const expenseStats = database.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM expenses WHERE date = ?
    `).get(targetDate)

    const expensesList = database.prepare(`
      SELECT * FROM expenses WHERE date = ? ORDER BY created_at DESC
    `).all(targetDate)

    const orders = database.prepare(`
      SELECT * FROM orders WHERE date(created_at) = ? ORDER BY created_at DESC
    `).all(targetDate)

    const savedSummary = database.prepare("SELECT * FROM daily_summaries WHERE date = ?").get(targetDate)

    return {
      success: true,
      data: {
        date: targetDate,
        orderStats,
        expenseStats,
        expensesList,
        orders,
        savedSummary,
        net_profit: (orderStats.total_sales || 0) - (expenseStats.total_expenses || 0)
      }
    }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function saveDailySummary(data) {
  try {
    const database = getDb()
    database.prepare(`
      INSERT OR REPLACE INTO daily_summaries
      (date, total_orders, total_sales, dine_in_sales, takeaway_sales, delivery_sales, total_expenses, net_profit, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.date, data.total_orders || 0, data.total_sales || 0,
      data.dine_in_sales || 0, data.takeaway_sales || 0, data.delivery_sales || 0,
      data.total_expenses || 0, data.net_profit || 0, data.notes || ''
    )
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function getMonthlySummary(year, month) {
  try {
    const database = getDb()
    const monthStr = `${year}-${String(month).padStart(2, '0')}`

    const dailyData = database.prepare(`
      SELECT
        date(created_at) as date,
        COUNT(*) as total_orders,
        SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) as total_sales
      FROM orders
      WHERE strftime('%Y-%m', created_at) = ?
      GROUP BY date(created_at)
      ORDER BY date
    `).all(monthStr)

    const monthlyTotals = database.prepare(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) as total_sales,
        SUM(CASE WHEN order_type = 'dine_in' AND status != 'cancelled' THEN total ELSE 0 END) as dine_in_sales,
        SUM(CASE WHEN order_type = 'takeaway' AND status != 'cancelled' THEN total ELSE 0 END) as takeaway_sales,
        SUM(CASE WHEN order_type = 'delivery' AND status != 'cancelled' THEN total ELSE 0 END) as delivery_sales
      FROM orders WHERE strftime('%Y-%m', created_at) = ?
    `).get(monthStr)

    const monthlyExpenses = database.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM expenses WHERE strftime('%Y-%m', date) = ?
    `).get(monthStr)

    return {
      success: true,
      data: {
        year, month, monthStr,
        dailyData,
        monthlyTotals,
        monthlyExpenses,
        net_profit: (monthlyTotals.total_sales || 0) - (monthlyExpenses.total_expenses || 0)
      }
    }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Settings
function getSettings() {
  try {
    const database = getDb()
    const rows = database.prepare("SELECT key, value FROM settings").all()
    const settings = {}
    rows.forEach(row => { settings[row.key] = row.value })
    return { success: true, data: settings }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function saveSettings(settings) {
  try {
    const database = getDb()
    const stmt = database.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
    const transaction = database.transaction(() => {
      Object.entries(settings).forEach(([key, value]) => {
        stmt.run(key, String(value))
      })
    })
    transaction()
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Backup
function createBackup(type) {
  try {
    const { app } = require('electron')
    const dbPath = getDbPath()
    if (!fs.existsSync(dbPath)) return { success: false, message: 'Database not found' }

    const backupDir = path.join(app.getPath('userData'), 'backups')
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const backupFile = path.join(backupDir, `backup_${type}_${timestamp}.db`)

    fs.copyFileSync(dbPath, backupFile)

    // Keep only last 30 backups
    const files = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.db'))
      .sort()
    if (files.length > 30) {
      files.slice(0, files.length - 30).forEach(f => {
        fs.unlinkSync(path.join(backupDir, f))
      })
    }

    return { success: true, path: backupFile }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function getBackupList() {
  try {
    const { app } = require('electron')
    const backupDir = path.join(app.getPath('userData'), 'backups')
    if (!fs.existsSync(backupDir)) return { success: true, data: [] }

    const files = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.db'))
      .sort()
      .reverse()
      .map(f => {
        const filePath = path.join(backupDir, f)
        const stat = fs.statSync(filePath)
        return {
          name: f,
          path: filePath,
          size: stat.size,
          created_at: stat.mtime.toISOString()
        }
      })

    return { success: true, data: files }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

function getDatabaseInfo() {
  try {
    const dbPath = getDbPath()
    const stat = fs.existsSync(dbPath) ? fs.statSync(dbPath) : null
    return {
      success: true,
      data: {
        path: dbPath,
        size: stat ? stat.size : 0,
        last_modified: stat ? stat.mtime.toISOString() : null
      }
    }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

module.exports = {
  initializeDatabase,
  login, changePassword, resetPassword,
  getCategories, createCategory, updateCategory, deleteCategory,
  getItems, getItemsByCategory, createItem, updateItem, deleteItem,
  getWaiters, createWaiter, updateWaiter, deleteWaiter,
  getDeliveryBoys, createDeliveryBoy, updateDeliveryBoy, deleteDeliveryBoy,
  getTables, createTable, updateTable, deleteTable,
  getUsers, createUser, updateUser, deleteUser,
  getOrders, getOrderById, createOrder, updateOrder, updateOrderStatus,
  getTodayStats, getNextTokenNumber,
  getExpenses, createExpense, updateExpense, deleteExpense,
  getDailySummary, saveDailySummary, getMonthlySummary,
  getSettings, saveSettings,
  createBackup, getBackupList, getDatabaseInfo,
}
