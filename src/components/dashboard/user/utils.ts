const numberFormatter = new Intl.NumberFormat();

export const formatNumber = (value?: number) => numberFormatter.format(value ?? 0);

export const formatMoney = (value?: number, currency?: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "PKR",
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  } catch {
    return `${currency || "PKR"} ${formatNumber(value ?? 0)}`;
  }
};

export const humanizeStatus = (status: string) =>
  status
    ? status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase())
    : "Unknown";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export const getStatusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "DRAFT":
      return "secondary";
    case "SOLD":
      return "destructive";
    default:
      return "outline";
  }
};

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });

