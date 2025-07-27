import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container py-6">  {/* Reduced padding from py-12 to py-6 */}
        <div className="grid grid-cols-1 gap-auto text-center">
          <div className="flex flex-col items-center justify-center">
            <h3 className="mb-2 text-base font-bold">NOCTAEL</h3> {/* Reduced margin and font size */}
            <p className="text-xs text-gray-400 max-w-md mx-auto">Premium clothing brand for those who embrace the darkness.</p> {/* Reduced text size */}
            <div className="mt-2 flex space-x-4 justify-center"> {/* Reduced margin-top */}
              <Link href="https://www.facebook.com/share/19AfhhX9kS/?mibextid=wwXIfr" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-4 w-4" /> {/* Reduced icon size */}
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://www.instagram.com/noctael.co" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" /> {/* Reduced icon size */}
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center mt-4 md:mt-0"> {/* Reduced margin-top */}
            {/* Shop section - commented out */}
          </div>
          
          {/* Company section - commented out */}
        
          {/* Customer Service section - commented out */}
        </div>
        <div className="mt-4 border-t border-gray-800 pt-4 text-center text-xs text-gray-400"> {/* Reduced margins and text size */}
          <p>&copy; {new Date().getFullYear()} Noctael. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
