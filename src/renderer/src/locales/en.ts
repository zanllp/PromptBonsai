export default {
  app: {
    title: 'Prompt Manager',
    description: 'Visually organize AI prompts, manage variants & themes efficiently',
    new: 'New',
    open: 'Open',
    save: 'Save',
    saveAs: 'Save As',
    confirmCloseUnsaved: 'You have unsaved changes. Are you sure you want to close?',
    fileOpened: 'File opened',
    saved: 'Saved',
    saveFailed: 'Save failed',
    cancelled: 'Cancelled',
    nodeCount: '{count} nodes'
  },
  time: {
    justNow: 'Just now',
    minutesAgo: '{n} min ago',
    hoursAgo: '{n} hr ago',
    daysAgo: '{n}d ago'
  },
  welcome: {
    newProject: 'New Project',
    openFile: 'Open File',
    recentFiles: 'Recent',
    remove: 'Remove',
    new: 'New',
    open: 'Open',
    openExample: 'Open Example'
  },
  node: {
    untitled: 'Untitled',
    defaultTitle: 'New Prompt',
    editPrompt: 'Edit Prompt',
    close: 'Close',
    title: 'Title',
    titlePlaceholder: 'Enter title…',
    usability: 'Rating',
    tags: 'Tags',
    promptText: 'Prompt',
    copyPrompt: 'Copy Prompt',
    aiGenerateTooltip: 'Auto-generate title, description & tags from prompt content',
    generating: 'Generating…',
    aiGenerate: 'AI Generate',
    promptPlaceholder: 'Enter prompt here (Markdown supported)…',
    description: 'Description',
    parent: 'Parent: ',
    unknown: 'Unknown',
    children: 'Children: ',
    variantCount: '{count} variants',
    updatedAt: 'Updated: ',
    difference: 'Diff',
    vs: 'vs ',
    same: 'Same',
    contentSameAsParent: 'Identical to parent "{title}"',
    addChild: 'Add Child',
    delete: 'Delete',
    deleteConfirm: 'Delete "{title}" and all its children?'
  },
  toolbar: {
    addRootNode: 'Add root node',
    smartMount: 'Smart Mount',
    layout: 'Auto Layout',
    fitView: 'Fit View'
  },
  index: {
    collapse: 'Collapse index',
    expand: 'Expand index',
    rootNodes: 'Root nodes index',
    jumpTo: 'Jump to {title}'
  },
  canvas: {
    emptyTitle: 'No prompts yet',
    emptyDescription: 'Click the <strong>+</strong> button on the toolbar or press <strong>Ctrl+N</strong> to create your first prompt node'
  },
  smartMatch: {
    title: 'Smart Mount',
    description: 'Paste prompt text to auto-match the most similar node as parent',
    placeholder: 'Paste prompt text here…',
    match: 'Match',
    bestMatch: 'Best match',
    noMatch: 'No matching node found (≥30% similarity). Create manually instead.',
    mountAsChild: 'Mount as Child'
  },
  diff: {
    title: 'Similar Node Detected',
    subtitle: 'Content of this node is highly similar to sibling node "{title}"',
    existingNode: 'Existing Node',
    currentNode: 'Current Node',
    stillAdd: 'Add Anyway'
  },
  tag: {
    addPlaceholder: 'Add tag…'
  },
  description: {
    addPlaceholder: 'Add notes or description…'
  },
  ai: {
    promptEmpty: 'Prompt text is empty',
    generateFailed: 'AI generation failed',
    noApiKey: 'Please configure your API Key on the welcome page first'
  },
  settings: {
    title: 'AI Settings',
    baseUrl: 'API Base URL',
    baseUrlPlaceholder: 'https://openrouter.ai/api/v1',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'sk-or-…',
    model: 'Model',
    modelPlaceholder: 'deepseek/deepseek-v4-flash'
  },
  common: {
    cancel: 'Cancel'
  }
}
