import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import AccountProfile from "../../components/account/profile"
import AccountOrders from "../../components/account/orders"
import AccountAddresses from "../../components/account/addresses"
import AccountWishlist from "../../components/account/wishlist"


export default function AccountPage() {
  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-center lg:text-left">My Account</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <div className="flex justify-center lg:justify-start">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <AccountProfile />
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <AccountOrders />
          </TabsContent>

          <TabsContent value="addresses">
            <AccountAddresses />
          </TabsContent>

          <TabsContent value="wishlist">
            <AccountWishlist />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
