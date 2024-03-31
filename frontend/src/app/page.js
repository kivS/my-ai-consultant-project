import Image from "next/image";
import { ModeToggle } from "@/components/theme-toggle";
import { Chat } from "@/components/chat/main";

export default function Home() {
  return (
    <>
      <ModeToggle />
      <Chat />
    </>
  );
}
