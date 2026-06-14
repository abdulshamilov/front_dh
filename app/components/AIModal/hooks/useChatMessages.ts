import { useState, useCallback, useRef } from 'react';
import config from '@/app/shared/config/axios';
import { AIMessage } from './useChatHistory';
import { AxiosError } from 'axios';
import { getErrorMessage } from '@/app/shared/types/errors';
import { sanitizeAiResponse } from '@/app/shared/utils/sanitizeAiResponse';

/**
 * Хук для управления отправкой сообщений в AI-чат.
 * Управляет состоянием загрузки и локальными сообщениями.
 * Поддерживает как текстовые, так и голосовые сообщения.
 */
export function useChatMessages() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Универсальная функция отправки сообщения.
   * Используется и для текстовых, и для голосовых сообщений.
   */
  const lastSentMessageRef = useRef<string>('');
  const sendMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const trimmedText = text.trim();
    
    // Защита от дублирования: не отправляем тот же текст повторно в течение 2 секунд
    if (trimmedText === lastSentMessageRef.current) {
      // Очищаем предыдущий таймаут если он есть
      if (sendMessageTimeoutRef.current) {
        clearTimeout(sendMessageTimeoutRef.current);
      }
      // Устанавливаем новый таймаут для сброса защиты
      sendMessageTimeoutRef.current = setTimeout(() => {
        lastSentMessageRef.current = '';
      }, 2000);
      return;
    }

    lastSentMessageRef.current = trimmedText;
    
    // Очищаем таймаут при новой отправке
    if (sendMessageTimeoutRef.current) {
      clearTimeout(sendMessageTimeoutRef.current);
      sendMessageTimeoutRef.current = null;
    }
    setIsLoading(true);
    setError(null);

    // Создаём временное сообщение пользователя
    const tempUserMessage: AIMessage = {
      id: Date.now(),
      message: text,
      response: '',
      referenced_cards: [],
      tokens_used: 0,
      is_helpful: null,
      created_at: new Date().toISOString(),
    };

    // Сразу добавляем в список
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await config.post('/cards/ai/chat/', {
        message: text,
      });

      const newMessage: AIMessage = {
        ...response.data,
        response: sanitizeAiResponse(
          response.data.ai_response || response.data.response
        ),
      };

      // Заменяем временное сообщение на реальное с ответом
      setMessages((prev) =>
        prev.map((m) => (m.id === tempUserMessage.id ? newMessage : m))
      );
      
      // Сбрасываем защиту от дублирования после успешной отправки
      setTimeout(() => {
        lastSentMessageRef.current = '';
      }, 1000);
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err);
      
      // Удаляем временное сообщение при ошибке
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      
      // Сбрасываем защиту от дублирования при ошибке
      lastSentMessageRef.current = '';
      
      // Формируем понятное сообщение об ошибке
      let errorMessage = 'Произошла ошибка при отправке сообщения';
      
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        
        if (status === 503) {
          errorMessage = 'Сервис временно недоступен. Пожалуйста, попробуйте позже.';
        } else if (status === 500) {
          errorMessage = 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
        } else if (status === 429) {
          errorMessage = 'Слишком много запросов. Пожалуйста, подождите немного.';
        } else if (status === 401 || status === 403) {
          errorMessage = 'Необходимо авторизоваться.';
        } else if (err.response?.data) {
          const data = err.response.data;
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data.detail) {
            errorMessage = data.detail;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else {
        errorMessage = getErrorMessage(err, errorMessage);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearError: () => setError(null),
  };
}
