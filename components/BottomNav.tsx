"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderOpen, FileBox, Calculator, Settings, LogOut } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projetos", label: "Projetos", icon: FolderOpen },
  { href: "/arquivos", label: "Arquivos", icon: FileBox },
  { href: "/precificacao", label: "Preços", icon: Calculator },
  { href: "/configuracoes", label: "Config", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2 md:hidden"
      style={{
        background: "rgba(7,7,15,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 cursor-pointer min-w-[56px]"
            style={
              active
                ? { color: "#A78BFA" }
                : { color: "rgba(255,255,255,0.35)" }
            }
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 cursor-pointer min-w-[56px]"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        <LogOut size={20} />
        <span className="text-[10px] font-medium leading-none">Sair</span>
      </button>
    </nav>
  );
}
