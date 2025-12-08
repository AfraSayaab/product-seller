// components/hero/Backdrop.tsx

type Props = {
  isOpen: boolean;
  onClick: () => void;
};

export const Backdrop = ({ isOpen, onClick }: Props) => (
  <div
    onClick={onClick}
    className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ${
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}
  />
);
