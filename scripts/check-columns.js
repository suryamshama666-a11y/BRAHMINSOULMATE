import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pgiivokemegrlevfzezg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWl2b2tlbWVncmxldmZ6ZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDA4OTYsImV4cCI6MjA2MTk3Njg5Nn0.MBDTfgkKb8m7aNLDM6xRi1zxLyP8hyk2pH90Hd6aZw8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableStructure() {
  console.log('🔍 Checking actual table structure...\n');
  
  try {
    // Try to insert a minimal record to see what columns are expected
    console.log('📋 Testing profiles table structure...');
    
    const testProfile = {
      name: 'Test User',
      age: 25,
      gender: 'male',
      location: { city: 'Test City', state: 'Test State', country: 'India' },
      religion: 'Hindu',
      marital_status: 'never_married',
      height: 170,
      education: [{ degree: 'Test Degree', institution: 'Test University', year: 2020 }],
      employment: { profession: 'Test Job', company: 'Test Company', position: 'Test Position' }
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select();
    
    if (error) {
      console.log('❌ Insert failed with error:', error.message);
      console.log('📝 Error details:', error.details);
      console.log('💡 Error hint:', error.hint);
      
      // Try to get schema information from the error
      if (error.message.includes('column')) {
        console.log('\n🔍 This suggests a column mismatch.');
        console.log('Let me try a different approach...\n');
        
        // Try inserting with minimal data
        const minimalProfile = {
          name: 'Test User'
        };
        
        const { data: data2, error: error2 } = await supabase
          .from('profiles')
          .insert(minimalProfile)
          .select();
        
        if (error2) {
          console.log('❌ Minimal insert also failed:', error2.message);
        } else {
          console.log('✅ Minimal insert succeeded!');
          console.log('📊 Inserted data:', data2);
        }
      }
    } else {
      console.log('✅ Insert succeeded!');
      console.log('📊 Inserted data:', data);
      
      // Clean up the test record
      if (data && data[0]) {
        await supabase
          .from('profiles')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
    
    // Try to select from the table to see its structure
    console.log('\n📋 Attempting to select from profiles table...');
    const { data: selectData, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Select failed:', selectError.message);
    } else {
      console.log('✅ Select succeeded');
      if (selectData && selectData.length > 0) {
        console.log('📊 Table has data. Columns found:');
        Object.keys(selectData[0]).forEach(col => console.log(`   • ${col}`));
      } else {
        console.log('📊 Table exists but is empty');
      }
    }
    
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

async function main() {
  console.log('🚀 Database Column Checker');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('\n');
  
  await checkTableStructure();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Check the error messages above');
  console.log('2. Verify the schema was applied correctly in the dashboard');
  console.log('3. Make sure RLS is disabled for testing');
}

main();
