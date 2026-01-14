import Image from "next/image";

type Props = {
  image: string;
};

export default function MainImage({ image }: Props) {
  return (
    <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl border bg-muted">
      <Image
        src={image}
        alt="Listing image"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
