const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSystems() {
  const { data: systems, error } = await supabase
    .from('system_status')
    .select('id, label, target_url')
    .not('target_url', 'is', null);

  if (error) {
    console.error('Error fetching systems:', error);
    return;
  }

  for (const system of systems) {
    let status = 'operational'; // Tablonda küçük harf kullandığın için böyle kalsın
    
    try {
      const response = await fetch(system.target_url, { method: 'GET' });
      // Supabase URL'lerine auth'suz gidince 401/400 dönebilir, 
      // bu sunucunun ayakta olduğunu kanıtlar.
      if (response.status >= 500) throw new Error('Down');
      
      console.log(`✅ ${system.label} is UP`);
    } catch (err) {
      status = 'degraded';
      console.log(`❌ ${system.label} is DOWN`);
    }

    await supabase
      .from('system_status')
      .update({ 
        status: status,
        updated_at: new Date().toISOString() // Tablondaki kolon adı updated_at
      })
      .eq('id', system.id);
  }
}

checkSystems();