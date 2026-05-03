<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { routineApi } from '../api/routines';
import type { Routine, Category, CreateRoutineBody, ApplyResult } from '../types';
import { adaptLabel } from '../utils/adaptLabel';
import RoutineForm from './RoutineForm.vue';
import ApplyModal from './ApplyModal.vue';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const routines = ref<Routine[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(false);
const globalError = ref('');

// Form modal
const showForm = ref(false);
const editTarget = ref<Routine | null>(null);

// Apply modal
const showApply = ref(false);
const applyTarget = ref<Routine | null>(null); // null = apply-all
const applyModalRef = ref<InstanceType<typeof ApplyModal> | null>(null);

// ---------------------------------------------------------------------------
// Load data
// ---------------------------------------------------------------------------
async function load() {
  loading.value = true;
  globalError.value = '';
  try {
    [routines.value, categories.value] = await Promise.all([
      routineApi.list(),
      routineApi.categories(),
    ]);
  } catch (e: unknown) {
    globalError.value = String(e);
  } finally {
    loading.value = false;
  }
}

onMounted(load);

// ---------------------------------------------------------------------------
// Create / Edit
// ---------------------------------------------------------------------------
function openCreate() {
  editTarget.value = null;
  showForm.value = true;
}
function openEdit(r: Routine) {
  editTarget.value = r;
  showForm.value = true;
}

async function handleFormSubmit(body: CreateRoutineBody, oldId?: number) {
  globalError.value = '';
  try {
    if (oldId !== undefined) {
      await routineApi.update(oldId, body);
    } else {
      await routineApi.create(body);
    }
    showForm.value = false;
    await load();
  } catch (e: unknown) {
    globalError.value = String(e);
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
async function handleDelete(r: Routine) {
  if (!confirm(`「${r.title}」を削除しますか？`)) return;
  globalError.value = '';
  try {
    await routineApi.remove(r.id);
    await load();
  } catch (e: unknown) {
    globalError.value = String(e);
  }
}

// ---------------------------------------------------------------------------
// Apply schedule
// ---------------------------------------------------------------------------
function openApply(r: Routine | null) {
  applyTarget.value = r;
  showApply.value = true;
}

async function handleApply(year: number, month: number) {
  globalError.value = '';
  try {
    let result: ApplyResult;
    if (applyTarget.value) {
      result = await routineApi.apply(applyTarget.value.id, { year, month });
    } else {
      result = await routineApi.applyAll({ year, month });
    }
    applyModalRef.value?.setResult(result);
  } catch (e: unknown) {
    applyModalRef.value?.setError(String(e));
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function adjustLabel(r: Routine): string {
  if (!r.adjust) return 'なし';
  const av = r.adjust.avoid;
  const parts: string[] = [];
  if (av.holiday) parts.push('祝日');
  const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
  [av.sun, av.mon, av.tue, av.wed, av.thu, av.fri, av.sat].forEach((f, i) => {
    if (f) parts.push(DAYS[i] + '曜');
  });
  const dir = r.adjust.alt === 1 ? '後にずらす' : '前にずらす';
  return parts.length ? `除外: ${parts.join('、')} / ${dir}` : `除外なし / ${dir}`;
}

function goToMenu() {
  window.location.assign('/mobile/login/#/menu');
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <header class="app-header">
      <button type="button" class="btn btn-header-back" @click="goToMenu">
        メニューに戻る
      </button>
      <h1 class="app-title">ルーティン管理</h1>
      <button type="button" class="btn btn-primary" @click="openCreate">＋ 追加</button>
    </header>

    <!-- Global error -->
    <p v-if="globalError" class="global-error">{{ globalError }}</p>

    <!-- Loading -->
    <p v-if="loading" class="loading-msg">読み込み中...</p>

    <!-- Apply all button -->
    <div class="apply-all-bar" v-if="routines.length">
      <button class="btn btn-accent" @click="openApply(null)">全ルーティン スケジュール追加</button>
    </div>

    <!-- Routine list -->
    <ul v-if="!loading" class="routine-list">
      <li v-for="r in routines" :key="r.id" class="routine-card">
        <div class="routine-main">
          <div class="routine-title">{{ r.title }}</div>
          <div class="routine-meta">
            <span class="tag">{{ r.activity_category_name }}</span>
            <span class="tag">{{ adaptLabel(r.adapt) }}</span>
          </div>
          <div v-if="r.adjust" class="routine-adjust">{{ adjustLabel(r) }}</div>
        </div>
        <div class="routine-actions">
          <button class="btn btn-sm btn-accent" @click="openApply(r)" title="スケジュール追加">
            📅
          </button>
          <button class="btn btn-sm btn-secondary" @click="openEdit(r)" title="編集">
            ✏️
          </button>
          <button class="btn btn-sm btn-danger" @click="handleDelete(r)" title="削除">
            🗑️
          </button>
        </div>
      </li>
      <li v-if="!routines.length" class="empty-msg">ルーティンがありません</li>
    </ul>

    <!-- Form modal -->
    <RoutineForm
      :visible="showForm"
      :categories="categories"
      :editTarget="editTarget"
      @close="showForm = false"
      @submit="handleFormSubmit"
    />

    <!-- Apply modal -->
    <ApplyModal
      ref="applyModalRef"
      :visible="showApply"
      :routineTitle="applyTarget?.title"
      @close="showApply = false"
      @apply="handleApply"
    />
  </div>
</template>
