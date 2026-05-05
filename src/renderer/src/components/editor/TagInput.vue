<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Tag } from '@/types/prompt'

const { t } = useI18n()

const props = defineProps<{
  modelValue: Tag[]
}>()

const emit = defineEmits<{
  'update:modelValue': [tags: Tag[]]
}>()

const newTagName = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(newTagName, (val) => {
  if (val.includes(',')) {
    const parts = val.split(',').map((s) => s.trim()).filter(Boolean)
    parts.forEach((name) => addTag(name))
    newTagName.value = ''
  }
})

const TAG_COLORS = [
  undefined,
  '#07CA6B',
  '#E89558',
  '#EA2143',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4'
]

function addTag(name: string): void {
  if (!name) return
  const exists = props.modelValue.some((t) => t.name.toLowerCase() === name.toLowerCase())
  if (exists) return
  const colorIndex = props.modelValue.length % TAG_COLORS.length
  const newTag: Tag = { name, color: TAG_COLORS[colorIndex] }
  emit('update:modelValue', [...props.modelValue, newTag])
}

function removeTag(index: number): void {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    e.preventDefault()
    const name = newTagName.value.trim()
    addTag(name)
    newTagName.value = ''
  } else if (e.key === 'Backspace' && !newTagName.value && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  }
}
</script>

<template>
  <div class="tag-input-container">
    <div class="tag-list">
      <span
        v-for="(tag, index) in modelValue"
        :key="tag.name"
        class="glass-tag"
        :style="tag.color ? { borderColor: tag.color + '40', color: tag.color } : {}"
      >
        {{ tag.name }}
        <span class="tag-remove" @click="removeTag(index)">&times;</span>
      </span>
      <input
        ref="inputRef"
        v-model="newTagName"
        class="tag-input-inline"
        :placeholder="t('tag.addPlaceholder')"
        @keydown="handleKeydown"
      />
    </div>
  </div>
</template>

<style scoped>
.tag-input-container {
  width: 100%;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  min-height: 42px;
  transition: all var(--transition-fast);
}

.tag-list:focus-within {
  border-color: rgba(24, 86, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(24, 86, 255, 0.1);
  background: rgba(255, 255, 255, 0.55);
}

.tag-input-inline {
  flex: 1;
  min-width: 80px;
  padding: 2px 4px;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-primary);
  font-size: 13px;
  color: var(--color-text);
}

.tag-input-inline::placeholder {
  color: rgba(20, 20, 20, 0.3);
}
</style>
