const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.development' });

async function executeSQLFile() {
  try {
    console.log('🔗 Setting up Supabase connection...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials in .env.development');
      console.log('URL exists:', !!supabaseUrl);
      console.log('Key exists:', !!supabaseKey);
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('📄 Reading SQL file...');
    const sqlContent = fs.readFileSync('./database/add_receipt_support.sql', 'utf8');
    
    console.log('🗃️ Executing SQL via Supabase Dashboard (Manual approach)...');
    console.log('');
    console.log('==== SQL TO EXECUTE ====');
    console.log(sqlContent);
    console.log('==== END SQL ====');
    console.log('');
    console.log('💡 Please copy the SQL above and run it in your Supabase SQL Editor.');
    console.log('🌐 Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
    
    // Test connection
    const { data, error } = await supabase.from('joint_cars').select('id').limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('📊 Found', data?.length || 0, 'car records');
    }
    
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

executeSQLFile();