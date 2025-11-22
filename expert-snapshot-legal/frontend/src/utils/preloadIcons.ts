// src/utils/preloadIcons.ts

// Utility to preload icons by their names
export const preloadIcons = async (iconNames: string[]) => {
  const promises = iconNames.map((name) => {
    const img = new Image();
    img.src = `/icons/${name}.svg`; // 🔹 Adjust if your icons live elsewhere
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });

  await Promise.all(promises);
};
