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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!brand.trim() || !model.trim() || !buyPrice) {
      toast.error('กรุณากรอกข้อมูลพื้นฐานให้ครบถ้วน')
      return
    }
    
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
      const profit = parseFloat(sellPrice) - parseFloat(buyPrice)
      
      console.log('💰 Calculation details:', {
        sellPrice: parseFloat(sellPrice),
        buyPrice: parseFloat(buyPrice),
        profit: profit,
        totalInvestment: totalInvestment,
        investorsCount: investors.filter(inv => inv.name.trim()).length
      })

      // Prepare investors data
      const validInvestors = investors.filter(inv => inv.name.trim() && inv.amount > 0)
      const investorsJson = validInvestors.map(inv => ({
        name: inv.name.trim(),
        email: inv.email?.trim() || null,
        amount: Number(inv.amount),
        share_percentage: Number(inv.share_percentage) || 0
      }))

      console.log('👥 Processed investors data:', investorsJson)
      
      // Create car data
      const carData = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        brand: brand.trim(),
        model: model.trim(),
        year: year || null,
        buy_price: parseFloat(buyPrice) || 0,
        sell_price: parseFloat(sellPrice) || 0,
        total_cost: parseFloat(buyPrice) || 0,
        profit: profit || 0,
        total_investment: totalInvestment || 0,
        status: status || 'กำลังหา',
        notes: notes.trim() || '',
        investors: investorsJson,
        car_code: securityCode
      }

      console.log('📦 Final car data for database:', carData)

      // Insert car data
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

      // Ensure security code exists
      if (!finalSecurityCode) {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
        
        const { error: updateError } = await supabase
          .from('joint_cars')
          .update({ car_code: generatedCode })
          .eq('id', carId)

        if (updateError) {
          console.warn('⚠️ Could not update security code:', updateError)
          finalSecurityCode = generatedCode
        } else {
          console.log('🔐 Security code updated in database:', generatedCode)
          finalSecurityCode = generatedCode
        }
      }

      // Insert investors to car_members table
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

      // Add creator as owner
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

      // Success notification
      const successMessage = `✅ สร้างรถคันใหม่สำเร็จ!\n` +
        `🚗 ${carData.brand} ${carData.model}\n` +
        `🔐 รหัสรถ: ${finalSecurityCode}\n` +
        `👥 นักลงทุน: ${validInvestors.length} คน\n` +
        `💰 เงินลงทุนรวม: ${totalInvestment.toLocaleString()} บาท`
      
      alert(successMessage)
      
      toast.success(
        `🎉 รถใหม่: ${carData.brand} ${carData.model}\n🔐 รหัส: ${finalSecurityCode}`,
        { duration: 8000 }
      )

      console.log('🎯 === FINAL RESULTS ===')
      console.log('Car ID:', carId)
      console.log('Security Code:', finalSecurityCode)
      console.log('Brand/Model:', `${carData.brand} ${carData.model}`)
      console.log('Investors count:', validInvestors.length)
      console.log('Total investment:', totalInvestment.toLocaleString(), 'บาท')
      console.log('Expected profit:', profit.toLocaleString(), 'บาท')
      console.log('=== END RESULTS ===')

      // Reset form
      setBrand('')
      setModel('')
      setYear(new Date().getFullYear())
      setBuyPrice('')
      setSellPrice('')
      setTargetProfit('')
      setStatus('กำลังหา')
      setNotes('')
      setInvestors([{ name: '', email: '', amount: 0, share_percentage: 0 }])

      // Navigate to secure cars page
      setTimeout(() => {
        router.push('/secure-cars')
      }, 2000)

    } catch (error) {
      console.error('💥 Unexpected error:', error)
      toast.error('เกิดข้อผิดพลาดที่ไม่คาดคิด')
    } finally {
      setLoading(false)
    }
  }

  const addInvestor = () => {
    setInvestors([...investors, { name: '', email: '', amount: 0, share_percentage: 0 }])
  }

  const removeInvestor = (index: number) => {
    if (investors.length > 1) {
      setInvestors(investors.filter((_, i) => i !== index))
    }
  }

  const updateInvestor = (index: number, field: keyof Investor, value: any) => {
    const updated = [...investors]
    updated[index] = { ...updated[index], [field]: value }
    setInvestors(updated)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link 
                href="/secure-cars"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-green-600">🆕</span>
                  สร้างรถใหม่
                </h1>
                <p className="text-gray-600 mt-1">ระบบหารรถแบบปลอดภัย • รหัสเฉพาะ 6 หลัก</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
            {/* Car Basic Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🚗</span>
                ข้อมูลพื้นฐานรถ
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ยี่ห้อ *
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เช่น Toyota, Honda"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รุ่น *
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เช่น Camry, Civic"
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
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1990"
                    max={new Date().getFullYear() + 5}
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
                    <option value="ซื้อแล้ว">ซื้อแล้ว</option>
                    <option value="ขายแล้ว">ขายแล้ว</option>
                    <option value="ยกเลิก">ยกเลิก</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>💰</span>
                ข้อมูลราคา
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
                    ราคาขายเป้าหมาย (บาท)
                  </label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    กำไรคาดหวัง (บาท)
                  </label>
                  <input
                    type="number"
                    value={buyPrice && sellPrice ? (parseFloat(sellPrice) - parseFloat(buyPrice)).toString() : ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    placeholder="คำนวณอัตโนมัติ"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Investors */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span>👥</span>
                  นักลงทุน
                </h2>
                <button
                  type="button"
                  onClick={addInvestor}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  + เพิ่มนักลงทุน
                </button>
              </div>

              <div className="space-y-4">
                {investors.map((investor, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">
                        นักลงทุนคนที่ {index + 1}
                      </span>
                      {investors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvestor(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="ชื่อ"
                          value={investor.name}
                          onChange={(e) => updateInvestor(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="อีเมล (ไม่บังคับ)"
                          value={investor.email}
                          onChange={(e) => updateInvestor(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="จำนวนเงิน"
                          value={investor.amount}
                          onChange={(e) => updateInvestor(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          min="0"
                          step="1000"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="สัดส่วน %"
                          value={investor.share_percentage}
                          onChange={(e) => updateInvestor(index, 'share_percentage', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>เงินลงทุนรวม:</strong> {investors.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()} บาท
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมายเหตุ
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="รายละเอียดเพิ่มเติม..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    กำลังสร้างรถ...
                  </span>
                ) : (
                  '🚗 สร้างรถใหม่'
                )}
              </button>
              
              <Link
                href="/secure-cars"
                className="bg-gray-500 text-white py-4 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium text-lg text-center"
              >
                ยกเลิก
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
