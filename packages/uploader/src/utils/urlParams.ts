export function urlParser(obj: any): string {
  return Object.keys(obj)
    .reduce((acc: any, key: string) => {
      acc.push(`${key}=${obj[key]}`);
      return acc;
    }, [])
    .join("&");
}
