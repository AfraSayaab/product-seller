import React from "react";
import { Mail, Globe, Phone } from "lucide-react";
import Image from "next/image";

type SellerUser = {
  id: number;
  username: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  biography?: string | null;
  publicAddress?: string | null;
  createdAt?: string | null;
  avatarUrl?: string | null;
};

export default function SellerDetailInfo({ user }: { user: SellerUser }) {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "";

  const profileImage = user.avatarUrl || "/profile.jpg";

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-black rounded-2xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex justify-center md:justify-start">
          <div className="relative w-48 h-48 rounded-full border-4 border-pink-500 overflow-hidden shadow-md">
            <Image src={profileImage} alt={name} width={192} height={192} />
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col justify-center space-y-4 text-white font-serif">
          <h2 className="text-3xl font-bold text-pink-500">{name}</h2>
          {memberSince && <p className="text-gray-400">Member since {memberSince}</p>}
          {user.publicAddress && <p className="text-gray-300">{user.publicAddress}</p>}
          {user.biography && <p className="text-gray-300">{user.biography}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2 text-gray-200">
              <Phone className="h-5 w-5 text-pink-500" />
              <span>{user.phone || "—"}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-200">
              <Mail className="h-5 w-5 text-pink-500" />
              <span>{user.email || "—"}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-200">
              <Globe className="h-5 w-5 text-pink-500" />
              <span>{user.website || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
