"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ICard } from "@/app/types/models";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { subscribeToDeveloper, unsubscribeFromDeveloper } from "@/app/shared/redux/slices/developers";
import { CallRequestModal } from "@/app/components/CallRequestModal";
import { useToast } from "@/app/components/shared/Toast";
import { SHORT_PHONE_TEL } from "@/app/shared/utils/contacts";
import { Share2, Check } from "lucide-react";

interface AsidePanelProps {
  card: ICard;
  formattedPrice: string;
}

export function AsidePanel({ card, formattedPrice }: AsidePanelProps) {
  const dispatch = useAppDispatch();
  const { isAuth } = useAppSelector((state) => state.auth);
  const { show: toast } = useToast();

  const [isSubscribed, setIsSubscribed] = useState(card.developer?.is_subscribed ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubscriptionToggle = async () => {
    if (!isAuth) { toast("Войдите, чтобы подписаться", { type: "info" }); return; }
    if (!card.developer) return;
    setIsLoading(true);
    const prev = isSubscribed;
    setIsSubscribed(!prev);
    try {
      if (prev) await dispatch(unsubscribeFromDeveloper(card.developer.id)).unwrap();
      else await dispatch(subscribeToDeveloper(card.developer.id)).unwrap();
    } catch {
      setIsSubscribed(prev);
      toast("Не удалось изменить подписку", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: card.title,
      text: card.title,
      url,
    };

    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        (typeof navigator.canShare !== "function" ||
          navigator.canShare(shareData))
      ) {
        await navigator.share(shareData);
      } else if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled — silent fail
    }
  };

  return (
    <aside className="lg:col-span-1">
      <div className="rounded-2xl flex flex-col gap-4">
        {/* Price card */}
        <div className="glass-card flex flex-col py-5 px-4 rounded-xl">
          <p
            className="text-2xl font-[family-name:var(--font-stetica-bold)]"
            style={{ color: "var(--price-color)" }}
          >
            {formattedPrice} ₽{" "}
            <span
              className="text-xl font-[family-name:var(--font-stetica-medium)]"
              style={{ color: "var(--text-secondary)" }}
            >
              / {card.area} м²
            </span>
          </p>
          <p
            className="text-sm mt-1 mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Окончательная цена
          </p>

          {/* CTA buttons */}
          <div className="flex w-full gap-0">
            <a
              href={SHORT_PHONE_TEL}
              className="flex-1 flex justify-center items-center py-3 font-[family-name:var(--font-stetica-bold)] transition-opacity hover:opacity-90 cursor-pointer text-white"
              style={{
                backgroundColor: "var(--success-bg)",
                borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
              }}
            >
              Позвонить
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 py-3 text-white font-[family-name:var(--font-stetica-bold)] transition-opacity hover:opacity-90 cursor-pointer"
              style={{
                backgroundColor: "var(--accent-secondary)",
                borderRadius: "0 var(--radius-md) var(--radius-md) 0",
              }}
            >
              Оставить заявку
            </button>
          </div>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="w-full mt-3 flex items-center justify-center gap-2 font-[family-name:var(--font-stetica-medium)] cursor-pointer transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
            style={{
              height: 48,
              background: copied
                ? "color-mix(in srgb, var(--success) 12%, transparent)"
                : "color-mix(in srgb, var(--accent-primary) 10%, transparent)",
              border: copied
                ? "1px solid var(--success)"
                : "1px solid var(--accent-primary)",
              color: copied ? "var(--success)" : "var(--accent-primary)",
              borderRadius: 14,
              fontSize: 14,
            }}
            aria-label="Поделиться"
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>Ссылка скопирована</span>
              </>
            ) : (
              <>
                <Share2 size={16} />
                <span>Поделиться</span>
              </>
            )}
          </button>
        </div>

        {/* Developer card */}
        {card.developer && (
          <div className="glass-card p-4 rounded-xl flex items-center gap-3">
            <Link className="cursor-pointer flex-1 min-w-0" href={`/developers/${card.developer.id}`}>
              <div className="flex items-center gap-3">
                <div className="relative w-[48px] h-[48px] flex-shrink-0">
                  <Image
                    src={card.developer.logo}
                    alt={card.developer.name}
                    fill
                    sizes="48px"
                    className="rounded-lg object-cover"
                  />
                </div>
                <p
                  className="font-[family-name:var(--font-stetica-bold)] truncate"
                  style={{ color: "var(--text-primary)", fontSize: 15 }}
                >
                  {card.developer.name}
                </p>
              </div>
            </Link>
            <button
              onClick={handleSubscriptionToggle}
              disabled={isLoading}
              className="flex-shrink-0 py-2 px-4 rounded-full font-[family-name:var(--font-stetica-medium)] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap text-sm"
              style={{
                backgroundColor: isSubscribed ? "var(--surface-elevated)" : "var(--accent-primary)",
                color: isSubscribed ? "var(--text-secondary)" : "#FFFFFF",
                border: isSubscribed ? "1px solid var(--border-glass)" : "none",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "..." : isSubscribed ? <><Check size={14} /> Подписаны</> : "Подписаться"}
            </button>
          </div>
        )}
      </div>

      <CallRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cardId={card.id}
      />
    </aside>
  );
}
