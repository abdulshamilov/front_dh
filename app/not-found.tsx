import { NotFoundContent } from "./components/NotFoundContent";

export default function NotFound() {
  return (
    <div
      className="my-14 flex items-center content-center justify-center"
      style={{
        backgroundColor: "var(--bg-primary)",
        transition: "background-color 0.3s ease",
      }}
    >
      <NotFoundContent />
    </div>
  );
}
