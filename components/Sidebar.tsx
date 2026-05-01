"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  FileBox,
  LogOut,
  Calculator,
  Settings,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projetos", label: "Projetos", icon: FolderOpen },
  { href: "/arquivos", label: "Arquivos", icon: FileBox },
  { href: "/precificacao", label: "Precificação", icon: Calculator },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside
      className="flex flex-col w-60 min-h-screen shrink-0 relative z-20"
      style={{
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <img src="/logo.png" alt="3D Sistema" className="w-9 h-9 object-contain" />
        <div>
          <p className="text-sm font-bold text-white leading-tight tracking-tight">3D Sistema</p>
          <p className="text-[11px] leading-tight mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            Bambu Lab A1 Mini
          </p>
        </div>
      </div>

      <div className="mx-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer"
              style={
                active
                  ? {
                      background: "rgba(124,58,237,0.2)",
                      color: "#A78BFA",
                      border: "1px solid rgba(124,58,237,0.3)",
                      boxShadow: "0 0 12px rgba(124,58,237,0.15)",
                    }
                  : {
                      color: "rgba(255,255,255,0.4)",
                      border: "1px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
