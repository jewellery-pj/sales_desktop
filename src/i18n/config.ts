import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        sales: 'Sales',
        profile: 'Profile',
        logout: 'Logout',
      },
      login: {
        title: 'Login',
        staffId: 'Staff ID',
        password: 'Password',
        submit: 'Login',
        error: 'Login failed. Please check your credentials.',
      },
      sales: {
        title: 'Sales Management',
        search: 'Search...',
        filter: 'Filter',
        addNew: 'Add New Sale',
        date: 'Date',
        customer: 'Customer',
        itemCode: 'Item Code',
        quantity: 'Quantity',
        amount: 'Amount',
        status: 'Status',
        actions: 'Actions',
        noRecords: 'No sales records found',
      },
      profile: {
        title: 'Profile',
        settings: 'Settings',
        theme: 'Theme',
        language: 'Language',
        light: 'Light',
        dark: 'Dark',
      },
    },
  },
  my: {
    translation: {
      nav: {
        sales: 'အရောင်း',
        profile: 'ပရိုဖိုင်',
        logout: 'ထွက်မည်',
      },
      login: {
        title: 'ဝင်ရောက်ရန်',
        staffId: 'ဝန်ထမ်းနံပါတ်',
        password: 'စကားဝှက်',
        submit: 'ဝင်ရောက်မည်',
        error: 'ဝင်ရောက်မှု မအောင်မြင်ပါ။ သင့်အချက်အလက်များကို စစ်ဆေးပါ။',
      },
      sales: {
        title: 'အရောင်းစီမံခန့်ခွဲမှု',
        search: 'ရှာဖွေရန်...',
        filter: 'စစ်ထုတ်ရန်',
        addNew: 'အသစ်ထည့်ရန်',
        date: 'ရက်စွဲ',
        customer: 'ဝယ်ယူသူ',
        itemCode: 'ပစ္စည်းကုတ်',
        quantity: 'အရေအတွက်',
        amount: 'ပမာဏ',
        status: 'အခြေအနေ',
        actions: 'လုပ်ဆောင်ချက်များ',
        noRecords: 'အရောင်းမှတ်တမ်းများ မတွေ့ပါ',
      },
      profile: {
        title: 'ပရိုဖိုင်',
        settings: 'ဆက်တင်များ',
        theme: 'အပြင်အဆင်',
        language: 'ဘာသာစကား',
        light: 'အလင်း',
        dark: 'အမှောင်',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'my',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
