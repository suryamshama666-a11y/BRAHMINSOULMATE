import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pgiivokemegrlevfzezg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWl2b2tlbWVncmxldmZ6ZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDA4OTYsImV4cCI6MjA2MTk3Njg5Nn0.MBDTfgkKb8m7aNLDM6xRi1zxLyP8hyk2pH90Hd6aZw8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMinimalInsert() {
  console.log('🧪 Testing minimal data insertion...\n');
  
  // Try inserting with just basic columns that should exist
  const testCases = [
    // Test 1: Just ID (auto-generated)
    {},
    
    // Test 2: Just user_id
    { user_id: 'test-user-1' },
    
    // Test 3: Add created_at
    { 
      user_id: 'test-user-2',
      created_at: new Date().toISOString()
    },
    
    // Test 4: Add basic profile info
    {
      user_id: 'test-user-3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testData = testCases[i];
    console.log(`📋 Test ${i + 1}: Inserting`, testData);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(testData)
        .select();
      
      if (error) {
        console.log(`❌ Test ${i + 1} failed:`, error.message);
        if (error.details) console.log(`   Details:`, error.details);
        if (error.hint) console.log(`   Hint:`, error.hint);
      } else {
        console.log(`✅ Test ${i + 1} succeeded!`);
        console.log(`   Inserted:`, data);
        
        // Clean up
        if (data && data[0]) {
          await supabase.from('profiles').delete().eq('id', data[0].id);
          console.log(`   🧹 Cleaned up test record`);
        }
        
        // If this test worked, we know what columns exist
        console.log(`\n🎯 SUCCESS! These columns work:`, Object.keys(testData));
        break;
      }
    } catch (err) {
      console.log(`❌ Test ${i + 1} exception:`, err.message);
    }
    
    console.log('');
  }
}

async function main() {
  console.log('🚀 Minimal Database Test');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('\n');
  
  try {
    await testMinimalInsert();
    
    console.log('\n💡 Next Steps:');
    console.log('1. Use the working column structure from above');
    console.log('2. Create a population script with only those columns');
    console.log('3. Or check your Supabase dashboard to see the actual table structure');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

main();
