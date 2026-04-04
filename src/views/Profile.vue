<template>
  <div class="profile-wrapper">
    <div v-if="loading" class="loading-container">
      <div class="gold-spinner"></div>
      <p class="loading-text">جاري تحميل بيانات الحساب...</p>
    </div>

    <div v-else class="profile-content">
      <!-- رأس الصفحة مع الخلفية المتدرجة -->
      <div class="profile-header">
        <div class="header-background"></div>
        
        <div class="header-content">
          <!-- صورة المستخدم -->
          <div class="avatar-section">
            <div class="avatar-container">
              <div class="avatar-glow"></div>
              <div class="avatar">
                {{ userData.username ? userData.username.charAt(0).toUpperCase() : 'U' }}
              </div>
              <div class="avatar-badge" v-if="userData.vipLevel">
                <i class="fas fa-crown"></i>
                VIP {{ userData.vipLevel }}
              </div>
            </div>
          </div>

          <!-- معلومات المستخدم الأساسية -->
          <div class="user-info-section">
            <h1 class="username">{{ userData.username || "المستخدم" }}</h1>
            <p class="user-id">ID: {{ userData.uid.substring(0, 12) }}...</p>
            <div class="user-status">
              <span class="status-badge active">
                <i class="fas fa-circle"></i> نشط
              </span>
              <span class="status-date">
                <i class="fas fa-calendar-alt"></i> {{ formattedDate }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- البطاقات الرئيسية -->
      <div class="main-cards">
        <!-- بطاقة الرصيد -->
        <div class="premium-card balance-card">
          <div class="card-icon">
            <i class="fas fa-wallet"></i>
          </div>
          <div class="card-content">
            <span class="card-label">الرصيد المتاح</span>
            <span class="card-value">{{ userData.balance }} USDT</span>
          </div>
          <div class="card-decoration"></div>
        </div>

        <!-- بطاقة VIP -->
        <div class="premium-card vip-card" v-if="userData.vipLevel">
          <div class="card-icon">
            <i class="fas fa-crown"></i>
          </div>
          <div class="card-content">
            <span class="card-label">مستوى VIP</span>
            <span class="card-value">المستوى {{ userData.vipLevel }}</span>
          </div>
          <div class="card-decoration"></div>
        </div>

        <!-- بطاقة الإحالات -->
        <div class="premium-card referral-card" v-if="userData.totalReferrals">
          <div class="card-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="card-content">
            <span class="card-label">عدد الإحالات</span>
            <span class="card-value">{{ userData.totalReferrals }}</span>
          </div>
          <div class="card-decoration"></div>
        </div>
      </div>

      <!-- قسم المعلومات الشخصية -->
      <div class="section">
        <h2 class="section-title">
          <i class="fas fa-user-circle"></i>
          المعلومات الشخصية
        </h2>

        <div class="info-grid">
          <!-- البريد الإلكتروني -->
          <div class="info-item">
            <div class="info-header">
              <i class="fas fa-envelope"></i>
              <span>البريد الإلكتروني</span>
            </div>
            <div class="info-body">
              <span class="info-value">{{ userData.email || 'غير مسجل' }}</span>
              <button class="copy-btn" @click="copy(userData.email)" v-if="userData.email" title="نسخ">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>

          <!-- رقم الهاتف -->
          <div class="info-item">
            <div class="info-header">
              <i class="fas fa-phone"></i>
              <span>رقم الهاتف</span>
            </div>
            <div class="info-body">
              <span class="info-value">{{ userData.phoneNumber || 'غير مسجل' }}</span>
              <button class="copy-btn" @click="copy(userData.phoneNumber)" v-if="userData.phoneNumber" title="نسخ">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>

          <!-- معرف المستخدم -->
          <div class="info-item">
            <div class="info-header">
              <i class="fas fa-id-card"></i>
              <span>معرف المستخدم</span>
            </div>
            <div class="info-body">
              <span class="info-value id-value">{{ userData.uid }}</span>
              <button class="copy-btn" @click="copy(userData.uid)" title="نسخ">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>

          <!-- كود الإحالة -->
          <div class="info-item" v-if="userData.referralCode">
            <div class="info-header">
              <i class="fas fa-link"></i>
              <span>كود الإحالة</span>
            </div>
            <div class="info-body">
              <span class="info-value referral-code">{{ userData.referralCode }}</span>
              <button class="copy-btn" @click="copy(userData.referralCode)" title="نسخ">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- قسم الأمان والإعدادات -->
      <div class="section">
        <h2 class="section-title">
          <i class="fas fa-lock"></i>
          الأمان والإعدادات
        </h2>

        <div class="settings-grid">
          <!-- زر تغيير كلمة المرور -->
          <button class="setting-btn" @click="openChangePasswordModal">
            <div class="setting-icon">
              <i class="fas fa-key"></i>
            </div>
            <div class="setting-content">
              <span class="setting-title">تغيير كلمة المرور</span>
              <span class="setting-desc">قم بتحديث كلمة المرور الخاصة بك</span>
            </div>
            <i class="fas fa-chevron-left"></i>
          </button>

          <!-- زر ربط رقم الهاتف (الميزة الجديدة) -->
          <button class="setting-btn" @click="openPhoneModal">
            <div class="setting-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <div class="setting-content">
              <span class="setting-title">ربط رقم الهاتف</span>
              <span class="setting-desc">{{ userData.phoneNumber ? 'تحديث رقم الهاتف' : 'أضف رقم هاتفك للأمان' }}</span>
            </div>
            <i class="fas fa-chevron-left"></i>
          </button>

          <!-- زر نسخ رابط الدعوة -->
          <button class="setting-btn" @click="copyReferralLink" v-if="userData.referralCode">
            <div class="setting-icon">
              <i class="fas fa-share-alt"></i>
            </div>
            <div class="setting-content">
              <span class="setting-title">نسخ رابط الدعوة</span>
              <span class="setting-desc">شارك الرابط مع أصدقائك واحصل على عمولات</span>
            </div>
            <i class="fas fa-chevron-left"></i>
          </button>

          <!-- زر تسجيل الخروج -->
          <button class="setting-btn logout-btn" @click="logout">
            <div class="setting-icon">
              <i class="fas fa-sign-out-alt"></i>
            </div>
            <div class="setting-content">
              <span class="setting-title">تسجيل الخروج</span>
              <span class="setting-desc">قم بإنهاء جلستك الحالية</span>
            </div>
            <i class="fas fa-chevron-left"></i>
          </button>
        </div>
      </div>

      <!-- نافذة تغيير كلمة المرور -->
      <div v-if="showChangePasswordModal" class="modal-overlay" @click.self="closeChangePasswordModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">
              <i class="fas fa-key"></i>
              تغيير كلمة المرور
            </h3>
            <button class="modal-close" @click="closeChangePasswordModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="input-group">
              <label class="input-label">كلمة المرور الحالية</label>
              <input 
                type="password" 
                v-model="passwordForm.currentPassword" 
                class="modal-input"
                placeholder="أدخل كلمة المرور الحالية"
              />
            </div>
            
            <div class="input-group">
              <label class="input-label">كلمة المرور الجديدة</label>
              <input 
                type="password" 
                v-model="passwordForm.newPassword" 
                class="modal-input"
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </div>
            
            <div class="input-group">
              <label class="input-label">تأكيد كلمة المرور الجديدة</label>
              <input 
                type="password" 
                v-model="passwordForm.confirmPassword" 
                class="modal-input"
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
            </div>
            
            <p v-if="passwordError" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ passwordError }}
            </p>
            <p v-if="passwordSuccess" class="success-message">
              <i class="fas fa-check-circle"></i>
              {{ passwordSuccess }}
            </p>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-gold" @click="updatePassword" :disabled="passwordLoading">
              <i class="fas fa-save"></i>
              {{ passwordLoading ? 'جاري التغيير...' : 'تحديث كلمة المرور' }}
            </button>
            <button class="btn btn-outline" @click="closeChangePasswordModal">
              <i class="fas fa-times"></i>
              إلغاء
            </button>
          </div>
        </div>
      </div>

      <!-- نافذة ربط رقم الهاتف (الميزة الجديدة) -->
      <div v-if="showPhoneModal" class="modal-overlay" @click.self="closePhoneModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">
              <i class="fas fa-mobile-alt"></i>
              {{ userData.phoneNumber ? 'تحديث رقم الهاتف' : 'ربط رقم الهاتف' }}
            </h3>
            <button class="modal-close" @click="closePhoneModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <p class="modal-description">
              {{ userData.phoneNumber ? 'قم بتحديث رقم هاتفك لتحسين أمان حسابك' : 'ربط رقم هاتفك سيساعدك في استرجاع حسابك إذا نسيت كلمة المرور' }}
            </p>

            <div class="input-group">
              <label class="input-label">رقم الهاتف</label>
              <div class="phone-input-wrapper">
                <span class="country-code">+966</span>
                <input 
                  type="tel" 
                  v-model="phoneForm.phone" 
                  class="modal-input phone-input"
                  placeholder="5xxxxxxxx"
                  @input="validatePhone"
                />
              </div>
              <p v-if="phoneError" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                {{ phoneError }}
              </p>
            </div>

            <div class="input-group">
              <label class="input-label">كلمة المرور (للتأكيد)</label>
              <input 
                type="password" 
                v-model="phoneForm.password" 
                class="modal-input"
                placeholder="أدخل كلمة المرور الخاصة بك"
              />
            </div>

            <p v-if="phoneSuccess" class="success-message">
              <i class="fas fa-check-circle"></i>
              {{ phoneSuccess }}
            </p>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-gold" @click="updatePhoneNumber" :disabled="phoneLoading">
              <i class="fas fa-check"></i>
              {{ phoneLoading ? 'جاري التحديث...' : 'تأكيد وربط الهاتف' }}
            </button>
            <button class="btn btn-outline" @click="closePhoneModal">
              <i class="fas fa-times"></i>
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default {
  name: "Profile",

  data() {
    return {
      loading: true,
      showChangePasswordModal: false,
      showPhoneModal: false,
      passwordLoading: false,
      phoneLoading: false,
      passwordError: "",
      passwordSuccess: "",
      phoneError: "",
      phoneSuccess: "",
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      },
      phoneForm: {
        phone: "",
        password: ""
      },
      userData: {
        email: "",
        phoneNumber: "",
        uid: "",
        createdAt: "",
        balance: 0,
        username: "",
        referralCode: "",
        vipLevel: 0,
        totalReferrals: 0,
      },
    };
  },

  computed: {
    formattedDate() {
      if (!this.userData.createdAt) return "غير متوفر";

      let date;

      if (this.userData.createdAt.toDate) {
        date = this.userData.createdAt.toDate();
      } else {
        date = new Date(this.userData.createdAt);
      }

      return isNaN(date.getTime())
        ? "غير متوفر"
        : date.toLocaleDateString("ar-EG", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
    },

    referralLink() {
      return `${window.location.origin}/register?ref=${this.userData.referralCode}`;
    }
  },

  created() {
    this.loadUserData();
  },

  methods: {
    async loadUserData() {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          this.loading = false;
          this.$router.push("/login");
          return;
        }

        try {
          const snap = await getDoc(doc(db, "users", user.uid));

          if (snap.exists()) {
            const data = snap.data();

            this.userData = {
              email: data.email || "",
              phoneNumber: data.phoneNumber || "",
              uid: user.uid,
              createdAt: data.createdAt || user.metadata.creationTime,
              balance: data.balance ?? 0,
              username: data.username || (data.email ? data.email.split("@")[0] : "مستخدم"),
              referralCode: data.referralCode || user.uid.substring(0, 6),
              vipLevel: data.vipLevel || 0,
              totalReferrals: data.totalReferrals || 0,
            };
          } else {
            this.userData = {
              email: user.email || "",
              phoneNumber: "",
              uid: user.uid,
              createdAt: user.metadata.creationTime,
              balance: 0,
              username: user.email ? user.email.split("@")[0] : "مستخدم",
              referralCode: user.uid.substring(0, 6),
              vipLevel: 0,
              totalReferrals: 0,
            };
          }
        } catch (err) {
          console.error("Error loading profile:", err);
          this.showErrorMessage("حدث خطأ في تحميل البيانات");
        }

        this.loading = false;
      });
    },

    copy(text) {
      if (!text) return;
      navigator.clipboard.writeText(text);
      this.showSuccessMessage("تم النسخ ✓");
    },

    copyReferralLink() {
      if (this.referralLink) {
        this.copy(this.referralLink);
        this.showSuccessMessage("تم نسخ رابط الدعوة ✓");
      }
    },

    openChangePasswordModal() {
      this.showChangePasswordModal = true;
      this.passwordError = "";
      this.passwordSuccess = "";
      this.passwordForm = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      };
    },

    closeChangePasswordModal() {
      this.showChangePasswordModal = false;
      this.passwordError = "";
      this.passwordSuccess = "";
      this.passwordForm = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      };
    },

    async updatePassword() {
      this.passwordError = "";
      this.passwordSuccess = "";

      if (!this.passwordForm.currentPassword) {
        this.passwordError = "الرجاء إدخال كلمة المرور الحالية";
        return;
      }

      if (!this.passwordForm.newPassword) {
        this.passwordError = "الرجاء إدخال كلمة المرور الجديدة";
        return;
      }

      if (this.passwordForm.newPassword.length < 6) {
        this.passwordError = "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل";
        return;
      }

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = "كلمات المرور الجديدة غير متطابقة";
        return;
      }

      this.passwordLoading = true;

      try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(
          user.email,
          this.passwordForm.currentPassword
        );

        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, this.passwordForm.newPassword);

        this.passwordSuccess = "تم تحديث كلمة المرور بنجاح ✓";
        setTimeout(() => {
          this.closeChangePasswordModal();
        }, 2000);
      } catch (error) {
        this.passwordError = error.message || "حدث خطأ في تحديث كلمة المرور";
      } finally {
        this.passwordLoading = false;
      }
    },

    openPhoneModal() {
      this.showPhoneModal = true;
      this.phoneError = "";
      this.phoneSuccess = "";
      this.phoneForm = {
        phone: this.userData.phoneNumber ? this.userData.phoneNumber.replace("+966", "") : "",
        password: ""
      };
    },

    closePhoneModal() {
      this.showPhoneModal = false;
      this.phoneError = "";
      this.phoneSuccess = "";
      this.phoneForm = {
        phone: "",
        password: ""
      };
    },

    validatePhone() {
      if (this.phoneForm.phone && !/^\d{9}$/.test(this.phoneForm.phone)) {
        this.phoneError = "رقم الهاتف يجب أن يكون 9 أرقام";
      } else {
        this.phoneError = "";
      }
    },

    async updatePhoneNumber() {
      this.phoneError = "";
      this.phoneSuccess = "";

      if (!this.phoneForm.phone) {
        this.phoneError = "الرجاء إدخال رقم الهاتف";
        return;
      }

      if (!/^\d{9}$/.test(this.phoneForm.phone)) {
        this.phoneError = "رقم الهاتف يجب أن يكون 9 أرقام";
        return;
      }

      if (!this.phoneForm.password) {
        this.phoneError = "الرجاء إدخال كلمة المرور للتأكيد";
        return;
      }

      this.phoneLoading = true;

      try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(
          user.email,
          this.phoneForm.password
        );

        await reauthenticateWithCredential(user, credential);

        const fullPhoneNumber = "+966" + this.phoneForm.phone;
        await updateDoc(doc(db, "users", user.uid), {
          phoneNumber: fullPhoneNumber
        });

        this.userData.phoneNumber = fullPhoneNumber;
        this.phoneSuccess = "تم ربط رقم الهاتف بنجاح ✓";
        
        setTimeout(() => {
          this.closePhoneModal();
        }, 2000);
      } catch (error) {
        this.phoneError = error.message || "حدث خطأ في ربط رقم الهاتف";
      } finally {
        this.phoneLoading = false;
      }
    },

    async logout() {
      try {
        await signOut(auth);
        this.$router.push("/login");
      } catch (error) {
        console.error("Error logging out:", error);
      }
    },

    showSuccessMessage(msg) {
      // يمكن استبدال هذا بـ toast notification
      console.log("Success:", msg);
    },

    showErrorMessage(msg) {
      // يمكن استبدال هذا بـ toast notification
      console.error("Error:", msg);
    }
  }
};
</script>

<style scoped>
* {
  direction: rtl;
}

.profile-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
  padding: 20px;
  padding-top: 80px;
  padding-bottom: 100px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 100px 20px;
}

.gold-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(212, 175, 55, 0.1);
  border-top: 4px solid #fcd535;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #fcd535;
  font-size: 18px;
  font-weight: 600;
}

.profile-content {
  max-width: 900px;
  margin: 0 auto;
}

/* رأس الصفحة */
.profile-header {
  position: relative;
  background: linear-gradient(135deg, #1e2329 0%, #181a20 100%);
  border-radius: 24px;
  padding: 40px 30px;
  margin-bottom: 30px;
  border: 1px solid rgba(212, 175, 55, 0.15);
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
  filter: blur(20px);
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 30px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.avatar-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(135deg, #fcd535, #d4af37, #c5a028);
  border-radius: 50%;
  filter: blur(15px);
  opacity: 0.4;
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

.avatar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1A1F2A, #11151C);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  font-weight: 700;
  color: #fcd535;
  border: 3px solid #fcd535;
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
  z-index: 1;
}

.avatar-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: linear-gradient(135deg, #fcd535, #d4af37);
  color: #0f1419;
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  border: 3px solid #0f1419;
  z-index: 2;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-info-section {
  flex: 1;
  padding-top: 10px;
}

.username {
  font-size: 32px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.user-id {
  font-size: 14px;
  color: #848e9c;
  margin: 0 0 12px 0;
  font-family: monospace;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge i {
  font-size: 8px;
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #848e9c;
  font-size: 12px;
}

/* البطاقات الرئيسية */
.main-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.premium-card {
  background: linear-gradient(135deg, #1e2329 0%, #181a20 100%);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(212, 175, 55, 0.15);
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.premium-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(212, 175, 55, 0.15);
}

.card-icon {
  width: 60px;
  height: 60px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fcd535;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-label {
  font-size: 12px;
  color: #848e9c;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 20px;
  font-weight: 800;
  color: #fcd535;
}

.card-decoration {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.1), transparent);
  border-radius: 50%;
  pointer-events: none;
}

/* الأقسام */
.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title i {
  color: #fcd535;
  font-size: 24px;
}

/* شبكة المعلومات -->
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.info-item {
  background: linear-gradient(135deg, #1e2329 0%, #181a20 100%);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(212, 175, 55, 0.1);
  transition: all 0.3s ease;
}

.info-item:hover {
  border-color: rgba(212, 175, 55, 0.3);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.1);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  color: #fcd535;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-header i {
  font-size: 16px;
}

.info-body {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}

.info-value {
  font-size: 14px;
  color: #eaecef;
  word-break: break-all;
  flex: 1;
}

.id-value {
  font-family: monospace;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 10px;
  border-radius: 8px;
}

.referral-code {
  font-family: monospace;
  font-size: 14px;
  color: #fcd535;
  letter-spacing: 1px;
}

.copy-btn {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #fcd535;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.copy-btn:hover {
  background: #fcd535;
  color: #0f1419;
  transform: scale(1.1);
}

/* شبكة الإعدادات */
.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-btn {
  background: linear-gradient(135deg, #1e2329 0%, #181a20 100%);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: inherit;
  font-family: inherit;
}

.setting-btn:hover {
  border-color: rgba(212, 175, 55, 0.3);
  background: linear-gradient(135deg, #252b34 0%, #1e2329 100%);
  transform: translateX(-8px);
}

.setting-btn.logout-btn:hover {
  border-color: rgba(255, 75, 75, 0.3);
  background: rgba(255, 75, 75, 0.05);
}

.setting-icon {
  width: 50px;
  height: 50px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fcd535;
  flex-shrink: 0;
}

.setting-btn.logout-btn .setting-icon {
  background: rgba(255, 75, 75, 0.1);
  color: #ff4b4b;
}

.setting-content {
  flex: 1;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-title {
  font-size: 15px;
  font-weight: 700;
  color: #eaecef;
  display: block;
}

.setting-desc {
  font-size: 12px;
  color: #848e9c;
  display: block;
}

.setting-btn i:last-child {
  color: #848e9c;
  font-size: 16px;
  flex-shrink: 0;
}

/* النوافذ المنبثقة */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #1e2329 0%, #181a20 100%);
  border-radius: 24px;
  padding: 0;
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 175, 55, 0.2);
  animation: modalSlideIn 0.3s ease;
  overflow: hidden;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #fcd535;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.modal-close {
  background: rgba(212, 175, 55, 0.1);
  border: none;
  color: #fcd535;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #fcd535;
  color: #0f1419;
}

.modal-body {
  padding: 24px;
}

.modal-description {
  font-size: 14px;
  color: #848e9c;
  margin-bottom: 20px;
  line-height: 1.6;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 13px;
  color: #fcd535;
  margin-bottom: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  font-size: 14px;
  color: #eaecef;
  transition: all 0.3s ease;
  font-family: inherit;
}

.modal-input:focus {
  outline: none;
  border-color: #fcd535;
  background: rgba(212, 175, 55, 0.08);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
}

.modal-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.phone-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 4px 8px;
}

.country-code {
  color: #fcd535;
  font-weight: 700;
  font-size: 14px;
  padding: 8px 12px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 8px;
  white-space: nowrap;
}

.phone-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 12px;
}

.error-message {
  color: #ff6b6b;
  font-size: 13px;
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-message {
  color: #51cf66;
  font-size: 13px;
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(81, 207, 102, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(81, 207, 102, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid rgba(212, 175, 55, 0.1);
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-gold {
  background: linear-gradient(135deg, #fcd535 0%, #d4af37 100%);
  color: #0f1419;
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

.btn-gold:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4);
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #fcd535;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.1);
  border-color: #fcd535;
}

/* تحسينات للجوال */
@media (max-width: 768px) {
  .profile-header {
    padding: 24px;
  }

  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-info-section {
    padding-top: 0;
  }

  .username {
    font-size: 24px;
  }

  .main-cards {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-width: 90vw;
  }
}

@media (max-width: 480px) {
  .profile-wrapper {
    padding: 15px;
    padding-top: 70px;
    padding-bottom: 80px;
  }

  .profile-header {
    padding: 16px;
    margin-bottom: 20px;
  }

  .avatar-container {
    width: 100px;
    height: 100px;
  }

  .avatar {
    font-size: 48px;
  }

  .username {
    font-size: 20px;
  }

  .section-title {
    font-size: 16px;
  }

  .modal-content {
    max-width: 95vw;
    border-radius: 16px;
  }

  .modal-header,
  .modal-body,
  .modal-actions {
    padding: 16px;
  }

  .modal-title {
    font-size: 16px;
  }

  .btn {
    padding: 10px 16px;
    font-size: 12px;
  }
}
</style>
