"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react";
import axiosInstance from "@/app/shared/config/axios";
import type { IQuestion, IQuestionUser } from "@/app/types/models";

interface Props {
  cardId: number;
  initialQuestions?: IQuestion[];
}

function QuestionItem({ q }: { q: IQuestion }) {
  const [open, setOpen] = useState(!!q.answer);
  const user = q.user as IQuestionUser | undefined;
  const userName = user?.name ?? "Пользователь";
  const date = new Date(q.created_at).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long",
  });

  return (
    <div style={{ borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
      {/* Question row */}
      <button
        type="button"
        onClick={() => q.answer && setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "flex-start", gap: 12,
          padding: "14px 16px", background: "none", border: "none", cursor: q.answer ? "pointer" : "default",
          textAlign: "left",
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,117,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
          <MessageCircle size={16} color="#5AADFF" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              {userName} · {date}
            </span>
            {q.answer
              ? (open ? <ChevronUp size={15} color="rgba(255,255,255,0.35)" /> : <ChevronDown size={15} color="rgba(255,255,255,0.35)" />)
              : <span style={{ fontSize: 10, fontFamily: "var(--font-stetica-bold)", color: "#F59E0B", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", padding: "2px 8px", borderRadius: 20 }}>Ожидает ответа</span>
            }
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.55, fontFamily: "var(--font-stetica-regular)" }}>
            {q.question}
          </p>
        </div>
      </button>

      {/* Answer */}
      {q.answer && open && (
        <div style={{ margin: "0 16px 14px", padding: "12px 14px", borderRadius: 12, background: "rgba(0,117,255,0.07)", border: "1px solid rgba(0,117,255,0.18)" }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-stetica-bold)", color: "#5AADFF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Ответ
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
            {q.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export function QuestionsSection({ cardId, initialQuestions }: Props) {
  const [questions, setQuestions] = useState<IQuestion[]>(initialQuestions ?? []);

  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) { setFormError("Введите вопрос"); return; }
    setFormError(null);
    setSubmitting(true);
    try {
      const body: Record<string, string> = { question: text.trim() };
      if (name.trim()) body.name = name.trim();
      const res = await axiosInstance.post(`/cards/${cardId}/questions/add/`, body);
      // Добавляем вопрос в список сразу (оптимистично)
      const newQ: IQuestion = res.data ?? {
        id: Date.now(),
        card: cardId,
        user: { id: 0, name: name.trim() || "Вы", phone_number: "" },
        question: text.trim(),
        created_at: new Date().toISOString(),
      };
      setQuestions((prev) => [...prev, newQ]);
      setSubmitted(true);
      setText("");
      setName("");
    } catch {
      setFormError("Не удалось отправить. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  const answered = questions.filter((q) => q.answer);
  const pending = questions.filter((q) => !q.answer);
  const sorted = [...answered, ...pending];

  return (
    <div style={{ padding: "16px 16px 0" }}>

      {/* List */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "28px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
          <MessageCircle size={32} color="rgba(255,255,255,0.2)" style={{ marginBottom: 10 }} />
          <p style={{ margin: 0, fontFamily: "var(--font-stetica-bold)", color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Вопросов ещё нет</p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Задайте первый!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {sorted.map((q) => <QuestionItem key={q.id} q={q} />)}
        </div>
      )}

      {/* Form */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20, paddingBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-stetica-bold)", fontSize: 15, color: "#fff", marginBottom: 14 }}>
          Задать вопрос
        </div>

        {submitted ? (
          <div style={{ padding: "16px", borderRadius: 14, background: "rgba(30,237,97,0.08)", border: "1px solid rgba(30,237,97,0.25)", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
            <div style={{ fontFamily: "var(--font-stetica-bold)", color: "#1EED61", fontSize: 14 }}>Вопрос отправлен!</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Ответ появится здесь после публикации</div>
            <button
              onClick={() => setSubmitted(false)}
              style={{ marginTop: 12, background: "none", border: "none", color: "#5AADFF", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-stetica-bold)" }}
            >
              Задать ещё
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя (необязательно)"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14, padding: "12px 14px",
                color: "#fff", fontSize: 14,
                fontFamily: "var(--font-stetica-regular)",
                outline: "none",
              }}
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Что вас интересует об этом объекте?"
              rows={3}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14, padding: "13px 14px",
                color: "#fff", fontSize: 14,
                fontFamily: "var(--font-stetica-regular)",
                resize: "none", outline: "none",
              }}
            />
            {formError && (
              <div style={{ fontSize: 12, color: "#FF6B6B" }}>{formError}</div>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 0", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #0075FF 0%, #0056CC 100%)",
                color: "#fff", fontFamily: "var(--font-stetica-bold)", fontSize: 15,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <Send size={16} />
              {submitting ? "Отправка..." : "Отправить вопрос"}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        input:focus, textarea:focus { border-color: rgba(0,117,255,0.5) !important; }
      `}</style>
    </div>
  );
}
