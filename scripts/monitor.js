const { createClient } = require('@supabase/supabase-js');

// GitHub Secrets'tan gelecek
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSystems() {
  // İzlenecek sistemleri çek
  const { data: systems, error } = await supabase
    .from('system_status')
    .select('id, label, target_url')
    .not('target_url', 'is', null);

  if (error) {
    console.error('Error fetching systems:', error);
    return;
  }

  for (const system of systems) {
    const startTime = Date.now();
    let status = 'Operational';
    
    try {
      const response = await fetch(system.target_url, { method: 'GET', timeout: 10000 });
      if (!response.ok) throw new Error('Down');
      
      console.log(`✅ ${system.label} is UP`);
    } catch (err) {
      status = 'Degraded'; // Veya 'Outage'
      console.log(`❌ ${system.label} is DOWN`);
    }

    // Veritabanını güncelle
    await supabase
      .from('system_status')
      .update({ 
        status: status,
        last_check: new Date().toISOString()
      })
      .eq('id', system.id);
  }
}

checkSystems();