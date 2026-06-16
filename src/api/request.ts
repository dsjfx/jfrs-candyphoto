import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ResponseData } from '@/types';
import { ElMessage } from 'element-plus';
import router from '@/router';

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加默认参数
    config.params = {
      ...config.params,
      timestamp: Date.now(), // 时间戳防缓存
      version: import.meta.env.VITE_APP_VERSION,        // API版本
      subject: import.meta.env.VITE_APP_SUBJECT        // 平台标识
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;

    if (res.code === 200 || res.success) {
      return res;
    }

    if (res.code === 401) {
      ElMessage.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      router.push('/login');
      return Promise.reject(new Error(res.message || '登录已过期'));
    }

    ElMessage.error(res.message || '请求失败');
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 400:
          ElMessage.error('请求参数错误');
          break;
        case 401:
          ElMessage.error('未授权，请登录');
          localStorage.removeItem('token');
          router.push('/login');
          break;
        case 403:
          ElMessage.error('拒绝访问');
          break;
        case 404:
          ElMessage.error('请求资源不存在');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        default:
          ElMessage.error('网络请求失败');
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络');
    } else {
      ElMessage.error(error.message || '请求配置错误');
    }
    return Promise.reject(error);
  }
);

export default request;

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
}

export function get<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>> {
  return request.get(url, config);
}

export function post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
  return request.post(url, data, config);
}

export function put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
  return request.put(url, data, config);
}

export function del<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>> {
  return request.delete(url, config);
}

export function upload<T = any>(url: string, formData: FormData, config?: RequestConfig): Promise<ResponseData<T>> {
  return request.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
