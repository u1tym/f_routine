<script setup lang="ts">
/**
 * ApplyModal - Specify year/month and apply schedule.
 * Used for both individual routine and apply-all.
 */
import { ref, watch } from 'vue';
import type { ApplyResult } from '../types';

const props = defineProps<{
  visible: boolean;
  routineTitle?: string; // undefined means "apply all"
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply', year: number, month: number): Promise<void>;
}>();

const today = new Date();
const year = ref(today.getFullYear());
const month = ref(today.getMonth() + 1);
const loading = ref(false);
const result = ref<ApplyResult | null>(null);
const applyError = ref('');

watch(
  () => props.visible,
  (v) => {
    if (v) {
      result.value = null;
      applyError.value = '';
      loading.value = false;
    }
  }
);

async function handleApply() {
  applyError.value = '';
  result.value = null;
  loading.value = true;
  try {
    await emit('apply', year.value, month.value);
  } catch {
    // errors handled in parent via applyError via result
  } finally {
    loading.value = false;
  }
}

// Parent calls this to pass back the result
function setResult(r: ApplyResult) {
  result.value = r;
}
function setError(msg: string) {
  applyError.value = msg;
}

defineExpose({ setResult, setError });
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-sheet">
        <h2 class="modal-title">
          {{ routineTitle ? `スケジュール追加：${routineTitle}` : '全ルーティン スケジュール追加' }}
        </h2>

        <div class="field">
          <label class="field-label">年</label>
          <input v-model.number="year" type="number" min="2000" max="2100" class="field-input num-input" />
        </div>
        <div class="field">
          <label class="field-label">月</label>
          <input v-model.number="month" type="number" min="1" max="12" class="field-input num-input" />
        </div>

        <p v-if="applyError" class="form-error">{{ applyError }}</p>

        <div v-if="result" class="apply-result">
          <p>追加件数: <strong>{{ result.inserted_count }}</strong></p>
          <ul v-if="result.dates.length">
            <li v-for="d in result.dates" :key="d">{{ d }}</li>
          </ul>
          <div v-if="result.errors.length" class="apply-errors">
            <p>エラー:</p>
            <ul><li v-for="(er, i) in result.errors" :key="i">{{ er }}</li></ul>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="emit('close')">閉じる</button>
          <button class="btn btn-primary" :disabled="loading" @click="handleApply">
            {{ loading ? '処理中...' : '追加実行' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
