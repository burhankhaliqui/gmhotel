const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
    show: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.maximize()
  })

  mainWindow.on('close', () => {
    try {
      const db = require('./database')
      db.createBackup('auto_close')
    } catch (e) {
      // ignore
    }
  })
}

app.whenReady().then(() => {
  const db = require('./database')
  db.initializeDatabase()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC Handlers - Auth
ipcMain.handle('auth:login', async (event, { username, password }) => {
  const db = require('./database')
  return db.login(username, password)
})

ipcMain.handle('auth:changePassword', async (event, { userId, currentPassword, newPassword }) => {
  const db = require('./database')
  return db.changePassword(userId, currentPassword, newPassword)
})

ipcMain.handle('auth:resetPassword', async (event, { userId, newPassword }) => {
  const db = require('./database')
  return db.resetPassword(userId, newPassword)
})

// IPC Handlers - Categories
ipcMain.handle('categories:getAll', async () => {
  const db = require('./database')
  return db.getCategories()
})

ipcMain.handle('categories:create', async (event, data) => {
  const db = require('./database')
  return db.createCategory(data)
})

ipcMain.handle('categories:update', async (event, { id, data }) => {
  const db = require('./database')
  return db.updateCategory(id, data)
})

ipcMain.handle('categories:delete', async (event, id) => {
  const db = require('./database')
  return db.deleteCategory(id)
})

// IPC Handlers - Items
ipcMain.handle('items:getAll', async () => {
  const db = require('./database')
  return db.getItems()
})

ipcMain.handle('items:getByCategory', async (event, categoryId) => {
  const db = require('./database')
  return db.getItemsByCategory(categoryId)
})

ipcMain.handle('items:create', async (event, data) => {
  const db = require('./database')
  return db.createItem(data)
})

ipcMain.handle('items:update', async (event, { id, data }) => {
  const db = require('./database')
  return db.updateItem(id, data)
})

ipcMain.handle('items:delete', async (event, id) => {
  const db = require('./database')
  return db.deleteItem(id)
})

// IPC Handlers - Waiters
ipcMain.handle('waiters:getAll', async () => {
  const db = require('./database')
  return db.getWaiters()
})

ipcMain.handle('waiters:create', async (event, data) => {
  const db = require('./database')
  return db.createWaiter(data)
})

ipcMain.handle('waiters:update', async (event, { id, data }) => {
  const db = require('./database')
  return db.updateWaiter(id, data)
})

ipcMain.handle('waiters:delete', async (event, id) => {
  const db = require('./database')
  return db.deleteWaiter(id)
})

// IPC Handlers - Delivery Boys
ipcMain.handle('deliveryBoys:getAll', async () => {
  const db = require('./database')
  return db.getDeliveryBoys()
})

ipcMain.handle('deliveryBoys:create', async (event, data) => {
  const db = require('./database')
  return db.createDeliveryBoy(data)
})

ipcMain.handle('deliveryBoys:update', async (event, { id, data }) => {
  const db = require('./database')
  return db.updateDeliveryBoy(id, data)
})

ipcMain.handle('deliveryBoys:delete', async (event, id) => {
  const db = require('./database')
  return db.deleteDeliveryBoy(id)
})

// IPC Handlers - Tables
ipcMain.handle('tables:getAll', async () => {
  const db = require('./database')
  return db.getTables()
})

ipcMain.handle('tables:create', async (event, data) => {
  const db = require('./database')
  return db.createTable(data)
})

ipcMain.handle('tables:update', async (event, { id, data }) => {
  const db = require('./database')
  return db.updateTable(id, data)
})

ipcMain.handle('tables:delete', async (event, id) => {
  const db = require('./database')
  return db.deleteTable(id)
})

// IPC Handlers - Users
ipcMain.handle('users:getAll', async () => {
  const db = require('./database')
  return db.getUsers()
})

ipcMain.handle('users:create', async (event, data) => {
  const db = require('./database')
  return db.createUser(data)
})

ipcMain.handle('users:update', async (event, { id, data }) => {
  const db = require('./database')
  return db.updateUser(id, data)
})

ipcMain.handle('users:delete', async (event, id) => {
  const db = require('./database')
  return db.deleteUser(id)
})

// IPC Handlers - Orders
ipcMain.handle('orders:getAll', async (event, filters) => {
  const db = require('./database')
  return db.getOrders(filters)
})

ipcMain.handle('orders:getById', async (event, id) => {
  const db = require('./database')
  return db.getOrderById(id)
})

ipcMain.handle('orders:create', async (event, data) => {
  const db = require('./database')
  return db.createOrder(data)
})

ipcMain.handle('orders:update', async (event, { id, data }) => {
  const db = require('./database')
  return db.updateOrder(id, data)
})

ipcMain.handle('orders:updateStatus', async (event, { id, status }) => {
  const db = require('./database')
  return db.updateOrderStatus(id, status)
})

ipcMain.handle('orders:getTodayStats', async () => {
  const db = require('./database')
  return db.getTodayStats()
})

ipcMain.handle('orders:getNextToken', async () => {
  const db = require('./database')
  return db.getNextTokenNumber()
})

// IPC Handlers - Expenses
ipcMain.handle('expenses:getAll', async (event, filters) => {
  const db = require('./database')
  return db.getExpenses(filters)
})

ipcMain.handle('expenses:create', async (event, data) => {
  const db = require('./database')
  return db.createExpense(data)
})

ipcMain.handle('expenses:update', async (event, { id, data }) => {
  const db = require('./database')
  return db.updateExpense(id, data)
})

ipcMain.handle('expenses:delete', async (event, id) => {
  const db = require('./database')
  return db.deleteExpense(id)
})

// IPC Handlers - Reports
ipcMain.handle('reports:getDailySummary', async (event, date) => {
  const db = require('./database')
  return db.getDailySummary(date)
})

ipcMain.handle('reports:saveDaily', async (event, data) => {
  const db = require('./database')
  return db.saveDailySummary(data)
})

ipcMain.handle('reports:getMonthly', async (event, { year, month }) => {
  const db = require('./database')
  return db.getMonthlySummary(year, month)
})

// IPC Handlers - Settings
ipcMain.handle('settings:get', async () => {
  const db = require('./database')
  return db.getSettings()
})

ipcMain.handle('settings:save', async (event, settings) => {
  const db = require('./database')
  return db.saveSettings(settings)
})

// IPC Handlers - Backup
ipcMain.handle('backup:create', async () => {
  const db = require('./database')
  return db.createBackup('manual')
})

ipcMain.handle('backup:getList', async () => {
  const db = require('./database')
  return db.getBackupList()
})

ipcMain.handle('backup:openFolder', async () => {
  const backupDir = path.join(app.getPath('userData'), 'backups')
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })
  shell.openPath(backupDir)
  return { success: true }
})

ipcMain.handle('backup:getDatabaseInfo', async () => {
  const db = require('./database')
  return db.getDatabaseInfo()
})

// IPC Handlers - Printing
ipcMain.handle('print:bill', async (event, orderData) => {
  const printer = require('./printer')
  return printer.printBill(orderData)
})

ipcMain.handle('print:dailySummary', async (event, summaryData) => {
  const printer = require('./printer')
  return printer.printDailySummary(summaryData)
})

ipcMain.handle('print:test', async () => {
  const printer = require('./printer')
  return printer.testPrint()
})

ipcMain.handle('print:getPrinters', async () => {
  return mainWindow.webContents.getPrintersAsync()
})
