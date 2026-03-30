export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white p-8 md:p-20">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="pb-8 border-b border-zinc-200">
                    <div className="w-12 h-12 bg-black rounded-xl mb-6 flex items-center justify-center">
                        <img src="/logo.png" alt="Novatrum" className="w-8 h-8 filter invert" />
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Master Service Agreement</h1>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2">Last Updated: March 2026</p>
                </div>

                <div className="space-y-8 text-sm font-bold text-zinc-700 leading-relaxed">
                    <section className="space-y-3">
                        <h2 className="text-lg font-black uppercase text-black">1. Scope of Work (Scope Creep)</h2>
                        <p>The services provided by Novatrum are strictly limited to the specifications outlined in the agreed "Definitive Blueprint". Any additional features, pages, or integrations requested after the blueprint is approved will be subject to additional billing at our standard hourly rate.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-black uppercase text-black">2. Payment Terms</h2>
                        <p>Invoices are generated via our automated system. Unless an installment plan is specifically agreed upon in the blueprint, payments are required as specified on the invoice. Development will pause if payments are delayed beyond 14 days of the due date.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-black uppercase text-black">3. Intellectual Property (IP)</h2>
                        <p>All source code, design assets, and intellectual property remain the sole property of Novatrum until the final invoice is paid in full. Upon full payment, a perpetual license to use the product is automatically transferred to the client.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-black uppercase text-black">4. Maintenance & Hosting</h2>
                        <p>Unless a "Continuous Engineering" (Monthly Retainer) package is selected, Novatrum is not responsible for server uptime, security patches, or content updates after the final handover. Clients without a maintenance plan assume full responsibility for their digital infrastructure.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-black uppercase text-black">5. Client Responsibilities</h2>
                        <p>The client agrees to provide necessary materials (text, images, branding guidelines) in a timely manner. Delays in providing materials may result in timeline extensions.</p>
                    </section>
                </div>

                <div className="pt-12 border-t border-zinc-200 mt-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Novatrum Core Infrastructure // Legal Department</p>
                </div>
            </div>
        </div>
    );
}