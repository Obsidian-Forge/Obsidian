import KeyGenerator from "./components/KeyGenerator";

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="mb-12 border-b border-zinc-900 pb-4">
        <h2 className="text-zinc-500 text-[0.65rem] tracking-[0.4em] uppercase">Module 01</h2>
        <h3 className="text-2xl tracking-[0.2em] font-light mt-2">Access Key Generation</h3>
      </div>

      {/* Tüm karmaşık mantığı ve arayüzü buraya bağladık */}
      <KeyGenerator />
      
    </div>
  );
}
