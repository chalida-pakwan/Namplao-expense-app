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
  
  // Auto calculate share percentages based on investment amounts
  const calculateSharePercentages = () => {
    const totalInvestment = investors.reduce((sum, inv) => sum + inv.amount, 0)
    if (totalInvestment > 0) {
      const updated = investors.map(investor => ({
        ...investor,
        share_percentage: Math.round((investor.amount / totalInvestment) * 100 * 100) / 100
      }))
      setInvestors(updated)
    }
  }
  
  const validateForm = () => {
    if (!brand.trim() || !model.trim() || !buyPrice || !sellPrice) {
      toast.error('กรุณากรอกข้อมูลรถให้ครบถ้วน')
      return false
    }
    
    if (parseFloat(buyPrice) <= 0 || parseFloat(sellPrice) <= 0) {
      toast.error('ราคาต้องมากกว่า 0')
      return false
    }
    
    if (investors.some(inv => !inv.name.trim() || inv.amount <= 0)) {
      toast.error('กรุณากรอกข้อมูลผู้ลงทุนให้ครบถ้วน')
      return false
    }
    
    return true
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error('กรุณาเข้าสู่ระบบ')
        router.push('/auth')
        return
      }

      // Generate unique 6-digit security code
      const generateSecurityCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString()
      }

      // Check if code already exists
      const ensureUniqueCode = async (): Promise<string> => {
        let attempts = 0
        while (attempts < 10) {
          const code = generateSecurityCode()
          const { data, error } = await supabase
            .from('joint_cars')
            .select('id')
            .eq('car_code', code)
            .single()
          
          if (error && error.code === 'PGRST116') {
            // Code not found, it's unique
            return code
          }
          attempts++
        }
        throw new Error('ไม่สามารถสร้างรหัสเฉพาะได้')
      }

      const securityCode = await ensureUniqueCode()
      
      // Calculate totals
      const totalInvestment = investors.reduce((sum, inv) => sum + inv.amount, 0)
      const profit = parseFloat(sellPrice) - parseFloat(buyPrice) - totalInvestment
      
      // Create car data
      const carData = {
        date: new Date().toISOString().split('T')[0],
        brand: brand.trim(),
        model: model.trim(),
        year: year,
        buy_price: parseFloat(buyPrice),
        sell_price: parseFloat(sellPrice),
        target_profit: parseFloat(targetProfit) || profit,
        profit: profit,
        total_investment: totalInvestment,
        status: status,
        notes: notes.trim(),
        created_by: user.id,
        car_code: securityCode, // เพิ่มรหัสปลอดภัย
        investors: investors.filter(inv => inv.name.trim()),
        additional_expenses: [],
        images: []
      }
      
      // Insert into joint_cars table with security code
      const { data: carResult, error: carError } = await supabase
        .from('joint_cars')
        .insert([carData])
        .select()
        .single()
      
      if (carError) {
        console.error('Error creating car:', carError)
        toast.error('เกิดข้อผิดพลาดในการสร้างรถ: ' + carError.message)
        return
      }
      
      // Add creator as owner in car_members
      const { error: memberError } = await supabase
        .from('car_members')
        .insert([{
          car_id: carResult.id,
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.name || user.email,
          role: 'owner'
        }])
      
      if (memberError) {
        console.error('Error adding owner to members:', memberError)
        // ไม่ return เพราะรถสร้างสำเร็จแล้ว
      }
      
      // Show success message with security code
      toast.success(`🎉 สร้างรถสำเร็จ! รหัสปลอดภัย: ${securityCode}`, {
        duration: 6000,
        style: {
          background: '#10B981',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      })
      
      // Show alert with the security code
      alert(`🔐 รหัสปลอดภัยสำหรับรถคันนี้: ${securityCode}\n\nให้ใช้รหัสนี้เชิญสมาชิกเข้าร่วม\n(กรุณาเก็บรหัสนี้ไว้ให้ดี)`)
      
      router.push(`/secure-cars/${carResult.id}`)
      
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
                <span className="text-blue-600">🔐</span>
                สร้างรถใหม่ (ระบบปลอดภัย)
              </h1>
              <p className="text-gray-600 mt-1">รถจะได้รหัส 6 หลักสำหรับเชิญสมาชิกอัตโนมัติ</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Car Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span>🚗</span>
              ข้อมูลรถ
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="เช่น Toyota, Honda"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="กำลังหา">กำลังหา</option>
                  <option value="ซื้อแล้ว">ซื้อแล้ว</option>
                  <option value="ขายแล้ว">ขายแล้ว</option>
                  <option value="ยกเลิก">ยกเลิก</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคาซื้อ (บาท) *
                </label>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                กำไรเป้าหมาย (บาท)
              </label>
              <input
                type="number"
                value={targetProfit}
                onChange={(e) => setTargetProfit(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="จะคำนวณอัตโนมัติจากราคาขาย - ราคาซื้อ - ค่าใช้จ่าย"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมายเหตุ
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="รายละเอียดเพิ่มเติม..."
              />
            </div>
          </div>

          {/* Investors */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span>👥</span>
                ผู้ลงทุน
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={calculateSharePercentages}
                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  🧮 คำนวณ %
                </button>
                <button
                  type="button"
                  onClick={addInvestor}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  + เพิ่มผู้ลงทุน
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {investors.map((investor, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ *
                    </label>
                    <input
                      type="text"
                      value={investor.name}
                      onChange={(e) => updateInvestor(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ชื่อผู้ลงทุน"
                      required
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
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนเงิน (บาท) *
                    </label>
                    <input
                      type="number"
                      value={investor.amount}
                      onChange={(e) => updateInvestor(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
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
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    {investors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInvestor(index)}
                        className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        🗑️ ลบ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">สรุป</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">เงินลงทุนรวม:</span>
                  <div className="font-semibold">
                    {investors.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()} บาท
                  </div>
                </div>
                <div>
                  <span className="text-blue-600">สัดส่วนรวม:</span>
                  <div className="font-semibold">
                    {investors.reduce((sum, inv) => sum + inv.share_percentage, 0).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <span className="text-blue-600">กำไรคาดการณ์:</span>
                  <div className="font-semibold">
                    {(parseFloat(sellPrice || '0') - parseFloat(buyPrice || '0') - investors.reduce((sum, inv) => sum + inv.amount, 0)).toLocaleString()} บาท
                  </div>
                </div>
                <div>
                  <span className="text-blue-600">จำนวนผู้ลงทุน:</span>
                  <div className="font-semibold">{investors.length} คน</div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/secure-cars"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <span>🔐</span>
                  สร้างรถ (มีรหัสปลอดภัย)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
