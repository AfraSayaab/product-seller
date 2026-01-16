import Footer from "@/components/Footer";
import { HeaderLayout } from "@/components/Header/header";
import SellerDetailInfo from "@/components/Seller/SellerDetailInfo";
import SellerOtherItems from "@/components/Seller/SellerOtherItems";

export default function SellerProfile() {
  

  return (
    <>
    <HeaderLayout />

    <main className="min-h-screen bg-background">
    <SellerDetailInfo
  name="Shanice"
  memberSince="Jun 17, 2024"
  mobile="+44 123 456 789"
  email="shanice@example.com"
  website="www.dazzleandbloom.co.uk"
  profileImage="/profile-shanice.webp"
/> 

<SellerOtherItems />

    </main>

    <Footer />
  </>
  );
}
