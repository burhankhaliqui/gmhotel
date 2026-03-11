const { contextBridge, ipcRenderer } = require('electron')

const api = {
  auth: {
    login: (data) => ipcRenderer.invoke('auth:login', data),
    changePassword: (data) => ipcRenderer.invoke('auth:changePassword', data),
    resetPassword: (data) => ipcRenderer.invoke('auth:resetPassword', data),
  },
  categories: {
    getAll: () => ipcRenderer.invoke('categories:getAll'),
    create: (data) => ipcRenderer.invoke('categories:create', data),
    update: (id, data) => ipcRenderer.invoke('categories:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('categories:delete', id),
  },
  items: {
    getAll: () => ipcRenderer.invoke('items:getAll'),
    getByCategory: (categoryId) => ipcRenderer.invoke('items:getByCategory', categoryId),
    create: (data) => ipcRenderer.invoke('items:create', data),
    update: (id, data) => ipcRenderer.invoke('items:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('items:delete', id),
  },
  waiters: {
    getAll: () => ipcRenderer.invoke('waiters:getAll'),
    create: (data) => ipcRenderer.invoke('waiters:create', data),
    update: (id, data) => ipcRenderer.invoke('waiters:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('waiters:delete', id),
  },
  deliveryBoys: {
    getAll: () => ipcRenderer.invoke('deliveryBoys:getAll'),
    create: (data) => ipcRenderer.invoke('deliveryBoys:create', data),
    update: (id, data) => ipcRenderer.invoke('deliveryBoys:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('deliveryBoys:delete', id),
  },
  tables: {
    getAll: () => ipcRenderer.invoke('tables:getAll'),
    create: (data) => ipcRenderer.invoke('tables:create', data),
    update: (id, data) => ipcRenderer.invoke('tables:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('tables:delete', id),
  },
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    create: (data) => ipcRenderer.invoke('users:create', data),
    update: (id, data) => ipcRenderer.invoke('users:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('users:delete', id),
  },
  orders: {
    getAll: (filters) => ipcRenderer.invoke('orders:getAll', filters),
    getById: (id) => ipcRenderer.invoke('orders:getById', id),
    create: (data) => ipcRenderer.invoke('orders:create', data),
    update: (id, data) => ipcRenderer.invoke('orders:update', { id, data }),
    updateStatus: (id, status) => ipcRenderer.invoke('orders:updateStatus', { id, status }),
    getTodayStats: () => ipcRenderer.invoke('orders:getTodayStats'),
    getNextToken: () => ipcRenderer.invoke('orders:getNextToken'),
  },
  expenses: {
    getAll: (filters) => ipcRenderer.invoke('expenses:getAll', filters),
    create: (data) => ipcRenderer.invoke('expenses:create', data),
    update: (id, data) => ipcRenderer.invoke('expenses:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('expenses:delete', id),
  },
  reports: {
    getDailySummary: (date) => ipcRenderer.invoke('reports:getDailySummary', date),
    saveDaily: (data) => ipcRenderer.invoke('reports:saveDaily', data),
    getMonthly: (year, month) => ipcRenderer.invoke('reports:getMonthly', { year, month }),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (settings) => ipcRenderer.invoke('settings:save', settings),
  },
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    getList: () => ipcRenderer.invoke('backup:getList'),
    openFolder: () => ipcRenderer.invoke('backup:openFolder'),
    getDatabaseInfo: () => ipcRenderer.invoke('backup:getDatabaseInfo'),
  },
  print: {
    bill: (data) => ipcRenderer.invoke('print:bill', data),
    dailySummary: (data) => ipcRenderer.invoke('print:dailySummary', data),
    test: () => ipcRenderer.invoke('print:test'),
    getPrinters: () => ipcRenderer.invoke('print:getPrinters'),
  },
}

contextBridge.exposeInMainWorld('api', api)
