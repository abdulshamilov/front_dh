import { User, Copy, Check, Gift, Users, Link as LinkIcon, ChevronRight } from "lucide-react";

interface Referral {
  name?: string;
  phone_number?: string;
  created_at: string;
}

interface ReferralSectionProps {
  referralLink: string;
  referrals: Referral[];
  copied: boolean;
  loadingReferral: boolean;
  onCopyLink: () => void;
}

const CARD: React.CSSProperties = {
  backgroundColor: "#1D2024",
  borderRadius: 16,
  padding: "16px",
  marginBottom: 10,
};

export function ReferralSection({ referralLink, referrals, copied, loadingReferral, onCopyLink }: ReferralSectionProps) {
  return (
    <div>
      {/* Hero promo card */}
      <div style={{
        background: "linear-gradient(135deg, #22212F 0%, #1D2024 60%, #0767D7 160%)",
        borderRadius: 20,
        padding: "20px 16px",
        marginBottom: 10,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow blob */}
        <div style={{
          position: "absolute", top: -20, right: -20,
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(241,17,126,0.18)", filter: "blur(32px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -10, left: -10,
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(0,117,255,0.15)", filter: "blur(24px)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, position: "relative" }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            backgroundColor: "rgba(241,17,126,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Gift size={22} color="#F1117E" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontFamily: "var(--font-stetica-bold)", color: "#FFFFFF" }}>
              Реферальная программа
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              Приглашай друзей — получай вознаграждение
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 8, position: "relative" }}>
          {[
            { icon: <Users size={15} color="#0075FF" />, bg: "rgba(0,117,255,0.15)", val: referrals.length, label: "Рефералов" },
            { icon: <Gift size={15} color="#F1117E" />, bg: "rgba(241,17,126,0.15)", val: 0, label: "Бонусов" },
            { icon: <LinkIcon size={15} color="#1EED61" />, bg: "rgba(30,237,97,0.12)", val: 1, label: "Ссылка" },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 12,
              padding: "10px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
            }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.icon}
              </div>
              <span style={{ fontSize: 17, fontFamily: "var(--font-stetica-bold)", color: "#FFFFFF" }}>{s.val}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {loadingReferral ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid #0075FF", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <>
          {/* Referral link */}
          <div style={CARD}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-stetica-bold)", color: "#AAABAC", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Ваша ссылка
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{
                flex: 1, borderRadius: 12, padding: "12px 14px",
                backgroundColor: "#0D0E11", border: "1px solid #2C2C2E",
                fontSize: 12, color: "rgba(255,255,255,0.6)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {referralLink || "Загрузка..."}
              </div>
              <button
                onClick={onCopyLink}
                style={{
                  width: 46, height: 46, flexShrink: 0, borderRadius: 12, border: "none",
                  backgroundColor: copied ? "#1EED61" : "#0075FF",
                  color: "#FFFFFF", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background-color 0.2s",
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Referrals list */}
          <div style={CARD}>
            <div style={{ fontSize: 13, fontFamily: "var(--font-stetica-bold)", color: "#AAABAC", marginBottom: 14 }}>
              РЕФЕРАЛЫ ({referrals.length})
            </div>

            {referrals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 16px", backgroundColor: "#0D0E11", borderRadius: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", margin: "0 auto 12px", backgroundColor: "rgba(0,117,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={22} color="#0075FF" />
                </div>
                <p style={{ fontFamily: "var(--font-stetica-bold)", color: "#FFFFFF", marginBottom: 4 }}>
                  Пока нет рефералов
                </p>
                <p style={{ fontSize: 13, color: "#AAABAC" }}>
                  Поделитесь ссылкой с друзьями
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {referrals.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px", borderRadius: 12, backgroundColor: "#0D0E11",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "rgba(0,117,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {r.name
                          ? <span style={{ fontSize: 14, fontFamily: "var(--font-stetica-bold)", color: "#0075FF" }}>{r.name.charAt(0).toUpperCase()}</span>
                          : <User size={16} color="#0075FF" />
                        }
                      </div>
                      <div>
                        <p style={{ fontFamily: "var(--font-stetica-bold)", fontSize: 14, color: "#FFFFFF" }}>{r.name || "Пользователь"}</p>
                        <p style={{ fontSize: 12, color: "#AAABAC" }}>{r.phone_number}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "#AAABAC" }}>{new Date(r.created_at).toLocaleDateString("ru-RU")}</span>
                      <ChevronRight size={14} color="#2C2C2E" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
