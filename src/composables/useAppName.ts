import { ref, computed, ComputedRef } from 'vue'

const masterRef = ref<string>((import.meta.env.VITE_APP_TITLE_MASTER || '').toString().trim())
const slaveRef = ref<string>((import.meta.env.VITE_APP_TITLE_SLAVE || '').toString().trim())

export function useAppName(suffix: string = '') {
  const appName = computed(() => {
    const m = masterRef.value
    const s = slaveRef.value
    if (m && s) return `${m} · ${s}${suffix}`
    if (m) return m
    if (s) return s
    return '糖果生活'
  })

  const setMaster = (v: string) => { masterRef.value = v?.toString().trim() || '' }
  const setSlave = (v: string) => { slaveRef.value = v?.toString().trim() || '' }

  return {
    master: masterRef,
    slave: slaveRef,
    appName,
    setMaster,
    setSlave,
  }
}

type AppNameParts = {
  master?: string
  slave?: string
  suffix?: string
  hasMaster?: boolean
  hasSlave?: boolean
}

export function useAppNameStruct(suffix: string = ''): { appNameParts: ComputedRef<AppNameParts> } {
  const appNameParts = computed(() => {
    const m = masterRef.value
    const s = slaveRef.value
    if (m && s) return { master: m, slave: s, suffix, hasMaster: true, hasSlave: true }
    if (m) return { master: m, hasMaster: true }
    if (s) return { slave: s, hasSlave: true }
    return { master: '糖果生活', hasMaster: true }
  })

  return { appNameParts }
}