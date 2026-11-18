import { useState, type InputHTMLAttributes } from 'react';

export function Field({ label, error, secret, ...p }: { label: string; error?: string; secret?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const id = label.replace(/\W+/g, '-').toLowerCase();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1.5">{label}</label>
      <div className="relative">
        <input id={id} {...p} type={secret && !show ? 'password' : secret ? 'text' : p.type}
          aria-invalid={!!error}
          className={`w-full rounded-lg bg-[#17181c] border px-3.5 py-2.5 text-[#F5F5F5] placeholder-neutral-500 outline-none focus:ring-2 focus:ring-[#FF7135]/50 ${error ? 'border-red-500' : 'border-white/10'} ${secret ? 'pr-16' : ''}`} />
        {secret && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-3 text-xs text-neutral-400 hover:text-[#FF7135]">
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400" role="alert">{error}</p>}
    </div>
  );
}
export const PrimaryButton = ({ loading, children, ...p }: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...p} disabled={loading || p.disabled} className="w-full rounded-lg bg-[#FF7135] hover:bg-[#ff8452] disabled:opacity-60 text-white font-semibold py-2.5 transition">
    {loading ? 'Please wait…' : children}
  </button>
);
export const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen grid place-items-center px-4 py-10 bg-[#101114]">
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14151a] p-6 sm:p-8 shadow-xl">{children}</div>
  </div>
);
