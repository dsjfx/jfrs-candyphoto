<template>
  <div class="photo-detail-page">
    <el-button @click="goBack" :icon="ArrowLeft" class="back-button">返回</el-button>

    <div v-if="loading" class="loading-state">
      <el-skeleton animated />
    </div>

    <div v-else-if="photo" class="photo-content">
      <div class="photo-main">
        <img :src="photo.cover.url" :alt="photo.title" class="main-image" />
      </div>
      <div class="photo-info">
        <h1 class="photo-title">{{ photo.title }}</h1>
        <div class="photo-meta">
          <span>
            <el-icon>
              <Calendar />
            </el-icon>
            {{ formatDate(photo.date) }}
          </span>
          <span v-if="photo.category" :style="{ color: parseColorToRgba(photo.category.color || '#666', 1) }">
            <el-icon>
              <Folder />
            </el-icon>
            {{ photo.category.name }}
          </span>
          <span>
            <el-icon>
              <View />
            </el-icon>
            {{ photo.views }} 次浏览
          </span>
        </div>
        <!-- content -->
        <div class="photo-description" v-html="photo.content"></div>

        <!-- tags -->
        <div v-if="photo.tags?.length" class="photo-tags">
          <el-tag v-for="tag in photo.tags" :key="tag" class="tag" size="small" :style="tagStyle(tag)">
            #{{ tag.name }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Calendar, View, Folder } from '@element-plus/icons-vue';
import { getPhotoById } from '@/api/photo';
import type { Blog } from '@/types';
import dayjs from 'dayjs';
import { addPhotoAttr } from '@/utils/funcUtils';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const photo = ref<Blog | null>(null);

const formatDate = (date: string) => dayjs(date).format('YYYY年MM月DD日');

const goBack = () => router.back();

const fetchPhoto = async () => {
  loading.value = true;

  try {
    const id = Number(route.params.id);
    if (id === 0) {

    } else {
      const res = await getPhotoById(id);
      if (res.success) {
        photo.value = res.data;
        addPhotoAttr(photo.value);
      }
    }
  } catch (error) {
    console.error('获取图片详情失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPhoto();
});

// tag color helper: accepts hex like #rrggbb or rgb(...) and returns rgba with given alpha
const parseColorToRgba = (input: string, alpha = 1) => {
  if (!input) return '';
  input = input.trim();
  // hex
  if (input.startsWith('#')) {
    const hex = input.slice(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // rgb or rgba
  if (input.startsWith('rgb')) {
    // replace rgba(...) with rgba(...)
    const inside = input.substring(input.indexOf('(') + 1, input.indexOf(')'));
    const parts = inside.split(',').map((s) => s.trim());
    const r = parts[0];
    const g = parts[1] || 0;
    const b = parts[2] || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return input;
}

const tagStyle = (tag: any) => {
  const color = tag?.color || '#059669';
  return {
    ['--tag-bg']: parseColorToRgba(color, 0.1),
    ['--tag-color']: parseColorToRgba(color, 1),
    border: 'none'
  } as any;
}
</script>

<style lang="scss" scoped>
.photo-detail-page {
  max-width: 1000px;
  margin: 0 auto;

  .back-button {
    margin-bottom: 20px;
    border: none;
    background: #fff;
    color: #333;
    padding: 10px 20px;
    border-radius: 24px;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      color: var(--color-primary);
      background: #f5f5f5;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      // transform: translateY(-2px);
    }
  }

  .loading-state {
    padding: 40px;
  }

  .photo-content {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;

    .photo-main {
      .main-image {
        display: block;
        width: 100%;
        max-height: 700px;
        object-fit: contain;
        background: var(--bg-card);
      }
    }

    .photo-info {
      padding: 30px;

      .photo-title {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 15px;
      }

      .photo-meta {
        display: flex;
        gap: 20px;
        color: #999;
        margin-bottom: 20px;

        span {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }

      .photo-description {
        font-size: 16px;
        line-height: 1.8;
        color: #666;
        margin-bottom: 20px;

        :deep() {

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            color: var(--text-primary);
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
            scroll-margin-top: 80px;
          }

          h1 {
            font-size: 1.8rem;
          }

          h2 {
            font-size: 1.6rem;
            // border-bottom: 2px solid $primary-light;
            padding-bottom: 0.5rem;
          }

          h3 {
            font-size: 1.4rem;
          }

          h4 {
            font-size: 1.2rem;
          }

          p {
            margin-bottom: 1.5rem;
          }

          a {
            color: var(--primary-color);
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: all 0.3s ease;

            &:hover {
              border-bottom-color: var(--primary-color);
            }
          }

          img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 1.5rem 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          blockquote {
            border-left: 4px solid var(--primary-color);
            margin: 1.5rem 0;
            padding: 1rem 1.5rem;
            background: rgba(var(--primary-color), 0.05);
            border-radius: 0 4px 4px 0;
            color: var(--text-secondary);

            p {
              margin: 0;
            }
          }

          code {
            background: rgba(var(--primary-color), 0.1);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 0.9em;
            color: var(--primary-dark);
          }

          pre {
            background: #2d2d2d;
            color: #fff;
            padding: 1.5rem;
            border-radius: 4px;
            overflow-x: auto;
            margin: 1.5rem 0;

            code {
              background: none;
              padding: 0;
              color: inherit;
            }
          }

          ul,
          ol {
            margin: 1.5rem 0;
            padding-left: 1.5rem;

            li {
              margin-bottom: 0.5rem;

              &::marker {
                color: var(--primary-color);
              }
            }
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;

            th,
            td {
              padding: 0.75rem 1rem;
              border: 1px solid var(--border-secondary);
              text-align: left;
            }

            th {
              background: rgba(var(--primary-color), 0.1);
              font-weight: 600;
              color: var(--text-primary);
            }

            tr:nth-child(even) {
              background: var(--bg-secondary);
            }
          }
        }
      }

      .photo-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .tag {
          height: 30px;
          padding: 0.4rem 0.6rem;
          font-size: 0.8rem;
          color: var(--tag-color, #059669);
          background: var(--tag-bg, rgba(5, 150, 105, 0.1));
          border-radius: 12px;
          transition: all 0.3s ease;
          cursor: pointer;

          &:hover {
            background: var(--tag-color, #059669);
            color: white;
          }
        }
      }
    }
  }
}
</style>
