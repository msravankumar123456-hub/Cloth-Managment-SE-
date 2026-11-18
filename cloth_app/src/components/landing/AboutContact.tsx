import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, MapPin, Mail, Phone, Building2, CheckCircle2 } from 'lucide-react';

export const AboutContact: React.FC = () => {
  const { submitEnquiry } = useApp();
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.businessName) return;

    submitEnquiry({
      name: form.name,
      businessName: form.businessName,
      email: form.email,
      message: form.message,
    });

    setSubmitted(true);
    setForm({ name: '', businessName: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="about-contact" className="py-24 relative bg-[#101114] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Platform About & Sample Contact Details */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-semibold tracking-wider text-[#FF7135] uppercase mb-2">
                About The Platform
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Connecting Indian apparel makers with independent retail.
              </h2>
              <p className="text-sm text-[#A1A1AA] mt-4 leading-relaxed">
                Loopmex is a proposed digital platform designed as a software engineering prototype to bridge the gap between clothing manufacturing clusters (Tirupur, Surat, Ludhiana) and independent fashion retailers across India.
              </p>
              <p className="text-sm text-[#71717A] mt-3 leading-relaxed">
                By standardizing size-ratio inventory visibility, automated GSTIN wholesale invoicing, and centralized freight tracking, Loopmex removes opaque agent commissions and supply chain friction.
              </p>
            </div>

            {/* Clearly Identified Sample Business Contact Details */}
            <div className="mt-8 pt-8 border-t border-white/[0.06] space-y-4 text-xs text-[#A1A1AA]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#71717A]">
                Prototype Demonstration Desk
              </div>
              
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-[#FF7135] shrink-0" />
                <span>Loopmex Apparel Tech Hub (Academic Demo Prototype)</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#FF7135] shrink-0" />
                <span>Textile Cluster Corridor, Tirupur & Surat Hubs (Sample Coordinates)</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#FF7135] shrink-0" />
                <span>demo@loopmex.internal</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#FF7135] shrink-0" />
                <span>+91 800-TB-WHOLESALE (Demonstration Toll-Free)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-9 rounded-2xl bg-[#17181C] border border-white/[0.08] shadow-2xl relative">
              <h3 className="text-xl font-bold text-white mb-1">
                Wholesale Partnership Enquiry
              </h3>
              <p className="text-xs text-[#71717A] mb-6">
                Are you an apparel retailer or garment manufacturer? Submit your business profile to test rate negotiations.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Enquiry Received!</h4>
                  <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                    Thank you. Your wholesale inquiry has been submitted to the factory desk. A demonstration sample catalog will be generated.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#D4D4D8] mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Ramesh Varma"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white placeholder-[#71717A] text-xs focus:outline-none focus:border-[#FF7135] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#D4D4D8] mb-1.5">
                        Shop / Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.businessName}
                        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        placeholder="e.g. Varma Apparels & Boutiques"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white placeholder-[#71717A] text-xs focus:outline-none focus:border-[#FF7135] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D8] mb-1.5">
                      Business Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. procurement@varmaapparels.in"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white placeholder-[#71717A] text-xs focus:outline-none focus:border-[#FF7135] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4D4D8] mb-1.5">
                      Message / Requirements
                    </label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Specify your retail categories, expected monthly pieces (e.g., 500+ shirts/month), and preferred fabrics..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white placeholder-[#71717A] text-xs focus:outline-none focus:border-[#FF7135] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-semibold text-xs tracking-wide uppercase transition-all duration-200 shadow-xl shadow-[#FF7135]/25 hover:shadow-[#FF7135]/40 cursor-pointer"
                  >
                    <span>Submit Enquiry</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
