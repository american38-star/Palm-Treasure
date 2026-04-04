<template>
  <div class="home-container">
    <!-- الشريط العلوي الاحترافي -->
    <header class="premium-header">
      <div class="header-content">
        <div class="user-profile">
          <div class="avatar-wrapper">
            <img src="/favicon.svg" alt="User Avatar" class="avatar-img" />
            <div class="status-indicator"></div>
          </div>
          <div class="user-info">
            <span class="welcome-text">مرحباً بك،</span>
            <h2 class="username">{{ username }}</h2>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-icon-btn" @click="go('/support')">
            <i class="fas fa-headset"></i>
          </button>
          <button class="action-icon-btn" @click="go('/notifications')">
            <i class="fas fa-bell"></i>
            <span class="badge"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- بطاقة الرصيد الفاخرة -->
    <section class="balance-card-section">
      <div class="balance-card">
        <div class="card-bg-pattern"></div>
        <div class="balance-content">
          <div class="balance-label">إجمالي الرصيد المتاح</div>
          <div class="balance-amount">
            <span class="currency">USDT</span>
            <span class="value">{{ balance }}</span>
          </div>
          <div class="balance-stats">
            <div class="stat-item">
              <span class="stat-label">أرباح اليوم</span>
              <span class="stat-value">+{{ todayEarnings || '0.00' }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-label">إجمالي السحب</span>
              <span class="stat-value">{{ totalWithdraw || '0.00' }}</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <button class="card-btn deposit" @click="go('/recharge')">
            <i class="fas fa-plus-circle"></i>
            إيداع
          </button>
          <button class="card-btn withdraw" @click="go('/withdraw')">
            <i class="fas fa-arrow-circle-down"></i>
            سحب
          </button>
        </div>
      </div>
    </section>

    <!-- شريط الإعلانات المتحرك -->
    <div class="scrolling-notice">
      <div class="notice-icon-wrapper">
        <i class="fas fa-bullhorn"></i>
      </div>
      <div class="notice-text-container">
        <marquee behavior="scroll" direction="right" scrollamount="5">
          🌴 شراكة عالمية مع Amazon, eBay, TikTok, Aliexpress, Alibaba, Shopee | انضم الآن إلى Palm Treasure وابدأ رحلة الاستثمار الذكي | سحوبات فورية ودعم فني على مدار الساعة 🌴
        </marquee>
      </div>
    </div>

    <!-- أزرار الوصول السريع -->
    <section class="quick-access-grid">
      <div class="quick-item" @click="go('/recharge')">
        <div class="quick-icon-box recharge">
          <i class="fas fa-wallet"></i>
        </div>
        <span>تعبئة رصيد</span>
      </div>
      <div class="quick-item" @click="go('/withdraw')">
        <div class="quick-icon-box withdraw">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <span>سحب نقدي</span>
      </div>
      <div class="quick-item" @click="go('/invite')">
        <div class="quick-icon-box invite">
          <i class="fas fa-user-plus"></i>
        </div>
        <span>دعوة أصدقاء</span>
      </div>
      <div class="quick-item" @click="showCompanyAd">
        <div class="quick-icon-box company">
          <i class="fas fa-info-circle"></i>
        </div>
        <span>عن الشركة</span>
      </div>
    </section>

    <!-- قسم المهام والـ VIP -->
    <section class="main-sections">
      <div class="section-header">
        <h3 class="section-title">قاعة المهام (VIP)</h3>
        <button class="view-all-btn" @click="go('/vips')">عرض الكل</button>
      </div>
      
      <div class="vip-horizontal-scroll">
        <div 
          v-for="vip in vipPlans.slice(0, 5)" 
          :key="vip.level" 
          class="vip-mini-card"
          :class="getVipClass(vip.level)"
          @click="go('/tasks')"
        >
          <div class="vip-badge">VIP {{ vip.level }}</div>
          <div class="vip-price">{{ vip.recharge }} USDT</div>
          <div class="vip-daily-profit">ربح يومي: {{ vip.daily }}</div>
          <button class="unlock-btn">دخول</button>
        </div>
      </div>
    </section>

    <!-- القائمة الشبكية المحسنة -->
    <section class="grid-menu-section">
      <div class="grid-menu">
        <div class="menu-card" v-for="item in menu" :key="item.title" @click="go(item.route)">
          <div class="menu-icon-wrapper">
            <i :class="item.icon"></i>
          </div>
          <span class="menu-title">{{ item.title }}</span>
        </div>
        
        <div class="menu-card special" @click="showTermsAd">
          <div class="menu-icon-wrapper gold">
            <i class="fas fa-scroll"></i>
          </div>
          <span class="menu-title">الشروط والأحكام</span>
        </div>
      </div>
    </section>

    <!-- إعلان Popup فاخر للشركة -->
    <div id="companyAd" class="ad-overlay" v-if="showAd" @click.self="closeAd">
      <div class="ad-box">
        <div class="ad-header">
          <h2>🌴 Palm Treasure</h2>
          <button class="close-btn" @click="closeAd">×</button>
        </div>

        <div class="ad-content">
          <div class="company-message">
            <p>
              مرحباً بالجميع 🌟<br><br>
              يسرّنا أن نعرّفكم بشركة Palm Treasure التي تأسست في إنجلترا بتاريخ 5 فبراير 2026، وهي شركة استثمارية متخصصة في مجال التجارة الإلكترونية. تمتلك الشركة فريقاً تقنياً محترفاً وخبرة مالية قوية، ويقع مقرها الرئيسي حالياً في منطقة الأعمال المركزية في إنجلترا.<br><br>
              وانطلاقاً من رؤيتنا للتوسع وبناء شبكة تعاون واسعة، قمنا بإنشاء فروع ووكالات في عدد من الدول العربية مثل لبنان، الجزائر، ليبيا، والعراق، ونسعى خلال المرحلة القادمة إلى توسيع نشاطنا وانتشارنا في مختلف دول الشرق الأوسط.<br><br>
              لقد جاء تأسيس هذه الشركة بعد دراسة عميقة لما حدث خلال عامي 2024 و2025، حيث ظهرت العديد من المنصات الوهمية التي خدعت الكثير من الناس ولم تستمر طويلاً. ومن هنا كان هدفنا واضحاً: تحويل هذا المجال إلى منصة حقيقية وموثوقة يستفيد منها الأعضاء كما تستفيد منها الشركة، ضمن نظام عادل وشفاف.<br><br>
              وقد تحقق هذا المشروع بجهود كبيرة من الفريق التقني تحت إشراف المهندس أليكس ديروب، الذي لعب دوراً أساسياً في تطوير النظام التقني للشركة. وتقديراً لجهوده المميزة ومساهمته في نجاح هذا المشروع، تمت ترقيته إلى منصب نائب المدير.<br><br>
              نحن في Palm Treasure نؤمن بأن النجاح الحقيقي يجب أن يكون متاحاً للجميع، لذلك تم تصميم هذا المشروع ليكون فرصة متاحة لكل الناس، وخاصة للطبقة المتوسطة وذوي الدخل المحدود، حتى يتمكنوا من تحسين أوضاعهم والمشاركة في فرص الاقتصاد الرقمي.<br><br>
              ولهذا السبب تم وضع نظام واضح وقوانين عادلة تضمن حماية حقوق الموظفين والأعضاء قبل حقوق المستثمرين، مع مراعاة الظروف الاقتصادية والاجتماعية في المجتمعات العربية.<br><br>
              وسيتم تطبيق هذا النظام المبرمج في معظم الدول العربية ابتداءً من 1 مارس 2026 وحتى نهاية عام 2028، وخلال هذه الفترة سيتم تقييم الأداء والنتائج. وبعد ذلك قد يتم تطوير النظام وإجراء بعض التعديلات بناءً على كفاءة الأعضاء وجهودهم وإخلاصهم في العمل.<br><br>
              كما نعمل منذ الآن على التخطيط لمجموعة من الفرص المستقبلية والمشاريع الجديدة التي ستوفر مزيداً من الإمكانيات لأعضاء الشركة في السنوات القادمة.<br><br>
              نتمنى للجميع التوفيق، ونسعد بانضمامكم إلى مجتمع Palm Treasure 🌴
            </p>
          </div>
          
          <div class="vip-section">
            <h3>📊 خطط العضوية والأرباح</h3>
            <div class="vip-grid">
              <div class="vip-card-full" v-for="vip in vipPlans" :key="vip.level">
                <div class="vip-card-header" :class="getVipClass(vip.level)">
                  <span class="vip-level-badge">VIP {{ vip.level }}</span>
                </div>
                <div class="vip-card-body">
                  <div class="vip-info-row">
                    <span>💰 الاشتراك:</span>
                    <strong>{{ vip.recharge }} USDT</strong>
                  </div>
                  <div class="vip-info-row">
                    <span>📈 الربح اليومي:</span>
                    <strong>{{ vip.daily }} USDT</strong>
                  </div>
                  <div class="vip-info-row">
                    <span>📅 الربح الشهري:</span>
                    <strong>{{ vip.monthly }} USDT</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="ad-btn" @click="closeAd">أنا أعرف</button>
      </div>
    </div>

    <!-- إعلان Popup للشروط والأحكام -->
    <div id="termsAd" class="ad-overlay" v-if="showTerms" @click.self="closeTerms">
      <div class="ad-box">
        <div class="ad-header">
          <h2>📜 الشروط والأحكام</h2>
          <button class="close-btn" @click="closeTerms">×</button>
        </div>
        <div class="ad-content">
          <div class="terms-message">
            <h3>📊 عقود رجال الأعمال</h3>
            <p>عند وصول عدد أعضاء فريقك إلى 70 عضواً نشطاً أو أكثر، تقوم الشركة بإبرام عقد رسمي معك، وذلك لضمان حقوقك وتقديراً لجهودك في بناء فريق ناجح وإدارته بكفاءة.</p>
            <div class="promotion-table">
              <div class="promotion-row">
                <span>🔹 70 عضواً نشطاً</span>
                <span class="highlight">💰 200 دولار</span>
              </div>
              <div class="promotion-row">
                <span>🔹 140 عضواً نشطاً</span>
                <span class="highlight">💰 350 دولاراً</span>
              </div>
              <div class="promotion-row">
                <span>🔹 300 عضو نشط</span>
                <span class="highlight">💰 500 دولار</span>
              </div>
            </div>
          </div>
        </div>
        <button class="ad-btn" @click="closeTerms">موافق</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import router from "../router";

export default {
  data() {
    return {
      username: "جاري التحميل...",
      balance: "0.00",
      todayEarnings: "0.00",
      totalWithdraw: "0.00",
      showAd: false,
      showTerms: false,
      menu: [
        { title: "سجل الشحن", icon: "fas fa-history", route: "/recharge-record" },
        { title: "سجل السحب", icon: "fas fa-file-invoice-dollar", route: "/withdraw-record" },
        { title: "الفريق", icon: "fas fa-users", route: "/team" },
        { title: "المهام", icon: "fas fa-tasks", route: "/tasks" },
        { title: "الملف الشخصي", icon: "fas fa-user-circle", route: "/profile" },
        { title: "تطبيق الهاتف", icon: "fas fa-mobile-alt", route: "/download" },
      ],
      vipPlans: [
        { level: 1, recharge: 12, daily: 3, monthly: 90, tasks: 1 },
        { level: 2, recharge: 60, daily: 15, monthly: 450, tasks: 1 },
        { level: 3, recharge: 160, daily: 40, monthly: 1200, tasks: 1 },
        { level: 4, recharge: 500, daily: 125, monthly: 3750, tasks: 1 },
        { level: 5, recharge: 1200, daily: 300, monthly: 9000, tasks: 1 },
        { level: 6, recharge: 3000, daily: 750, monthly: 22500, tasks: 1 },
        { level: 7, recharge: 6000, daily: 1500, monthly: 45000, tasks: 1 },
        { level: 8, recharge: 12000, daily: 3000, monthly: 90000, tasks: 1 },
        { level: 9, recharge: 25000, daily: 6250, monthly: 187500, tasks: 1 },
        { level: 10, recharge: 50000, daily: 12500, monthly: 375000, tasks: 1 },
      ]
    };
  },

  mounted() {
    this.fetchUserData();
  },

  methods: {
    async fetchUserData() {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            this.username = data.displayName || data.email || data.phoneNumber || "مستخدم";
            this.balance = parseFloat(data.balance || 0).toFixed(2);
            this.todayEarnings = parseFloat(data.todayEarnings || 0).toFixed(2);
            this.totalWithdraw = parseFloat(data.totalWithdraw || 0).toFixed(2);
          }
        } else {
          router.push("/login");
        }
      });
    },

    go(route) {
      router.push(route);
    },

    showCompanyAd() {
      this.showAd = true;
    },

    closeAd() {
      this.showAd = false;
    },

    showTermsAd() {
      this.showTerms = true;
    },

    closeTerms() {
      this.showTerms = false;
    },

    getVipClass(level) {
      if (level <= 2) return 'vip-bronze';
      if (level <= 4) return 'vip-silver';
      if (level <= 6) return 'vip-gold';
      if (level <= 8) return 'vip-platinum';
      return 'vip-elite';
    }
  }
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #0A0C10;
  color: #ffffff;
  padding-bottom: 80px;
  direction: rtl;
  font-family: 'Tajawal', sans-serif;
}

/* Header */
.premium-header {
  padding: 20px;
  background: linear-gradient(to bottom, #11151C, #0A0C10);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #D4AF37;
  padding: 2px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  left: 2px;
  width: 10px;
  height: 10px;
  background: #4CAF50;
  border: 2px solid #0A0C10;
  border-radius: 50%;
}

.welcome-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.username {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #D4AF37;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-icon-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  color: #D4AF37;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #ff4d4d;
  border-radius: 50%;
}

/* Balance Card */
.balance-card-section {
  padding: 0 20px;
  margin-bottom: 20px;
}

.balance-card {
  background: linear-gradient(135deg, #1A1F2A 0%, #11151C 100%);
  border-radius: 24px;
  padding: 25px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.card-bg-pattern {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.balance-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 10px;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 20px;
}

.currency {
  font-size: 18px;
  font-weight: 600;
  color: #D4AF37;
}

.value {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 1px;
}

.balance-stats {
  display: flex;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #F6E27A;
}

.stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.card-actions {
  display: flex;
  gap: 12px;
}

.card-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-btn.deposit {
  background: linear-gradient(135deg, #D4AF37, #F6E27A);
  color: #0A0C10;
}

.card-btn.withdraw {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Notice Bar */
.scrolling-notice {
  margin: 0 20px 20px;
  background: rgba(212, 175, 55, 0.05);
  border-radius: 50px;
  padding: 8px 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.notice-icon-wrapper {
  color: #D4AF37;
  font-size: 14px;
}

.notice-text-container {
  flex: 1;
  overflow: hidden;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

/* Quick Access */
.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 0 20px;
  gap: 15px;
  margin-bottom: 25px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.quick-icon-box {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
}

.quick-icon-box.recharge { background: rgba(76, 175, 80, 0.1); color: #4CAF50; }
.quick-icon-box.withdraw { background: rgba(255, 152, 0, 0.1); color: #FF9800; }
.quick-icon-box.invite { background: rgba(33, 150, 243, 0.1); color: #2196F3; }
.quick-icon-box.company { background: rgba(212, 175, 55, 0.1); color: #D4AF37; }

.quick-item span {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

/* VIP Section */
.main-sections {
  padding: 0 20px;
  margin-bottom: 25px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

.view-all-btn {
  background: transparent;
  border: none;
  color: #D4AF37;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.vip-horizontal-scroll {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
  scrollbar-width: none;
}

.vip-horizontal-scroll::-webkit-scrollbar {
  display: none;
}

.vip-mini-card {
  min-width: 140px;
  background: #11151C;
  border-radius: 20px;
  padding: 15px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.vip-badge {
  font-size: 12px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 50px;
  display: inline-block;
  margin-bottom: 10px;
  color: #0A0C10;
}

.vip-bronze .vip-badge { background: #CD7F32; }
.vip-silver .vip-badge { background: #C0C0C0; }
.vip-gold .vip-badge { background: #D4AF37; }
.vip-platinum .vip-badge { background: #E5E4E2; }
.vip-elite .vip-badge { background: #8A2BE2; color: #fff; }

.vip-price {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 5px;
}

.vip-daily-profit {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
}

.unlock-btn {
  width: 100%;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  background: transparent;
  color: #D4AF37;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* Grid Menu */
.grid-menu-section {
  padding: 0 20px;
}

.grid-menu {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.menu-card {
  background: #11151C;
  border-radius: 16px;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  cursor: pointer;
}

.menu-icon-wrapper {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
}

.menu-icon-wrapper.gold {
  color: #D4AF37;
  background: rgba(212, 175, 55, 0.1);
}

.menu-title {
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

.menu-card.special {
  background: linear-gradient(135deg, #11151C, #1A1F2A);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

/* Popups */
.ad-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.ad-box {
  background: #11151C;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  border-radius: 24px;
  border: 1px solid #D4AF37;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ad-header {
  padding: 15px 20px;
  background: #D4AF37;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ad-header h2 {
  margin: 0;
  font-size: 18px;
  color: #0A0C10;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #0A0C10;
  cursor: pointer;
}

.ad-content {
  padding: 20px;
  overflow-y: auto;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.6;
}

.vip-card-full {
  background: #1A1F2A;
  border-radius: 12px;
  margin-bottom: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.vip-card-header {
  padding: 8px;
  text-align: center;
  font-weight: 700;
}

.vip-card-body {
  padding: 12px;
}

.vip-info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 13px;
}

.promotion-table {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 15px;
}

.promotion-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.promotion-row:last-child { border-bottom: none; }

.highlight { color: #F6E27A; font-weight: 700; }

.ad-btn {
  padding: 15px;
  background: #D4AF37;
  border: none;
  color: #0A0C10;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 480px) {
  .balance-amount .value { font-size: 30px; }
  .quick-access-grid { gap: 10px; }
  .quick-icon-box { width: 45px; height: 45px; font-size: 18px; }
}
</style>
