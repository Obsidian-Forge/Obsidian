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
    let status = 'operational';
    let details = null;
    let latency = 0;
    const startTime = Date.now(); // Hız ölçümüne başlıyoruz

    try {
      const response = await fetch(system.target_url, { method: 'GET' });
      latency = Date.now() - startTime; // Ne kadar sürdüğünü hesapladık

      if (response.status >= 500) throw new Error(`HTTP Error ${response.status}`);
      
      // Eğer müşteri sitesi detaylı JSON (/api/health) döndürüyorsa onu oku
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.status) status = data.status; // operational, degraded, down
        if (data.details) details = data.details; // db: ok vb.
      }
      
      console.log(`✅ ${system.label} is UP (${latency}ms)`);
    } catch (err) {
      latency = Date.now() - startTime;
      status = 'down';
      details = { error: err.message };
      console.log(`❌ ${system.label} is DOWN`);
    }

    // 1. Durumu Ana Tabloda Güncelle
    await supabase
      .from('system_status')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', system.id);

    // 2. YENİ: Detayları Log Tablosuna Yaz!
    await supabase
      .from('incident_logs')
      .insert([{
        node_id: system.id,
        status: status,
        latency: latency,
        details: details
      }]);
  }
}

checkSystems();