"use client";

import { Star, ArrowUpRight } from "lucide-react";

// Профиль компании в Google Картах — все отзывы.
const REVIEWS_URL =
  "https://www.google.com/maps/place/Dream+House/@54.687388,39.5989109,17z/data=!4m8!3m7!1s0x4149fef674d8e6f7:0xa7fcd74b2c49a615!8m2!3d54.687388!4d39.5989109!9m1!1b1!16s%2Fg%2F11f15cfdqw";

interface Testimonial {
  name: string;
  date: string;
  text: string;
  rating: number;
}

// Реальные отзывы клиентов из Google Карт.
const TESTIMONIALS: Testimonial[] = [
  {
    name: "Максим Кирилов",
    date: "месяц назад",
    text: "Пришли уже с готовым проектом. Отдел проектирования внёс пару технических правок — и наш уникальный дом готов. Всё получилось именно так, как на картинке. За сроки в договоре не вышли.",
    rating: 5,
  },
  {
    name: "Степан Тулепов",
    date: "3 месяца назад",
    text: "Компания построила нам невероятно красивый дом на нашем участке! Всем довольны.",
    rating: 5,
  },
  {
    name: "Анатолий Королев",
    date: "9 месяцев назад",
    text: "Ребята настоящие профессионалы. Всё шло по плану, без задержек и неприятных сюрпризов.",
    rating: 5,
  },
  {
    name: "Амир",
    date: "11 месяцев назад",
    text: "Думали, что стройка — это ад и грязь. Но с этой строительной компанией всё прошло спокойно и по плану.",
    rating: 5,
  },
  {
    name: "Виктория Рогачева",
    date: "год назад",
    text: "За пять месяцев построили загородный дом по индивидуальному проекту. Все действия заранее согласовывали со мной. Все строители — квалифицированные специалисты, претензий нет.",
    rating: 5,
  },
  {
    name: "Анатолий Бор",
    date: "год назад",
    text: "Обратился по рекомендации знакомых и остался доволен. Компания помогла с ипотекой.",
    rating: 5,
  },
  {
    name: "Сергей Енин",
    date: "год назад",
    text: "Выбрали компанию из-за адекватного соотношения цены и качества. Стройка без нареканий.",
    rating: 5,
  },
  {
    name: "Динара Галина",
    date: "2 года назад",
    text: "Заказывали дом. Условия оптимальные, в бюджет уложились. Сдали всё в срок, качеством довольны.",
    rating: 5,
  },
];

const PALETTES = [
  { accent: "#1D8E7A", avatarBg: "rgba(29,142,122,0.18)" },
  { accent: "#0075FF", avatarBg: "rgba(0,117,255,0.18)" },
  { accent: "#F1117E", avatarBg: "rgba(241,17,126,0.18)" },
  { accent: "#8B5CF6", avatarBg: "rgba(139,92,246,0.18)" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}

export function Testimonials() {
  return (
    <section
      style={{ marginTop: 32 }}
      aria-labelledby="testimonials-heading"
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          gap: 12,
          padding: "0 16px",
        }}
      >
        <h2
          id="testimonials-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            lineHeight: 1.2,
            letterSpacing: "-0.015em",
            color: "var(--home-text-primary)",
          }}
        >
          Нас выбирают
        </h2>
        <a
          href={REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--home-accent-link)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Отзывы в Google
          <ArrowUpRight size={14} />
        </a>
      </header>

      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 8,
          scrollbarWidth: "none",
        }}
      >
        {TESTIMONIALS.map((t, i) => {
          const p = PALETTES[i % PALETTES.length];
          return (
            <article
              key={t.name}
              style={{
                flex: "0 0 auto",
                width: 230,
                scrollSnapAlign: "start",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: 14,
                borderRadius: 14,
                background: "var(--home-surface)",
                overflow: "hidden",
                minHeight: 170,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: p.avatarBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: p.accent,
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {initials(t.name)}
              </div>

              {/* Name + city */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    lineHeight: 1.25,
                    color: "var(--home-text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.name}
                </h3>
                <span
                  style={{
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    fontSize: 11.5,
                    color: "var(--home-text-tertiary)",
                  }}
                >
                  {t.date}
                </span>
              </div>

              {/* Quote */}
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontSize: 12.5,
                  lineHeight: 1.45,
                  color: "var(--home-text-secondary)",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {t.text}
              </p>

              {/* Footer rating */}
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Star
                  size={13}
                  strokeWidth={0}
                  style={{
                    color: "var(--home-star)",
                    fill: "var(--home-star)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--home-text-primary)",
                  }}
                >
                  {t.rating.toFixed(1)}
                </span>
              </div>
            </article>
          );
        })}

        {/* CTA — все отзывы в 2ГИС */}
        <a
          href={REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: "0 0 auto",
            width: 180,
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: 14,
            borderRadius: 14,
            background: "var(--home-accent-soft)",
            border: "1px solid var(--home-border-strong)",
            textDecoration: "none",
            minHeight: 170,
            textAlign: "center",
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--home-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Star size={20} strokeWidth={0} style={{ color: "#fff", fill: "#fff" }} />
          </span>
          <span
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--home-text-primary)",
            }}
          >
            Все отзывы
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--home-accent-link)",
            }}
          >
            в Google

            <ArrowUpRight size={14} />
          </span>
        </a>
      </div>
    </section>
  );
}

export default Testimonials;
