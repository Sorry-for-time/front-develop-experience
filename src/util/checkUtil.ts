/**
 * 尝试判断当前运行设备是否为移动端
 *
 * @returns 当前设备是否为移动端
 */
export const isMobile = (): boolean => {
  const regPattern: RegExp =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return (
    regPattern.test(navigator.userAgent) ||
    ((navigator as any).userAgentData.mobile as boolean) ||
    regPattern.test((navigator as any).userAgentData.platform)
  );
};
