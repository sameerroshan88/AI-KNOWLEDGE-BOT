"use client"

export function DashboardTrustBar() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[20px] border border-[#1f1f1f] bg-[#050505] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#111111] text-[#7C3AED] font-semibold border border-[#1f1f1f]">V</div>
          <div>
            <p className="text-sm font-semibold text-white">Vidyashilp University</p>
            <p className="mt-1 text-sm text-[#7c7c7c]">Trusted partner for academic knowledge bases.</p>
          </div>
        </div>
      </div>
      <div className="rounded-[20px] border border-[#1f1f1f] bg-[#050505] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#111111] text-[#7C3AED] font-semibold border border-[#1f1f1f]">T</div>
          <div>
            <p className="text-sm font-semibold text-white">TechQRT</p>
            <p className="mt-1 text-sm text-[#7c7c7c]">Secure research tools for fast PDF conversations.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
