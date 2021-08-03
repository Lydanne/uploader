import { axios } from "@/utils/axios";
import { FileMeta } from '@sharedkit/uploader'

const StorageKey = 'PIPE_TOKEN'
const uploaderPipe = '/applet/uploader/pipe'
let token = localStorage.getItem(StorageKey) || ''

export const open = (code:string):Promise<any> => axios.put(`${uploaderPipe}/${code}/open?token=${token}`).then(res => {
  token = res?.data?.token;
  localStorage.setItem(StorageKey, token)
  return res;
})

export const sendFiles = (code:string, files: FileMeta[]):Promise<any> => axios.put(`${uploaderPipe}/${code}/send?token=${token}`,files)

export const osssts = (code:string):Promise<any> => axios.get(`${uploaderPipe}/${code}/osssts?token=${token}`)

export const close = (code:string):Promise<any> => axios.put(`${uploaderPipe}/${code}/close?token=${token}`).then(res => {
  token = '';
  localStorage.setItem(StorageKey, token)
  return res;
})