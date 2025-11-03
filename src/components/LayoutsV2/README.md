# LayoutsV2 - Fresh Layout System

A clean, reusable layout system ready for integration into new development projects. This is a fresh clone of the original layouts with all project-specific code removed.

## 📁 Structure

```
LayoutsV2/
├── DefaultLayoutV2.tsx    # Main layout with sidebar, header, footer
├── BlankLayoutV2.tsx      # Minimal layout for auth pages, etc.
├── SidebarV2.tsx          # Navigation sidebar component
├── HeaderV2.tsx           # Top navigation header
├── FooterV2.tsx           # Footer component
├── SettingV2.tsx          # Theme customizer panel
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Copy to Your Project

Copy the entire `LayoutsV2` folder to your project's components directory:

```bash
cp -r src/components/LayoutsV2 /path/to/your/project/src/components/
```

### 2. Update Imports

The layouts use the following dependencies that you'll need to ensure exist in your project:

- `react-redux` - State management
- `react-router-dom` - Routing
- `react-i18next` - Internationalization
- `react-perfect-scrollbar` - Scrollbar component
- `react-animate-height` - Animated collapsible menus

### 3. Configure Redux Store

Ensure your Redux store has the `themeConfigSlice` with these actions:
- `toggleSidebar()`
- `toggleTheme(theme)`
- `toggleRTL(direction)`
- `toggleMenu(menuType)`
- `toggleNavbar(navbarType)`
- `toggleLayout(layoutType)`
- `toggleAnimation(animation)`
- `toggleSemidark(enabled)`

### 4. Update Paths

Update the following paths in the components:

**DefaultLayoutV2.tsx:**
- Line 3: `import App from '../../App'` → Update to your App wrapper
- Line 4: `import { IRootState } from '../../store'` → Update to your store path
- Line 5: `import { toggleSidebar } from '../../store/themeConfigSlice'` → Update to your slice path

**SidebarV2.tsx:**
- Update logo path: `/logo.png` → Your logo path
- Update app name: `'App Name'` → Your application name
- Update menu items to match your routes

**HeaderV2.tsx:**
- Update logo path: `/logo.png` → Your logo path
- Update user profile image paths
- Update dropdown menu links to match your routes

**FooterV2.tsx:**
- Update company name: `'Your Company Name'` → Your company name

## 🎨 Customization Guide

### Adding Menu Items to Sidebar

Edit `SidebarV2.tsx` and add new menu items in the `<ul>` section:

```tsx
<li className="menu nav-item">
    <button 
        type="button" 
        className={`${currentMenu === 'your-menu' ? 'active' : ''} nav-link group w-full`} 
        onClick={() => toggleMenu('your-menu')}
    >
        <div className="flex items-center">
            <YourIcon className="group-hover:!text-primary shrink-0" />
            <span className="ltr:pl-3 rtl:pr-3 text-gray-900 dark:text-slate-400 dark:group-hover:text-slate-200">
                {t('Your Menu')}
            </span>
        </div>
        <div className={currentMenu !== 'your-menu' ? 'rtl:rotate-90 -rotate-90' : ''}>
            <IconCaretDown />
        </div>
    </button>

    <AnimateHeight duration={300} height={currentMenu === 'your-menu' ? 'auto' : 0}>
        <ul className="sub-menu text-slate-500">
            <li>
                <NavLink to="/your-route">{t('Your Page')}</NavLink>
            </li>
        </ul>
    </AnimateHeight>
</li>
```

### Customizing Theme Colors

The layouts use Tailwind CSS classes. Update your `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#4361ee',
        // Add your custom colors
      }
    }
  }
}
```

### User Authentication Integration

Replace the placeholder user data in `SidebarV2.tsx` footer section:

```tsx
// Replace this section with your auth context
const { user } = useAuth(); // Your auth hook

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
```

### Adding Logout Functionality

In `HeaderV2.tsx`, update the logout link:

```tsx
import { useAuth } from '../../contexts/AuthContext'; // Your auth context

const { logout } = useAuth();

// In the dropdown menu
<li className="border-t border-white-light dark:border-white-light/10">
    <button onClick={logout} className="text-danger !py-3 w-full text-left">
        <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
        Sign Out
    </button>
</li>
```

## 🔧 Usage Examples

### Using DefaultLayoutV2 in Routes

```tsx
import { Routes, Route } from 'react-router-dom';
import DefaultLayoutV2 from './components/LayoutsV2/DefaultLayoutV2';
import BlankLayoutV2 from './components/LayoutsV2/BlankLayoutV2';

function App() {
  return (
    <Routes>
      {/* Routes with full layout */}
      <Route path="/" element={<DefaultLayoutV2><HomePage /></DefaultLayoutV2>} />
      <Route path="/dashboard" element={<DefaultLayoutV2><Dashboard /></DefaultLayoutV2>} />
      
      {/* Routes with blank layout (auth pages) */}
      <Route path="/login" element={<BlankLayoutV2><LoginPage /></BlankLayoutV2>} />
      <Route path="/register" element={<BlankLayoutV2><RegisterPage /></BlankLayoutV2>} />
    </Routes>
  );
}
```

### Conditional Sidebar Display

To show/hide sidebar based on authentication:

```tsx
// In DefaultLayoutV2.tsx
const { isAuthenticated } = useAuth();

{/* BEGIN SIDEBAR - Only show for authenticated users */}
{isAuthenticated && <SidebarV2 />}
{/* END SIDEBAR */}

<div className={`main-content flex flex-col min-h-screen ${!isAuthenticated ? 'ltr:ml-0 rtl:mr-0' : ''}`}>
```

## 📦 Required Icon Components

The layouts use these icon components. Ensure they exist in your project:

- `IconCaretsDown`
- `IconCaretDown`
- `IconMenuDashboard`
- `IconMinus`
- `IconSettings`
- `IconMenu`
- `IconSearch`
- `IconXCircle`
- `IconSun`
- `IconMoon`
- `IconLaptop`
- `IconMailDot`
- `IconBellBing`
- `IconUser`
- `IconMail`
- `IconLockDots`
- `IconLogout`
- `IconX`

## 🎯 Features

### DefaultLayoutV2
- ✅ Responsive sidebar navigation
- ✅ Top header with search, theme toggle, notifications
- ✅ Scroll-to-top button
- ✅ Loading screen animation
- ✅ Theme customizer panel
- ✅ Footer component
- ✅ RTL support

### SidebarV2
- ✅ Collapsible menu items
- ✅ Perfect scrollbar
- ✅ Active route highlighting
- ✅ User info footer
- ✅ Mobile responsive

### HeaderV2
- ✅ Search functionality
- ✅ Theme switcher (Light/Dark/System)
- ✅ Messages dropdown
- ✅ Notifications dropdown
- ✅ User profile dropdown
- ✅ Mobile menu toggle

### SettingV2
- ✅ Color scheme selector
- ✅ Navigation position (Horizontal/Vertical/Collapsible)
- ✅ Layout style (Box/Full)
- ✅ Direction (LTR/RTL)
- ✅ Navbar type (Sticky/Floating/Static)
- ✅ Router transition animations

## 🔄 Migration Checklist

- [ ] Copy LayoutsV2 folder to your project
- [ ] Install required dependencies
- [ ] Update import paths in all layout files
- [ ] Configure Redux store with themeConfigSlice
- [ ] Update logo paths
- [ ] Update app name/branding
- [ ] Customize menu items in SidebarV2
- [ ] Integrate authentication context
- [ ] Update footer company name
- [ ] Test responsive behavior
- [ ] Test theme switching
- [ ] Test all navigation links

## 🎨 Styling

The layouts use Tailwind CSS with custom classes. Key classes:

- `main-container` - Main wrapper
- `main-content` - Content area
- `sidebar` - Sidebar navigation
- `nav-link` - Navigation links
- `sub-menu` - Submenu items
- `btn-primary` - Primary buttons
- `dark:` prefix - Dark mode styles

## 📝 Notes

- All project-specific code has been removed
- Generic placeholder content is used throughout
- Authentication logic needs to be integrated
- Menu items are examples and should be customized
- Icon components must exist in your project
- Redux store structure must match expected shape

## 🤝 Support

For issues or questions about integrating these layouts into your project, refer to the original implementation in the `Layouts` folder for reference.

---

**Version:** 2.0  
**Last Updated:** 2025  
**License:** Use freely in your projects
