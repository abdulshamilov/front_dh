import { apiSlice } from './auth';

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  user: number;
}

export const notificationsApi = apiSlice.injectEndpoints({
  // При hot-reload повторная инъекция эндпоинта с тем же именем иначе
  // молча игнорируется, и в памяти остаётся старая версия.
  overrideExisting: true,
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => '/notifications/',
      providesTags: ['Notifications'],
    }),
    markNotificationAsRead: builder.mutation<Notification, number>({
      query: (id) => ({
        url: `/notifications/${id}/read/`,
        method: 'PATCH',
        body: { is_read: true },
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/mark-all-read/',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    deleteNotification: builder.mutation<void, number>({
      query: (id) => ({
        url: `/notifications/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
    // Очистка всех уведомлений одним запросом
    clearNotifications: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/clear/',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearNotificationsMutation,
} = notificationsApi;
