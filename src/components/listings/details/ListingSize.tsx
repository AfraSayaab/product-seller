export default function ListingSize() {
    return (
      <div>
        <p className="mb-2 text-sm font-medium">Size</p>
  
        <div className="flex gap-2">
          <span className="rounded-md border border-pink-500 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600">
            M
          </span>
  
          {["XS", "S", "L", "XL"].map((size) => (
            <span
              key={size}
              className="rounded-md border px-4 py-2 text-sm text-muted-foreground line-through opacity-50"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    );
  }
  