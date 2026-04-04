<template>
  <div class="recharge-page">
    <!-- Header -->
    <div class="top-nav">
      <div class="nav-left" @click="$router.back()">
        <i class="fas fa-arrow-right"></i>
      </div>
      <div class="nav-center">إيداع USDT</div>
      <div class="nav-right" @click="$router.push('/transactions')">
        <i class="fas fa-history"></i>
      </div>
    </div>

    <div class="main-content">
      <!-- Asset Display -->
      <div class="asset-card">
        <div class="asset-main">
          <div class="coin-logo-fa">
            <i class="fab fa-ethereum" style="color: #26a17b;"></i>
          </div>
          <div class="asset-text">
            <span class="coin-symbol">USDT</span>
            <span class="coin-name">TetherUS</span>
          </div>
        </div>
        <div class="balance-info">
          <span class="label">الرصيد الحالي</span>
          <span class="value">0.00 USDT</span>
        </div>
      </div>

      <!-- Network Selector Dropdown -->
      <div class="input-section">
        <label class="section-label">الشبكة</label>
        <div class="dropdown-container" @click="toggleDropdown" v-click-outside="closeDropdown">
          <div class="dropdown-selected" :class="{ 'is-open': isDropdownOpen }">
            <div class="selected-info">
              <i :class="getNetworkIconClass(network)" class="net-icon-fa"></i>
              <span class="net-name">{{ network }}</span>
            </div>
            <i class="fas fa-chevron-down arrow-icon"></i>
          </div>
          
          <transition name="slide-fade">
            <div v-if="isDropdownOpen" class="dropdown-list">
              <div 
                v-for="(addr, net) in addresses" 
                :key="net" 
                class="dropdown-item"
                :class="{ 'active': network === net }"
                @click.stop="selectNetwork(net)"
              >
                <div class="item-left">
                  <i :class="getNetworkIconClass(net)" class="net-icon-fa"></i>
                  <div class="item-text">
                    <span class="net-title">{{ net }}</span>
                    <span class="net-desc">{{ getNetworkDesc(net) }}</span>
                  </div>
                </div>
                <i v-if="network === net" class="fas fa-check"></i>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Deposit Details Card -->
      <div class="deposit-card">
        <div class="qr-section">
          <div class="qr-frame">
            <img :src="getQr(network)" :alt="network" class="qr-code">
            <div v-if="loading" class="qr-loader">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
          </div>
          <p class="qr-tip">حفظ رمز QR</p>
        </div>

        <div class="address-section">
          <div class="label-row">
            <span class="addr-label">عنوان الإيداع</span>
            <span class="network-tag">{{ network }}</span>
          </div>
          <div class="address-display">
            <div class="address-text">{{ getAddress(network) }}</div>
            <button class="copy-icon-btn" @click="copyAddress">
              <i :class="copied ? 'fas fa-check' : 'far fa-copy'"></i>
            </button>
          </div>
          <transition name="fade">
            <div v-if="copied" class="copy-toast">تم النسخ بنجاح</div>
          </transition>
        </div>
      </div>

      <!-- Form Inputs -->
      <div class="form-section">
        <div class="input-group">
          <label>المبلغ</label>
          <div class="input-field">
            <input type="number" v-model.number="amount" placeholder="الحد الأدنى 10">
            <span class="suffix">USDT</span>
          </div>
        </div>

        <div class="input-group">
          <label>معرف العملية (TxID)</label>
          <div class="input-field">
            <input type="text" v-model="txid" placeholder="أدخل Hash العملية">
          </div>
        </div>

        <button class="main-btn" @click="submit" :disabled="loading">
          <span v-if="!loading">تأكيد الإيداع</span>
          <i v-else class="fas fa-circle-notch fa-spin"></i>
        </button>

        <transition name="fade">
          <div v-if="message" :class="['alert', messageType]">
            <i :class="messageType === 'error' ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
            {{ message }}
          </div>
        </transition>
      </div>

      <!-- Instructions -->
      <div class="tips-box">
        <div class="tips-header">
          <i class="fas fa-lightbulb"></i>
          <span>نصائح هامة</span>
        </div>
        <ul class="tips-list">
          <li>يرجى التأكد من اختيار شبكة <strong>{{ network }}</strong> عند التحويل.</li>
          <li>سيتم إضافة الرصيد تلقائياً بعد تأكيد الشبكة.</li>
          <li>لا تقم بإيداع أي عملات أخرى غير USDT لهذا العنوان.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default {
  name: "Recharge",
  directives: {
    'click-outside': {
      beforeMount(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      }
    }
  },
  data() {
    return {
      network: "TRC20",
      isDropdownOpen: false,
      amount: null,
      txid: "",
      copied: false,
      loading: false,
      message: "",
      messageType: "info",
      addresses: {
        TRC20: "TC9YKMxacLkvJLA6JbQVGofnjumTqkaUjD",
        ERC20: "0x17e488f699CC96E4dd05e4E2c869789534E2F634",
        BEP20: "0x17e488f699CC96E4dd05e4E2c869789534E2F634",
        SOL: "GgVi3xNRUQeJrNqt8Hg3eBJx5B8yuyggjNvvHxxKVnTR",
      },
      userEmail: "",
      userId: "",
    };
  },
  mounted() {
    this.initializeUser();
  },
  methods: {
    initializeUser() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        this.userEmail = user.email;
        this.userId = user.uid;
      }
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    closeDropdown() {
      this.isDropdownOpen = false;
    },
    selectNetwork(net) {
      this.network = net;
      this.isDropdownOpen = false;
    },
    getQr(net) {
      return `/qr/${net}.png`;
    },
    getAddress(net) {
      return this.addresses[net] || "";
    },
    getNetworkIconClass(net) {
      const icons = {
        TRC20: "fab fa-vimeo-v", // Tron-like icon
        ERC20: "fab fa-ethereum",
        BEP20: "fas fa-coins", // BNB-like icon
        SOL: "fas fa-bolt" // Solana-like icon
      };
      return icons[net] || "fas fa-circle";
    },
    getNetworkDesc(net) {
      const descs = {
        TRC20: "Tron Network (TRX)",
        ERC20: "Ethereum Network (ETH)",
        BEP20: "BNB Smart Chain (BSC)",
        SOL: "Solana Network"
      };
      return descs[net] || "";
    },
    handleImageError(e) {
      e.target.style.display = 'none';
    },
    async copyAddress() {
      const text = this.getAddress(this.network);
      try {
        await navigator.clipboard.writeText(text);
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      } catch (err) {
        console.error("Copy failed");
      }
    },
    async submit() {
      if (!this.amount || this.amount < 10) {
        this.message = "الحد الأدنى للإيداع 10 USDT";
        this.messageType = "error";
        return;
      }
      if (!this.txid) {
        this.message = "يرجى إدخال TxID";
        this.messageType = "error";
        return;
      }
      this.loading = true;
      try {
        await addDoc(collection(db, "payments"), {
          userId: this.userId,
          email: this.userEmail,
          amount: this.amount,
          txid: this.txid,
          network: this.network,
          status: "pending",
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, "transactions"), {
          userId: this.userId,
          email: this.userEmail,
          type: "recharge",
          amount: this.amount,
          network: this.network,
          txid: this.txid,
          status: "pending",
          createdAt: serverTimestamp(),
        });
        this.message = "تم إرسال الطلب بنجاح";
        this.messageType = "success";
        this.amount = null;
        this.txid = "";
      } catch (e) {
        this.message = "حدث خطأ في الإرسال";
        this.messageType = "error";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.recharge-page {
  min-height: 100vh;
  background: #0b0e11;
  color: #eaecef;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
}

/* Top Nav */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #181a20;
  border-bottom: 1px solid #2b2f36;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-center {
  font-size: 18px;
  font-weight: 700;
}

.nav-left, .nav-right {
  font-size: 20px;
  cursor: pointer;
  color: #848e9c;
}

.main-content {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

/* Asset Card */
.asset-card {
  background: #1e2329;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.asset-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.coin-logo-fa {
  width: 40px;
  height: 40px;
  background: rgba(38, 161, 123, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.net-icon-fa {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.fa-ethereum { color: #627eea; }
.fa-vimeo-v { color: #ff0013; } /* Tron Red */
.fa-coins { color: #f3ba2f; } /* BNB Gold */
.fa-bolt { color: #14f195; } /* Solana Green */

.coin-symbol {
  display: block;
  font-size: 18px;
  font-weight: 700;
}

.coin-name {
  font-size: 12px;
  color: #848e9c;
}

.balance-info {
  text-align: left;
}

.balance-info .label {
  display: block;
  font-size: 12px;
  color: #848e9c;
}

.balance-info .value {
  font-weight: 700;
  color: #fcd535;
}

/* Dropdown */
.input-section {
  margin-bottom: 20px;
}

.section-label {
  display: block;
  font-size: 14px;
  color: #848e9c;
  margin-bottom: 8px;
}

.dropdown-container {
  position: relative;
  cursor: pointer;
}

.dropdown-selected {
  background: #2b2f36;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.dropdown-selected.is-open {
  border-color: #fcd535;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.net-icon {
  width: 24px;
  height: 24px;
}

.net-name {
  font-weight: 600;
}

.dropdown-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #2b2f36;
  border-radius: 12px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid #3b3f46;
}

.dropdown-item {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #3b3f46;
}

.dropdown-item.active {
  background: rgba(252, 213, 53, 0.1);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.net-title {
  display: block;
  font-weight: 600;
}

.net-desc {
  font-size: 11px;
  color: #848e9c;
}

.dropdown-item i {
  color: #fcd535;
}

/* Deposit Card */
.deposit-card {
  background: #181a20;
  border-radius: 20px;
  padding: 25px;
  border: 1px solid #2b2f36;
  margin-bottom: 20px;
}

.qr-section {
  text-align: center;
  margin-bottom: 25px;
}

.qr-frame {
  display: inline-block;
  background: #fff;
  padding: 10px;
  border-radius: 12px;
  position: relative;
}

.qr-code {
  width: 150px;
  height: 150px;
  display: block;
}

.qr-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #848e9c;
}

.address-section {
  background: #2b2f36;
  border-radius: 12px;
  padding: 15px;
  position: relative;
}

.label-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.addr-label {
  font-size: 12px;
  color: #848e9c;
}

.network-tag {
  font-size: 10px;
  background: rgba(252, 213, 53, 0.1);
  color: #fcd535;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
}

.address-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.address-text {
  font-family: monospace;
  font-size: 13px;
  word-break: break-all;
  color: #eaecef;
  line-height: 1.4;
}

.copy-icon-btn {
  background: none;
  border: none;
  color: #fcd535;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
}

.copy-toast {
  position: absolute;
  bottom: -25px;
  right: 15px;
  font-size: 11px;
  color: #0ecb81;
}

/* Form */
.form-section {
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  color: #848e9c;
}

.input-field {
  background: #2b2f36;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  border: 1px solid transparent;
}

.input-field:focus-within {
  border-color: #fcd535;
}

.input-field input {
  flex: 1;
  background: none;
  border: none;
  padding: 15px 0;
  color: #fff;
  font-size: 16px;
  outline: none;
}

.suffix {
  color: #848e9c;
  font-weight: 700;
  font-size: 14px;
}

.main-btn {
  width: 100%;
  background: #fcd535;
  color: #0b0e11;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
  transition: opacity 0.2s;
}

.main-btn:disabled {
  opacity: 0.5;
}

.alert {
  margin-top: 15px;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert.success { background: rgba(14, 203, 129, 0.1); color: #0ecb81; }
.alert.error { background: rgba(246, 70, 93, 0.1); color: #f6465d; }

/* Tips */
.tips-box {
  background: rgba(252, 213, 53, 0.05);
  border-radius: 12px;
  padding: 15px;
  border: 1px solid rgba(252, 213, 53, 0.1);
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fcd535;
  font-weight: 700;
  margin-bottom: 10px;
}

.tips-list {
  margin: 0;
  padding-right: 20px;
  font-size: 12px;
  color: #848e9c;
  line-height: 1.8;
}

/* Animations */
.slide-fade-enter-active { transition: all 0.2s ease-out; }
.slide-fade-enter-from { transform: translateY(-10px); opacity: 0; }

.fade-enter-active { transition: opacity 0.3s; }
.fade-enter-from { opacity: 0; }
</style>
