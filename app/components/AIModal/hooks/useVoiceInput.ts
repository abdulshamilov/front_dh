import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface UseVoiceInputProps {
  onFinalText: (text: string) => void;
}

export function useVoiceInput({ onFinalText }: UseVoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');

  // Refs для работы с распознаванием речи
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const lastFinalTextRef = useRef('');
  const isSendingRef = useRef(false);

  // Refs для VAD (Voice Activity Detection)
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const vadLoopRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Константы VAD
  const SILENCE_THRESHOLD = 5;
  const SILENCE_TIME = 2000; // 2 секунды тишины

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor =
        (
          window as typeof window & {
            webkitSpeechRecognition?: new () => SpeechRecognition;
            SpeechRecognition?: new () => SpeechRecognition;
          }
        ).webkitSpeechRecognition ||
        (
          window as typeof window & {
            webkitSpeechRecognition?: new () => SpeechRecognition;
            SpeechRecognition?: new () => SpeechRecognition;
          }
        ).SpeechRecognition;

      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ru-RU';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let hasNewFinal = false;
          const processedResults = new Set<string>();

          // Обрабатываем все результаты, но избегаем дубликатов
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (!result || !result[0]) continue;
            
            const transcript = result[0].transcript.trim();
            if (!transcript) continue;

            // Создаем уникальный ключ для результата
            const resultKey = `${i}-${transcript}`;
            
            if (result.isFinal) {
              // Проверяем, что этот финальный результат еще не был обработан
              if (!processedResults.has(resultKey)) {
                processedResults.add(resultKey);
                
                const currentText = finalTranscriptRef.current.trim();
                const transcriptLower = transcript.toLowerCase();
                const currentTextLower = currentText.toLowerCase();
                
                // Избегаем дублирования: проверяем, что текст действительно новый
                // Не добавляем, если этот текст уже есть в финальном тексте
                if (!currentTextLower.includes(transcriptLower) && transcriptLower !== currentTextLower) {
                  // Добавляем только если это действительно новый текст
                  const newText = currentText ? `${currentText} ${transcript}`.trim() : transcript;
                  finalTranscriptRef.current = newText;
                  hasNewFinal = true;
                  lastFinalTextRef.current = transcript;
                }
              }
            } else {
              // Для промежуточных результатов просто обновляем интерфейс
              interimTranscript = transcript;
            }
          }

          // Обновляем интерфейс только если есть изменения
          if (hasNewFinal) {
            setInterimText(finalTranscriptRef.current.trim());
          } else if (interimTranscript) {
            const currentFinal = finalTranscriptRef.current.trim();
            const combinedText = currentFinal ? `${currentFinal} ${interimTranscript}`.trim() : interimTranscript;
            // Обновляем только если текст действительно изменился
            if (combinedText !== currentFinal) {
              setInterimText(combinedText);
            }
          }
        };

        recognitionRef.current.onerror = (
          event: SpeechRecognitionErrorEvent
        ) => {
          console.error('Speech recognition error:', event.error);
        };

        recognitionRef.current.onend = () => {
          // Автоматически перезапускаем если VAD активен
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error('Restart error:', e);
            }
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startVAD = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.fftSize);

    const checkSilence = () => {
      if (!analyserRef.current || !isListeningRef.current) return;

      analyserRef.current.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += Math.abs(dataArray[i] - 128);
      }
      const volume = sum / dataArray.length;

      if (volume < SILENCE_THRESHOLD) {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
        } else if (Date.now() - silenceStartRef.current > SILENCE_TIME) {
          console.log('VAD: Тишина обнаружена, останавливаем');
          stopListening();
          return;
        }
      } else {
        silenceStartRef.current = null;
      }

      vadLoopRef.current = requestAnimationFrame(checkSilence);
    };

    checkSilence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopVAD = useCallback(() => {
    if (vadLoopRef.current) {
      cancelAnimationFrame(vadLoopRef.current);
      vadLoopRef.current = null;
    }
    silenceStartRef.current = null;
  }, []);

  const stopListening = useCallback(() => {
    // Защита от множественных вызовов
    if (isSendingRef.current) {
      return;
    }

    setIsListening(false);
    isListeningRef.current = false;
    stopVAD();

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Вызываем callback с финальным текстом только один раз
    const textToSend = finalTranscriptRef.current.trim();
    
    // Очищаем состояние
    finalTranscriptRef.current = '';
    lastFinalTextRef.current = '';
    setInterimText('');

    // Отправляем только если есть текст и он не пустой
    if (textToSend && textToSend.length > 0) {
      isSendingRef.current = true;
      onFinalText(textToSend);
      // Сбрасываем флаг через небольшую задержку
      setTimeout(() => {
        isSendingRef.current = false;
      }, 1000);
    } else {
      isSendingRef.current = false;
    }
  }, [onFinalText, stopVAD]);

  /**
   * Начинает/останавливает запись
   */
  const toggleListening = useCallback(async () => {
    if (!recognitionRef.current) {
      alert('Распознавание речи не поддерживается вашим браузером');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      try {
        // Получаем доступ к микрофону
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;

        // Создаём AudioContext и анализатор
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyserRef.current = analyser;

        // Запускаем распознавание речи
        finalTranscriptRef.current = '';
        lastFinalTextRef.current = '';
        isSendingRef.current = false;

        // SpeechRecognition кидает InvalidStateError, если start() вызван
        // повторно до того, как сработало onend предыдущего сеанса.
        // Страхуемся: сначала stop(), затем start() с коротким ретраем.
        try {
          recognitionRef.current.start();
        } catch (startErr) {
          const errName = (startErr as { name?: string })?.name;
          if (errName === 'InvalidStateError') {
            try {
              recognitionRef.current.stop();
            } catch {
              /* ignore */
            }
            // дождаться onend, затем перезапустить
            await new Promise((r) => setTimeout(r, 120));
            try {
              recognitionRef.current.start();
            } catch (retryErr) {
              console.warn('SpeechRecognition restart failed:', retryErr);
            }
          } else {
            throw startErr;
          }
        }

        setIsListening(true);
        isListeningRef.current = true;

        // Запускаем VAD
        startVAD();
      } catch (error) {
        console.error('Ошибка доступа к микрофону:', error);
        // Освобождаем медиа-ресурсы, если запись не стартовала
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (audioContextRef.current) {
          try {
            audioContextRef.current.close();
          } catch {
            /* ignore */
          }
          audioContextRef.current = null;
        }
        alert('Не удалось получить доступ к микрофону');
      }
    }
  }, [isListening, startVAD, stopListening]);

  return {
    isListening,
    interimText,
    toggleListening,
  };
}
