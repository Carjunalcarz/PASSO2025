# LayoutsV2 - Quick Start Guide

## 🎯 What You Need to Change

### 1. **Logo & Branding** (5 minutes)

**SidebarV2.tsx** - Line 56:
```tsx
<img className="w-8 flex-none" src="/logo.png" alt="logo" />
<span className="text-xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-slate-200">
    Your App Name Here
</span>
```

**HeaderV2.tsx** - Line 69:
```tsx
<img className="w-8 ltr:-ml-1 rtl:-mr-1 inline" src="/logo.png" alt="logo" />
<span className="text-xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle hidden md:inline dark:text-white-light transition-all duration-300">
    Your App Name Here
</span>
```

**FooterV2.tsx** - Line 3:
```tsx
© {new Date().getFullYear()}. Your Company Name. All rights reserved.
```

---

### 2. **Menu Items** (10 minutes)

**SidebarV2.tsx** - Replace example menus (lines 67-145) with your routes:

```tsx
<li className="menu nav-item">
    <NavLink to="/your-route" className="nav-link group">
        <div className="flex items-center">
            <YourIcon className="group-hover:!text-primary shrink-0" />
            <span className="ltr:pl-3 rtl:pr-3 text-gray-900 dark:text-slate-400 dark:group-hover:text-slate-200">
                {t('Your Menu Item')}
            </span>
        </div>
    </NavLink>
</li>
```

---

### 3. **User Authentication** (15 minutes)

**SidebarV2.tsx** - Footer section (lines 149-171):
```tsx
// Add your auth hook
import { useAuth } from '../../contexts/AuthContext';

const { user, logout } = useAuth();

// Update user display
<div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
</div>
<div className="min-w-0 flex-1">
    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
        {user?.name || 'User Name'}
    </p>
    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
        {user?.email || 'user@example.com'}
    </p>
</div>

// Add logout button
<button
    onClick={logout}
    className="p-2 rounded-md text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex-shrink-0"
    title="Logout"
>
    <IconLogout className="w-4 h-4" />
</button>
```

**HeaderV2.tsx** - User dropdown (lines 241-281):
```tsx
import { useAuth } from '../../contexts/AuthContext';

const { user, logout } = useAuth();

// Update user info display
<h4 className="text-base">
    {user?.name || 'User Name'}
    <span className="text-xs bg-success-light rounded text-success px-1 ltr:ml-2 rtl:ml-2">
        {user?.emailVerification ? 'Verified' : 'Active'}
    </span>
</h4>
<button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
    {user?.email || 'user@example.com'}
</button>

// Update logout button
<li className="border-t border-white-light dark:border-white-light/10">
    <button onClick={logout} className="text-danger !py-3 w-full text-left flex items-center">
        <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
        Sign Out
    </button>
</li>
```

---

### 4. **Import Paths** (5 minutes)

Update these imports in all files:

```tsx
// Before
import App from '../../App';
import { IRootState } from '../../store';
import { toggleSidebar } from '../../store/themeConfigSlice';

// After (adjust based on your project structure)
import App from '@/App';
import { IRootState } from '@/store';
import { toggleSidebar } from '@/store/themeConfigSlice';
```

---

## 📦 Required Dependencies

```bash
npm install react-redux react-router-dom react-i18next react-perfect-scrollbar react-animate-height
```

---

## 🚀 Usage in Routes

```tsx
import { Routes, Route } from 'react-router-dom';
import { DefaultLayoutV2, BlankLayoutV2 } from './components/LayoutsV2';

function App() {
  return (
    <Routes>
      {/* Protected routes with full layout */}
      <Route path="/" element={<DefaultLayoutV2><HomePage /></DefaultLayoutV2>} />
      <Route path="/dashboard" element={<DefaultLayoutV2><Dashboard /></DefaultLayoutV2>} />
      
      {/* Public routes with blank layout */}
      <Route path="/login" element={<BlankLayoutV2><LoginPage /></BlankLayoutV2>} />
    </Routes>
  );
}
```

---

## 🎨 Customization Priorities

### Must Change:
1. ✅ Logo paths
2. ✅ App name/branding
3. ✅ Footer company name
4. ✅ Menu items and routes
5. ✅ User authentication integration

### Should Change:
6. Import paths (if using path aliases)
7. User profile image paths
8. Notification/message logic
9. Search functionality

### Optional:
10. Theme colors (via Tailwind config)
11. Animation preferences
12. Layout settings defaults

---

## 🔍 File Reference

| File | Purpose | Key Changes Needed |
|------|---------|-------------------|
| `DefaultLayoutV2.tsx` | Main layout wrapper | Import paths |
| `SidebarV2.tsx` | Navigation menu | Logo, menu items, user info |
| `HeaderV2.tsx` | Top navigation | Logo, user dropdown, logout |
| `FooterV2.tsx` | Footer | Company name |
| `BlankLayoutV2.tsx` | Minimal layout | Import paths |
| `SettingV2.tsx` | Theme customizer | Usually no changes needed |

---

## ⚡ 5-Minute Setup

```bash
# 1. Copy files
cp -r src/components/LayoutsV2 /your/project/src/components/

# 2. Find and replace in all files
# - "Your App Name Here" → "MyApp"
# - "Your Company Name" → "MyCompany Inc"
# - "/logo.png" → "/assets/logo.png"

# 3. Update menu items in SidebarV2.tsx

# 4. Add auth integration

# 5. Test!
npm run dev
```

---

## 🐛 Common Issues

**Issue:** TypeScript errors about missing modules
**Fix:** Update import paths to match your project structure

**Issue:** Icons not displaying
**Fix:** Ensure all Icon components exist in your project

**Issue:** Redux errors
**Fix:** Verify your store has `themeConfigSlice` with required actions

**Issue:** Sidebar not showing
**Fix:** Check if you have authentication logic hiding it

---

## 📞 Need Help?

Refer to the full `README.md` for detailed documentation.

---

**Total Setup Time:** ~30-45 minutes  
**Difficulty:** Easy to Moderate
