# 🧪 Manual Testing Checklist

## 📋 **Pre-Testing Setup**

### ✅ **Verify Deployment**
- [ ] Confirm Vercel project is deployed successfully
- [ ] Check actual Vercel URL (might be different from assumed URL)
- [ ] Verify environment variables are set correctly
- [ ] Confirm Supabase database is connected

---

## 🎯 **Core Functionality Tests**

### 🔐 **Authentication System**
- [ ] **Registration**
  - [ ] Create new account with email/password
  - [ ] Verify email validation
  - [ ] Check password strength requirements
  - [ ] Confirm account creation success

- [ ] **Login**
  - [ ] Login with correct credentials
  - [ ] Test invalid credentials
  - [ ] Verify session persistence
  - [ ] Check logout functionality

### 💰 **Income/Expense Management**
- [ ] **Dashboard**
  - [ ] View main dashboard
  - [ ] Check balance calculations
  - [ ] Verify charts display correctly
  - [ ] Test responsive design on mobile

- [ ] **Add Income**
  - [ ] Create new income entry
  - [ ] Verify category selection
  - [ ] Check date picker
  - [ ] Confirm amount validation

- [ ] **Add Expense**
  - [ ] Create new expense entry
  - [ ] Test different categories
  - [ ] Verify negative balance handling
  - [ ] Check calculation accuracy

- [ ] **Edit/Delete**
  - [ ] Edit existing entries
  - [ ] Delete entries
  - [ ] Verify data persistence
  - [ ] Check undo functionality (if available)

### 🚗 **Joint Car Investment System**
- [ ] **Car Management**
  - [ ] Add new car project
  - [ ] Set car details (brand, model, year)
  - [ ] Configure purchase/sale prices
  - [ ] Upload car images

- [ ] **Investor Management**
  - [ ] Add multiple investors
  - [ ] Set investment amounts
  - [ ] Calculate share percentages
  - [ ] Verify profit/loss calculations

- [ ] **Advanced Features**
  - [ ] Enhanced dashboard analytics
  - [ ] ROI calculations
  - [ ] Profit margin analysis
  - [ ] Performance metrics

### 🔍 **Advanced Search & Filtering**
- [ ] **Search Functionality**
  - [ ] Text search across entries
  - [ ] Filter by categories
  - [ ] Date range filtering
  - [ ] Status filtering

- [ ] **Multi-Select Filters**
  - [ ] Select multiple statuses
  - [ ] Filter by multiple brands
  - [ ] Investor-based filtering
  - [ ] Profit/loss filtering

### 📁 **Data Export**
- [ ] **Export Formats**
  - [ ] JSON export
  - [ ] CSV export  
  - [ ] Excel (.xlsx) export
  - [ ] PDF report generation

- [ ] **Export Options**
  - [ ] Export all data
  - [ ] Export selected entries
  - [ ] Custom date ranges
  - [ ] Field selection

---

## 📱 **Mobile Responsiveness**
- [ ] **Layout**
  - [ ] Navigation works on mobile
  - [ ] Forms are usable on small screens
  - [ ] Charts display correctly
  - [ ] Touch interactions work

- [ ] **Performance**
  - [ ] Fast loading on mobile
  - [ ] Smooth scrolling
  - [ ] Responsive image loading

---

## 🔒 **Security Tests**
- [ ] **Data Isolation**
  - [ ] Users can only see own data
  - [ ] RLS policies working
  - [ ] No data leakage between users

- [ ] **Session Management**
  - [ ] Session expires appropriately
  - [ ] Secure logout
  - [ ] No persistent sensitive data

---

## ⚡ **Performance Tests**
- [ ] **Loading Times**
  - [ ] Initial page load < 3 seconds
  - [ ] Navigation is smooth
  - [ ] Database queries are fast

- [ ] **Browser Compatibility**
  - [ ] Works in Chrome
  - [ ] Works in Safari
  - [ ] Works in Firefox
  - [ ] Works in Edge

---

## 🐛 **Error Handling**
- [ ] **Network Issues**
  - [ ] Graceful offline handling
  - [ ] Retry mechanisms
  - [ ] Error messages are helpful

- [ ] **Data Validation**
  - [ ] Form validation works
  - [ ] Prevents invalid data entry
  - [ ] Clear error messages

---

## 📊 **Real URLs to Test**

### 🔗 **Find Your Actual Vercel URL**
1. Go to https://vercel.com/dashboard
2. Find your project: `namplao-expense-app` or similar
3. Click on the project
4. Copy the actual deployment URL

### 🧪 **Test These URLs** (replace with your actual domain):
```
https://your-actual-app.vercel.app/
https://your-actual-app.vercel.app/auth
https://your-actual-app.vercel.app/dashboard  
https://your-actual-app.vercel.app/joint-cars
https://your-actual-app.vercel.app/income
https://your-actual-app.vercel.app/expense
```

---

## 📝 **Testing Notes Template**

### ✅ **Passed Tests:**
- Feature: _______________
- Result: _______________
- Notes: ________________

### ❌ **Failed Tests:**
- Feature: _______________
- Error: ________________
- Steps to reproduce: ____

### ⚠️ **Issues Found:**
- Description: ___________
- Severity: _____________
- Workaround: ___________

---

## 🎯 **Success Criteria**

### ✅ **Minimum Requirements for "Working System":**
- [ ] User can register and login
- [ ] Can add/edit income and expenses
- [ ] Basic dashboard shows correct data
- [ ] Can create car investment projects
- [ ] Data persists between sessions
- [ ] Mobile responsive layout works

### 🌟 **Full Feature Success:**
- [ ] All advanced features working
- [ ] Export functionality operational
- [ ] Multi-user isolation confirmed
- [ ] Performance meets expectations
- [ ] No critical security issues

---

**🎉 Ready to test your live application!**
