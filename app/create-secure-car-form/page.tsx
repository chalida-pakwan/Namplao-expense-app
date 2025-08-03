'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

export default function CreateSecureCar() {
  const router = useRouter()
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [status, setStatus] = useState('กำลังหา')
  const [notes, setNotes] = useState('')
  const [investors, setInvestors] = useState<Array<{
    name: string;
    email: string;
    phone: string;
    amount: string;
    date: string;
  }>>([
    { name: '', email: '', phone: '', amount: '', date: '' }
  ])
  const [loading, setLoading] = useState(false)

  const handleInvestorChange = (index: number, field: string, value: string) => {
    const updated = [...investors]
    ;(updated[index] as any)[field] = value
    setInvestors(updated)
  }

  const addInvestor = () => {
    setInvestors([...investors, { name: '', email: '', phone: '', amount: '', date: '' }])
  }

  const removeInvestor = (index: number) => {
    if (investors.length > 1) {
      const updated = investors.filter((_, i) => i !== index)
      setInvestors(updated)
    }
  }

  const validateForm = () => {
    if (!brand.trim()) {
      toast.error('กรุณากรอกยี่ห้อรถ')
      return false
    }
    if (!model.trim()) {
      toast.error('กรุณากรอกรุ่นรถ')
      return false
    }
    if (!buyPrice || parseFloat(buyPrice) <= 0) {
      toast.error('กรุณากรอกราคาซื้อที่ถูกต้อง')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      // ตรวจสอบการล็อกอิน
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error('กรุณาเข้าสู่ระบบก่อน')
        router.push('/auth')
        return
      }

      console.log('🚀 Starting car creation process...')
      console.log('👤 User:', user.email)

      // สร้างรหัสปลอดภัย 6 หลัก
      const generateSecurityCode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        console.log('🔐 Generated security code:', code)
        return code
      }

      const securityCode = generateSecurityCode()
      console.log('✅ Security code ready:', securityCode)

      // คำนวณข้อมูลการลงทุน
      const totalInvestment = investors
        .filter(inv => inv.name.trim() && inv.amount)
        .reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0)

      const profit = sellPrice ? parseFloat(sellPrice) - parseFloat(buyPrice) : 0

      // เตรียมข้อมูลรถ
      const carData = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        brand: brand.trim(),
        model: model.trim(),
        year: year ? parseInt(year) : null,
        buy_price: parseFloat(buyPrice),
        sell_price: sellPrice ? parseFloat(sellPrice) : 0,
        profit: profit,
        total_investment: totalInvestment,
        status: status,
        notes: notes.trim() || null,
        investors: investors.filter(inv => inv.name.trim()),
        car_code: securityCode // เพิ่มรหัสปลอดภัย
      }

      console.log('📝 Car data to insert:', carData)

      // บันทึกลง Database
      const { data: carResult, error: carError } = await supabase
        .from('joint_cars')
        .insert(carData)
        .select()
        .single()

      if (carError) {
        console.error('❌ Car creation error:', carError)
        
        // ถ้า car_code field ไม่มี ลองสร้างโดยไม่ใส่ car_code
        if (carError.message.includes('car_code')) {
          console.log('⚠️ car_code field not found, trying without it...')
          
          const { car_code, ...carDataWithoutCode } = carData
          const { data: carResult2, error: carError2 } = await supabase
            .from('joint_cars')
            .insert(carDataWithoutCode)
            .select()
            .single()

          if (carError2) {
            throw carError2
          } else {
            // สร้างสำเร็จแต่ไม่มี car_code
            console.log('✅ Car created without car_code:', carResult2.id)
            
            toast.error('⚠️ สร้างรถสำเร็จ แต่ยังไม่มีระบบรหัสปลอดภัย\nกรุณาติดต่อ Developer เพื่อเพิ่ม car_code field', {
              duration: 8000
            })
            
            alert(`⚠️ สร้างรถสำเร็จ แต่ยังไม่มีรหัสปลอดภัย\n\n🆔 Car ID: ${carResult2.id}\n💡 ต้องรัน SQL ใน Supabase เพื่อเพิ่ม car_code field`)
            
            router.push('/secure-cars')
            return
          }
        } else {
          throw carError
        }
      } else {
        // สร้างสำเร็จพร้อมรหัสปลอดภัย
        console.log('✅ Car created successfully with security code:', carResult)

        // แสดงรหัสปลอดภัยแบบหลายวิธี
        const successMessage = `✅ สร้างรถสำเร็จ!\n🔐 รหัสปลอดภัย: ${carResult.car_code || securityCode}\n📝 กรุณาจดรหัสนี้ไว้สำหรับเชิญสมาชิก\n🚗 รถ: ${brand} ${model} ${year || ''}`
        
        // แสดง Alert popup
        alert(successMessage)
        
        // แสดง Toast notification
        toast.success(`🎉 สร้างรถสำเร็จ! รหัสปลอดภัย: ${carResult.car_code || securityCode}`, {
          duration: 10000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            maxWidth: '500px'
          }
        })

        // เพิ่มสมาชิกเจ้าของรถ
        try {
          await supabase.from('car_members').insert({
            car_id: carResult.id,
            user_id: user.id,
            user_email: user.email,
            user_name: user.user_metadata?.name || user.email,
            role: 'owner'
          })
          console.log('✅ Added owner as member')
        } catch (memberError) {
          console.log('⚠️ Could not add owner as member:', memberError)
        }

        // Backup alert เผื่อไม่เห็น
        setTimeout(() => {
          alert(`🔐 รหัสปลอดภัยของคุณ: ${carResult.car_code || securityCode}`)
        }, 1000)

        // ไปหน้ารายการรถ
        setTimeout(() => {
          router.push('/secure-cars')
        }, 2000)
      }

    } catch (error: any) {
      console.error('❌ Unexpected error:', error)
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              🚗 สร้างรถร่วมลงทุนแบบปลอดภัย
            </h1>
            <p className="text-gray-600">ระบบจะสร้างรหัสปลอดภัย 6 หลักให้อัตโนมัติ</p>
          </div>

          {/* ข้อมูลรถ */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4 text-blue-800">📋 ข้อมูลรถ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อรถ *</label>
                <input 
                  type="text"
                  value={brand} 
                  onChange={e => setBrand(e.target.value)} 
                  placeholder="เช่น Toyota, Honda"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รุ่นรถ *</label>
                <input 
                  type="text"
                  value={model} 
                  onChange={e => setModel(e.target.value)} 
                  placeholder="เช่น Vios, City"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปี</label>
                <input 
                  type="number"
                  value={year} 
                  onChange={e => setYear(e.target.value)} 
                  placeholder="2020"
                  min="1990"
                  max="2030"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="กำลังหา">กำลังหา</option>
                  <option value="ซื้อแล้ว">ซื้อแล้ว</option>
                  <option value="ขายแล้ว">ขายแล้ว</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ราคาซื้อ (บาท) *</label>
                <input 
                  type="number"
                  value={buyPrice} 
                  onChange={e => setBuyPrice(e.target.value)} 
                  placeholder="400000"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ราคาขาย (บาท)</label>
                <input 
                  type="number"
                  value={sellPrice} 
                  onChange={e => setSellPrice(e.target.value)} 
                  placeholder="450000"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={3} 
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับรถ..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>

          {/* ผู้ร่วมลงทุน */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-green-800">👥 ผู้ร่วมลงทุน</h3>
              <button 
                onClick={addInvestor} 
                className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ➕ เพิ่มผู้ลงทุน
              </button>
            </div>

            {investors.map((inv, index) => (
              <div key={index} className="bg-white/70 rounded-lg p-4 mb-4 border border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input 
                    type="text"
                    placeholder="ชื่อผู้ลงทุน" 
                    value={inv.name} 
                    onChange={e => handleInvestorChange(index, 'name', e.target.value)} 
                    className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  <input 
                    type="email"
                    placeholder="อีเมล" 
                    value={inv.email} 
                    onChange={e => handleInvestorChange(index, 'email', e.target.value)} 
                    className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  <input 
                    type="tel"
                    placeholder="เบอร์โทร" 
                    value={inv.phone} 
                    onChange={e => handleInvestorChange(index, 'phone', e.target.value)} 
                    className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  <input 
                    type="number"
                    placeholder="จำนวนเงิน (บาท)" 
                    value={inv.amount} 
                    onChange={e => handleInvestorChange(index, 'amount', e.target.value)} 
                    min="0"
                    className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  <input 
                    type="date"
                    placeholder="วันที่ลงเงิน" 
                    value={inv.date} 
                    onChange={e => handleInvestorChange(index, 'date', e.target.value)} 
                    className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  <div className="flex items-center">
                    {investors.length > 1 && (
                      <button 
                        onClick={() => removeInvestor(index)} 
                        className="text-red-500 hover:text-red-700 text-sm underline"
                      >
                        🗑️ ลบผู้ลงทุนนี้
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ปุ่มบันทึก */}
          <div className="text-center">
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังสร้างรถ...
                </span>
              ) : (
                '🚗 สร้างรถ & รับรหัสปลอดภัย 6 หลัก'
              )}
            </button>
          </div>

          {/* คำแนะนำ */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 คำแนะนำ:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• ระบบจะสร้างรหัสปลอดภัย 6 หลักให้อัตโนมัติ</li>
              <li>• กรุณาจดรหัสที่ได้รับไว้สำหรับเชิญสมาชิกเข้าร่วม</li>
              <li>• ข้อมูลที่มี * จำเป็นต้องกรอก</li>
              <li>• สามารถเพิ่มผู้ร่วมลงทุนได้หลายคน</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
