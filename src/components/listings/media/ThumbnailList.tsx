import Image from "next/image";

type Props = {
  image: string;
  onClick: () => void;
};

export default function ThumbnailItem({ image, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="relative aspect-square w-full overflow-hidden rounded-lg border hover:ring-2 hover:ring-pink-500 transition"
    >
      <Image
        src={image}
        alt="Thumbnail"
        fill
        className="object-cover"
      />
    </button>
  );
}
