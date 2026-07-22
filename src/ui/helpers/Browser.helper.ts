export const getWebsiteTitle = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return "New Tab";
  }
};
export const computeNativeBounds = (
  domRect: DOMRect,
  winContentBounds: any,
) => {
  // Scale formula
  const scaleX = winContentBounds.width / window.innerWidth;
  const scaleY = winContentBounds.height / window.innerHeight;

  const bounds: ViewBounds = {
    x: Math.round(domRect.x * scaleX),
    y: Math.round(domRect.y * scaleY),
    width: Math.round(domRect.width * scaleX),
    height: Math.round(domRect.height * scaleY),
  };

  return bounds;
};
