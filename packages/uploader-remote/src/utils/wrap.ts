export function wrap<T,Err>(p:Promise<T>){
  return p.then(res => [null, res]).catch(err => [err, null])
}