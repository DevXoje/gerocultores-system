import { ref } from 'vue'

export interface TabOption<TValue extends string> {
  value: TValue
  label: string
}

export function useTabs<TValue extends string>(initialValue: TValue) {
  const activeTab = ref<TValue>(initialValue)

  function selectTab(tab: TValue): void {
    activeTab.value = tab
  }

  return {
    activeTab,
    selectTab,
  }
}
