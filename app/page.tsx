import Header from "@/components/Header";
import HeroArea from "@/components/HeroArea";
import ChatWindow from "@/components/ChatWindow";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-moss-600"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex flex-1 flex-col">
        <HeroArea />
        <ChatWindow />
      </main>
      <Footer />
    </div>
  );
}
