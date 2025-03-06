import { ExternalLinkIcon } from "lucide-react"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import Link from "next/link"
const Header = () => {
    return (
        <div>
        <div className="text-center"></div>
        <Dialog>
          <DialogTrigger><Badge variant="destructive" className="bg-green-700">[ Dev Build ] : Solat.Today x GodamSahur <ExternalLinkIcon /></Badge></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solat.Today x GodamSahur</DialogTitle>
              <DialogDescription>
                As part of the <Link target="_blank" href="https://sahur.dev/" className="underline">Godam Sahur</Link> initiative, this application is under heavy development. Please verify the information provided before using this application, and <Link target="_blank" href="https://api.whatsapp.com/send?phone=60102065075" className="underline">report</Link> any bugs to the developer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>

            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>

    )
}

export default Header