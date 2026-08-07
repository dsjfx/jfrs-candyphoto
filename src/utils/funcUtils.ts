import { Album, Blog, PageResult, PageResultAlbum, ResponseData } from "@/types";

/**
 * 封装批量照片属性
 */
export function addPhotoAttrs(photos: Blog[]) {
  if (photos.length > 0) {
    photos.forEach((item) => {
      addPhotoAttr(item);
    })
  }
}

/**
 * 封装单个照片属性
 * @param photo 
 */
export function addPhotoAttr(photo: Blog) {
  const photos = photo.photos;
  if (photos && photos.length > 0) {
    const _photo = photos[0];
    photo.cover = _photo;
    photo.date = photo.publishedAt || _photo.createdAt;
  } else {
    photo.cover = {
      url: photo.coverImage,
      thumbnailUrl: photo.coverThumbnail,
      createdAt: photo.createdAt,
      updatedAt: photo.updatedAt,
      width: 0,
      height: 0,
    }
    photo.date = photo.publishedAt || photo.createdAt;
  }
}

/**
 * 格式化日期
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

/**
 * 从数组中随机获取一条记录
 */
export function randomRecord<T>(records: T[]) {
  const randomIndex = Math.floor(Math.random() * records.length);
  const record = records[randomIndex];
  return record;
}


export async function defaultPageResult<T>(): Promise<ResponseData<PageResult<T>>> {
  return {
    code: 200,
    message: '操作成功',
    success: true,
    data: {
      records: [] as T[],
      pagination: {
        total: 1,
        size: 10,
        current: 1
      }
    }
  }
}

export async function defaultPageAlbum(): Promise<ResponseData<PageResultAlbum>> {
  return {
    code: 200,
    message: '操作成功',
    success: true,
    data: {
      album: {} as Album,
      pagination: {
        total: 1,
        size: 10,
        current: 1
      }
    }
  }
}

const MAP_URL: Record<string, string> = {
  'PH': '/photos',
  'CO': '/comment',
  'AU': '/auth',
}

export function accessUrl(code: string, url: string) {
  return `${MAP_URL[code]}${url}`
}

