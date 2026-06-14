import { IReview } from "@/app/types/models";

export const MOCK_REVIEWS: IReview[] = [
  {
    id: 1,
    user_name: "Алексей Иванов",
    user_avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    comment: "Отличный жилой комплекс! Современная планировка, качественная отделка. Рядом есть всё необходимое: магазины, школы, детские сады. Очень доволен покупкой и рекомендую всем!",
    images: [
      {
        id: 1,
        image: "https://optim.tildacdn.com/stor3664-3966-4634-b239-663538366538/-/format/webp/27089237.jpg.webp"
      },
      {
        id: 2,
        image: "https://optim.tildacdn.com/stor3664-3966-4634-b239-663538366538/-/format/webp/27089237.jpg.webp"
      },
      {
        id: 3,
        image: "https://optim.tildacdn.com/stor3664-3966-4634-b239-663538366538/-/format/webp/27089237.jpg.webp"
      }
    ],
    created_at: "2025-12-20T10:30:00Z",
    helpful_count: 12,
    not_helpful_count: 1,
    developer_response: {
      id: 1,
      developer_name: "СтройИнвест",
      response_text: "Благодарим за положительный отзыв! Рады, что Вам понравилась квартира. Желаем комфортного проживания!",
      created_at: "2025-12-21T14:00:00Z"
    }
  },
  {
    id: 2,
    user_name: "Мария Петрова",
    rating: 4,
    comment: "Хорошее расположение, удобная инфраструктура. Единственный минус - долго ждали заселения, но в целом все устроило.",
    images: [],
    created_at: "2025-12-15T16:45:00Z",
    helpful_count: 8,
    not_helpful_count: 2,
  },
  {
    id: 3,
    user_name: "Дмитрий Соколов",
    user_avatar: "https://i.pravatar.cc/150?img=33",
    rating: 5,
    comment: "Превосходное качество строительства! Звукоизоляция на высшем уровне, соседей вообще не слышно. Парковочных мест достаточно.",
    images: [
      {
        id: 4,
        image: "https://optim.tildacdn.com/stor3664-3966-4634-b239-663538366538/-/format/webp/27089237.jpg.webp"
      }
    ],
    created_at: "2025-12-10T09:20:00Z",
    helpful_count: 15,
    not_helpful_count: 0,
  },
  {
    id: 4,
    user_name: "Елена Волкова",
    rating: 3,
    comment: "Обычная застройка. Ничего выдающегося, но и серьезных недостатков нет. Цена соответствует качеству.",
    images: [
      {
        id: 5,
        image: "https://optim.tildacdn.com/stor3664-3966-4634-b239-663538366538/-/format/webp/27089237.jpg.webp"
      },
      {
        id: 6,
        image: "https://optim.tildacdn.com/stor3664-3966-4634-b239-663538366538/-/format/webp/27089237.jpg.webp"
      },
      {
        id: 7,
        image: "https://optim.tildacdn.com/stor3664-3966-4634-b239-663538366538/-/format/webp/27089237.jpg.webp"
      },
      {
        id: 8,
        image: "https://optim.tildacdn.com/stor3664-3966-4634-b239-663538366538/-/format/webp/27089237.jpg.webp"
      },
      {
        id: 9,
        image: "https://optim.tildacdn.com/stor3664-3966-4634-b239-663538366538/-/format/webp/27089237.jpg.webp"
      }
    ],
    created_at: "2025-12-05T18:00:00Z",
    helpful_count: 5,
    not_helpful_count: 3,
    developer_response: {
      id: 2,
      developer_name: "СтройИнвест",
      response_text: "Спасибо за Ваш отзыв. Мы постоянно работаем над улучшением качества наших объектов.",
      created_at: "2025-12-06T10:30:00Z"
    }
  },
  {
    id: 5,
    user_name: "Игорь Смирнов",
    user_avatar: "https://i.pravatar.cc/150?img=68",
    rating: 5,
    comment: "Купил квартиру в этом комплексе год назад. Все отлично - никаких проблем. Застройщик выполнил все обещания.",
    images: [
      {
        id: 10,
        image: "https://optim.tildacdn.com/stor3664-3966-4634-b239-663538366538/-/format/webp/27089237.jpg.webp"
      },
      {
        id: 11,
        image: "https://optim.tildacdn.com/stor3664-3966-4634-b239-663538366538/-/format/webp/27089237.jpg.webp"
      }
    ],
    created_at: "2025-11-28T12:15:00Z",
    helpful_count: 20,
    not_helpful_count: 1,
  },
  {
    id: 6,
    user_name: "Ольга Кузнецова",
    rating: 4,
    comment: "Современный дизайн, качественные материалы. Немного смущает транспортная доступность, но это решаемо.",
    images: [],
    created_at: "2025-11-20T14:30:00Z",
    helpful_count: 6,
    not_helpful_count: 1,
  },
  {
    id: 7,
    user_name: "Сергей Новиков",
    user_avatar: "https://i.pravatar.cc/150?img=52",
    rating: 5,
    comment: "Идеальное соотношение цены и качества! Рекомендую!",
    images: [],
    created_at: "2025-11-15T08:45:00Z",
    helpful_count: 10,
    not_helpful_count: 0,
  }
];
