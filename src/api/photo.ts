import { accessUrl } from '@/utils/funcUtils';
import { get, post, put, del, upload } from './request';
import type { Blog, PhotoQuery, PageResult, ResponseData } from '@/types';

function makeUrl(url: string) {
  return accessUrl('PH', url)
}

export function getPhotos(params?: PhotoQuery): Promise<ResponseData<PageResult<Blog>>> {
  return get(makeUrl('/blogs'), { params });
}

export function getPhotosWithAdditions(params?: PhotoQuery): Promise<ResponseData<PageResult<Blog>>> {
  return get(makeUrl('/with-photos'), { params });
}

export function getPhotoById(id: number): Promise<ResponseData<Blog>> {
  return get(makeUrl(`/view/${id}`));
}

export function createPhoto(data: Partial<Blog>): Promise<ResponseData<Blog>> {
  return post(makeUrl(''), data);
}

export function updatePhoto(id: number, data: Partial<Blog>): Promise<ResponseData<Blog>> {
  return put(makeUrl(`/${id}`), data);
}

export function deletePhoto(id: number): Promise<ResponseData<null>> {
  return del(makeUrl(`/${id}`));
}

export function uploadPhoto(formData: FormData): Promise<ResponseData<Blog>> {
  return upload(makeUrl('/upload'), formData);
}

export function likePhoto(id: number): Promise<ResponseData<null>> {
  return post(makeUrl(`/${id}/like`));
}

export function unlikePhoto(id: number): Promise<ResponseData<null>> {
  return del(makeUrl(`/${id}/like`));
}

export function getFeaturedPhoto(): Promise<ResponseData<PageResult<Blog>>> {
  return get(makeUrl('/featured'));
}

export function searchPhotos(keyword: string, params?: PhotoQuery): Promise<ResponseData<PageResult<Blog>>> {
  return get(makeUrl('/search-photos'), { params: { search: keyword, ...params } });
}
