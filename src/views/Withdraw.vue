<template>
  <div class="withdraw-page">
    <div class="card">
      <div class="card-header">
        <h2 class="title">
          <i class="fas fa-hand-holding-usd"></i>
          سحب الأرباح
          <span class="title-glow">USDT</span>
        </h2>
        <p class="sub">قم بإدخال معلومات السحب الخاصة بك</p>
      </div>

      <!-- رصيد المستخدم -->
      <div class="balance-box">
        <div class="balance-info">
          <span class="balance-label">رصيدك الحالي</span>
          <div class="balance-display">
            <span class="balance-amount">{{ balance.toFixed(2) }}</span>
            <span class="balance-currency-badge">USDT</span>
          </div>
        </div>
      </div>

      <!-- حالة VIP -->
      <div v-if="userVipLevel" class="vip-status-box">
        <div class="vip-badge">
          <i class="fas fa-crown"></i>
          مستوى VIP {{ userVipLevel }}
        </div>
        <div class="user-contact">
          <i class="fas fa-phone" v-if="userPhone"></i>
          <i class="fas fa-envelope" v-else></i>
          {{ userContact }}
        </div>
        <div class="withdraw-condition">
          <i class="fas fa-check-circle" :class="{ 'condition-met': balance >= minWithdrawAmount }"></i>
          <span>الحد الأدنى: <strong>{{ minWithdrawAmount }} USDT</strong></span>
        </div>
        <div class="withdraw-condition">
          <i class="fas fa-check-circle" :class="{ 'condition-met': isAllowedDay }"></i>
          <span>يوم السحب: <strong>{{ withdrawDay }}</strong></span>
        </div>
      </div>

      <div v-else class="vip-status-box error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>يجب أن يكون لديك اشتراك VIP للسحب</p>
      </div>

      <!-- رسائل الخطأ والنجاح -->
      <transition name="fade">
        <div v-if="message" class="message" :class="messageType">
          <i :class="messageType === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i>
          {{ message }}
        </div>
      </transition>

      <!-- مبلغ السحب -->
      <div class="input-group">
        <label>
          <i class="fas fa-coins"></i>
          المبلغ
        </label>
        <div class="amount-input-wrapper">
          <input 
            type="number" 
            v-model.number="amount" 
            placeholder="0.00" 
            class="gold-input"
            @input="validateAmount"
          />
          <span class="input-currency-badge">USDT</span>
        </div>
        <span v-if="amountError" class="input-error">{{ amountError }}</span>
      </div>

      <!-- الشبكة -->
      <div class="input-group">
        <label>
          <i class="fas fa-network-wired"></i>
          الشبكة
        </label>
        <div class="network-selector">
          <div class="select-wrapper">
            <select v-model="network" class="gold-select" @change="validateNetwork">
              <option value="">اختر الشبكة</option>
              <option value="TRC20">TRC20 - Tron</option>
              <option value="ERC20">ERC20 - Ethereum</option>
              <option value="BEP20">BEP20 - BNB Chain</option>
              <option value="SOL">SOL - Solana</option>
            </select>
            <i class="fas fa-chevron-down select-arrow"></i>
          </div>
          <div v-if="network" class="network-icon-display">
            <img :src="getNetworkIcon(network)" :alt="network" class="network-icon">
          </div>
        </div>
        <span v-if="networkError" class="input-error">{{ networkError }}</span>
      </div>

      <!-- عنوان المحفظة -->
      <div class="input-group">
        <label>
          <i class="fas fa-qrcode"></i>
          عنوان المحفظة
        </label>
        <input 
          type="text" 
          v-model="wallet" 
          placeholder="أدخل عنوان محفظتك USDT" 
          class="gold-input"
          @input="validateWallet"
        />
        <span v-if="walletError" class="input-error">{{ walletError }}</span>
      </div>

      <!-- ملخص الطلب -->
      <div v-if="showSummary" class="summary-box">
        <h3>📋 ملخص طلب السحب</h3>
        
        <div class="summary-item">
          <span>معلومات الاتصال:</span>
          <span class="summary-value">{{ userContact }}</span>
        </div>
        
        <div class="summary-item">
          <span>مستوى VIP:</span>
          <span class="summary-value">{{ userVipLevel || 'لا يوجد' }}</span>
        </div>
        
        <div class="summary-item">
          <span>المبلغ:</span>
          <span class="summary-value">{{ Number(amount).toFixed(2) }} USDT</span>
        </div>
        
        <div class="summary-item">
          <span>الشبكة:</span>
          <span class="summary-value">{{ network }}</span>
        </div>
        
        <div class="summary-item">
          <span>عنوان المحفظة:</span>
          <span class="summary-value address">{{ wallet.substring(0, 10) }}...{{ wallet.substring(wallet.length - 10) }}</span>
        </div>
        
        <div class="summary-item">
          <span>يوم السحب:</span>
          <span class="summary-value">{{ withdrawDay }}</span>
        </div>
        
        <div class="summary-item">
          <span>الحد الأدنى:</span>
          <span class="summary-value">{{ minWithdrawAmount }} USDT</span>
        </div>
        
        <div class="summary-item total">
          <span>سيتم خصم:</span>
          <span class="summary-value">{{ Number(amount).toFixed(2) }} USDT</span>
        </div>
        
        <div class="summary-item">
          <span>الرصيد بعد السحب:</span>
          <span class="summary-value">{{ (balance - Number(amount)).toFixed(2) }} USDT</span>
        </div>
      </div>

      <!-- تحذيرات -->
      <div class="warning-box">
        <i class="fas fa-shield-alt"></i>
        <div class="warning-text">
          <p>يرجى التأكد من صحة المعلومات قبل الإرسال</p>
          <p class="small">سيتم خصم المبلغ من رصيدك فوراً عند تقديم الطلب</p>
        </div>
      </div>

      <!-- زر السحب -->
      <button 
        class="gold-button" 
        @click="submitWithdraw"
        :disabled="isLoading || !isFormValid"
      >
        <i class="fas fa-paper-plane" v-if="!isLoading"></i>
        <i class="fas fa-spinner fa-spin" v-else></i>
        {{ isLoading ? 'جاري المعالجة...' : 'تأكيد السحب' }}
      </button>
    </div>
  </div>
</template>

<script>
import { auth, db } from "../firebase";
import { doc, getDoc, runTransaction, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default {
  name: "Withdraw",
  
  data() {
    return {
      balance: 0,
      amount: "",
      network: "",
      wallet: "",
      isLoading: false,
      message: "",
      messageType: "info",
      userVipLevel: null,
      userPhone: "",
      userEmail: "",
      minWithdrawAmount: 5,
      
      // أخطاء الحقول
      amountError: "",
      networkError: "",
      walletError: "",
      
      vipLimits: {
        1: 5, 2: 25, 3: 50, 4: 160, 5: 530,
        6: 820, 7: 1120, 8: 2400, 9: 5300, 10: 11300,
        11: 26000, 12: 56000, 13: 120000, 14: 260000
      },
      
      withdrawDays: {
        1: "السبت", 2: "السبت", 3: "الأحد", 4: "الأحد",
        5: "الاثنين", 6: "الاثنين", 7: "الثلاثاء", 8: "الثلاثاء",
        9: "الأربعاء", 10: "الأربعاء", 11: "الخميس", 12: "الخميس",
        13: "الجمعة", 14: "الجمعة"
      }
    };
  },

  computed: {
    withdrawDay() {
      return this.withdrawDays[this.userVipLevel] || "";
    },

    isAllowedDay() {
      if (!this.userVipLevel) return false;
      
      const dayMap = {
        "السبت": "Saturday",
        "الأحد": "Sunday",
        "الاثنين": "Monday",
        "الثلاثاء": "Tuesday",
        "الأربعاء": "Wednesday",
        "الخميس": "Thursday",
        "الجمعة": "Friday"
      };
      
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const allowedDay = this.withdrawDays[this.userVipLevel];
      
      return today === dayMap[allowedDay];
    },

    isFormValid() {
      return (
        this.amount && 
        !this.amountError &&
        this.network && 
        !this.networkError &&
        this.wallet && 
        !this.walletError &&
        this.userVipLevel &&
        this.isAllowedDay &&
        Number(this.amount) === this.minWithdrawAmount &&
        this.balance >= this.minWithdrawAmount
      );
    },

    showSummary() {
      return this.amount && this.network && this.wallet && this.userVipLevel;
    },

    userContact() {
      if (this.userPhone) {
        return this.userPhone;
      } else if (this.userEmail) {
        return this.userEmail;
      } else {
        return "لا يوجد";
      }
    }
  },

  watch: {
    amount() {
      this.validateAmount();
    },
    network() {
      this.validateNetwork();
    },
    wallet() {
      this.validateWallet();
    },
    userVipLevel() {
      if (this.userVipLevel) {
        this.minWithdrawAmount = this.vipLimits[this.userVipLevel] || 5;
      }
    }
  },

  async created() {
    await this.loadUserData();
  },

  methods: {
    async loadUserData() {
      const user = auth.currentUser;
      if (!user) {
        this.$router.push("/login");
        return;
      }

      try {
        // تحميل بيانات المستخدم من Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          this.balance = userData.balance || 0;
          this.userPhone = userData.phoneNumber || "";
          this.userEmail = userData.email || "";
        }

        // تحميل مستوى VIP
        const vipRef = doc(db, "users", user.uid, "vip", "current");
        const vipSnap = await getDoc(vipRef);
        
        if (vipSnap.exists()) {
          this.userVipLevel = vipSnap.data().level;
        } else {
          this.showMessage("لا يوجد اشتراك VIP نشط", "error");
        }
      } catch (error) {
        console.error("خطأ:", error);
        this.showMessage("حدث خطأ في تحميل البيانات", "error");
      }
    },

    validateAmount() {
      if (!this.amount) {
        this.amountError = "الرجاء إدخال المبلغ";
      } else if (this.amount < this.minWithdrawAmount) {
        this.amountError = `الحد الأدنى للسحب هو ${this.minWithdrawAmount} USDT`;
      } else if (this.amount > this.balance) {
        this.amountError = "المبلغ أكبر من رصيدك";
      } else {
        this.amountError = "";
      }
    },

    validateNetwork() {
      if (!this.network) {
        this.networkError = "الرجاء اختيار الشبكة";
      } else {
        this.networkError = "";
      }
    },

    validateWallet() {
      if (!this.wallet) {
        this.walletError = "الرجاء إدخال عنوان محفظتك";
      } else if (this.wallet.length < 20) {
        this.walletError = "عنوان المحفظة قصير جداً";
      } else {
        this.walletError = "";
      }
    },

    getNetworkIcon(network) {
      const icons = {
        'TRC20': 'https://cryptologos.cc/logos/tron-trx-logo.png',
        'ERC20': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        'BEP20': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
        'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png'
      };
      return icons[network] || '';
    },

    showMessage(msg, type = "info") {
      this.message = msg;
      this.messageType = type;
      setTimeout(() => {
        this.message = "";
      }, 5000);
    },

    async submitWithdraw() {
      if (!this.isFormValid) {
        this.showMessage("يرجى ملء جميع الحقول بشكل صحيح", "error");
        return;
      }

      this.isLoading = true;

      try {
        const user = auth.currentUser;
        if (!user) {
          this.showMessage("يجب تسجيل الدخول أولاً", "error");
          this.isLoading = false;
          return;
        }

        // تنفيذ العملية في Firestore
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await transaction.get(userRef);

          if (!userSnap.exists()) {
            throw new Error("المستخدم غير موجود");
          }

          const currentBalance = userSnap.data().balance || 0;

          if (currentBalance < this.amount) {
            throw new Error("الرصيد غير كافي");
          }

          // تحديث الرصيد
          transaction.update(userRef, {
            balance: currentBalance - this.amount
          });

          // إضافة سجل الطلب
          const withdrawalsRef = collection(db, "users", user.uid, "withdrawals");
          await addDoc(withdrawalsRef, {
            amount: this.amount,
            network: this.network,
            wallet: this.wallet,
            status: "pending",
            createdAt: serverTimestamp()
          });

          // إضافة في جدول المعاملات العام
          const transactionsRef = collection(db, "transactions");
          await addDoc(transactionsRef, {
            userId: user.uid,
            type: "withdrawal",
            amount: this.amount,
            network: this.network,
            wallet: this.wallet,
            status: "pending",
            createdAt: serverTimestamp()
          });
        });

        this.showMessage("تم تقديم طلب السحب بنجاح", "success");
        setTimeout(() => {
          this.$router.push("/");
        }, 2000);
      } catch (error) {
        console.error("خطأ:", error);
        this.showMessage(error.message || "حدث خطأ في تقديم الطلب", "error");
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.withdraw-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  padding-bottom: 100px;
}

.card {
  background: linear-gradient(135deg, #1e2329 0%, #181a20 100%);
  border-radius: 24px;
  padding: 28px;
  border: 1px solid rgba(212, 175, 55, 0.15);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  max-width: 500px;
  width: 100%;
}

.card-header {
  margin-bottom: 28px;
  text-align: center;
}

.title {
  font-size: 28px;
  font-weight: 800;
  color: #eaecef;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-glow {
  color: #fcd535;
  font-size: 20px;
  background: rgba(212, 175, 55, 0.15);
  padding: 4px 12px;
  border-radius: 8px;
}

.sub {
  color: #848e9c;
  font-size: 14px;
  margin: 0;
}

/* صندوق الرصيد */
.balance-box {
  background: rgba(212, 175, 55, 0.08);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.08);
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-label {
  font-size: 12px;
  color: #848e9c;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.balance-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.balance-amount {
  font-size: 24px;
  font-weight: 900;
  color: #fcd535;
  font-family: 'Courier New', monospace;
  letter-spacing: -0.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.balance-currency-badge {
  font-size: 11px;
  color: #fcd535;
  font-weight: 700;
  background: rgba(212, 175, 55, 0.15);
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

/* حالة VIP */
.vip-status-box {
  background: rgba(212, 175, 55, 0.08);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vip-status-box.error {
  background: rgba(220, 38, 38, 0.08);
  border-color: rgba(220, 38, 38, 0.2);
  color: #dc2626;
}

.vip-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #fcd535;
  font-size: 14px;
}

.user-contact {
  font-size: 13px;
  color: #eaecef;
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-contact i {
  color: #fcd535;
}

.withdraw-condition {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #eaecef;
}

.withdraw-condition i {
  color: #dc2626;
  font-size: 14px;
}

.withdraw-condition i.condition-met {
  color: #10b981;
}

/* رسائل */
.message {
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  animation: slideIn 0.3s ease;
}

.message.error {
  background: rgba(220, 38, 38, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.message.success {
  background: rgba(16, 185, 129, 0.15);
  color: #86efac;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* مجموعات الإدخال */
.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #eaecef;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.input-group label i {
  color: #fcd535;
  font-size: 14px;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(212, 175, 55, 0.05);
  border-radius: 12px;
  padding: 4px 8px;
  border: 1px solid rgba(212, 175, 55, 0.15);
}

.gold-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #eaecef;
  padding: 10px 8px;
  font-size: 14px;
  outline: none;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gold-input::placeholder {
  color: #5a6370;
}

.input-currency {
  color: #fcd535;
  font-weight: 700;
  font-size: 12px;
  padding-right: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-currency-badge {
  color: #fcd535;
  font-weight: 700;
  font-size: 10px;
  background: rgba(212, 175, 55, 0.1);
  padding: 4px 6px;
  border-radius: 5px;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.input-error {
  display: block;
  color: #fca5a5;
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
}

/* محدد الشبكة */
.network-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.select-wrapper {
  flex: 1;
  position: relative;
  background: rgba(212, 175, 55, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.15);
  overflow: hidden;
}

.gold-select {
  width: 100%;
  background: transparent;
  border: none;
  color: #eaecef;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
  font-weight: 600;
  cursor: pointer;
  appearance: none;
  padding-right: 40px;
}

.gold-select option {
  background: #1e2329;
  color: #eaecef;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #fcd535;
  pointer-events: none;
  font-size: 12px;
}

.network-icon-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%);
  border-radius: 14px;
  border: 1.5px solid rgba(212, 175, 55, 0.25);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.1);
}

.network-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* صندوق الملخص */
.summary-box {
  background: rgba(212, 175, 55, 0.08);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  margin-bottom: 20px;
}

.summary-box h3 {
  font-size: 14px;
  font-weight: 700;
  color: #fcd535;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 12px;
  color: #eaecef;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  font-weight: 700;
  color: #fcd535;
  padding-top: 12px;
  padding-bottom: 12px;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.summary-value {
  color: #fcd535;
  font-weight: 600;
  word-break: break-word;
  max-width: 200px;
  text-align: right;
}

.summary-value.address {
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

/* صندوق التحذير */
.warning-box {
  background: rgba(217, 119, 6, 0.1);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(217, 119, 6, 0.2);
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.warning-box i {
  color: #d97706;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.warning-text p {
  margin: 0;
  font-size: 12px;
  color: #eaecef;
  font-weight: 500;
}

.warning-text p.small {
  color: #848e9c;
  font-size: 11px;
}

/* الزر */
.gold-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #fcd535 0%, #d4af37 100%);
  color: #0f1419;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gold-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

.gold-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* الانتقالات */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
