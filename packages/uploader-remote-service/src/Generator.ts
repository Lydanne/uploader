export const numberSeeds = "0123456789"

export function code(len = 4, seeds = numberSeeds) {
  let t = ''
  for (let i = 0; i < len; i++) {
    t += seeds[random(0, seeds.length)]    
  }
  return t
}

export function random(start:number, end:number) {
  return Math.floor(Math.random() * (end - start)) + start;
}