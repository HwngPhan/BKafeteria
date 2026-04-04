
export type Product = {
  id: string
  name: string
  price: number
  image: string
  vendorId: string
  category: string
  rating: number
  description: string
}

export type Vendor = {
  id: string
  name: string
  image: string
  rating: number
  distance: string
  time: string
}

export const VENDORS: Vendor[] = [
  { id: "v1", name: "Cơm Tấm Sài Gòn", image: "/vendor1.jpg", rating: 4.8, distance: "0.5km", time: "15p" },
  { id: "v2", name: "Trà Sữa Mixue", image: "/vendor2.jpg", rating: 4.5, distance: "1.2km", time: "20p" },
  { id: "v3", name: "Bánh Mì PewPew", image: "/vendor3.jpg", rating: 4.2, distance: "2.0km", time: "25p" },
]

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Cơm Sườn Bì Chả", price: 45000, image: "/comtam.jpg", vendorId: "v1", category: "Food", rating: 4.9, description: "Cơm tấm dẻo, sườn nướng than hoa" },
  { id: "p2", name: "Trà Đào Cam Sả", price: 25000, image: "/tradao.jpg", vendorId: "v2", category: "Drink", rating: 4.7, description: "Thanh mát giải nhiệt mùa hè" },
  { id: "p3", name: "Bánh Mì Thập Cẩm", price: 30000, image: "/banhmi.jpg", vendorId: "v3", category: "Food", rating: 4.5, description: "Đầy ắp thịt nguội và pate" },
  { id: "p4", name: "Cà Phê Sữa Đá", price: 20000, image: "/cafe.jpg", vendorId: "v2", category: "Drink", rating: 4.8, description: "Đậm đà hương vị Việt Nam" },
]

export const PROMOTIONS = [
  { id: 1, title: "Giảm 50% Cơm Tấm", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: 2, title: "Freeship Đơn > 100k", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: 3, title: "Mua 1 Tặng 1 Trà Sữa", color: "bg-pink-100 text-pink-700 border-pink-200" },
]