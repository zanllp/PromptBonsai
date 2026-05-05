import { app, shell, BrowserWindow, Menu, MenuItem } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc'

const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: '提示词管理器',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Right-click context menu
  mainWindow.webContents.on('context-menu', (_event, params) => {
    const menu = new Menu()
    const canEdit = params.isEditable
    const hasSelection = params.selectionText.length > 0

    if (canEdit) {
      if (hasSelection) menu.append(new MenuItem({ label: '剪切', role: 'cut' }))
      if (hasSelection) menu.append(new MenuItem({ label: '复制', role: 'copy' }))
      menu.append(new MenuItem({ label: '粘贴', role: 'paste' }))
      menu.append(new MenuItem({ label: '全选', role: 'selectAll' }))
    } else {
      if (hasSelection) {
        menu.append(new MenuItem({ label: '复制', role: 'copy' }))
      }
      menu.append(new MenuItem({ label: '全选', role: 'selectAll' }))
    }

    menu.popup()
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', (e) => {
    mainWindow?.webContents.send('app:before-close')
    e.preventDefault()
    setTimeout(() => {
      mainWindow?.webContents
        .executeJavaScript('window.closeConfirmed')
        .then((confirmed) => {
          if (confirmed) {
            mainWindow?.removeAllListeners('close')
            mainWindow?.close()
          }
        })
        .catch(() => {
          mainWindow?.removeAllListeners('close')
          mainWindow?.close()
        })
    }, 100)
  })
}

app.whenReady().then(() => {
  createWindow()
  registerIpcHandlers(mainWindow!)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
