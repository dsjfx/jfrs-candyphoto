import { Category, Tag } from './category';

export interface Blog {
  id: number;
  title: string;
  content: string;
  summary: string;
  coverImage: string;
  coverThumbnail: string;
  cover: Photo;
  tags?: Tag[];
  category: Category; // 新增分类字段
  views: number | 0;
  likes: number[];
  createdAt: string;
  updatedAt: string;
  date: string;
  photos?: Photo[];
}

export interface PhotoQuery {
  current?: number;
  size?: number;
  status?: string;
  title?: string;
  albumId?: number;
  tags?: string[];
  subject?: string;
}

export interface Photo {
  id?: number;
  filename?: string;
  width: number;
  height: number;
  url: string;
  thumbnailUrl: string;
  size?: number;
  mimetype?: string; // 图片格式，如 'jpg'、'png'、'webp' 等
  createdAt: string;
  updatedAt: string;
  albumId?: number;
  thumbnailFilename?: string;
  thumbnailPath?: string;
  thumbnailSize?: number;
  sortOrder?: number;
  isCover?: boolean;
}
