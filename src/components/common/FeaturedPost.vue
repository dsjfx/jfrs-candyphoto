<template>
  <div class="featured-post">
    <div class="post-image-wrapper" @click="() => (modalVisible = true)">
      <img :src="featuredPhoto.thumbnailUrl || featuredPhoto.url" :alt="featuredPhoto.title" class="post-image" />
    </div>
    <div class="post-content">
      <div class="post-meta">
        <span class="meta-item">
          <el-icon class="meta-icon">
            <Calendar />
          </el-icon>
          {{ formatDate(featuredPhoto.date) }}
        </span>
        <span class="meta-item" v-if="featuredPhoto.category"
          :style="{ color: featuredPhoto.category?.color || '#888' }">
          <el-icon class="meta-icon">
            <Folder />
          </el-icon>
          {{ featuredPhoto.category?.name }}
        </span>
      </div>
      <h2 class="post-title" @click="handleFeatured">
        {{ featuredPhoto.title }}
      </h2>
      <p class="post-description">{{ featuredPhoto.summary }}</p>
      <div class="post-actions">
        <span class="read-more" @click="handleFeatured">继续阅读 →</span>
      </div>
    </div>
  </div>

  <ImageModal v-model:modelValue="modalVisible" :src="featuredPhoto.url || featuredPhoto.thumbnailUrl" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ImageModal from '@/components/common/ImageModal.vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { getFeaturedPhoto } from '@/api/photo';
import type { Blog, Photo } from '@/types';
import { addPhotoAttrs, randomRecord } from '@/utils/funcUtils';
import { ElMessage } from 'element-plus';
import { Calendar, Folder } from '@element-plus/icons-vue';

interface FeaturedPhotoDisplay extends Blog {
  url: string;
  thumbnailUrl: string;
  // width: number;
  // height: number;
  // size: number;
  // mimetype: string;
}

const router = useRouter();

const featuredPhoto = ref<FeaturedPhotoDisplay>({
  id: 0,
  title: '光影日记',
  date: '',
  category: { id: 0, name: '精选', photos: 0 }, // 默认分类
  content: '用镜头记录生活与旅行，每一张照片背后都有一个故事。',
  summary: '用镜头记录生活与旅行，每一张照片背后都有一个故事。',
  url: 'https://picsum.photos/1200/600?random=featured',
  thumbnailUrl: '',
  // width: 0,
  // height: 0,
  // size: 0,
  // mimetype: '',
  // albumId: 0,
  tags: [],
  views: 0,
  likes: [],
  createdAt: '',
  updatedAt: '',
  coverImage: '',
  coverThumbnail: '',
  cover: {} as Photo,
});

const handleFeatured = () => {
  const id = featuredPhoto.value.id
  if (id !== 0) {
    router.push(`/photo/${id}`);
  }
}

// modal visible state
const modalVisible = ref(false);

const formatDate = (date: string) => {
  if (!date) return '2025年12月30日';
  return dayjs(date).format('YYYY年MM月DD日');
};

const fetchFeatured = async () => {
  try {
    const res = await getFeaturedPhoto();
    if (res.success && res.data && res.data.records.length > 0) {
      const records = res.data.records;

      addPhotoAttrs(records);

      // 从数组中随机获取一条记录
      const record = randomRecord(records);

      featuredPhoto.value = {
        ...record,
        url: record.coverImage,
        thumbnailUrl: record.coverThumbnail,
      };
    }
  } catch (error) {
    console.error('获取精选图片失败:', error);
    ElMessage.warning('获取精选图片失败');
  }
};

onMounted(() => {
  fetchFeatured();
});
</script>

<style lang="scss" scoped>
@use 'sass:color';

.featured-post {
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin-bottom: 40px;
  margin-left: auto;
  margin-right: auto;
  background-color: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    // transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);

    .post-image {
      cursor: pointer;
      transform: scale(1.05);
    }

    .read-more {
      color: #e67e22;
    }
  }

  .post-image-wrapper {
    width: 100%;
    height: 450px;
    overflow: hidden;

    .post-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.5s;
    }
  }

  .post-content {
    padding: 30px;
    display: flex;
    flex-direction: column;

    .post-meta {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #888;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .meta-icon {
        font-size: 16px;
      }
    }

    .post-title {
      margin: 0 0 15px 0;
      font-size: 28px;
      font-weight: 600;
      color: #333;
      line-height: 1.4;
      transition: color 0.2s, text-decoration-color 0.2s;

      &:hover {
        color: #d35400;
        text-decoration: underline;
        text-decoration-color: rgba(211, 84, 0, 0.8);
        cursor: pointer;
      }
    }

    .post-description {
      font-size: 16px;
      color: #666;
      line-height: 1.8;
      margin: 0 0 25px 0;
    }

    .post-actions {
      .read-more {
        font-size: 16px;
        color: #d35400;
        font-weight: 500;
        transition: color 0.2s;
        cursor: pointer;

        &:hover {
          color: color.adjust(#d35400, $lightness: -8%);
          text-decoration: underline;
        }
      }
    }
  }
}

/* Modal styles */
.image-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
}

.modal-content {
  position: relative;
  max-width: 95%;
  max-height: 95%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  font-size: 22px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
}

.modal-image-wrapper {
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-img {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.1s linear;
  will-change: transform;
}
</style>
