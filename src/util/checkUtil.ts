/**
 * 尝试判断当前运行设备是否为移动端
 *
 * @returns 当前设备是否为移动端
 */
export const isMobile = (): boolean => {
  const regUA: RegExp =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return (
    regUA.test(navigator.userAgent) ||
    (/arm/i.test(navigator.platform) && /Linux/i.test(navigator.userAgent))
  );
};
