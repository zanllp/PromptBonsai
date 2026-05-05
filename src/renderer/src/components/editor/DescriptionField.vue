<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    if (val !== localValue.value) {
      localValue.value = val
    }
  }
)

function onInput(e: Event): void {
  const target = e.target as HTMLTextAreaElement
  localValue.value = target.value
  emit('update:modelValue', target.value)
}
</script>

<template>
  <textarea
    class="glass-input glass-textarea description-field"
    :value="localValue"
    @input="onInput"
    :placeholder="t('description.addPlaceholder')"
    rows="3"
  ></textarea>
</template>

<style scoped>
.description-field {
  min-height: 60px;
}
</style>
