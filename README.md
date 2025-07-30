# � แอพ รายรับ-รายจ่าย สำหรับนายหน้า

ระบบจัดการการลงทุนร่วมซื้อรถยนต์ พร้อมระบบติดตามผลกำไร-ขาดทุนแบบครบวงจร

## ✨ Features

### 🏠 ระบบหลัก
- 📊 **Dashboard รายรับ-รายจ่าย**: ภาพรวมการเงินแบบ Real-time
- 💰 **จัดการรายการเงิน**: เพิ่ม แก้ไข ลบ รายการรายรับ-รายจ่าย
- � **รายงานและกราฟ**: วิเคราะห์การเงินด้วย Charts
- 🔍 **ค้นหาและกรอง**: หารายการตามหมวดหมู่ วันที่ จำนวนเงิน

### 🚗 ระบบการลงทุนร่วมซื้อรถ (Joint Car Investment)
- 🎯 **จัดการพอร์ตการลงทุน**: ติดตามรถแต่ละคันและผู้ลงทุน
- � **การแบ่งหุ้น**: ระบบคำนวณส่วนแบ่งผลกำไรอัตโนมัติ
- 📊 **แดชบอร์ดขั้นสูง**: วิเคราะห์ ROI และ Performance Metrics
- � **ค้นหาขั้นสูง**: Multi-select filters และ Dynamic sorting
- 📁 **ส่งออกข้อมูล**: Export JSON/CSV/Excel/PDF พร้อม Custom fields
- 🖼️ **จัดการรูปภาพ**: อัปโหลดและจัดเก็บรูปรถ

### 🔐 ระบบความปลอดภัย
- 🔑 **Authentication**: เข้าสู่ระบบด้วย Email/Password
- 👥 **Row Level Security**: ข้อมูลแยกตาม User
- 🛡️ **Data Protection**: เข้ารหัสข้อมูลสำคัญ
- 📊 **รายงาน** - สรุปข้อมูลทางการเงิน
- ⚙️ **ตั้งค่า** - จัดการข้อมูลส่วนตัว
- 🔐 **Authentication** - ระบบเข้าสู่ระบบด้วย Supabase
- 📱 **Mobile Responsive** - รองรับการใช้งานบนมือถือ

## 🛠 Technology Stack

- **Frontend**: Next.js 15.4.4 (App Router)
- **UI Framework**: React 19.1.0
- **Styling**: Tailwind CSS 4.1.11
- **Database & Auth**: Supabase
- **TypeScript**: 5.8.3
- **Charts**: Chart.js + React-ChartJS-2
- **Icons**: React Icons + Emoji

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd แอพ\\ รายรับ_รายจ่าย\\ สำหรับนายหน้า
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Setup environment variables
Create \`.env.local\` file with:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_SERVICE_SID=your_twilio_service_sid
\`\`\`

4. Run development server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📱 Available Scripts

- \`npm run dev\` - Run development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint

## 🏗 Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── income/            # Income management
│   ├── expense/           # Expense management
│   ├── records/           # Transaction records
│   ├── settings/          # User settings
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── BottomNav.tsx     # Mobile navigation
│   ├── ClientLayout.tsx  # Client-side layout
│   ├── Navbar.tsx        # Top navigation
│   └── Footer.tsx        # Footer component
├── lib/                   # Utility libraries
│   └── supabaseClient.ts # Supabase configuration
└── middleware.ts          # Next.js middleware
\`\`\`

## 🎨 Design System

### Colors
- **Primary**: Orange tones (#f97316, #ea580c, #dc2626)
- **Secondary**: Gray tones (#6b7280, #9ca3af, #d1d5db)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font Family**: Inter, Prompt (for Thai text)
- **Responsive**: Mobile-first design approach

## 🔧 Configuration

### Tailwind CSS
- Configured with custom colors and animations
- ES Modules format for v4 compatibility
- Mobile-safe utilities included

### Supabase
- Authentication with email/password
- Real-time database updates
- Row Level Security (RLS) enabled

## 📋 TODO

- [ ] Add data visualization charts
- [ ] Implement expense categories
- [ ] Add export functionality
- [ ] Enable push notifications
- [ ] Add dark mode support

## 🤝 Contributing

1. Fork the project
2. Create feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.
