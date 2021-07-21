export function optionHander<T>(option: T, defaultOption = {}) {
  const keys = Object.keys(option);
  return keys.reduce((prev, key) => {
    const val = option[key];
    if (val && typeof val === "object") {
      prev[key] = optionHander(val, defaultOption[key]);
    } else {
      prev[key] = val;
    }
    return prev;
  }, defaultOption);
}
