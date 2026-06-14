"use client";

import Link from "next/link";

export function NotFoundContent() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        <div className="flex justify-center mb-6">
          <svg
            className="w-[40px] h-[64px] sm:w-[52px] sm:h-[84px]"
            viewBox="0 0 26 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.72147 4.15728C6.87857 6.09646 6.52801 6.48847 6.49797 6.64528C6.48294 6.74459 6.47293 9.67164 6.48795 13.1423L6.50798 19.4564L3.48822 16.3046C1.445 14.1615 0.443427 13.1475 0.368308 13.1475H0.26815L0.278166 20.6115L0.29319 28.0755L3.84879 31.7709C5.80187 33.8042 7.43444 35.4663 7.47951 35.4663C7.54962 35.4663 10.4993 32.4295 10.5944 32.257C10.6195 32.21 10.6195 32.1368 10.5894 32.0845C10.5594 32.0322 9.25231 30.6523 7.67983 29.0111L4.82533 26.037V23.2615L4.83034 20.4913L5.67667 21.3955L6.52801 22.2946V23.8104V25.3209L8.73649 27.626C10.1738 29.1313 10.965 29.9258 11.0151 29.9049C11.0752 29.8788 11.0852 27.9657 11.0752 15.8812C11.0602 3.43597 11.0501 1.88359 10.985 1.86791C10.94 1.86268 10.0035 2.80875 8.72147 4.15728Z"
              fill="var(--accent-primary)"
            />
            <path
              d="M12.7375 17.2193V32.5341L10.7093 34.6457C9.59255 35.8061 8.68111 36.7887 8.68111 36.8306C8.68111 36.9403 11.771 40.1287 11.8611 40.1078C11.9312 40.0921 13.664 38.3098 16.1329 35.7172L17.2947 34.4941V28.3891V22.2841L18.101 21.4531C18.5417 20.9983 18.9172 20.622 18.9373 20.622C18.9573 20.622 18.9723 23.3191 18.9723 26.6172C18.9723 30.9869 18.9874 32.6125 19.0274 32.6281C19.0925 32.649 23.4594 28.0964 23.5145 27.9501C23.5295 27.903 23.5495 24.5526 23.5495 20.5018C23.5546 13.4768 23.5495 13.1476 23.4644 13.1476C23.4143 13.1476 22.0822 14.4961 20.3345 16.3203L17.2897 19.4982L17.2997 12.996L17.3047 6.49373L16.884 6.05467C16.6587 5.81424 15.7523 4.87339 14.8709 3.95869C13.9945 3.04921 13.1982 2.21291 13.0981 2.10315C13.0029 1.99861 12.8827 1.90975 12.8276 1.90975C12.7425 1.90975 12.7375 2.39062 12.7375 17.2193Z"
              fill="var(--accent-primary)"
            />
          </svg>
        </div>

        <h1
          className="text-7xl sm:text-8xl font-bold tracking-tight mb-4"
          style={{
            color: "var(--accent-primary)",
          }}
        >
          404
        </h1>

        <h2
          className="text-xl sm:text-2xl font-bold mb-3"
          style={{
            color: "var(--text-primary)",
          }}
        >
          Страница не найдена
        </h2>

        <p
          className="text-sm sm:text-base mb-6 max-w-md mx-auto"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Запрашиваемая страница не существует или была перемещена.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-[16px] font-semibold text-sm sm:text-base transition-all duration-300"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "#FFFFFF",
            }}
          >
            Вернуться на главную
          </Link>

          <Link
            href="/"
            className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-[16px] font-semibold text-sm sm:text-base transition-all duration-300 border-2"
            style={{
              backgroundColor: "transparent",
              color: "var(--accent-primary)",
              borderColor: "var(--accent-primary)",
            }}
          >
            Назад
          </Link>
        </div>
      </div>
    </div>
  );
}
