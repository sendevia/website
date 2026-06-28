/**
 * 判断当前是否在客户端环境
 * @returns 如果是客户端环境返回 true，否则返回 false
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}
