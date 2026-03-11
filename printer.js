const { BrowserWindow } = require('electron')

function formatCurrency(amount) {
  return 'PKR ' + Number(amount || 0).toLocaleString('en-PK')
}

async function printHTML(html) {
  return new Promise((resolve) => {
    const win = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true }
    })
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    win.webContents.on('did-finish-load', () => {
      win.webContents.print({ silent: false, printBackground: true }, (success, reason) => {
        win.destroy()
        if (success) resolve({ success: true })
        else resolve({ success: false, reason: reason || 'Print cancelled' })
      })
    })
    win.webContents.on('did-fail-load', () => {
      win.destroy()
      resolve({ success: false, reason: 'Failed to load print content' })
    })
  })
}

async function printBill(orderData) {
  try {
    const items = orderData.items || []
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding:2px 0">${item.item_name}</td>
        <td style="text-align:center;padding:2px 4px">${item.quantity} ${item.unit || ''}</td>
        <td style="text-align:right;padding:2px 0">${formatCurrency(item.price)}</td>
        <td style="text-align:right;padding:2px 0">${formatCurrency(item.total)}</td>
      </tr>
    `).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; padding: 4mm; }
          .header { text-align: center; margin-bottom: 8px; }
          .header h1 { font-size: 18px; font-weight: bold; }
          .header p { font-size: 10px; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .info { font-size: 11px; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { border-bottom: 1px solid #000; padding: 2px 0; text-align: left; }
          .total-row td { font-weight: bold; border-top: 1px solid #000; padding-top: 4px; }
          .footer { text-align: center; margin-top: 8px; font-size: 10px; }
          @media print { @page { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${orderData.restaurant_name || 'GM Hotel'}</h1>
          <p>${orderData.address || ''}</p>
          <p>${orderData.phone || ''}</p>
        </div>
        <div class="divider"></div>
        <div class="info">Token: <strong>#${orderData.token_number || '-'}</strong></div>
        <div class="info">Order: ${orderData.order_number || '-'}</div>
        <div class="info">Type: ${(orderData.order_type || 'dine_in').replace('_', ' ').toUpperCase()}</div>
        ${orderData.table_number ? `<div class="info">Table: ${orderData.table_number}</div>` : ''}
        ${orderData.waiter_name ? `<div class="info">Waiter: ${orderData.waiter_name}</div>` : ''}
        ${orderData.customer_name ? `<div class="info">Customer: ${orderData.customer_name}</div>` : ''}
        <div class="info">Date: ${new Date(orderData.created_at || Date.now()).toLocaleString('en-PK')}</div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center">Qty</th>
              <th style="text-align:right">Price</th>
              <th style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            ${orderData.discount > 0 ? `
              <tr><td colspan="3">Subtotal</td><td style="text-align:right">${formatCurrency(orderData.subtotal)}</td></tr>
              <tr><td colspan="3">Discount</td><td style="text-align:right">-${formatCurrency(orderData.discount)}</td></tr>
            ` : ''}
            <tr class="total-row">
              <td colspan="3"><strong>TOTAL</strong></td>
              <td style="text-align:right"><strong>${formatCurrency(orderData.total)}</strong></td>
            </tr>
          </tfoot>
        </table>
        <div class="divider"></div>
        <div class="footer">
          <p>Payment: ${(orderData.payment_method || 'cash').toUpperCase()}</p>
          <p style="margin-top:6px">Thank you for visiting!</p>
          <p>** GM Hotel **</p>
        </div>
      </body>
      </html>
    `

    return printHTML(html)
  } catch (e) {
    return { success: false, reason: e.message }
  }
}

async function printDailySummary(summaryData) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; padding: 4mm; }
          .header { text-align: center; margin-bottom: 8px; }
          .header h1 { font-size: 16px; font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 11px; }
          .bold { font-weight: bold; }
          @media print { @page { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DAILY SUMMARY</h1>
          <p>${summaryData.restaurant_name || 'GM Hotel'}</p>
          <p>Date: ${summaryData.date}</p>
        </div>
        <div class="divider"></div>
        <div class="row"><span>Total Orders</span><span>${summaryData.total_orders || 0}</span></div>
        <div class="divider"></div>
        <div class="row"><span>Dine-In Sales</span><span>${formatCurrency(summaryData.dine_in_sales)}</span></div>
        <div class="row"><span>Takeaway Sales</span><span>${formatCurrency(summaryData.takeaway_sales)}</span></div>
        <div class="row"><span>Delivery Sales</span><span>${formatCurrency(summaryData.delivery_sales)}</span></div>
        <div class="divider"></div>
        <div class="row bold"><span>Total Sales</span><span>${formatCurrency(summaryData.total_sales)}</span></div>
        <div class="row"><span>Total Expenses</span><span>-${formatCurrency(summaryData.total_expenses)}</span></div>
        <div class="divider"></div>
        <div class="row bold"><span>NET PROFIT</span><span>${formatCurrency(summaryData.net_profit)}</span></div>
        <div class="divider"></div>
        <div style="text-align:center;font-size:10px;margin-top:6px">
          Printed: ${new Date().toLocaleString('en-PK')}
        </div>
      </body>
      </html>
    `

    return printHTML(html)
  } catch (e) {
    return { success: false, reason: e.message }
  }
}

async function testPrint() {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Courier New', monospace; font-size: 14px; text-align: center; padding: 20px; }
          @media print { @page { margin: 0; } }
        </style>
      </head>
      <body>
        <h2>TEST PRINT</h2>
        <p>GM Hotel POS System</p>
        <p>Printer is working correctly!</p>
        <p>${new Date().toLocaleString('en-PK')}</p>
        <p>* * * * * * * * * * *</p>
      </body>
      </html>
    `
    return printHTML(html)
  } catch (e) {
    return { success: false, reason: e.message }
  }
}

module.exports = { printBill, printDailySummary, testPrint }
