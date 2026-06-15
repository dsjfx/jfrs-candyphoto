<template>
  <div class="home-page">
    <FeaturedPost v-if="current === 1 && !searchQuery" />

    <div class="content-section">
      <div class="section-header">
        <el-input
          v-model="searchQuery"
          placeholder="搜索图片..."
          :prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
      </div>

      <div v-if="isLoading" class="photo-grid">
        <el-skeleton v-for="i in 6" :key="i" animated class="photo-skeleton" />
      </div>

      <div v-else-if="photos.length > 0" class="photo-grid">
        <PhotoCard v-for="photo in photos" :key="photo.id" :photo="photo" />
      </div>

      <div v-else class="empty-state">
        <el-icon class="empty-icon"><Picture /></el-icon>
        <p class="empty-text">暂无图片</p>
      </div>

      <div v-if="!isLoading && total > 0" class="pagination-wrapper">
        <!-- <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="current"
          @current-change="handlePageChange"
        /> -->
        <!-- 分页控件 -->
        <Paging
          :current="current"
          :total="total"
          :page-size="pageSize"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Picture } from '@element-plus/icons-vue';
import FeaturedPost from '@/components/common/FeaturedPost.vue';
import PhotoCard from '@/components/common/PhotoCard.vue';
import Paging from '@/components/page/Paging.vue'
import { getPhotos, searchPhotos } from '@/api/photo';
import type { Blog } from '@/types/photo';
import { addPhotoAttrs } from '@/utils/funcUtils';
import { useLoading } from '@/composables/useLoading';

const searchQuery = ref('');
// const loading = ref(false);
const photos = ref<Blog[]>([]);
const current = ref(1);
const pageSize = ref(10);
const total = ref(0);

const {
  isLoading,
  startLoading, 
  stopLoading 
} = useLoading();

const fetchPhotos = async () => {
  // loading.value = true;
  startLoading();

  try {
    const res = await getPhotos({ 
      current: current.value, 
      size: pageSize.value, 
      status: 'published' 
    });
    if (res.success) {
      photos.value = res.data.records;
      total.value = res.data.pagination.total;

      addPhotoAttrs(photos.value);
    }
  } catch (error) {
    console.error('获取图片列表失败:', error);
  } finally {
    // loading.value = false;
    stopLoading();
  }
};

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    current.value = 1;
    fetchPhotos();
    return;
  }
  // loading.value = true;
  startLoading();

  try {
    const res = await searchPhotos(searchQuery.value, { current: current.value, size: pageSize.value });
    if (res.success) {
      photos.value = res.data.records;
      total.value = res.data.pagination.total;
      
      addPhotoAttrs(photos.value);
    }
  } catch (error) {
    console.error('搜索图片失败:', error);
  } finally {
    // loading.value = false;
    stopLoading();
  }
};

const handlePageChange = (page: number) => {
  current.value = page;
  if (searchQuery.value.trim()) {
    handleSearch();
  } else {
    fetchPhotos();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  fetchPhotos();
});
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding: 40px 20px;
  background-color: var(--bg-primary);

  .content-section {
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    padding: 30px 0;

    .site-header {
      text-align: center;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 1px solid #eee;

      .site-title {
        font-size: 48px;
        font-weight: 700;
        margin: 0;
        letter-spacing: 2px;

        .title-candy {
          color: #059669;
        }

        .title-divider {
          color: #999;
          margin: 0 12px;
          font-weight: 400;
        }

        .title-diary {
          color: #333;
        }
      }
    }

    .section-header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 40px;

      .search-input {
        width: 320px;

        :deep(.el-input__wrapper) {
          padding: 10px 20px;
          border-radius: 28px;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;

          &:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          }

          &.is-focus {
            box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1);
          }
        }

        :deep(.el-input__inner) {
          color: #333;
          font-size: 15px;
        }

        :deep(.el-input__prefix) {
          color: #999;
        }
      }
    }
  }

  .photo-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    margin-bottom: 50px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;

    @media (max-width: 900px) {
      max-width: 100%;
      padding: 0 10px;
    }

    .photo-skeleton {
      width: 100%;
      height: 450px;
      border-radius: 20px;
      
      @media (max-width: 900px) {
        height: 300px;
      }
    }
    
    :deep(.photo-card) {
      width: 100%;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 60px;
    padding-bottom: 80px;

    :deep(.el-pagination) {
      padding: 15px 30px;
      background: #fff;
      border-radius: 40px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
      background-color: var(--color-primary);
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #999;

    .empty-icon {
      font-size: 60px;
      margin-bottom: 20px;
    }

    .empty-text {
      font-size: 16px;
    }
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 20px 16px;

    .content-section {
      padding: 20px 0;

      .section-header {
        justify-content: center;

        .search-input {
          width: 100%;
          max-width: 360px;
        }
      }
    }
  }
}
</style>
