export function optionHander<T>(option: T, defaultOption: any = {}): T {
  if (!option || typeof option !== "object") {
    return option;
  }
  const keys = Object.keys(option);
  return keys.reduce((prev, key) => {
    const val = option[key];
    if (val && typeof val === "object") {
      prev[key] = optionHander(val, defaultOption[key] || {});
    } else {
      prev[key] = val;
    }
    return prev;
  }, defaultOption);
}

export function sleep(interval) {
  return new Promise((resolve) => setTimeout(resolve, interval));
}
