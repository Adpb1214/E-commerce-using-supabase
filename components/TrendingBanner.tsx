import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
// import { Button } from "@/components/ui/button"
import img1 from "../public/sale-banner-template-design-big-sale-special-offer-promotion-discount-banner-vector.jpg"

import img2 from "../public/th.jpeg"
import img3 from "../public/6389bc75f8e8eaf5627c243d4e85ac5a.jpg"

interface TrendingProductsBannerProps {
  title: string
  description: string
  imageUrl: string
  linkUrl: string
}

export function TrendingProductsBanner({ title, description, imageUrl, linkUrl }: TrendingProductsBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg">
      {/* Background Image */}
      <Image
        src={img1}
        alt="Trending Products"
        width={1200}
        height={600}
        className="object-cover w-full h-[200px] sm:h-[300px] md:h-[400px]"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-gray-200 mb-4 sm:mb-6 max-w-md">
          {description}
        </p>
        <Link href={linkUrl}>
          <Button size="lg" className="w-full sm:w-auto">
            Shop Now
          </Button>
        </Link>
      </div>
    </div>
  )
}
