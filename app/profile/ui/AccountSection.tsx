import { LogOut, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useUpdateProfileMutation } from "@/app/shared/redux/api/auth";
import { useAppDispatch } from "@/app/shared/redux/hooks";
import { fetchUser } from "@/app/shared/redux/slices/auth";

interface AccountSectionProps {
  profile: {
    name: string;
    phone_number: string;
    password: string;
    profile_photo?: string | undefined;
  };
  setProfile: React.Dispatch<React.SetStateAction<{
    name: string;
    phone_number: string;
    password: string;
    profile_photo?: string | undefined;
  }>>;
  onLogout: () => void;
  onDeleteAccount: () => void;
  hideLogout?: boolean;
}

const CARD: React.CSSProperties = {
  backgroundColor: "#1D2024",
  borderRadius: 16,
  padding: "16px",
  marginBottom: 10,
};

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontFamily: "var(--font-stetica-bold)",
  color: "#AAABAC",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const INPUT: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 12,
  padding: "13px 14px",
  fontSize: 15,
  fontFamily: "var(--font-stetica-regular)",
  backgroundColor: "#0D0E11",
  color: "#FFFFFF",
  border: "1px solid #2C2C2E",
  outline: "none",
};

export function AccountSection({ profile, setProfile, onLogout, onDeleteAccount, hideLogout }: AccountSectionProps) {
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading: isUpdatingName }] = useUpdateProfileMutation();
  const [message, setMessage] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState(profile.name);
  const [isNameChanged, setIsNameChanged] = useState(false);

  useEffect(() => {
    setNameValue(profile.name);
    setIsNameChanged(false);
  }, [profile.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    setNameValue(value);
    setIsNameChanged(value !== profile.name);
  };

  const handleNameSave = async () => {
    if (!isNameChanged || !nameValue.trim()) { setNameValue(profile.name); setIsNameChanged(false); return; }
    try {
      const result = await updateProfile({ name: nameValue }).unwrap();
      setProfile({ ...profile, name: result.name });
      dispatch(fetchUser());
      setMessage("Сохранено");
      setTimeout(() => setMessage(null), 2500);
      setIsNameChanged(false);
    } catch {
      setMessage("Ошибка сохранения");
      setNameValue(profile.name);
      setIsNameChanged(false);
    }
  };

  return (
    <div>
      {/* Personal data */}
      <div style={CARD}>
        <div style={{ fontSize: 13, fontFamily: "var(--font-stetica-bold)", color: "#AAABAC", marginBottom: 14 }}>
          ЛИЧНЫЕ ДАННЫЕ
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={LABEL}>Имя</label>
          <input
            type="text"
            value={nameValue}
            onChange={handleNameChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isNameChanged) handleNameSave();
              if (e.key === "Escape") { setNameValue(profile.name); setIsNameChanged(false); }
            }}
            disabled={isUpdatingName}
            style={{ ...INPUT, border: isNameChanged ? "1.5px solid #0075FF" : "1px solid #2C2C2E", opacity: isUpdatingName ? 0.6 : 1 }}
            placeholder="Ваше имя"
          />
          {isNameChanged && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={handleNameSave}
                disabled={isUpdatingName}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 12, border: "none",
                  backgroundColor: "#0075FF", color: "#FFFFFF",
                  fontFamily: "var(--font-stetica-bold)", fontSize: 14, cursor: "pointer",
                }}
              >
                {isUpdatingName ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                onClick={() => { setNameValue(profile.name); setIsNameChanged(false); }}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 12,
                  border: "1px solid #2C2C2E", backgroundColor: "transparent",
                  color: "#AAABAC", fontFamily: "var(--font-stetica-bold)", fontSize: 14, cursor: "pointer",
                }}
              >
                Отмена
              </button>
            </div>
          )}
        </div>

        <div>
          <label style={LABEL}>Телефон</label>
          <input
            type="tel"
            value={profile.phone_number}
            disabled
            readOnly
            style={{ ...INPUT, opacity: 0.4, cursor: "not-allowed" }}
          />
        </div>

        {message && (
          <div style={{ marginTop: 10, fontSize: 13, color: message === "Сохранено" ? "#1EED61" : "#FF4444" }}>
            {message}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
        {!hideLogout && (
          <button
            onClick={onLogout}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 16,
              border: "1.5px solid #FF4444", backgroundColor: "rgba(255,68,68,0.06)",
              color: "#FF4444", fontFamily: "var(--font-stetica-bold)", fontSize: 15,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <LogOut size={18} />
            Выйти из аккаунта
          </button>
        )}
        <button
          onClick={onDeleteAccount}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#5A5A5A", fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "4px 0 8px",
          }}
        >
          <Trash2 size={13} />
          Удалить аккаунт
        </button>
      </div>
    </div>
  );
}
