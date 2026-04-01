import type { MenuOption } from 'naive-ui'
import type { RouteRecordRaw } from 'vue-router'
import { usePermission } from '@/hooks'
import Layout from '@/layouts/index.vue'
import { $t, arrayToTree, renderIcon } from '@/utils'
import { clone, min, omit, pick } from 'radash'

const metaFields: AppRoute.MetaKeys[]
  = ['title', 'icon', 'requiresAuth', 'roles', 'keepAlive', 'hide', 'order', 'href', 'activeMenu', 'withoutTab', 'pinTab', 'menuType']

function standardizedRoutes(route: AppRoute.RowRoute[]) {
  const result = clone(route).map((i) => {
    const route = omit(i, metaFields)
    Reflect.set(route, 'meta', pick(i, metaFields))
    
    if (i.component && !route.componentPath) {
      route.componentPath = i.component
    }
    if (i.parentId !== undefined) {
      route.pid = i.parentId === 0 ? null : i.parentId
    }
    if (i.menuType && !route.menuType) {
      route.menuType = i.menuType === 'directory' ? 'dir' : i.menuType
    }
    if (i.sort !== undefined && !route.order) {
      route.order = i.sort
    }
    if (!route.name && route.path) {
      route.name = route.path.replace(/\//g, '-').slice(1)
    }
    
    return route
  }) as AppRoute.Route[]
  
  return result
}

export function createRoutes(routes: AppRoute.RowRoute[]) {
  let resultRouter = standardizedRoutes(routes)
  
  const { hasPermission } = usePermission()
  resultRouter = resultRouter.filter(i => hasPermission(i.meta?.roles ?? undefined))

  const modules = import.meta.glob('@/views/**/*.vue')
  resultRouter = resultRouter.map((item: AppRoute.Route) => {
    if (item.componentPath && !item.redirect) {
      const componentPath = `/src/views${item.componentPath}`
      if (modules[componentPath]) {
        item.component = modules[componentPath]
      }
    }
    return item
  })

  resultRouter = arrayToTree(resultRouter) as AppRoute.Route[]

  const appRootRoute: RouteRecordRaw = {
    path: '/appRoot',
    name: 'appRoot',
    redirect: import.meta.env.VITE_HOME_PATH,
    component: Layout,
    meta: {
      title: '',
      icon: 'icon-park-outline:home',
    },
    children: [],
  }

  setRedirect(resultRouter)

  appRootRoute.children = resultRouter as unknown as RouteRecordRaw[]
  return appRootRoute
}

export function generateCacheRoutes(routes: AppRoute.RowRoute[]) {
  return routes
    .filter(i => i.keepAlive)
    .map(i => i.name)
}

function setRedirect(routes: AppRoute.Route[]) {
  if (!routes || routes.length === 0) return

  routes.forEach((route) => {
    if (route.children) {
      if (!route.redirect) {
        const visibleChilds = route.children.filter(child => !child.meta.hide)

        let target = visibleChilds[0]

        const orderChilds = visibleChilds.filter(child => child.meta.order)

        if (orderChilds.length > 0)
          target = min(orderChilds, i => i.meta.order!) as AppRoute.Route

        if (target)
          route.redirect = target.path
      }

      setRedirect(route.children)
    }
  })
}

export function createMenus(userRoutes: AppRoute.RowRoute[]) {
  const resultMenus = standardizedRoutes(userRoutes)

  const visibleMenus = resultMenus.filter((route) => {
    const isDirectory = route.meta.menuType === 'dir' || route.meta.menuType === 'directory'
    if (isDirectory) return true
    return route.meta.menuVisible !== false
  })

  const tree = arrayToTree(visibleMenus)
  const menus = transformAuthRoutesToMenus(tree)
  return menus
}

function transformAuthRoutesToMenus(routes: AppRoute.Route[]): MenuOption[] {
  return routes.map((route) => {
    const menu: MenuOption = {
      label: route.meta?.title || route.path,
      key: route.path,
      icon: renderIcon(route.meta?.icon),
    }

    if (route.children?.length) {
      menu.children = transformAuthRoutesToMenus(route.children)
    }

    return menu
  })
}