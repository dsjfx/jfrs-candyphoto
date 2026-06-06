<template>
  <div class="sidebar-container">
    <div class="profile-section">
      <el-avatar :size="80" :src="avatar" @error="errorHandler" />

      <h2 class="blog-title">
        <span v-if="appNameParts.hasMaster" class="title-master">
          {{ appNameParts.master }}
        </span>
        <span v-if="appNameParts.hasMaster && appNameParts.hasSlave" class="title-divider">
          ·
        </span>
        <span v-if="appNameParts.hasSlave" class="title-slave">
          {{ appNameParts.slave }}
        </span>
      </h2>
      <p class="blog-slogan">{{ slogan }}</p>
    </div>

    <el-menu :default-active="currentRoute" class="sidebar-menu" :router="true">
      <!-- 使用 v-for 根据 navItems 动态生成菜单 -->
      <el-menu-item v-for="item in navItems" :key="item.path" :index="item.path">
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.name }}</span>
      </el-menu-item>
    </el-menu>

    <div class="footer">
      <div class="footer-copyright">
        <p>© {{ currentYear }} {{ appName }}</p>
        <p>All Rights Reserved.</p>
      </div>
      <div class="footer-beian">
        <a v-if="icpLicense" href="https://beian.miit.gov.cn/" target="_blank">
          {{ icpLicense }}
        </a>
        <a v-if="publicSecurityLicense" href="http://www.beian.gov.cn/" target="_blank">
          {{ publicSecurityLicense }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { House, Picture, FolderOpened, User } from '@element-plus/icons-vue';
import { getUserAvatar } from '@/api/user';
import { useLoading } from '@/composables/useLoading';
import { useAppName, useAppNameStruct } from '@/composables/useAppName'

const {
  // isLoading, 
  startLoading,
  stopLoading
} = useLoading();

const route = useRoute();
const { appNameParts } = useAppNameStruct();
const { appName } = useAppName();

const avatar = ref<string>('https://picsum.photos/200/200?random=10');
const icpLicense = ref<string | null>('');
const publicSecurityLicense = ref<string | null>('');

const currentRoute = computed(() => {
  const path = route.path;
  // 特殊处理：/photo/:id 应该匹配 / 菜单项
  if (path.startsWith('/photo/')) {
    return '/';
  }
  for (const item of navItems) {
    if (item.path !== '/' && path.startsWith(item.path)) {
      return item.path;
    }
    if (item.path === '/' && path === '/') {
      return item.path;
    }
  }
  return path;
});

const errorHandler = () => true;

// const mainTitle = import.meta.env.VITE_APP_TITLE_MASTER || '糖果';
// const slaveTitle = import.meta.env.VITE_APP_TITLE_SLAVE || '光影春秋';
const slogan = import.meta.env.VITE_APP_TITLE_SLOGAN;
// const appTitle = getAppTitle();
const currentYear = new Date().getFullYear()

const navItems = [
  { path: '/', name: '首页', icon: House },
  { path: '/photos', name: '瀑布相片', icon: Picture },
  { path: '/albums', name: '相册集', icon: FolderOpened },
  { path: '/about', name: '关于', icon: User }
]

// function getAppTitle() {
//   return mainTitle + ' · ' + slaveTitle;
// }

const fetchAvatar = async () => {
  startLoading();

  try {
    const res = await getUserAvatar({ id: 10 });
    if (res.success) {
      const _avatar = res.data.avatar;
      if (_avatar) {
        // avatar.value = _avatar;
      }
      icpLicense.value = res.data.icpLicense || null;
      publicSecurityLicense.value = res.data.publicSecurityLicense || null;
    }
  } catch (error) {

  } finally {
    stopLoading();
  }
}

onMounted(async () => {
  fetchAvatar();
});

</script>

<style lang="scss" scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100%;

  .profile-section {
    text-align: center;
    margin-bottom: 30px;

    .el-avatar {
      margin-bottom: 15px;
    }

    .blog-title {
      font-size: 1.8rem;
      font-weight: bold;
      margin-bottom: 5px;

      .title-master {
        color: var(--color-primary)
      }

      .title-divider {
        color: var(--color-deputy);
        margin: 0 1px;
        font-weight: 400;
      }

      .title-slave {
        color: var(--color-secondary);
      }
    }

    .blog-slogan {
      font-size: 1rem;
      color: var(--color-deputy);
      opacity: 0.6;
    }
  }

  .sidebar-menu {
    width: 100%;
    border-right: none;
    flex-grow: 1;

    .el-menu-item {
      height: 50px;
      line-height: 50px;
      font-size: 16px;
      color: #555;

      &:hover {
        background-color: #f0f2f5;
      }

      &.is-active {
        color: var(--color-primary);
        background-color: var(--bg-menu)
      }
    }
  }

  .footer {
    width: 100%;
    margin-top: auto;
    border-top: 1px solid var(--border-deputy);
    padding: 15px 0;
    font-size: 12px;
    color: #999;
    text-align: center;
    line-height: 1.6;

    a {
      color: inherit;
      text-decoration: none;
      display: block;
      transition: color 0.3s;

      &:hover {
        color: var(--color-primary);
        text-decoration: underline;
      }
    }
  }

  .footer-copyright {
    margin-bottom: 5px;
  }

  .footer-beian {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

@media (max-width: 768px) {
  .sidebar-container {
    padding: 60px 16px 20px;

    .profile-section {
      margin-bottom: 24px;

      .el-avatar {
        margin-bottom: 12px;
      }

      .blog-title {
        font-size: 1.5rem;
      }

      .blog-slogan {
        font-size: 0.9rem;
      }
    }

    .sidebar-menu {
      .el-menu-item {
        height: 48px;
        line-height: 48px;
        font-size: 15px;
      }
    }
  }
}
</style>