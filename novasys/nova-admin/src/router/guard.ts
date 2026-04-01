import type { Router } from 'vue-router'
import { useAppStore, useRouteStore, useTabStore } from '@/store'
import { local } from '@/utils'

const title = import.meta.env.VITE_APP_NAME

export function setupRouterGuard(router: Router) {
  const appStore = useAppStore()
  const routeStore = useRouteStore()
  const tabStore = useTabStore()

  router.beforeEach(async (to, from, next) => {
    if (to.meta.href) {
      window.open(to.meta.href)
      next(false)
      return
    }
    appStore.showProgress && window.$loadingBar?.start()

    const isLogin = Boolean(local.get('accessToken'))

    if (to.name === 'root') {
      if (isLogin) {
        next({ path: '/appRoot', replace: true })
      }
      else {
        next({ path: '/login', replace: true })
      }
      return
    }

    if (to.path === '/appRoot') {
      if (!routeStore.isInitAuthRoute) {
        try {
          await routeStore.initAuthRoute()
        }
        catch {
          next({ path: '/login' })
          return
        }
      }
    }

    if (to.name === 'login') {
    }
    else if (to.meta.requiresAuth === false) {
    }
    else if (to.meta.requiresAuth === true && !isLogin) {
      const redirect = to.name === 'not-found' ? undefined : to.fullPath
      next({ path: '/login', query: { redirect } })
      return
    }

    if (!routeStore.isInitAuthRoute && to.name !== 'login') {
      try {
        await routeStore.initAuthRoute()
        if (to.name === 'not-found') {
          next({
            path: to.fullPath,
            replace: true,
            query: to.query,
            hash: to.hash,
          })
          return
        }
      }
      catch {
        const redirect = to.fullPath !== '/' ? to.fullPath : undefined
        next({ path: '/login', query: redirect ? { redirect } : undefined })
        return
      }
    }

    if (to.name === 'login' && isLogin) {
      next({ path: '/' })
      return
    }

    next()
  })
  router.beforeResolve((to) => {
    routeStore.setActiveMenu(to.meta.activeMenu ?? to.fullPath)
    tabStore.addTab(to)
    tabStore.setCurrentTab(to.fullPath as string)
  })

  router.afterEach((to) => {
    document.title = `${to.meta.title} - ${title}`
    appStore.showProgress && window.$loadingBar?.finish()
  })
}