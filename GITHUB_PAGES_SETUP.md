# 🚀 GitHub Pages Setup Guide

## ✅ الإعدادات الجاهزة

تم إعداد المشروع للنشر على GitHub Pages بنجاح!

### الملفات المُعدة:

1. ✅ `frontend/next.config.js` - مُعد للـ static export
2. ✅ `.github/workflows/deploy-pages.yml` - workflow للنشر التلقائي
3. ✅ `frontend/.nojekyll` - لتجنب مشاكل Jekyll

---

## 📋 خطوات التفعيل على GitHub

### 1. تفعيل GitHub Pages

اذهب إلى repository على GitHub:
```
https://github.com/amrmeta1/tadfuq-platform
```

ثم:
1. اضغط على **Settings** (الإعدادات)
2. من القائمة الجانبية، اختر **Pages**
3. في قسم **Source**، اختر:
   - Source: **GitHub Actions**
4. احفظ التغييرات

### 2. رفع التغييرات

```bash
git add .
git commit -m "🚀 Add GitHub Pages deployment"
git push
```

### 3. انتظر النشر

- سيبدأ الـ workflow تلقائياً
- يمكنك متابعة التقدم في تبويب **Actions**
- عند الانتهاء، سيكون الموقع متاحاً على:

```
https://amrmeta1.github.io/tadfuq-platform/
```

---

## 🔧 كيف يعمل؟

### Workflow التلقائي:

1. **عند Push لـ main branch:**
   - يقوم بتثبيت dependencies
   - يبني المشروع (`npm run build`)
   - ينشئ مجلد `out/` بالملفات الثابتة
   - يرفعها لـ GitHub Pages

2. **النتيجة:**
   - موقع ثابت (static) سريع جداً
   - مجاني 100%
   - SSL مجاني
   - CDN عالمي

---

## ⚠️ ملاحظات مهمة

### Frontend فقط:
- ✅ الـ Frontend سيعمل بشكل كامل
- ❌ الـ Backend لن يعمل (لأنه يحتاج server)
- 💡 يمكن ربطه بـ API خارجي لاحقاً

### API Calls:
حالياً، الـ Frontend يحاول الاتصال بـ:
```
http://localhost:8080 (Tenant Service)
http://localhost:8081 (Ingestion Service)
```

**للحل:**
1. نشر Backend على خدمة أخرى (Railway, Render, Fly.io)
2. تحديث `NEXT_PUBLIC_API_URL` في `.env.example`
3. إعادة البناء

---

## 🎯 الخطوات التالية

### بعد النشر الناجح:

1. **اختبر الموقع:**
   ```
   https://amrmeta1.github.io/tadfuq-platform/
   ```

2. **إذا أردت ربط Backend:**
   - انشر Backend على Railway/Render
   - حدّث environment variables
   - أعد النشر

3. **Domain مخصص (اختياري):**
   - يمكنك ربط domain خاص بك
   - من Settings → Pages → Custom domain

---

## 🐛 استكشاف الأخطاء

### إذا فشل النشر:

1. **تحقق من Actions tab:**
   ```
   https://github.com/amrmeta1/tadfuq-platform/actions
   ```

2. **تأكد من تفعيل GitHub Pages:**
   - Settings → Pages → Source: GitHub Actions

3. **تحقق من الـ build:**
   ```bash
   cd frontend
   npm run build
   ```

---

## 📊 الحالة الحالية

- ✅ Next.js مُعد للـ static export
- ✅ GitHub Actions workflow جاهز
- ✅ `.nojekyll` موجود
- ⏳ في انتظار التفعيل على GitHub

**جاهز للنشر! 🎉**
