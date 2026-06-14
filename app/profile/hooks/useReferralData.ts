import { useState, useEffect } from "react";
import config from "@/app/shared/config/axios";

interface ReferralApiResponse {
  referred_name?: string;
  referred_phone?: string;
  created_at: string;
}

interface Referral {
  name?: string;
  phone_number?: string;
  created_at: string;
}

interface ReferralLinkResponse {
  referral_link: string;
}

interface ReferralsResponse {
  results?: ReferralApiResponse[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export function useReferralData(activeSection: string, isAuth: boolean) {
  const [referralLink, setReferralLink] = useState<string>("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [loadingReferral, setLoadingReferral] = useState(false);

  useEffect(() => {
    if (activeSection === "referral" && isAuth) {
      fetchReferralData();
    }
  }, [activeSection, isAuth]);

  const fetchReferralData = async () => {
    setLoadingReferral(true);
    try {
      const [linkResponse, referralsResponse] = await Promise.all([
        config.get<ReferralLinkResponse>("/users/referral-link/"),
        config.get<ReferralsResponse>("/users/referrals/"),
      ]);

      // Обрабатываем реферальную ссылку
      const link = linkResponse.data?.referral_link || "";
      setReferralLink(link);

      // Обрабатываем рефералов (пагинированный ответ с results)
      const referralsDataRaw = referralsResponse.data;
      const rawReferrals: ReferralApiResponse[] = referralsDataRaw?.results || [];

      // Маппим данные из API формата (referred_name, referred_phone) в формат интерфейса (name, phone_number)
      const referralsData: Referral[] = rawReferrals.map((item) => ({
        name: item.referred_name,
        phone_number: item.referred_phone,
        created_at: item.created_at,
      }));

      setReferrals(referralsData);
    } catch (error) {
      console.error("Ошибка при загрузке реферальных данных:", error);
      setReferrals([]);
      setReferralLink("");
    } finally {
      setLoadingReferral(false);
    }
  };

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return {
    referralLink,
    referrals,
    copied,
    loadingReferral,
    handleCopyLink,
  };
}
