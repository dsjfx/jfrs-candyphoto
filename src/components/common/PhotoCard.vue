<template>
  <div class="photo-card">
    <!-- photo -->
    <div class="card-image-wrapper" @click="() => (modalVisible = true)">
      <img class="card-image" :src="photo.cover.url" :alt="photo.title" />
    </div>
    <!-- card -->
    <div class="card-content">
      <!-- card head -->
      <div class="card-meta">
        <span class="meta-item">
          <el-icon class="meta-icon">
            <Calendar />
          </el-icon>
          {{ formatDate(photo.date) }}
        </span>
        <span class="meta-item" v-if="photo.category" :style="{ color: photo.category.color || '#888' }">
          <el-icon class="meta-icon">
            <Folder />
          </el-icon>
          {{ photo.category.name }}
        </span>
      </div>

      <!-- card content -->
      <h3 class="card-title" @click="handleClick">{{ photo.title }}</h3>
      <p class="card-description">{{ photo.summary }}</p>

      <!-- card footer -->
      <div class="card-footer">
        <span class="read-more" @click="handleClick">继续阅读 →</span>
      </div>
    </div>
  </div>

  <ImageModal v-model:modelValue="modalVisible" :src="photo.cover?.url || ''" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Blog } from '@/types';
import dayjs from 'dayjs';
import { Calendar, Folder } from '@element-plus/icons-vue';
import ImageModal from '@/components/common/ImageModal.vue';
import { ref } from 'vue';

const props = defineProps<{
  photo: Blog;
}>();

const router = useRouter();

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY年MM月DD日');
};

const handleClick = () => {
  router.push(`/photo/${props.photo.id}`);
};

const modalVisible = ref(false);
</script>

<style lang="scss" scoped>
@use 'sass:color';

.photo-card {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 20px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

  &:hover {
    // transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);

    .card-image {
      cursor: pointer;
      transform: scale(1.05);
    }

    .read-more {
      color: #e67e22;
    }
  }

  .card-image-wrapper {
    position: relative;
    height: 350px;
    overflow: hidden;

    @media (max-width: 600px) {
      height: 250px;
    }

    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
  }

  .card-content {
    padding: 24px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    .card-meta {
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

    .card-title {
      margin: 0 0 15px 0;
      font-size: 22px;
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

    .card-description {
      display: -webkit-box;
      margin: 0 0 20px 0;
      font-size: 15px;
      color: #666;
      line-height: 1.6;
      line-clamp: 3;
      /* 标准属性，提升兼容性 */
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      margin-top: auto;

      .read-more {
        font-size: 15px;
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

/* Modal styles (reuse from FeaturedPost) */
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
