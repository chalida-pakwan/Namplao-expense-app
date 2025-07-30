'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';

export default function TestJointCars() {
  const [user, setUser] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results: string[] = [];
    
    try {
      // Test 1: Authentication
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        results.push('❌ Authentication Error: ' + authError.message);
      } else if (currentUser) {
        results.push('✅ Authentication: User logged in - ' + currentUser.email);
        setUser(currentUser);
      } else {
        results.push('⚠️ Authentication: No user logged in');
      }

      // Test 2: Database Connection
      const { data: tablesData, error: dbError } = await supabase
        .from('joint_cars')
        .select('id, brand, model, status')
        .limit(5);
      
      if (dbError) {
        results.push('❌ Database Error: ' + dbError.message);
      } else {
        results.push('✅ Database Connection: Successfully connected');
        results.push(`📊 Found ${tablesData?.length || 0} joint cars records`);
        setCars(tablesData || []);
      }

      // Test 3: Check required tables
      const tables = ['joint_cars', 'post_sale_expenses'];
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('id').limit(1);
          if (error) {
            results.push(`❌ Table ${table}: Error - ${error.message}`);
          } else {
            results.push(`✅ Table ${table}: Exists and accessible`);
          }
        } catch (err) {
          results.push(`❌ Table ${table}: Connection failed`);
        }
      }

      // Test 4: Check if we can create a test record (if user is logged in)
      if (currentUser) {
        try {
          const testCar = {
            user_id: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            brand: 'Test',
            model: 'Test Model',
            year: 2024,
            buy_price: 100000,
            sell_price: 120000,
            total_cost: 105000,
            profit: 15000,
            total_investment: 100000,
            status: 'กำลังหา',
            notes: 'Test record - can be deleted',
            investors: [{ name: 'Test User', amount: 100000, share_percentage: 100 }],
            expenses: []
          };

          const { data: insertData, error: insertError } = await supabase
            .from('joint_cars')
            .insert(testCar)
            .select()
            .single();

          if (insertError) {
            results.push('❌ Insert Test: Cannot create records - ' + insertError.message);
          } else {
            results.push('✅ Insert Test: Can create records successfully');
            
            // Clean up test record
            if (insertData?.id) {
              await supabase.from('joint_cars').delete().eq('id', insertData.id);
              results.push('🧹 Cleanup: Test record deleted');
            }
          }
        } catch (err) {
          results.push('❌ Insert Test: Exception occurred');
        }
      }

    } catch (error) {
      results.push('❌ General Error: ' + (error as Error).message);
    }

    setTestResult(results.join('\n'));
    setLoading(false);
  };

  const retryTests = () => {
    setLoading(true);
    setTestResult('');
    runTests();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">🧪 ทดสอบระบบ Joint Cars</h1>
            <button
              onClick={retryTests}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? '⏳ กำลังทดสอบ...' : '🔄 ทดสอบใหม่'}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-3 text-blue-600">กำลังทดสอบระบบ...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Test Results */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h2 className="text-base sm:text-lg font-semibold mb-3">📋 ผลการทดสอบ</h2>
                <div className="bg-white rounded p-2 sm:p-3 max-h-60 sm:max-h-80 overflow-y-auto">
                  <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-mono break-words">
                    {testResult}
                  </pre>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                  <h2 className="text-base sm:text-lg font-semibold mb-3 text-green-800">👤 ข้อมูลผู้ใช้</h2>
                  <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                    <div className="break-words"><strong>ID:</strong> <span className="font-mono">{user.id}</span></div>
                    <div className="break-words"><strong>Email:</strong> {user.email}</div>
                    <div><strong>Created:</strong> {new Date(user.created_at).toLocaleString('th-TH')}</div>
                    <div><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at).toLocaleString('th-TH')}</div>
                  </div>
                </div>
              )}

              {/* Sample Data */}
              {cars.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-3 text-blue-800">🚗 ข้อมูลรถตัวอย่าง</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">ยี่ห้อ</th>
                          <th className="text-left p-2">รุ่น</th>
                          <th className="text-left p-2">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cars.map((car) => (
                          <tr key={car.id} className="border-b">
                            <td className="p-2 font-mono text-xs">{car.id.substring(0, 8)}...</td>
                            <td className="p-2">{car.brand}</td>
                            <td className="p-2">{car.model}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                car.status === 'ขายแล้ว' ? 'bg-green-100 text-green-800' :
                                car.status === 'ซื้อแล้ว' ? 'bg-blue-100 text-blue-800' :
                                car.status === 'กำลังหา' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {car.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 text-orange-800">🔗 ลิงก์ทดสอบ</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <a
                    href="/joint-cars"
                    className="block p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-center transition-colors"
                  >
                    📊 หน้าหลัก Joint Cars
                  </a>
                  <a
                    href="/joint-cars/new"
                    className="block p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-center transition-colors"
                  >
                    ➕ เพิ่มรถใหม่
                  </a>
                  <a
                    href="/dashboard"
                    className="block p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center transition-colors"
                  >
                    🏠 Dashboard หลัก
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
