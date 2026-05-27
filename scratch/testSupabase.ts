import { supabase } from '../lib/supabase';

async function test() {
  const { data, error } = await supabase.from('partner').select('id').limit(1);
  if (error) {
    console.error('Supabase error:', error);
    process.exit(1);
  }
  console.log('Supabase data:', data);
}

test();
