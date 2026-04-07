/**
 * 响应式组合式函数
 * 统一管理响应式断点和设备检测
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'

// 断点定义
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1920
}

// 当前窗口宽度
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

// 断点状态
const isXs = computed(() => windowWidth.value < breakpoints.sm)
const isSm = computed(() => windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.md)
const isMd = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg)
const isLg = computed(() => windowWidth.value >= breakpoints.lg && windowWidth.value < breakpoints.xl)
const isXl = computed(() => windowWidth.value >= breakpoints.xl && windowWidth.value < breakpoints.xxl)
const isXxl = computed(() => windowWidth.value >= breakpoints.xxl)

// 设备类型
const isMobile = computed(() => windowWidth.value < breakpoints.md)
const isTablet = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg)
const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)
const isLargeScreen = computed(() => windowWidth.value >= breakpoints.xxl)

// 触摸设备
const isTouchDevice = computed(() => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

// 窗口尺寸
const windowSize = computed(() => ({
  width: windowWidth.value,
  height: typeof window !== 'undefined' ? window.innerHeight : 800
}))

// 更新窗口宽度
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

/**
 * 响应式 hook
 */
export function useResponsive() {
  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    // 断点
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,

    // 设备类型
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,

    // 触摸设备
    isTouchDevice,

    // 窗口尺寸
    windowSize,

    // 原始值
    windowWidth,

    // 常量
    breakpoints
  }
}

/**
 * 移动端检测 hook
 */
export function useMobile() {
  const isMobileFlag = ref(window.innerWidth < 768)

  const handleResize = () => {
    isMobileFlag.value = window.innerWidth < 768
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    isMobile: isMobileFlag
  }
}

/**
 * 大屏幕检测 hook
 */
export function useLargeScreen() {
  const isLargeScreenFlag = ref(window.innerWidth >= 1920)

  const handleResize = () => {
    isLargeScreenFlag.value = window.innerWidth >= 1920
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    isLargeScreen: isLargeScreenFlag
  }
}

/**
 * 媒体查询 hook
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches

    const handler = (e: MediaQueryListEvent) => {
      matches.value = e.matches
    }

    mediaQuery.addEventListener('change', handler)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handler)
    })
  }

  return {
    matches
  }
}

export default useResponsive
