import { Button } from "@/components/ui/button";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { FaucetButton } from "@/components/faucet-button";
import Link from "next/link";
import { ArrowRight, Award, Coins, Gamepad2, Rocket } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-2 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold">Space Puzzle</span>
          </div>
          <div className="flex items-center gap-2">
            <FaucetButton />
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 sm:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
                  Explore the Universe of{" "}
                  <span className="text-primary">Space Puzzle</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Play, earn tokens, collect achievements, and join a thriving
                  blockchain gaming community.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button className="w-full sm:w-auto" asChild size="lg">
                    <Link href="/dashboard">
                      Launch Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button className="w-full sm:w-auto" variant="outline" size="lg" asChild>
                    <Link href="/game">
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Launch Game
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4 sm:p-8 aspect-square flex items-center justify-center">
                <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg overflow-hidden flex items-center justify-center">
                  <Rocket className="h-20 w-20 sm:h-32 sm:w-32 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-muted px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
              Key Features
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
              <div className="bg-background p-4 sm:p-6 rounded-lg shadow-sm h-full">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Game Tokens (KEY)</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Tokenize in-game keys, trade with other players, and use them
                  for in-game purchases.
                </p>
              </div>
              <div className="bg-background p-4 sm:p-6 rounded-lg shadow-sm h-full">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Daily Rewards</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Claim daily rewards and build consecutive day streaks for
                  bonus multipliers.
                </p>
              </div>
              <div className="bg-background p-4 sm:p-6 rounded-lg shadow-sm h-full">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">NFT Achievements</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Earn unique NFTs for completing achievements and showcase your
                  gaming prowess.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-sm sm:text-base font-bold">Space Puzzle</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground text-center md:text-right">
              &copy; {new Date().getFullYear()} Space Puzzle Game. All rights
              reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
