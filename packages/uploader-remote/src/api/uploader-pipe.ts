import { axios } from "@/utils/axios";
import { FileMeta } from '@sharedkit/uploader'

const pipeUrl = '/applet/uploader/pipe'
let token = ''

export const open = (code:string):Promise<any> => axios.put(`${pipeUrl}/${code}/open`).then(res => {
  token = res.data.token;
  return res;
})

export const sendFiles = (code:string, files: FileMeta[]):Promise<any> => axios.put(`${pipeUrl}/${code}/send?token=${token}`,files)

export const osssts = (code:string):Promise<any> => axios.get(`${pipeUrl}/${code}/osssts?token=${token}`)

export const close = (code:string):Promise<any> => axios.put(`${pipeUrl}/${code}/close?token=${token}`).then(res => {
  token = '';
  return res;
})