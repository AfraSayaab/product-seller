import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Tag } from "lucide-react";

export default function ListingActions() {
  return (
    <div className="space-y-3">
      <Button className="w-full bg-pink-500 hover:bg-pink-600">
        <Mail className="mr-2 h-4 w-4" />
        Email Seller
      </Button>

      <Button variant="outline" className="w-full">
        <MessageCircle className="mr-2 h-4 w-4" />
        Send Message
      </Button>

      <Button variant="secondary" className="w-full">
        <Tag className="mr-2 h-4 w-4" />
        Send Offer
      </Button>
    </div>
  );
}
