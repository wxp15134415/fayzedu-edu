/** Gender */
export enum Gender {
  male = 'male',
  female = 'female',
  unknown = 'unknown',
}

// 支持字符串和数字两种格式
export const GenderMap: Record<string, string> = {
  male: '男',
  female: '女',
  unknown: '未知',
  0: '男',
  1: '女',
  2: '未知',
}
