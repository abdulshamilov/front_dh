"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Calendar,
  GraduationCap,
  TrendingUp,
  Smartphone,
  Phone,
  MessageCircle,
  CheckCircle2,
  Building2,
  Infinity,
  Star,
  Users,
  Zap,
} from "lucide-react";

const PHONE_RAW = "79884200705";
const PHONE_DISPLAY = "+7 (988) 420-07-05";
const TEL_LINK = `tel:+${PHONE_RAW}`;
const WA_LINK = `https://wa.me/${PHONE_RAW}`;

const GLASS: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%), var(--surface)",
  border: "1px solid rgba(255,255,255,0.08)",
};

function BenefitCard({
  icon,
  title,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        ...GLASS,
        borderRadius: 20,
        padding: "20px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `color-mix(in srgb, ${accent ?? "var(--accent-primary)"} 15%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent ?? "var(--accent-primary)"} 30%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 16,
          fontFamily: "var(--font-stetica-bold)",
          color: "var(--text-primary)",
          lineHeight: "1.3",
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontFamily: "var(--font-stetica-medium)",
          color: "var(--text-secondary)",
          lineHeight: "1.5",
        }}
      >
        {sub}
      </p>
    </div>
  );
}

function OfferRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <CheckCircle2
        size={20}
        color="var(--success)"
        style={{ flexShrink: 0, marginTop: 2 }}
      />
      <p
        style={{
          margin: 0,
          fontSize: 15,
          fontFamily: "var(--font-stetica-medium)",
          color: "var(--text-primary)",
          lineHeight: "1.6",
        }}
      >
        {children}
      </p>
    </div>
  );
}

export default function VacancyPage() {
  const router = useRouter();

  return (
    <div
      style={{ backgroundColor: "var(--bg-primary)", minHeight: "100dvh", overflowX: "hidden" }}
      className="font-[family-name:var(--font-stetica-medium)]"
    >
      {/* ── Back ── */}
      <div className="max-w-[720px] mx-auto px-4 pt-5">
        <button
          onClick={() => router.back()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--text-secondary)",
            borderRadius: 12,
            padding: "8px 14px",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "var(--font-stetica-medium)",
          }}
          className="hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={16} />
          Назад
        </button>
      </div>

      {/* ── Hero ── */}
      <div
        className="max-w-[720px] mx-auto px-4 pt-8 pb-10"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Glow blob */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -40,
            left: "50%",
            transform: "translateX(-50%)",
            width: 500,
            height: 300,
            background:
              "radial-gradient(ellipse, rgba(0,117,255,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background:
              "linear-gradient(135deg, rgba(0,117,255,0.25) 0%, rgba(0,212,255,0.15) 100%)",
            border: "1px solid rgba(0,117,255,0.4)",
            borderRadius: 999,
            padding: "6px 14px",
            marginBottom: 20,
          }}
        >
          <Zap size={14} color="var(--accent-cyan)" />
          <span
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              fontFamily: "var(--font-stetica-bold)",
              color: "var(--accent-cyan)",
              textTransform: "uppercase",
            }}
          >
            Открытая вакансия
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(28px, 5vw, 44px)",
            fontFamily: "var(--font-stetica-bold)",
            color: "var(--text-primary)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Менеджер по продажам{" "}
          <span
            style={{
              background:
                "linear-gradient(90deg, var(--accent-primary), var(--accent-cyan))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            недвижимости
          </span>
        </h1>

        <p
          style={{
            margin: "14px 0 0",
            fontSize: 17,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: 520,
          }}
        >
          Работа в сфере недвижимости — это перспектива, свобода и доход, который
          растёт вместе с тобой. Мы ищем амбициозного человека в нашу команду.
        </p>

        {/* Quick stats row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 24,
          }}
        >
          {[
            { icon: <Calendar size={14} />, label: "График 5/2" },
            { icon: <Clock size={14} />, label: "10:00 – 18:00" },
            { icon: <Building2 size={14} />, label: "Недвижимость" },
            { icon: <Star size={14} color="var(--rating)" />, label: "Обучение бесплатно" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--surface)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 13,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-stetica-medium)",
              }}
            >
              {icon}
              {label}
            </span>
          ))}
        </div>

        {/* Hero CTA */}
        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap", width: "100%" }}>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#25D366",
              color: "#fff",
              borderRadius: 14,
              padding: "14px 24px",
              fontSize: 15,
              fontFamily: "var(--font-stetica-bold)",
              textDecoration: "none",
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(37,211,102,0.25)",
              transition: "transform 0.18s, box-shadow 0.18s",
              flex: "1 1 180px",
            }}
            className="hover:-translate-y-0.5 hover:shadow-lg"
          >
            <MessageCircle size={18} />
            Написать в WhatsApp
          </a>
          <a
            href={TEL_LINK}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "var(--surface)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--text-primary)",
              borderRadius: 14,
              padding: "14px 24px",
              fontSize: 15,
              fontFamily: "var(--font-stetica-bold)",
              textDecoration: "none",
              cursor: "pointer",
              transition: "transform 0.18s",
              flex: "1 1 180px",
            }}
            className="hover:-translate-y-0.5"
          >
            <Phone size={18} />
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>

      {/* ── Benefits grid ── */}
      <div className="max-w-[720px] mx-auto px-4 pb-10">
        <h2
          style={{
            margin: "0 0 18px",
            fontSize: 13,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "var(--font-stetica-bold)",
            color: "var(--text-tertiary)",
          }}
        >
          Что тебя ждёт
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          <BenefitCard
            icon={<Calendar size={22} color="var(--accent-primary)" />}
            title="График 5/2"
            sub="Стабильный рабочий ритм без переработок"
            accent="var(--accent-primary)"
          />
          <BenefitCard
            icon={<Clock size={22} color="var(--accent-cyan)" />}
            title="10:00 – 18:00"
            sub="Комфортный рабочий день без ранних подъёмов"
            accent="var(--accent-cyan)"
          />
          <BenefitCard
            icon={<GraduationCap size={22} color="var(--brand-gold)" />}
            title="Бесплатное обучение"
            sub="Введём в профессию с нуля — платить не нужно"
            accent="var(--brand-gold)"
          />
          <BenefitCard
            icon={<Smartphone size={22} color="var(--brand-pink)" />}
            title="Соцсети под ключ"
            sub="Научим вести аккаунты и привлекать клиентов онлайн"
            accent="var(--brand-pink)"
          />
          <BenefitCard
            icon={<Users size={22} color="var(--success)" />}
            title="Команда и поддержка"
            sub="Работаешь не один — есть наставник и коллектив"
            accent="var(--success)"
          />
          <BenefitCard
            icon={<TrendingUp size={22} color="var(--price-color)" />}
            title="Карьерный рост"
            sub="Лучшие менеджеры становятся руководителями"
            accent="var(--price-color)"
          />
        </div>
      </div>

      {/* ── Income highlight ── */}
      <div className="max-w-[720px] mx-auto px-4 pb-10">
        <div
          style={{
            borderRadius: 24,
            padding: "32px 28px",
            background:
              "linear-gradient(135deg, rgba(241,17,126,0.14) 0%, rgba(0,117,255,0.10) 60%, rgba(0,212,255,0.06) 100%)",
            border: "1px solid rgba(241,17,126,0.2)",
            display: "flex",
            flexDirection: "column" as const,
            gap: 14,
            position: "relative" as const,
            overflow: "hidden",
          }}
        >
          {/* bg decoration */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              right: -30,
              top: -30,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(241,17,126,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "rgba(241,17,126,0.18)",
                border: "1px solid rgba(241,17,126,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Infinity size={26} color="var(--price-color)" />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontFamily: "var(--font-stetica-bold)",
                  color: "var(--text-primary)",
                }}
              >
                Заработок без потолка
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-stetica-medium)",
                }}
              >
                % от каждой сделки — твой доход
              </p>
            </div>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            В недвижимости нет фиксированного оклада «на потолке» — твой доход
            зависит только от твоих продаж. Чем активнее работаешь, тем больше
            получаешь. Лучшие менеджеры закрывают{" "}
            <span
              style={{
                color: "var(--price-color)",
                fontFamily: "var(--font-stetica-bold)",
              }}
            >
              несколько сделок в месяц
            </span>{" "}
            и сами определяют свой доход.
          </p>
          {/* Progress bar visual */}
          <div style={{ marginTop: 4 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 12,
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-stetica-medium)",
              }}
            >
              <span>Старт</span>
              <span>∞</span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "85%",
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg, var(--accent-primary), var(--price-color))",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── What we offer list ── */}
      <div className="max-w-[720px] mx-auto px-4 pb-10">
        <div
          style={{
            ...GLASS,
            borderRadius: 24,
            padding: "28px 24px",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px",
              fontSize: 20,
              fontFamily: "var(--font-stetica-bold)",
              color: "var(--text-primary)",
            }}
          >
            Мы предлагаем
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <OfferRow>
              <strong>Бесплатное обучение</strong> — введём в профессию с нуля,
              объясним все тонкости рынка недвижимости
            </OfferRow>
            <OfferRow>
              <strong>Обучение ведению соцсетей</strong> — научим продвигать себя
              онлайн и находить клиентов через Instagram, ВКонтакте и Telegram
            </OfferRow>
            <OfferRow>
              <strong>Комфортный график 5/2, 10:00–18:00</strong> — без ночных
              смен и переработок
            </OfferRow>
            <OfferRow>
              <strong>Доход без потолка</strong> — процент с каждой закрытой
              сделки, никаких ограничений
            </OfferRow>
            <OfferRow>
              Поддержка наставника и дружная команда с первого дня
            </OfferRow>
            <OfferRow>
              Доступ к базе объектов DreamHouse и корпоративным инструментам
            </OfferRow>
          </div>
        </div>
      </div>

      {/* ── Requirements ── */}
      <div className="max-w-[720px] mx-auto px-4 pb-10">
        <div
          style={{
            ...GLASS,
            borderRadius: 24,
            padding: "28px 24px",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px",
              fontSize: 20,
              fontFamily: "var(--font-stetica-bold)",
              color: "var(--text-primary)",
            }}
          >
            Кого мы ищем
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Желание работать и развиваться — опыт необязателен",
              "Коммуникабельность и умение находить общий язык с людьми",
              "Ответственность и нацеленность на результат",
              "Смартфон и доступ к интернету",
              "Готовность обучаться новому",
            ].map((item) => (
              <div
                key={item}
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--accent-primary)",
                    flexShrink: 0,
                    marginTop: 7,
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    fontFamily: "var(--font-stetica-medium)",
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="max-w-[720px] mx-auto px-4 pb-24">
        <div
          style={{
            borderRadius: 24,
            padding: "32px 24px",
            background:
              "linear-gradient(135deg, rgba(0,117,255,0.16) 0%, rgba(0,212,255,0.08) 100%)",
            border: "1px solid rgba(0,117,255,0.25)",
            textAlign: "center" as const,
          }}
        >
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: 24,
              fontFamily: "var(--font-stetica-bold)",
              color: "var(--text-primary)",
            }}
          >
            Готов попробовать?
          </h2>
          <p
            style={{
              margin: "0 0 28px",
              fontSize: 15,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            Напиши нам в WhatsApp или позвони — расскажем подробнее
            и договоримся о встрече
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#25D366",
                color: "#fff",
                borderRadius: 16,
                padding: "16px 28px",
                fontSize: 16,
                fontFamily: "var(--font-stetica-bold)",
                textDecoration: "none",
                cursor: "pointer",
                boxShadow: "0 6px 32px rgba(37,211,102,0.3)",
                transition: "transform 0.18s, box-shadow 0.18s",
              }}
              className="hover:-translate-y-1"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
            <a
              href={TEL_LINK}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "var(--surface-elevated)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-primary)",
                borderRadius: 16,
                padding: "16px 28px",
                fontSize: 16,
                fontFamily: "var(--font-stetica-bold)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "transform 0.18s",
              }}
              className="hover:-translate-y-1"
            >
              <Phone size={20} />
              Позвонить
            </a>
          </div>

          <p
            style={{
              marginTop: 20,
              fontSize: 14,
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-stetica-medium)",
            }}
          >
            {PHONE_DISPLAY}
          </p>
        </div>
      </div>
    </div>
  );
}
