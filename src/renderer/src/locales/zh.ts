export default {
  app: {
    title: '提示词管理器',
    description: '可视化组织 AI 提示词，高效管理变体与主题',
    new: '新建',
    open: '打开',
    save: '保存',
    saveAs: '另存为',
    confirmCloseUnsaved: '有未保存的更改，确定要关闭吗？',
    fileOpened: '文件已打开',
    saved: '已保存',
    saveFailed: '保存失败',
    cancelled: '已取消',
    nodeCount: '{count} 个节点'
  },
  time: {
    justNow: '刚刚',
    minutesAgo: '{n} 分钟前',
    hoursAgo: '{n} 小时前',
    daysAgo: '{n} 天前'
  },
  welcome: {
    newProject: '新建项目',
    openFile: '打开文件',
    recentFiles: '最近打开',
    remove: '移除',
    new: '新建',
    open: '打开',
    openExample: '打开示例'
  },
  node: {
    untitled: '未命名',
    defaultTitle: '新提示词',
    editPrompt: '编辑提示词',
    close: '关闭',
    locate: '定位到节点',
    title: '标题',
    titlePlaceholder: '输入标题…',
    usability: '可用性',
    tags: '标签',
    promptText: '提示词内容',
    copyPrompt: '复制提示词',
    aiGenerateTooltip: 'AI 根据提示词内容自动生成标题、描述和标签',
    generating: '生成中…',
    aiGenerate: 'AI 生成',
    promptPlaceholder: '在此输入提示词（支持 Markdown）…',
    description: '描述',
    parent: '父节点：',
    unknown: '未知',
    children: '子节点：',
    variantCount: '{count} 个变体',
    updatedAt: '更新时间：',
    difference: '差异',
    vs: 'vs ',
    same: '相同',
    contentSameAsParent: '与父节点「{title}」内容一致',
    addChild: '添加子节点',
    delete: '删除',
    deleteConfirm: '确定删除「{title}」及其所有子节点？'
  },
  toolbar: {
    addRootNode: '添加根节点',
    smartMount: '智能挂载',
    layout: '整理布局',
    fitView: '适配视图'
  },
  index: {
    collapse: '收起索引',
    expand: '展开索引',
    rootNodes: '根节点索引',
    jumpTo: '跳转到 {title}'
  },
  canvas: {
    emptyTitle: '还没有提示词',
    emptyDescription: '点击工具栏的 <strong>+</strong> 按钮或按 <strong>Ctrl+N</strong> 创建你的第一个提示词节点'
  },
  smartMatch: {
    title: '智能挂载',
    description: '粘贴提示词正文，自动匹配最相似的节点作为父节点',
    placeholder: '在此粘贴提示词正文…',
    match: '匹配节点',
    bestMatch: '最佳匹配',
    noMatch: '未找到匹配度 ≥ 30% 的节点，可手动创建',
    mountAsChild: '挂载为子节点'
  },
  diff: {
    title: '检测到相似节点',
    subtitle: '当前节点与同级节点「{title}」的内容高度相似',
    existingNode: '已有节点',
    currentNode: '当前节点',
    stillAdd: '仍然添加'
  },
  tag: {
    addPlaceholder: '添加标签…'
  },
  description: {
    addPlaceholder: '添加备注或描述…'
  },
  ai: {
    promptEmpty: '提示词内容为空',
    generateFailed: 'AI 生成失败',
    noApiKey: '请先在启动页配置 API Key'
  },
  settings: {
    title: 'AI 设置',
    baseUrl: 'API Base URL',
    baseUrlPlaceholder: 'https://openrouter.ai/api/v1',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'sk-or-…',
    model: '模型',
    modelPlaceholder: 'deepseek/deepseek-v4-flash'
  },
  common: {
    cancel: '取消'
  }
}
