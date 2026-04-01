/**
 * 将给定的数组转换为树形结构。
 * @param arr - 原始数组，其中每个元素包含id和pid属性，pid表示父级id。
 * @returns 返回转换后的树形结构数组。
 */
export function arrayToTree(arr: any[]) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return []
  }

  const res: any = []
  const map = new Map()

  arr.forEach((item) => {
    map.set(item.id, item)
  })

  arr.forEach((item) => {
    const parentId = item.pid
    
    if (parentId != null) {
      const parent = map.get(parentId)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(item)
      }
      else {
        res.push(item)
      }
    }
    else {
      res.push(item)
    }
  })
  return res
}
