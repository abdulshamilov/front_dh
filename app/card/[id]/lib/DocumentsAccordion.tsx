import { IDocument } from "@/app/types/models";

const getFileExtension = (url: string): string => {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : "file";
};

export function DocumentsAccordion({ documents }: { documents: IDocument[] }) {
  return (
    <div
      className="mb-4 overflow-hidden rounded-xl"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-glass)",
      }}
    >
      <div
        className="px-6 py-4 font-[family-name:var(--font-stetica-bold)] text-lg"
        style={{ color: "var(--text-primary)" }}
      >
        Документы
      </div>
      <div className="px-6 pb-6 pt-2">
        {documents.length > 0 ? (
          <div className="space-y-3">
            <div
              className="hidden md:grid md:grid-cols-[1fr_150px_130px_50px] gap-4 pb-2 text-sm font-[family-name:var(--font-stetica-medium)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>Тип документа</span>
              <span>Дата размещения</span>
              <span>Тип файла</span>
              <span></span>
            </div>

            <ul className="space-y-3 md:space-y-2">
              {documents.map((doc: IDocument, i: number) => (
                <li
                  key={i}
                  className="flex flex-col md:grid md:grid-cols-[1fr_150px_130px_50px] gap-2 md:gap-4 md:items-center p-0 md:p-3 md:p-0 rounded-lg md:rounded-none transition-colors"
                  style={{ borderBottom: "1px solid var(--divider)" }}
                >
                  <div className="md:hidden flex flex-row justify-between space-y-2">
                    <div className="flex flex-col items-start justify-between gap-1">
                      <span
                        className="font-[family-name:var(--font-stetica-medium)] flex-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {doc.title}
                      </span>
                      <div className="flex gap-2">
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {doc.uploaded_at
                            ? new Date(doc.uploaded_at).toLocaleDateString(
                                "ru-RU"
                              )
                            : "—"}
                          , {getFileExtension(doc.file)}
                        </span>
                      </div>
                    </div>
                    <a
                      href={doc.file}
                      download
                      aria-label={`Скачать ${doc.title}`}
                      className="flex-shrink-0 flex justify-center items-center hover:opacity-70 transition-opacity"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 3v12" />
                        <path d="M7 10l5 5 5-5" />
                        <path d="M5 21h14" />
                      </svg>
                    </a>
                  </div>

                  <span
                    className="hidden md:block font-[family-name:var(--font-stetica-regular)] truncate"
                    style={{ color: "var(--text-primary)" }}
                    title={doc.title}
                  >
                    {doc.title}
                  </span>
                  <span
                    className="hidden md:block text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {doc.uploaded_at
                      ? new Date(doc.uploaded_at).toLocaleDateString("ru-RU")
                      : "—"}
                  </span>
                  <span
                    className="hidden md:block text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {getFileExtension(doc.file)}
                  </span>
                  <a
                    href={doc.file}
                    download
                    aria-label={`Скачать ${doc.title}`}
                    className="hidden md:flex justify-center items-center hover:opacity-70 transition-opacity"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--accent-primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3v12" />
                      <path d="M7 10l5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p
            className="text-center py-4 text-base"
            style={{ color: "var(--text-secondary)" }}
          >
            Документы отсутствуют
          </p>
        )}
      </div>
    </div>
  );
}
