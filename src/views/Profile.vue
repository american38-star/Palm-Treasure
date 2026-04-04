<template>
  <div class="profile-page">
    <div v-if="loading" class="loading-container">
      <div class="gold-spinner"></div>
      <p class="loading-text">جاري تحميل بيانات الحساب...</p>
    </div>

    <div v-else class="profile-container">
      <!-- رأس الصفحة - صورة المستخدم -->
      <div class="profile-header">
        <div class="avatar-box">
          <div class="avatar-circle">
            {{ userData.username ? userData.username.charAt(0).toUpperCase() : 'U' }}
          </div>
          <div class="vip-tag" v-if="userData.vipLevel">
            <i class="fas fa-crown"></i> VIP {{ userData.vipLevel }}
          </div>
        </div>
        <h2 class="username-display">{{ userData.username || "المستخدم" }}</h2>
      </div>

      <!-- قسم البيانات الأساسية (نظام الحقول الذهبية) -->
      <div class="fields-section">
        <h3 class="section-label"><i class="fas fa-user-circle"></i> معلومات الحساب</h3>
        
        <!-- حقل معرف المستخدم -->
        <div class="gold-field">
          <label><i class="fas fa-id-badge"></i> معرف المستخدم (ID)</label>
          <div class="field-input-group">
            <input type="text" :value="userData.uid" readonly class="gold-input-field">
            <button class="field-action-btn" @click="copy(userData.uid)">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>

        <!-- حقل البريد الإلكتروني -->
        <div class="gold-field">
          <label><i class="fas fa-envelope"></i> البريد الإلكتروني</label>
          <div class="field-input-group">
            <input type="text" :value="userData.email || 'غير مسجل'" readonly class="gold-input-field">
            <button class="field-action-btn" @click="copy(userData.email)" v-if="userData.email">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>

        <!-- حقل رقم الهاتف -->
        <div class="gold-field">
          <label><i class="fas fa-phone-alt"></i> رقم الهاتف</label>
          <div class="field-input-group">
            <input type="text" :value="userData.phoneNumber || 'لم يتم الربط بعد'" readonly class="gold-input-field">
            <button class="field-action-btn link-btn" @click="openPhoneModal">
              <i class="fas fa-link"></i> {{ userData.phoneNumber ? 'تحديث' : 'ربط الآن' }}
            </button>
          </div>
        </div>

        <!-- حقل كود الإحالة -->
        <div class="gold-field" v-if="userData.referralCode">
          <label><i class="fas fa-share-nodes"></i> كود الإحالة الخاص بك</label>
          <div class="field-input-group">
            <input type="text" :value="userData.referralCode" readonly class="gold-input-field highlight-gold">
            <button class="field-action-btn" @click="copy(userData.referralCode)">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- قسم الرصيد والإحصائيات (نظام الحقول الذهبية) -->
      <div class="fields-section">
        <h3 class="section-label"><i class="fas fa-chart-line"></i> الرصيد والإحصائيات</h3>
        
        <!-- حقل الرصيد الحالي -->
        <div class="gold-field balance-field">
          <label><i class="fas fa-wallet"></i> الرصيد المتاح (USDT)</label>
          <div class="field-input-group">
            <input type="text" :value="userData.balance.toFixed(2)" readonly class="gold-input-field balance-text">
            <span class="currency-tag">USDT</span>
          </div>
        </div>

        <div class="stats-row">
          <!-- حقل مستوى VIP -->
          <div class="gold-field half">
            <label><i class="fas fa-crown"></i> مستوى VIP</label>
            <input type="text" :value="'VIP ' + userData.vipLevel" readonly class="gold-input-field center-text">
          </div>

          <!-- حقل الإحالات -->
          <div class="gold-field half">
            <label><i class="fas fa-users"></i> إجمالي الإحالات</label>
            <input type="text" :value="userData.totalReferrals" readonly class="gold-input-field center-text">
          </div>
        </div>

        <!-- حقل تاريخ التسجيل -->
        <div class="gold-field">
          <label><i class="fas fa-calendar-day"></i> تاريخ الانضمام</label>
          <input type="text" :value="formattedDate" readonly class="gold-input-field">
        </div>
      </div>

      <!-- أزرار التحكم -->
      <div class="action-buttons">
        <button class="main-gold-btn" @click="openChangePasswordModal">
          <i class="fas fa-key"></i> تغيير كلمة المرور
        </button>
        
        <button class="outline-gold-btn" @click="copyReferralLink" v-if="userData.referralCode">
          <i class="fas fa-link"></i> نسخ رابط الدعوة
        </button>

        <button class="danger-btn" @click="logout">
          <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
        </button>
      </div>
    </div>

    <!-- نافذة ربط الهاتف (تصميم ذهبي وأسود) -->
    <div v-if="showPhoneModal" class="gold-modal-overlay" @click.self="closePhoneModal">
      <div class="gold-modal">
        <div class="modal-head">
          <h3><i class="fas fa-mobile-screen-button"></i> ربط رقم الهاتف</h3>
          <button @click="closePhoneModal" class="close-x">×</button>
        </div>
        <div class="modal-body">
          <div class="gold-field">
            <label>رقم الهاتف الجديد</label>
            <div class="phone-input-box">
              <span class="prefix">+966</span>
              <input type="tel" v-model="phoneForm.phone" placeholder="5xxxxxxxx" class="gold-input-field">
            </div>
          </div>
          <div class="gold-field">
            <label>كلمة المرور للتأكيد</label>
            <input type="password" v-model="phoneForm.password" placeholder="أدخل كلمة المرور" class="gold-input-field">
          </div>
          <p v-if="phoneError" class="error-txt">{{ phoneError }}</p>
          <p v-if="phoneSuccess" class="success-txt">{{ phoneSuccess }}</p>
          <button class="main-gold-btn" @click="updatePhoneNumber" :disabled="phoneLoading">
            {{ phoneLoading ? 'جاري المعالجة...' : 'تأكيد الربط' }}
          </button>
        </div>
      </div>
    </div>

    <!-- نافذة تغيير كلمة المرور (تصميم ذهبي وأسود) -->
    <div v-if="showChangePasswordModal" class="gold-modal-overlay" @click.self="closeChangePasswordModal">
      <div class="gold-modal">
        <div class="modal-head">
          <h3><i class="fas fa-key"></i> تغيير كلمة المرور</h3>
          <button @click="closeChangePasswordModal" class="close-x">×</button>
        </div>
        <div class="modal-body">
          <div class="gold-field">
            <label>كلمة المرور الحالية</label>
            <input type="password" v-model="passwordForm.currentPassword" class="gold-input-field">
          </div>
          <div class="gold-field">
            <label>كلمة المرور الجديدة</label>
            <input type="password" v-model="passwordForm.newPassword" class="gold-input-field">
          </div>
          <div class="gold-field">
            <label>تأكيد كلمة المرور</label>
            <input type="password" v-model="passwordForm.confirmPassword" class="gold-input-field">
          </div>
          <p v-if="passwordError" class="error-txt">{{ passwordError }}</p>
          <p v-if="passwordSuccess" class="success-txt">{{ passwordSuccess }}</p>
          <button class="main-gold-btn" @click="updatePassword" :disabled="passwordLoading">
            {{ passwordLoading ? 'جاري التحديث...' : 'حفظ التغييرات' }}
          </button>
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
      passwordForm: { currentPassword: "", newPassword: "", confirmPassword: "" },
      phoneForm: { phone: "", password: "" },
      userData: { email: "", phoneNumber: "", uid: "", createdAt: "", balance: 0, username: "", referralCode: "", vipLevel: 0, totalReferrals: 0 }
    };
  },
  computed: {
    formattedDate() {
      if (!this.userData.createdAt) return "غير متوفر";
      let date = this.userData.createdAt.toDate ? this.userData.createdAt.toDate() : new Date(this.userData.createdAt);
      return isNaN(date.getTime()) ? "غير متوفر" : date.toLocaleDateString("ar-EG", { year: 'numeric', month: 'long', day: 'numeric' });
    },
    referralLink() { return `${window.location.origin}/register?ref=${this.userData.referralCode}`; }
  },
  created() { this.loadUserData(); },
  methods: {
    async loadUserData() {
      onAuthStateChanged(auth, async (user) => {
        if (!user) { this.loading = false; this.$router.push("/login"); return; }
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
          }
        } catch (err) { console.error(err); }
        this.loading = false;
      });
    },
    copy(text) { if (!text) return; navigator.clipboard.writeText(text); alert("تم النسخ بنجاح ✓"); },
    copyReferralLink() { this.copy(this.referralLink); },
    openChangePasswordModal() { this.showChangePasswordModal = true; this.passwordError = ""; this.passwordSuccess = ""; },
    closeChangePasswordModal() { this.showChangePasswordModal = false; },
    async updatePassword() {
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) { this.passwordError = "كلمات المرور غير متطابقة"; return; }
      this.passwordLoading = true;
      try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, this.passwordForm.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, this.passwordForm.newPassword);
        this.passwordSuccess = "تم التحديث بنجاح ✓";
        setTimeout(() => this.closeChangePasswordModal(), 2000);
      } catch (e) { this.passwordError = e.message; }
      this.passwordLoading = false;
    },
    openPhoneModal() { this.showPhoneModal = true; this.phoneError = ""; this.phoneSuccess = ""; },
    closePhoneModal() { this.showPhoneModal = false; },
    async updatePhoneNumber() {
      if (!/^\d{9}$/.test(this.phoneForm.phone)) { this.phoneError = "رقم الهاتف يجب أن يكون 9 أرقام"; return; }
      this.phoneLoading = true;
      try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, this.phoneForm.password);
        await reauthenticateWithCredential(user, credential);
        const fullPhone = "+966" + this.phoneForm.phone;
        await updateDoc(doc(db, "users", user.uid), { phoneNumber: fullPhone });
        this.userData.phoneNumber = fullPhone;
        this.phoneSuccess = "تم الربط بنجاح ✓";
        setTimeout(() => this.closePhoneModal(), 2000);
      } catch (e) { this.phoneError = e.message; }
      this.phoneLoading = false;
    },
    async logout() { await signOut(auth); this.$router.push("/login"); }
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #000000;
  color: #ffffff;
  padding: 20px;
  padding-top: 60px;
  padding-bottom: 100px;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
}

.profile-container {
  max-width: 500px;
  margin: 0 auto;
}

/* رأس الصفحة */
.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-box {
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  background-color: #111111;
  border: 3px solid #D4AF37;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
  color: #D4AF37;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
}

.vip-tag {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: #D4AF37;
  color: #000000;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  border: 2px solid #000000;
}

.username-display {
  font-size: 22px;
  color: #D4AF37;
  font-weight: 700;
}

/* نظام الحقول الذهبية */
.fields-section {
  margin-bottom: 25px;
}

.section-label {
  font-size: 16px;
  color: #D4AF37;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-right: 4px solid #D4AF37;
  padding-right: 10px;
}

.gold-field {
  margin-bottom: 18px;
}

.gold-field label {
  display: block;
  font-size: 13px;
  color: #888888;
  margin-bottom: 6px;
  margin-right: 5px;
}

.field-input-group {
  display: flex;
  gap: 8px;
}

.gold-input-field {
  flex: 1;
  background-color: #111111;
  border: 1px solid #333333;
  border-radius: 12px;
  padding: 12px 15px;
  color: #ffffff;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
}

.gold-input-field:focus {
  border-color: #D4AF37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.1);
}

.highlight-gold {
  color: #D4AF37;
  font-weight: bold;
}

.field-action-btn {
  background-color: #111111;
  border: 1px solid #D4AF37;
  color: #D4AF37;
  padding: 0 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.field-action-btn:hover {
  background-color: #D4AF37;
  color: #000000;
}

.link-btn {
  min-width: 100px;
  justify-content: center;
}

/* الرصيد */
.balance-field .gold-input-field {
  border-color: #D4AF37;
  background-color: rgba(212, 175, 55, 0.05);
}

.balance-text {
  font-size: 24px !important;
  font-weight: 900 !important;
  color: #D4AF37 !important;
  text-align: center;
}

.currency-tag {
  background-color: #D4AF37;
  color: #000000;
  padding: 0 15px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  font-weight: 800;
}

.stats-row {
  display: flex;
  gap: 15px;
}

.half {
  flex: 1;
}

.center-text {
  text-align: center;
  font-weight: bold;
}

/* الأزرار */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 30px;
}

.main-gold-btn {
  background-color: #D4AF37;
  color: #000000;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.main-gold-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

.outline-gold-btn {
  background-color: transparent;
  border: 1px solid #D4AF37;
  color: #D4AF37;
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.danger-btn {
  background-color: transparent;
  border: 1px solid #ff4444;
  color: #ff4444;
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
}

/* النوافذ */
.gold-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}

.gold-modal {
  background: #000000;
  border: 2px solid #D4AF37;
  border-radius: 20px;
  width: 100%; max-width: 400px;
  padding: 25px;
}

.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; color: #D4AF37;
}

.close-x {
  background: none; border: none; color: #D4AF37; font-size: 30px; cursor: pointer;
}

.phone-input-box {
  display: flex; gap: 10px;
}

.prefix {
  background: #111111; border: 1px solid #333333; border-radius: 12px;
  padding: 12px; color: #D4AF37; font-weight: bold;
}

.error-txt { color: #ff4444; font-size: 13px; margin-bottom: 10px; text-align: center; }
.success-txt { color: #44ff44; font-size: 13px; margin-bottom: 10px; text-align: center; }

.loading-container { text-align: center; padding: 100px 0; }
.gold-spinner {
  width: 50px; height: 50px; border: 3px solid rgba(212, 175, 55, 0.1);
  border-top-color: #D4AF37; border-radius: 50%; animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
