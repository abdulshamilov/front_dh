import { useState, useEffect } from 'react';
import config from '@/app/shared/config/axios';
import { ICard } from '@/app/types/models';
import { sanitizeAiResponse } from '@/app/shared/utils/sanitizeAiResponse';

export interface AIMessage {
  id: number;
  message: string;
  response: string;
  referenced_cards: ICard[];
  tokens_used: number;
  is_helpful: boolean | null;
  created_at: string;
}

export function useChatHistory() {
  const [history, setHistory] = useState<AIMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await config.get('/cards/ai/history/');
      // API возвращает объект с полем results, содержащим массив сообщений
      const messages = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);
      // Берём только первые 5 сообщений (как приходит с сервера) и переворачиваем
      const firstFiveMessages = messages.slice(0, 5).reverse();
      // Чистим служебные JSON-маркеры из текста ответов
      const sanitized = firstFiveMessages.map((m: AIMessage) => ({
        ...m,
        response: sanitizeAiResponse(m.response),
      }));
      setHistory(sanitized);
    } catch (error) {
      console.error('Ошибка при загрузке истории:', error);
      setHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return { history, isLoadingHistory };
}
