<template>
  <div class="ad-container" dir="rtl">
    <!-- ترحيب بالمستخدم -->
    <div class="user-info">
      <p>مرحباً، <strong>{{ username }}</strong></p>
      <p>الرصيد: <strong>{{ balance }} USDT</strong></p>
    </div>

    <!-- مميزات الإعلان -->
    <div class="ad-highlights">
      <p>⏱ وفر الوقت &nbsp;&nbsp;💰 وفر المال</p>
      <p>🔊 شراكة عالمية مع Amazon, eBay, Etsy, Walmart وأكثر!</p>
    </div>

    <!-- عنوان المنتج -->
    <div class="item-title">
      <strong>{{ item.title }}</strong>
    </div>

    <!-- محتوى الإعلان الكامل -->
    <div class="ad-content">
      <h2>✨ Palm Treasure ✨</h2>
      <p>
        مرحباً بالجميع 🌟<br><br>
        يسرّنا أن نعرّفكم بشركة Palm Treasure التي تأسست في سنغافورة بتاريخ 5 فبراير 2026، وهي شركة استثمارية متخصصة في مجال التجارة الإلكترونية. تمتلك الشركة فريقاً تقنياً محترفاً وخبرة مالية قوية، ويقع مقرها الرئيسي حالياً في منطقة الأعمال المركزية في سنغافورة.
      </p>
      <p>
        وانطلاقاً من رؤيتنا للتوسع وبناء شبكة تعاون واسعة، قمنا بإنشاء فروع ووكالات في عدد من الدول العربية مثل لبنان، الجزائر، ليبيا، والعراق، ونسعى خلال المرحلة القادمة إلى توسيع نشاطنا وانتشارنا في مختلف دول الشرق الأوسط.
      </p>
      <p>
        لقد جاء تأسيس هذه الشركة بعد دراسة عميقة لما حدث خلال عامي 2024 و2025، حيث ظهرت العديد من المنصات الوهمية التي خدعت الكثير من الناس ولم تستمر طويلاً. ومن هنا كان هدفنا واضحاً: تحويل هذا المجال إلى منصة حقيقية وموثوقة يستفيد منها الأعضاء كما تستفيد منها الشركة، ضمن نظام عادل وشفاف.
      </p>
      <p>
        وقد تحقق هذا المشروع بجهود كبيرة من الفريق التقني تحت إشراف المهندس أليكس ديروب، الذي لعب دوراً أساسياً في تطوير النظام التقني للشركة. وتقديراً لجهوده المميزة ومساهمته في نجاح هذا المشروع، تمت ترقيته إلى منصب نائب المدير.
      </p>
      <p>
        نحن في Palm Treasure نؤمن بأن النجاح الحقيقي يجب أن يكون متاحاً للجميع، لذلك تم تصميم هذا المشروع ليكون فرصة متاحة لكل الناس، وخاصة للطبقة المتوسطة وذوي الدخل المحدود، حتى يتمكنوا من تحسين أوضاعهم والمشاركة في فرص الاقتصاد الرقمي.
      </p>
      <p>
        ولهذا السبب تم وضع نظام واضح وقوانين عادلة تضمن حماية حقوق الموظفين والأعضاء قبل حقوق المستثمرين، مع مراعاة الظروف الاقتصادية والاجتماعية في المجتمعات العربية.
      </p>
      <p>
        وسيتم تطبيق هذا النظام المبرمج في معظم الدول العربية ابتداءً من 1 مارس 2026 وحتى نهاية عام 2028، وخلال هذه الفترة سيتم تقييم الأداء والنتائج. وبعد ذلك قد يتم تطوير النظام وإجراء بعض التعديلات بناءً على كفاءة الأعضاء وجهودهم وإخلاصهم في العمل.
      </p>
      <p>
        كما نعمل منذ الآن على التخطيط لمجموعة من الفرص المستقبلية والمشاريع الجديدة التي ستوفر مزيداً من الإمكانيات لأعضاء الشركة في السنوات القادمة.
      </p>
      <p>
        نتمنى للجميع التوفيق، ونسعد بانضمامكم إلى مجتمع Palm Treasure 🌴
      </p>
      <hr>
      <h3>📊 خطط العضوية والأرباح في Palm Treasure</h3>
      <div class="vip-table">
        <div class="vip-row">
          <span class="vip-level">VIP 1</span>
          <span class="vip-recharge">💰 0 USDT</span>
          <span class="vip-daily">📈 0.3 USDT/يوم</span>
        </div>
        <div class="vip-row">
          <span class="vip-level">VIP 2</span>
          <span class="vip-recharge">💰 50 USDT</span>
          <span class="vip-daily">📈 1.6 USDT/يوم</span>
        </div>
        <div class="vip-row">
          <span class="vip-level">VIP 3</span>
          <span class="vip-recharge">💰 100 USDT</span>
          <span class="vip-daily">📈 3.25 USDT/يوم</span>
        </div>
        <div class="vip-row">
          <span class="vip-level">VIP 4</span>
          <span class="vip-recharge">💰 300 USDT</span>
          <span class="vip-daily">📈 10 USDT/يوم</span>
        </div>
        <div class="vip-row">
          <span class="vip-level">VIP 5</span>
          <span class="vip-recharge">💰 900 USDT</span>
          <span class="vip-daily">📈 33 USDT/يوم</span>
        </div>
        <div class="vip-row">
          <span class="vip-level">VIP 6</span>
          <span class="vip-recharge">💰 1350 USDT</span>
          <span class="vip-daily">📈 51 USDT/يوم</span>
        </div>
        <div class="vip-row">
          <span class="vip-level">VIP 7</span>
          <span class="vip-recharge">💰 1800 USDT</span>
          <span class="vip-daily">📈 70 USDT/يوم</span>
        </div>
        <div class="vip-row">
          <span class="vip-level">VIP 8</span>
          <span class="vip-recharge">💰 3600 USDT</span>
          <span class="vip-daily">📈 150 USDT/يوم</span>
        </div>
        <div class="vip-row">
          <span class="vip-level">VIP 9</span>
          <span class="vip-recharge">💰 7200 USDT</span>
          <span class="vip-daily">📈 330 USDT/يوم</span>
        </div>
        <div class="vip-row">
          <span class="vip-level">VIP 10</span>
          <span class="vip-recharge">💰 14400 USDT</span>
          <span class="vip-daily">📈 700 USDT/يوم</span>
        </div>
      </div>

      <div class="commission-info">
        <h3>🤝 نظام العمولات</h3>
        <p>المستوى 1: 6% | المستوى 2: 2% | المستوى 3: 1%</p>
      </div>

      <p>━━━━━━━━━━━━━━━</p>
      <p>شراكات عالمية مع Amazon, eBay, TikTok, Aliexpress, Alibaba, Shopee</p>
    </div>

    <!-- زر الإغلاق -->
    <button class="ad-btn" @click="closeAd">أنا أعرف</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "أحمد",
      balance: 120,
      item: { title: "فرصة استثمارية مميزة" },
      showAd: true
    };
  },
  methods: {
    closeAd() {
      this.showAd = false;
    }
  }
};
</script>

<style scoped>
.ad-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  background: #f7f7f7;
  border-radius: 10px;
  font-family: "Arial", sans-serif;
  line-height: 1.6;
}
.user-info p {
  font-size: 16px;
}
.ad-highlights {
  margin: 15px 0;
  font-weight: bold;
  text-align: center;
}
.item-title {
  font-size: 20px;
  margin: 15px 0;
  text-align: center;
}
.ad-content h2 {
  text-align: center;
  color: #2a9d8f;
}
.vip-table {
  margin: 15px 0;
  border-top: 2px solid #ccc;
}
.vip-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #ddd;
}
.vip-level {
  font-weight: bold;
}
.ad-btn {
  display: block;
  margin: 20px auto 0;
  padding: 10px 20px;
  background: #2a9d8f;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.ad-btn:hover {
  background: #21867a;
}
</style>
