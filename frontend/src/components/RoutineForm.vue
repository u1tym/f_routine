<script setup lang="ts">
/**
 * RoutineForm - Modal form for creating/editing a routine.
 * Create: POST /routines. Update: PUT /routines/{id}.
 */
import { ref, watch, computed } from 'vue';
import type {
  Routine,
  Category,
  CreateRoutineBody,
  Adapt,
  Adjust,
  MonthlyAdaptFlags,
} from '../types';

const MONTH_ADAPT_KEYS = [
  'adapt_jan',
  'adapt_feb',
  'adapt_mar',
  'adapt_apr',
  'adapt_may',
  'adapt_jun',
  'adapt_jul',
  'adapt_aug',
  'adapt_sep',
  'adapt_oct',
  'adapt_nov',
  'adapt_dec',
] as const satisfies readonly (keyof MonthlyAdaptFlags)[];

const MONTH_LABELS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
] as const;

const props = defineProps<{
  visible: boolean;
  categories: Category[];
  editTarget?: Routine | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', body: CreateRoutineBody, oldId?: number): void;
}>();

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------
const title = ref('');
const categoryId = ref<number | null>(null);

// adapt mode: 'day' | 'weekday'
const adaptMode = ref<'day' | 'weekday'>('day');
// day mode
const dayNumber = ref<number>(1); // 1..31 or -1 for last
const isLastDay = ref(false);
// weekday mode
const weekdayIndex = ref<number>(0); // 0=Sun..6=Sat
const nthNumber = ref<number>(1);   // positive=from start, negative=from end

// adjust (optional)
const useAdjust = ref(false);
const avoidHoliday = ref(false);
const avoidWeekdays = ref<boolean[]>([false, false, false, false, false, false, false]); // 0=Sun..6=Sat
const altDir = ref<1 | -1>(1); // 1=forward, -1=backward

// 各月にスケジュール反映するか（チェック OFF = その月は反映しない）
const adaptMonths = ref<boolean[]>(Array.from({ length: 12 }, () => true));

// error display
const formError = ref('');

// ---------------------------------------------------------------------------
// Populate form when editing an existing routine
// ---------------------------------------------------------------------------
watch(
  () => props.editTarget,
  (target) => {
    if (!target) return;
    title.value = target.title;
    categoryId.value = target.activity_category_id;
    const a = target.adapt;
    if (a.week === -1) {
      adaptMode.value = 'day';
      if (a.number === -1) {
        isLastDay.value = true;
        dayNumber.value = -1;
      } else {
        isLastDay.value = false;
        dayNumber.value = a.number;
      }
    } else {
      adaptMode.value = 'weekday';
      weekdayIndex.value = a.week;
      nthNumber.value = a.number;
    }
    if (target.adjust) {
      useAdjust.value = true;
      avoidHoliday.value = target.adjust.avoid.holiday;
      const av = target.adjust.avoid;
      avoidWeekdays.value = [av.sun, av.mon, av.tue, av.wed, av.thu, av.fri, av.sat];
      altDir.value = target.adjust.alt;
    } else {
      useAdjust.value = false;
      avoidHoliday.value = false;
      avoidWeekdays.value = [false, false, false, false, false, false, false];
      altDir.value = 1;
    }
    MONTH_ADAPT_KEYS.forEach((key, i) => {
      adaptMonths.value[i] = target[key] ?? true;
    });
  },
  { immediate: true }
);

// Also reset form when dialog opens fresh (no editTarget)
watch(
  () => props.visible,
  (v) => {
    if (v && !props.editTarget) resetForm();
    formError.value = '';
  }
);

function resetForm() {
  title.value = '';
  categoryId.value = null;
  adaptMode.value = 'day';
  dayNumber.value = 1;
  isLastDay.value = false;
  weekdayIndex.value = 0;
  nthNumber.value = 1;
  useAdjust.value = false;
  avoidHoliday.value = false;
  avoidWeekdays.value = [false, false, false, false, false, false, false];
  altDir.value = 1;
  adaptMonths.value = Array.from({ length: 12 }, () => true);
}

// ---------------------------------------------------------------------------
// Computed: build payload
// ---------------------------------------------------------------------------
const nthOptions = computed(() => {
  const opts = [];
  for (let i = 1; i <= 5; i++) opts.push({ value: i, label: `第${i}` });
  for (let i = -1; i >= -5; i--) opts.push({ value: i, label: `最終から${Math.abs(i)}番目` });
  return opts;
});

function buildAdapt(): Adapt {
  if (adaptMode.value === 'day') {
    return { number: isLastDay.value ? -1 : dayNumber.value, week: -1 };
  }
  return { number: nthNumber.value, week: weekdayIndex.value };
}

function buildAdjust(): Adjust | null {
  if (!useAdjust.value) return null;
  const [sun, mon, tue, wed, thu, fri, sat] = avoidWeekdays.value;
  return {
    avoid: {
      holiday: avoidHoliday.value,
      sun, mon, tue, wed, thu, fri, sat,
    },
    alt: altDir.value,
  };
}

function buildMonthlyAdapt(): MonthlyAdaptFlags {
  return MONTH_ADAPT_KEYS.reduce((acc, key, i) => {
    acc[key] = adaptMonths.value[i];
    return acc;
  }, {} as MonthlyAdaptFlags);
}

function handleSubmit() {
  formError.value = '';
  if (!title.value.trim()) { formError.value = '名称を入力してください'; return; }
  if (!categoryId.value) { formError.value = 'カテゴリを選択してください'; return; }

  const body: CreateRoutineBody = {
    ...buildMonthlyAdapt(),
    title: title.value.trim(),
    activity_category_id: categoryId.value,
    adapt: buildAdapt(),
    adjust: buildAdjust(),
  };
  emit('submit', body, props.editTarget?.id);
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-sheet">
        <h2 class="modal-title">{{ editTarget ? 'ルーティン編集' : 'ルーティン新規追加' }}</h2>

        <!-- Name -->
        <div class="field">
          <label class="field-label">名称</label>
          <input v-model="title" class="field-input" placeholder="ルーティン名" />
        </div>

        <!-- Category -->
        <div class="field">
          <label class="field-label">カテゴリ</label>
          <select v-model="categoryId" class="field-input">
            <option :value="null" disabled>-- 選択 --</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <!-- Adapt mode toggle -->
        <div class="field">
          <label class="field-label">適用日タイプ</label>
          <div class="radio-group">
            <label><input type="radio" v-model="adaptMode" value="day" /> 日付指定</label>
            <label><input type="radio" v-model="adaptMode" value="weekday" /> 曜日指定</label>
          </div>
        </div>

        <!-- Day mode -->
        <div v-if="adaptMode === 'day'" class="field">
          <label class="field-label">適用日</label>
          <label class="checkbox-row">
            <input type="checkbox" v-model="isLastDay" />
            <span>月末日</span>
          </label>
          <div v-if="!isLastDay" class="inline-field">
            <span>毎月</span>
            <input
              v-model.number="dayNumber"
              type="number" min="1" max="31"
              class="field-input num-input"
            />
            <span>日</span>
          </div>
        </div>

        <!-- Weekday mode -->
        <div v-if="adaptMode === 'weekday'" class="field">
          <label class="field-label">適用曜日</label>
          <div class="inline-field">
            <select v-model.number="nthNumber" class="field-input">
              <option v-for="o in nthOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
            <select v-model.number="weekdayIndex" class="field-input">
              <option v-for="(w, i) in ['日', '月', '火', '水', '木', '金', '土']" :key="i" :value="i">
                {{ w }}曜日
              </option>
            </select>
          </div>
        </div>

        <!-- 反映する月 -->
        <div class="field">
          <label class="field-label">スケジュールに反映する月</label>
          <p class="field-hint">オフにした月は「反映」してもスケジュールは追加されません</p>
          <div class="month-checks">
            <label v-for="(label, i) in MONTH_LABELS" :key="label" class="checkbox-row">
              <input type="checkbox" v-model="adaptMonths[i]" />
              <span>{{ label }}</span>
            </label>
          </div>
        </div>

        <!-- Adjust toggle -->
        <div class="field">
          <label class="checkbox-row">
            <input type="checkbox" v-model="useAdjust" />
            <span>除外日・調整を使用する</span>
          </label>
        </div>

        <div v-if="useAdjust" class="adjust-section">
          <div class="field">
            <label class="field-label">除外対象</label>
            <label class="checkbox-row">
              <input type="checkbox" v-model="avoidHoliday" />
              <span>祝日を除外</span>
            </label>
            <div class="week-checks">
              <label v-for="(w, i) in ['日', '月', '火', '水', '木', '金', '土']" :key="i" class="checkbox-row">
                <input type="checkbox" v-model="avoidWeekdays[i]" />
                <span>{{ w }}曜日</span>
              </label>
            </div>
          </div>

          <div class="field">
            <label class="field-label">除外日のずらし方向</label>
            <div class="radio-group">
              <label><input type="radio" v-model.number="altDir" :value="1" /> 後にずらす</label>
              <label><input type="radio" v-model.number="altDir" :value="-1" /> 前にずらす</label>
            </div>
          </div>
        </div>

        <!-- Error -->
        <p v-if="formError" class="form-error">{{ formError }}</p>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="emit('close')">キャンセル</button>
          <button class="btn btn-primary" @click="handleSubmit">
            {{ editTarget ? '更新' : '追加' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
