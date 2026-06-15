<template>
  <div class="image-gallery">
    <!-- 搜索 -->
    <div class="gallery-header">
      <h2>{{ photoTitle }}</h2>
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索图片..."
          @keyup.enter="handleSearch(true)"
        />
        <FaIcon :icon="faSearch" />
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-container">
      <LoadingSpinner />
      <p class="loading-text">{{ loadingText }}</p>
    </div>

    <!-- 瀑布流容器 -->
    <div v-else class="masonry-container">
      <div
        v-for="column in columns"
        :key="column.index"
        class="masonry-column"
        :style="{ width: columnWidth }"
      >
        <div
          v-for="item in column.items"
          :key="item.id"
          class="image-item"
          @click="handleImageClick(item)"
        >
          <!-- 图片容器 -->
          <div class="image-container">
            <img
              :src="item.cover.url"
              :alt="item.title"
              :loading="lazy ? 'lazy' : 'eager'"
              @load="onImageLoad"
            />
            
            <!-- 文字说明遮罩层 -->
            <div class="image-overlay">
              <div class="image-content">
                <h3 class="image-title">{{ item.title }}</h3>
                <p class="image-description">{{ item.summary }}</p >
                <div class="image-meta">
                  <span class="date">{{ formatDate(item.date) }}</span>
                  <span class="category">{{ item.category.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多按钮 -->
    <div v-if="hasMore" class="load-more-wrapper">
      <el-button
        v-if="!isLoading"
        type="primary"
        size="large"
        @click="handlePageChange(current + 1)"
        class="load-more-btn"
      >
        加载更多
      </el-button>
      <el-button
        v-else
        type="primary"
        size="large"
        loading
        disabled
        class="load-more-btn"
      >
        加载中...
      </el-button>
    </div>

    <!-- 没有更多内容提示 -->
    <div v-if="photos.length > 0 && !hasMore" class="no-more-wrapper">
      <span class="no-more-text">— 没有更多内容了 —</span>
    </div>
    
    <!-- 分页控件 -->
    <!-- <Paging 
      v-if="!isLoading && !isEmpty"
      :current="current"
      :total="filteredPhotos.length"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    /> -->

    <!-- 图片预览模态框 -->
    <div v-if="selectedPhoto" class="modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">×</button>
        <img :src="selectedPhoto.cover.url" :alt="selectedPhoto.title" />
        <div class="modal-info">
          <h2>{{ selectedPhoto.title }}</h2>
          <div v-html="selectedPhoto.content"></div>
          <div class="modal-meta">
            <span>上传时间: {{ formatDate(selectedPhoto.date) }}</span>
            <span>分类: {{ selectedPhoto.category.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
// import Paging from '@/components/page/Paging.vue'
import LoadingSpinner from '@/components/core/LoadingSpinner.vue'
import { useLoading } from '@/composables/useLoading'
import { getPhotosWithAdditions, searchPhotos } from '@/api/photo';
import type { Blog } from '@/types';
import { addPhotoAttrs, formatDate } from '@/utils/funcUtils';

const {
  state,
  isLoading, 
  isLoadingMore, 
  isLoadingPage,
  startLoading, 
  stopLoading 
} = useLoading()

// 响应式数据
const columns = ref<Array<{ index: number; items: Blog[] }>>([])
const columnCount = ref(4)
const columnWidth = ref('25%')
const columnHeights = ref<any>([])

const selectedPhoto = ref<Blog | null>(null)

const searchQuery = ref('');
const loading = ref(false);
const photos = ref<Blog[]>([]);
const current = ref(1);
const pageSize = ref(8);
const total = ref(0);

const lazy = ref(true)

const photoTitle = import.meta.env.VITE_APP_PHOTO_TITLE || '图片故事'


// 计算属性

const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

const hasMore = computed(() => {
  return photos.value.length < total.value;
});

const loadingText = computed(() => {
  if (isLoadingPage.value) return '正在加载页面...'
  if (isLoadingMore.value) return '正在加载更多...'
  return '正在加载...'
});

// 方法

const initColumns = () => {
  columns.value = Array.from({ length: columnCount.value }, (_, i) => ({
    index: i,
    items: []
  }))
}

const initColumnHeights = () => {
  columnHeights.value = Array(columnCount.value).fill(0)
}

const distributePhotos = (initial: boolean, load: boolean = true) => {
  if(initial) {
    initColumns();
    initColumnHeights();
  }
  
  let totalItems = photos.value.length
  const startIndex = (current.value - 1) * pageSize.value
  const endIndex = Math.min(startIndex + pageSize.value, totalItems)

  const currentPhotos = load ? photos.value.slice(startIndex, endIndex) : photos.value;
  
  // 简单的按高度分布算法
  currentPhotos.forEach(p => {
    const _columnHeights = columnHeights.value

    // 找到高度最小的列
    const minHeightIndex = _columnHeights.indexOf(Math.min(..._columnHeights))
    
    // 将图片添加到该列
    columns.value[minHeightIndex] && columns.value[minHeightIndex].items.push(p)
    
    // 更新列高度（考虑图片宽高比）
    _columnHeights[minHeightIndex] += p.cover.height / p.cover.width
  });
}

const fetchPhotos = async (init: boolean) => {
  startLoading();

  loading.value = init;
  if (init) {
    resetPhoto();
  }

  try {
    const res = await getPhotosWithAdditions({ 
      current: current.value, 
      size: pageSize.value,
    });
    if (res.success) {
      const _photos = res.data.records;
      const _total = res.data.pagination.total;
      
      addPhotoAttrs(_photos);

      if (_photos && _photos.length > 0) {
        _photos.forEach(p => {
          photos.value.push(p);
        })
      }
      
      if (total.value != _total) {
        total.value = _total;
      }
    }
  } catch (error) {
    console.error('获取照片列表失败:', error);
    state.value.error = error instanceof Error ? error.message : '加载失败'
    state.value.hasError = true
  } finally {
    stopLoading();
  }
};

const handlePageChange = async (page: number) => {
  // const initial = false;
  if (page >= 1 && page <= totalPages.value && page !== current.value) {
    current.value = page;

    if (searchQuery.value.trim()) {
      await handleSearch(false);
    } else {
      await fetchPhotos(false);
    }

    // distributePhotos(initial);
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

const resetPhoto = () => {
  if (photos.value.length > 0) {
    photos.value = [];
  }
}

const handleImageClick = (photo: Blog) => {
  selectedPhoto.value = photo
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  selectedPhoto.value = null
  document.body.style.overflow = 'auto'
}

const handleSearch = async (init: boolean) => {
  if (!searchQuery.value.trim()) {
    current.value = 1;
    await fetchPhotos(true);
    return;
  }
  
  loading.value = init;
  if(init) {
    current.value = 1;
    resetPhoto();
  }
  
  startLoading();
  try {
    const res = await searchPhotos(
      searchQuery.value, 
      { current: current.value, size: pageSize.value}
    );
    if (res.success) {
      const _photos = res.data.records;
      const _total = res.data.pagination.total;

      addPhotoAttrs(_photos);

      if (_photos && _photos.length > 0) {
        _photos.forEach(p => {
          photos.value.push(p);
        })
      }
      
      if (total.value != _total) {
        total.value = _total;
      }
    }
  } catch (error) {
    console.error('搜索照片失败:', error);
  } finally {
    stopLoading();
  }
}

const onImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.opacity = '1'
}

const updateColumnCount = () => {
  const width = window.innerWidth
  
  if (width >= 1200) {
    columnCount.value = 4
  } else if (width >= 768) {
    columnCount.value = 3
  } else if (width >= 480) {
    columnCount.value = 2
  } else {
    columnCount.value = 1
  }
  
  columnWidth.value = `${100 / columnCount.value}%`
  distributePhotos(true, false);
}

// 生命周期钩子
onMounted(async () => {
  await fetchPhotos(true);
  
  updateColumnCount();
  
  // distributePhotos(false);
  
  window.addEventListener('resize', updateColumnCount)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount)
})

// 监听过滤后的图片变化
watch(photos, () => {
  if (current.value > totalPages.value) {
    current.value = 1
  }
  distributePhotos(loading.value);
}, { deep: true })
</script>

<style lang="scss">
.image-gallery {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .gallery-header {
    text-align: center;
    margin-bottom: 50px;
    padding-top: 10px;
    position: relative;

    h2 {
      margin-bottom: 20px;
      color: #333;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .search-bar {
      position: relative;
      max-width: 500px;
      margin: 0 auto;

      input {
        width: 100%;
        padding: 0.8rem 1rem 0.8rem 2.5rem;
        font-size: 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 25px;
        outline: none;
        transition: border-color 0.3s ease;

        &:focus {
          border-color: $base-color-j1;
        }

        &::placeholder {
          color: #aaa;
        }
      }

      svg {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        cursor: pointer;
      }      
    }
      
    // &::before {
    //   content: '';
    //   position: absolute;
    //   left: 0;
    //   top: 10px;
    //   width: 100px;
    //   height: 5px;
    //   background: linear-gradient(90deg, $base-color-j9, $base-color-j10);
    // }    
  }

  .loading-container {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

      .spinner-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(4px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        animation: fadeIn 0.3s ease;
      }

      .loading-text {
        margin-top: 16px;
        color: #666;
        font-size: 14px;
        animation: pulse 1.5s infinite;
      }    
  }

  .masonry-container {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;

    .masonry-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .image-item {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      background: white;
      cursor: pointer;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

        .image-overlay {
          opacity: 1;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(0, 0, 0, 0.4) 50%,
            rgba(0, 0, 0, 0) 100%
          );
        }

        .image-title {
          transform: translateY(0);
        }

        .image-description {
          transform: translateY(0);
        }
      }
    }

    .image-container {
      position: relative;
      overflow: hidden;

      img {
        width: 100%;
        height: auto;
        display: block;
        transition: opacity 0.5s ease;
        opacity: 0;
      }
    }

    .image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 20px;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, 0.2) 50%,
        rgba(0, 0, 0, 0) 100%
      );
      color: white;
      transition: all 0.3s ease;
      opacity: 0.8;
    }

    .image-content {
      transform: translateY(10px);
      transition: transform 0.3s ease;
    }

    .image-title {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
      font-weight: 600;
      transform: translateY(20px);
      transition: transform 0.3s ease 0.1s;
    }

    .image-description {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.4;
      opacity: 0.9;
      transform: translateY(20px);
      transition: transform 0.3s ease 0.2s, opacity 0.3s ease;
    }

    .image-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      font-size: 0.8rem;
      opacity: 0.7;

      .date,
      .category {
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 8px;
        border-radius: 4px;
      }
    }
  }

  .load-more-wrapper {
    display: flex;
    justify-content: center;
    padding: 50px 0;

    .load-more-btn {
      min-width: 200px;
      height: 50px;
      font-size: 16px;
      border-radius: 25px;
      background: linear-gradient(135deg, #059669, #047857);
      border: none;
      color: white;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
      }
    }
  }

  .no-more-wrapper {
    display: flex;
    justify-content: center;
    padding: 50px 0;

    .no-more-text {
      color: var(--color-secondary);
      font-size: 15px;
      letter-spacing: 2px;
    }
  }

  .modal {
    position: fixed;
    // top: 0;
    // left: 0;
    // right: 0;
    // bottom: 0;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 500px;  /* 或你需要的任何值 */
    // max-height: 90vh;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;

    .modal-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      animation: slideUp 0.3s ease;

      .close-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.1);
        }
      }

      img {
        width: 100%;
        height: auto;
        max-height: 70vh;
        object-fit: contain;
      }

      .modal-info {
        padding: 25px;

        h2 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 1.8rem;
        }

        p {
          margin: 0 0 20px 0;
          color: #666;
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .modal-meta {
          display: flex;
          gap: 20px;
          color: #888;
          font-size: 0.9rem;

          span {
            padding: 5px 10px;
            background: #f5f5f5;
            border-radius: 4px;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .image-gallery {
    padding: 10px;

    .gallery-header {
      h1 {
        font-size: 2rem;
      }
    }
  }
}

// 动画
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>