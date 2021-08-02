import Axios from "axios"
import config from '@/config'
import { Message } from "element-ui";

export const axios = Axios.create({ baseURL: config.baseURL })

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  if(Math.floor(response.status / 100) !== 2){
    throw new Error('请求状态' + response.statusText)
  }

  switch (response.data.code) {
    case 404:
      throw new ResponseExpection('NotFind',response.data.msg);
  }

  return response.data;
}, function (error) {
  // 对响应错误做点什么
  console.log('[Axios Error]: '+error)
  return error;
});

export class ResponseExpection extends Error{
  type:string;
  constructor(type: string, message: string) {
    super(message)
    this.type = type
  }
}