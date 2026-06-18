"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/lib/store";
import Coach from "@/components/Coach";

const NAV = [
  { section: "Dashboard" },
  { href: "/dashboard", icon: "🏠", label: "Overview & allocation" },
  { href: "/performance", icon: "📈", label: "Performance" },
  { href: "/stress", icon: "🌪️", label: "Stress Lab" },
  { href: "/future", icon: "🔮", label: "Future Paths" },
  { section: "Guidance" },
  { href: "/actions", icon: "🧭", label: "Action Center" },
  { href: "/learn", icon: "🎓", label: "Learn Hub" },
  { section: "Setup" },
  { href: "/onboarding", icon: "⚙️", label: "My profile" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { data, user, isAuthed, logout } = useProfile();
  const src = data?.meta?.dataSource || "";
  const live = src.startsWith("live");
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">🧭</span>
          <div>
            <div className="name">WealthLens</div>
            <div className="sub">Plan · learn · invest</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((n, i) =>
            "section" in n ? (
              <div className="nav-section" key={i}>{n.section}</div>
            ) : (
              <Link key={n.href} href={n.href!}
                className={path === n.href ? "active" : ""}>
                <span className="ico">{n.icon}</span>{n.label}
              </Link>
            )
          )}
        </nav>
        <div className="foot">
          {isAuthed && user ? (
            <div className="acct">
              <div className="av">{user.name.slice(0, 1).toUpperCase()}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="nm">{user.name}</div>
                <div className="em">{user.email}</div>
              </div>
              <button className="logout-btn" onClick={logout}>Out</button>
            </div>
          ) : (
            <Link href="/login" className="acct" style={{ textDecoration: "none" }}>
              <div className="av">＋</div>
              <div style={{ minWidth: 0 }}>
                <div className="nm">Save your progress</div>
                <div className="em">Sign in or create an account</div>
              </div>
            </Link>
          )}
          <div className={`data-badge ${live ? "" : "synthetic"}`}>
            <span className="dot" />{live ? "Live market data" : "Synthetic data"}
          </div>
          {data?.meta?.asOf && <div>SPY · AGG · GLD · as of {data.meta.asOf}</div>}
        </div>
      </aside>
      <main className="main">{children}</main>
      <Coach />
    </div>
  );
}
