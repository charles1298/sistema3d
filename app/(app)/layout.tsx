import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import ParticlesCanvas from "@/components/ParticlesCanvas";
import { getSessao } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sessao = await getSessao();
  if (!sessao) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#07070F]">
      <ParticlesCanvas count={70} />

      {/* Ambient orbs — fixed behind everything */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Sidebar: only on md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 relative z-10 overflow-auto">
        <div className="p-4 pb-24 md:p-8 md:pb-8 max-w-[1400px]">{children}</div>
      </main>

      {/* Bottom nav: only on mobile */}
      <BottomNav />
    </div>
  );
}
