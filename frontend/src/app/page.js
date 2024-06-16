import Image from "next/image";

import { Chat } from "@/components/chat/main";
import { AI } from "@/lib/chat/actions"; // Provider the gives access to AiState and UiState
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {

  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }
  
  console.log({data})
  // console.log(data.user.user_metadata)

  return ( 
    <AI>
      <Chat />
    </AI>  
  );
}
