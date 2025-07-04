import Link from "next/link"
import Image from "next/image"

const categories = [
  {
    id: 1,
    name: "T-Shirts",
    image: "/images/category-tshirts.jpg",
    link: "/products?category=t-shirts",
  },
  {
    id: 2,
    name: "Hoodies",
    image: "/images/category-hoodies.jpg",
    link: "/products?category=hoodies",
  },
  {
    id: 3,
    name: "Pants",
    image: "/images/category-pants.jpg",
    link: "/products?category=pants",
  },
  {
    id: 4,
    name: "Accessories",
    image: "/images/category-accessories.jpg",
    link: "/products?category=accessories",
  },
]

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link key={category.id} href={category.link} className="group relative overflow-hidden rounded-lg">
          <div className="aspect-square">
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity group-hover:bg-black/60">
            <h3 className="text-2xl font-bold text-white">{category.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  )
}
