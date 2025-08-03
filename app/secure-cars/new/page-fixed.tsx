'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' 
import supabase from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'

interface Investor {
  name: string
  email?: string
  amount: number
  share_percentage: number
}

export default function NewSecureCarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Car basic info
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [targetProfit, setTargetProfit] = useState('')
  const [status, setStatus] = useState('กำลังหา')
  const [notes, setNotes] = useState('')
  
  // Investors
  const [investors, setInvestors] = useState<Investor[]>([
    { name: '', email: '', amount: 0, share_percentage: 0 }
  ])
  
  const addInvestor = () => {
    setInvestors([...investors, { name: '', email: '', amount: 0, share_percentage: 0 }])
  }
  
  const removeInvestor = (index: number) => {
    if (investors.length > 1) {
      setInvestors(investors.filter((_, i) => i !== index))
    }
  }
  
  const updateInvestor = (index: number, field: keyof Investor, value: string | number) => {
    const updated = investors.map((investor, i) => 
      i === index ? { ...investor, [field]: value } : investor
    )
    setInvestors(updated)
  }

  const validateForm = () => {
    if (!brand.trim()) {
      toast.error('กรุณาระบุยี่ห้อรถ')
      return false
    }
    if (!model.trim()) {
      toast.error('กรุณาระบุรุ่นรถ')
      return false
    }
    if (!buyPrice || parseFloat(buyPrice) <= 0) {
      toast.error('กรุณาระบุราคาซื้อที่ถูกต้อง')
      return false
    }
    if (!sellPrice || parseFloat(sellPrice) <= 0) {
      toast.error('กรุณาระบุราคาขายที่ถูกต้อง')
      return false
    }
    if (parseFloat(sellPrice) <= parseFloat(buyPrice)) {
      toast.error('ราคาขายต้องมากกว่าราคาซื้อ')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      console.log('🚀 Starting car creation process...')

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error('กรุณาเข้าสู่ระบบก่อน')
        return
      }

      console.log('👤 User authenticated:', user.id)

      // Generate security code
      const securityCode = Math.floor(100000 + Math.random() * 900000).toString()
      console.log('🔐 Generated security code:', securityCode)

      // Calculate totals
      const totalInvestment = investors.reduce((sum, inv) => sum + inv.amount, 0)
      const profit = parseFloat(sellPrice) - parseFloat(buyPrice) // กำไรจริง = ราคาขาย - ราคาซื้อ
      
      console.log('💰 Calculation details:', {
        sellPrice: parseFloat(sellPrice),
        buyPrice: parseFloat(buyPrice),
        profit: profit,
        totalInvestment: totalInvestment,
        investorsCount: investors.filter(inv => inv.name.trim()).length
      })

      // Prepare investors data in the correct format for database
      const validInvestors = investors.filter(inv => inv.name.trim() && inv.amount > 0)
      const investorsJson = validInvestors.map(inv => ({
        name: inv.name.trim(),
        email: inv.email?.trim() || null,
        amount: Number(inv.amount),
        share_percentage: Number(inv.share_percentage) || 0
      }))

      console.log('👥 Processed investors data:', investorsJson)
      
      // Create car data (must include required fields)
      const carData = {
        user_id: user.id,  // ✅ ต้องมี (references auth.users)
        date: new Date().toISOString().split('T')[0], // ✅ ต้องมี (NOT NULL)
        brand: brand.trim(), // ✅ ต้องมี (NOT NULL)
        model: model.trim(), // ✅ ต้องมี (NOT NULL)
        year: year || null,  // ✅ nullable
        buy_price: parseFloat(buyPrice) || 0, // ✅ ต้องมี (DEFAULT 0)
        sell_price: parseFloat(sellPrice) || 0, // ✅ ต้องมี (DEFAULT 0)
        profit: profit, // คำนวณกำไร
        total_investment: totalInvestment, // รวมเงินลงทุน
        status: status, // ✅ ต้องมี (DEFAULT 'กำลังหา')
        notes: notes.trim() || null, // ✅ nullable
        investors: investorsJson, // ข้อมูลนักลงทุนในรูปแบบ JSON
        target_profit: targetProfit ? parseFloat(targetProfit) : null,
        car_code: securityCode // รหัสรถ
      }

      console.log('📦 Final car data for database:', carData)

      // 🚀 INSERT CAR DATA TO DATABASE
      const { data: carInsertData, error: carError } = await supabase
        .from('joint_cars')
        .insert([carData])
        .select('id, car_code, brand, model')
        .single()

      if (carError) {
        console.error('❌ Car insertion error:', carError)
        toast.error(`เกิดข้อผิดพลาดในการบันทึกข้อมูลรถ: ${carError.message}`)
        return
      }

      console.log('✅ Car inserted successfully:', carInsertData)
      const carId = carInsertData.id
      let finalSecurityCode = carInsertData.car_code

      // 🔐 ENSURE SECURITY CODE EXISTS
      if (!finalSecurityCode) {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
        
        const { error: updateError } = await supabase
          .from('joint_cars')
          .update({ car_code: generatedCode })
          .eq('id', carId)

        if (updateError) {
          console.warn('⚠️ Could not update security code:', updateError)
          // Use the original generated code even if database update failed
          finalSecurityCode = generatedCode
        } else {
          console.log('🔐 Security code updated in database:', generatedCode)
          finalSecurityCode = generatedCode
        }
      }

      // 👥 INSERT INVESTORS TO CAR_MEMBERS TABLE
      if (validInvestors.length > 0) {
        const memberEntries = validInvestors.map(investor => ({
          car_id: carId,
          member_name: investor.name,
          email: investor.email || null,
          investment_amount: investor.amount,
          share_percentage: investor.share_percentage || 0
        }))

        const { error: membersError } = await supabase
          .from('car_members')
          .insert(memberEntries)

        if (membersError) {
          console.error('❌ Investors insertion error:', membersError)
          toast.error(`เกิดข้อผิดพลาดในการบันทึกข้อมูลนักลงทุน: ${membersError.message}`)
        } else {
          console.log('✅ Investors inserted successfully:', memberEntries.length, 'members')
        }
      }

      // 🎯 ADD CREATOR AS OWNER
      const { error: ownerError } = await supabase
        .from('car_members')
        .insert({
          car_id: carId,
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.name || user.email,
          role: 'owner'
        })

      if (ownerError) {
        console.warn('⚠️ Could not add owner to members:', ownerError)
      }

      // 🎉 SUCCESS NOTIFICATION
      const successMessage = `✅ สร้างรถคันใหม่สำเร็จ!\n` +
        `🚗 ${carData.brand} ${carData.model}\n` +
        `🔐 รหัสรถ: ${finalSecurityCode}\n` +
        `👥 นักลงทุน: ${validInvestors.length} คน\n` +
        `💰 เงินลงทุนรวม: ${totalInvestment.toLocaleString()} บาท`
      
      // แสดงรหัสแบบหลายวิธี
      alert(successMessage)
      
      toast.success(
        `🎉 รถใหม่: ${carData.brand} ${carData.model}\n🔐 รหัส: ${finalSecurityCode}`,
        { duration: 8000 }
      )

      // 🖥️ CONSOLE OUTPUT FOR DEBUGGING
      console.log('🎯 === FINAL RESULTS ===')
      console.log('Car ID:', carId)
      console.log('Security Code:', finalSecurityCode)
      console.log('Brand/Model:', `${carData.brand} ${carData.model}`)
      console.log('Investors count:', validInvestors.length)
      console.log('Total investment:', totalInvestment.toLocaleString(), 'บาท')
      console.log('Expected profit:', profit.toLocaleString(), 'บาท')
      console.log('=== END RESULTS ===')

      // 🔄 RESET FORM
      setBrand('')
      setModel('')
      setYear(new Date().getFullYear())
      setBuyPrice('')
      setSellPrice('')
      setTargetProfit('')
      setStatus('กำลังหา')
      setNotes('')
      setInvestors([{ name: '', email: '', amount: 0, share_percentage: 0 }])

    } catch (error) {
      console.error('💥 Unexpected error:', error)
      toast.error(`เกิดข้อผิดพลาดที่ไม่คาดคิด: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  🚗 เพิ่มรถคันใหม่
                </h1>
                <p className="text-gray-600">
                  สร้างโครงการรถคันใหม่พร้อมระบบรหัสปลอดภัย
                </p>
              </div>
              <Link 
                href="/secure-cars" 
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← กลับ
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Car Basic Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                📋 ข้อมูลพื้นฐานของรถ
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ยี่ห้อรถ *
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เช่น Toyota, Honda, BMW"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รุ่นรถ *
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เช่น Camry, Civic, X5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ปี
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1990"
                    max="2030"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สถานะ
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="กำลังหา">กำลังหา</option>
                    <option value="ได้แล้ว">ได้แล้ว</option>
                    <option value="ขายแล้ว">ขายแล้ว</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                💰 ข้อมูลราคา
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ราคาซื้อ (บาท) *
                  </label>
                  <input
                    type="number"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ราคาขาย (บาท) *
                  </label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    กำไรเป้าหมาย (บาท)
                  </label>
                  <input
                    type="number"
                    value={targetProfit}
                    onChange={(e) => setTargetProfit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              {/* Profit Display */}
              {buyPrice && sellPrice && parseFloat(sellPrice) > parseFloat(buyPrice) && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">
                    💹 กำไรที่คาดการณ์: {(parseFloat(sellPrice) - parseFloat(buyPrice)).toLocaleString()} บาท
                  </p>
                </div>
              )}
            </div>

            {/* Investors */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  👥 นักลงทุน
                </h2>
                <button
                  type="button"
                  onClick={addInvestor}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  + เพิ่มนักลงทุน
                </button>
              </div>
              
              <div className="space-y-4">
                {investors.map((investor, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        นักลงทุนคนที่ {index + 1}
                      </h3>
                      {investors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvestor(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ชื่อ
                        </label>
                        <input
                          type="text"
                          value={investor.name}
                          onChange={(e) => updateInvestor(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="ชื่อนักลงทุน"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          อีเมล
                        </label>
                        <input
                          type="email"
                          value={investor.email}
                          onChange={(e) => updateInvestor(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="example@email.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          จำนวนเงิน (บาท)
                        </label>
                        <input
                          type="number"
                          value={investor.amount}
                          onChange={(e) => updateInvestor(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                          step="1000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          สัดส่วน (%)
                        </label>
                        <input
                          type="number"
                          value={investor.share_percentage}
                          onChange={(e) => updateInvestor(index, 'share_percentage', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Investment Display */}
              {investors.some(inv => inv.amount > 0) && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">
                    💰 รวมเงินลงทุน: {investors.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()} บาท
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                📝 หมายเหตุ
              </h2>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="หมายเหตุเพิ่มเติม เช่น สภาพรถ, อุปกรณ์พิเศษ, หรือข้อมูลอื่นๆ"
              />
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                >
                  {loading ? '🔄 กำลังบันทึก...' : '🚗 สร้างรถคันใหม่'}
                </button>
                
                <Link
                  href="/secure-cars"
                  className="px-6 py-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-lg font-medium"
                >
                  ยกเลิก
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
