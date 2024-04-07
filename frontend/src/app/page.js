import Image from "next/image";
import { ModeToggle } from "@/components/theme-toggle";
import { Chat } from "@/components/chat/main";
import { AI } from "@/lib/chat/actions"; // Provider the gives access to AiState and UiState

export default function Home() {
  return ( 
    <AI>
      <ModeToggle />
      <Chat />
    </AI>  
  );
}