import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const IPC = {
  FILE_NEW: 'file:new',
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  FILE_SAVE_AS: 'file:save-as',
  GET_APP_PATH: 'app:get-path',
  AI_GENERATE: 'ai:generate',
  FILE_OPEN_PATH: 'file:open-path',
  GET_EXAMPLE_PATH: 'app:get-example-path'
} as const

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(IPC.FILE_NEW, async () => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: '新建文件',
      message: '新建文件？未保存的更改将会丢失。',
      buttons: ['取消', '新建'],
      defaultId: 1,
      cancelId: 0
    })
    return result.response === 1
  })

  ipcMain.handle(IPC.FILE_OPEN, async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '打开提示词文件',
      filters: [{ name: 'Prompt Files', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null

    const filePath = result.filePaths[0]
    const content = await readFile(filePath, 'utf-8')
    return { filePath, data: content }
  })

  ipcMain.handle(IPC.FILE_SAVE, async (_event, filePath: string, data: string) => {
    try {
      await writeFile(filePath, data, 'utf-8')
      return { filePath, success: true }
    } catch (err: any) {
      return { filePath, success: false, error: err.message }
    }
  })

  ipcMain.handle(IPC.FILE_SAVE_AS, async (_event, data: string) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '保存提示词文件',
      defaultPath: 'prompts.json',
      filters: [{ name: 'Prompt Files', extensions: ['json'] }]
    })
    if (result.canceled || !result.filePath) return null

    try {
      await writeFile(result.filePath, data, 'utf-8')
      return { filePath: result.filePath, success: true }
    } catch (err: any) {
      return { filePath: result.filePath, success: false, error: err.message }
    }
  })

  ipcMain.handle(IPC.GET_APP_PATH, () => {
    return app.getAppPath()
  })

  ipcMain.handle(IPC.GET_EXAMPLE_PATH, () => {
    if (app.isPackaged) {
      return join(process.resourcesPath, 'default-prompts.json')
    }
    return join(app.getAppPath(), 'examples', 'default-prompts.json')
  })

  ipcMain.handle(IPC.FILE_OPEN_PATH, async (_event, filePath: string) => {
    try {
      const content = await readFile(filePath, 'utf-8')
      return { filePath, data: content }
    } catch (err: any) {
      return { filePath, error: err.message }
    }
  })

  ipcMain.handle(IPC.AI_GENERATE, async (_event, promptText: string, parentPromptText: string | undefined, baseUrl: string, apiKey: string, model: string, locale: string) => {
    const hasParent = !!parentPromptText?.trim()
    const isZh = locale.startsWith('zh')

    const systemPrompt = hasParent
      ? isZh
        ? `你是一个提示词分析助手。用户会提供一段「父节点提示词」和一段「当前节点提示词」。
请对比两者的差异，为当前节点生成以下字段的 JSON。
规则：
- title：不超过25个字，用「差异关键词」的格式概括当前节点与父节点的不同之处（如："变体3：阴郁色调 + 用完散落"、"TikTok竖屏 + 和服散乱"）
- description：不超过50个字，说明这个变体相比父节点改了什么
- tags：提取3-5个关键词，优先提取当前节点有而父节点没有的新元素，每个标签包含 name（${isZh ? '中文' : 'English'}）和 color（hex颜色，从以下选：#EA2143 #EC4899 #8B5CF6 #06B6D4 #07CA6B #E89558 #1856FF #3A344E）
只返回 JSON。格式：{"title":"...","description":"...","tags":[{"name":"...","color":"..."}]}`
        : `You are a prompt analysis assistant. The user provides a "parent node prompt" and a "current node prompt".
Compare the two and generate a JSON for the current node.
Rules:
- title: max 25 chars, summarize the differences from the parent using "diff keywords" format (e.g. "V3: moody tones + scattered petals", "TikTok vertical + kimono style")
- description: max 50 chars, explain what changed compared to the parent
- tags: extract 3-5 keywords, prioritize elements unique to the current node. Each tag has name (English) and color (hex, pick from: #EA2143 #EC4899 #8B5CF6 #06B6D4 #07CA6B #E89558 #1856FF #3A344E)
Return JSON only. Format: {"title":"...","description":"...","tags":[{"name":"...","color":"..."}]}`
      : isZh
        ? `你是一个提示词分析助手。根据用户提供的 AI 提示词内容，生成以下字段的 JSON。
规则：
- title：简短标题，不超过20个字，概括提示词的核心主题
- description：简短描述，不超过50个字，说明这个提示词的特点和用途
- tags：提取3-5个关键词作为标签，每个标签包含 name（${isZh ? '中文' : 'English'}）和 color（hex颜色，从以下选：#EA2143 #EC4899 #8B5CF6 #06B6D4 #07CA6B #E89558 #1856FF #3A344E）
只返回 JSON，不要其他内容。格式：{"title":"...","description":"...","tags":[{"name":"...","color":"..."}]}`
        : `You are a prompt analysis assistant. Based on the user's AI prompt content, generate a JSON.
Rules:
- title: short title, max 20 chars, summarize the core theme
- description: brief description, max 50 chars, explain the prompt's characteristics and purpose
- tags: extract 3-5 keywords as tags. Each tag has name (English) and color (hex, pick from: #EA2143 #EC4899 #8B5CF6 #06B6D4 #07CA6B #E89558 #1856FF #3A344E)
Return JSON only. Format: {"title":"...","description":"...","tags":[{"name":"...","color":"..."}]}`

    const userContent = hasParent
      ? `【父节点提示词】\n${parentPromptText}\n\n【当前节点提示词】\n${promptText}`
      : promptText

    const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ]
      })
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('AI 返回格式异常')

    return JSON.parse(jsonMatch[0])
  })
}

export { IPC }
