<template>
  <div class="about-page">
    <div class="about-card">
      <div class="about-header">
        <div class="header-main">
          <div class="avatar">
            <FaIcon :icon="faUserCircle" size="4x" />
          </div>
          <div class="header-info">
            <h1 class="name">{{ author.name }}</h1>
            <p class="title">{{ author.job }}</p>
          </div>
        </div>
        <div class="header-side">
          <div class="qr-section">
            <div class="qr-code">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Placeholder" alt="QR Code" />
            </div>
            <span class="qr-label">扫码联系</span>
          </div>
        </div>
      </div>

      <div class="quote-section">
        <div class="quote-icon">
          <FaIcon :icon="faQuoteLeft" />
        </div>
        <p class="quote">{{ author.motto }}</p>
      </div>

      <div class="description-section">
        <p class="description">{{ author.detailedBio }}</p>
      </div>

      <div class="info-section">
        <div class="info-item">
          <div class="info-icon">
            <FaIcon :icon="faMapMarkerAlt" />
          </div>
          <div class="info-text">
            <span class="info-label">栖居</span>
            <span class="info-value">{{ author.location }}</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">
            <FaIcon :icon="faEnvelope" />
          </div>
          <div class="info-text">
            <span class="info-label">书信</span>
            <span class="info-value">{{ author.email }}</span>
          </div>
        </div>
      </div>

      <div class="interests-section">
        <div class="interests-label">
          <FaIcon :icon="faHeart" style="margin-right: 6px;" />
          <span>爱好</span>
        </div>
        <div class="interests-tags">
          <span v-for="(item, index) in author.interests" :key="index" class="interest-tag">
            {{ item }}
          </span>
        </div>
      </div>

      <div class="footer-section">
        <div class="social-icons">
          <a :href="author.github" target="_blank" class="social-icon" title="GitHub">
            <FaIcon :icon="faGithub" />
          </a>
          <a :href="author.twitter" target="_blank" class="social-icon" title="Twitter">
            <FaIcon :icon="faTwitter" />
          </a>
          <a :href="author.weibo" target="_blank" class="social-icon" title="微博">
            <FaIcon :icon="faWeibo" />
          </a>
        </div>
        <div class="signature">
          <FaIcon :icon="faPenNib" style="margin-right: 6px;" />
          <span>{{ TEXT_SIGNNATURE }}</span>
        </div>
      </div>

      <div class="bottom-quote">
        <FaIcon :icon="faLeaf" style="margin-right: 6px;" />
        <span>{{ TEXT_BOTTOM_QUOTE }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getUserInfo } from '@/api/user';
import { useLoading } from '@/composables/useLoading';
import { User, UserProfile } from '@/types';
import {
  faGithub,
  faTwitter,
  faWeibo,
} from '@fortawesome/free-brands-svg-icons'
import {
  faUserCircle,
  faQuoteLeft,
  faMapMarkerAlt,
  faEnvelope,
  faHeart,
  faPenNib,
  faLeaf
} from '@fortawesome/free-solid-svg-icons'
import { onMounted, ref } from 'vue';

const {
  startLoading,
  stopLoading
} = useLoading();

const author = ref<UserProfile>({
  name: '解点迷',
  job: '独立创作者 & 全栈设计师',
  motto: '写作是思想的散步，设计是理性的浪漫。',
  shortBio: "写过代码，拍过山川，现在用文字与设计搭建数字花园。相信好的故事能跨越边界，连接真实的人。",
  detailedBio: "前软件工程师，现自由内容创作者。在互联网行业浮沉5年后，决定用更温柔的方式探索技术与人文的交叉点。目前专注于个人知识库、独立博客写作及UI设计。喜爱咖啡、胶片摄影和周末徒步。",
  location: "中国 · 杭州",
  interests: ['旅行', '看书', '手冲咖啡', '解放鞋'],
  email: "hello@linyian.com",
  funFact: "从0到1搭建过3个独立项目，最近沉迷于用Tailwind CSS与Figma做设计系统。",
});
const TEXT_SIGNNATURE = ref<string>('手写回信，见字如晤');
const TEXT_BOTTOM_QUOTE = ref<string>('在数字时代，保留一份手工的真诚');

const getUserProfile = async () => {
  startLoading();

  try {
    const res = await getUserInfo({ id: 3 });
    if (res.success) {
      const user: User = res.data;
      if (user) {
        author.value.name = user.nickname;
        author.value.detailedBio = user.bio;
        author.value.interests = user.hobbies || [];
        author.value.location = user.location;
        author.value.email = user.email;
        author.value.motto = user.motto || '“ 写作是思想的散步，设计是理性的浪漫。”';
        author.value.job = user.job || '';
        author.value.github = user.github || '';
        author.value.twitter = user.twitter || '';
        author.value.weibo = user.weibo || '';
      }
    }
  } catch (error) {
    console.error('获取用户信息失败：', error);
  } finally {
    stopLoading();
  }
}

onMounted(async () => {
  await getUserProfile();
});

</script>

<style lang="scss" scoped>
.about-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  .about-card {
    background-color: var(--bg-card);
    border-radius: 32px;
    padding: 48px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  }

  .about-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 40px;
    margin-bottom: 40px;

    .header-main {
      display: flex;
      gap: 24px;
      flex: 1;

      .avatar {
        color: #b98a63;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        background: rgba(185, 138, 99, 0.1);
        border-radius: 20px;
      }

      .header-info {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .name {
          font-size: 38px;
          font-weight: 700;
          color: #2a2318;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .title {
          font-size: 16px;
          color: #8c7a60;
          margin: 0;
          letter-spacing: 0.3px;
        }
      }
    }

    .header-side {
      display: flex;
      flex-direction: column;
      align-items: center;

      .qr-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;

        .qr-code {
          width: 100px;
          height: 100px;
          padding: 8px;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e8dcc8;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }

        .qr-label {
          font-size: 12px;
          color: #9b8a70;
        }
      }
    }
  }

  .quote-section {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 32px;
    padding: 24px 28px;
    background: rgba(185, 138, 99, 0.06);
    border-radius: 20px;

    .quote-icon {
      color: #b98a63;
      opacity: 0.6;
      margin-top: 4px;
    }

    .quote {
      font-size: 19px;
      color: #5e4b3c;
      margin: 0;
      font-style: italic;
      line-height: 1.7;
    }
  }

  .description-section {
    margin-bottom: 40px;

    .description {
      font-size: 16px;
      line-height: 2;
      color: #4a4035;
      margin: 0;
    }
  }

  .info-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 36px;

    .info-item {
      display: flex;
      gap: 14px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 16px;
      border: 1px solid rgba(212, 196, 168, 0.3);

      .info-icon {
        color: #b98a63;
        font-size: 22px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .info-text {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .info-label {
          font-size: 13px;
          font-weight: 600;
          color: #9b8a70;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 16px;
          color: #4a4035;
        }
      }
    }
  }

  .interests-section {
    margin-bottom: 40px;

    .interests-label {
      font-size: 14px;
      font-weight: 600;
      color: #9b8a70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
    }

    .interests-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .interest-tag {
        padding: 8px 18px;
        background: rgba(185, 138, 99, 0.1);
        color: #8c6a4c;
        border-radius: 20px;
        font-size: 14px;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(185, 138, 99, 0.2);
        }
      }
    }
  }

  .footer-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 32px;
    border-top: 1px solid rgba(212, 196, 168, 0.4);

    .social-icons {
      display: flex;
      gap: 14px;

      .social-icon {
        width: 44px;
        height: 44px;
        background: rgba(232, 220, 200, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        color: #6a5c49;
        font-size: 20px;

        &:hover {
          background: #e8dcc8;
          color: #b98a63;
          transform: translateY(-3px);
        }
      }
    }

    .signature {
      font-size: 14px;
      color: #9b8a70;
      font-style: italic;
    }
  }

  .bottom-quote {
    background: linear-gradient(135deg, rgba(247, 238, 217, 0.5), rgba(255, 255, 255, 0.5));
    border-radius: 24px;
    padding: 20px 32px;
    text-align: center;
    margin-top: 32px;
    border: 1px dashed rgba(185, 138, 99, 0.3);

    p {
      font-size: 14px;
      color: #8c7a60;
      margin: 0;
      letter-spacing: 0.3px;
    }
  }
}

@media (max-width: 768px) {
  .about-page {
    padding: 40px 16px;

    .about-card {
      padding: 32px 24px;
    }

    .about-header {
      flex-direction: column-reverse;
      align-items: center;
      gap: 28px;

      .header-main {
        flex-direction: column;
        align-items: center;
        text-align: center;

        .avatar {
          width: 90px;
          height: 90px;
          font-size: 48px;
        }

        .header-info {
          .name {
            font-size: 30px;
          }
        }
      }
    }

    .info-section {
      grid-template-columns: 1fr;
    }

    .footer-section {
      flex-direction: column;
      gap: 20px;
    }
  }
}
</style>
