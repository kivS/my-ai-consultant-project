'use client'

import { cn } from '@/lib/utils'
import { EmptyScreen } from '@/components/chat/empty-screen'
import { useEffect, useState } from 'react'

import { usePathname, useRouter } from 'next/navigation'
import { ChatPanel } from '@/components/chat/panel'

import { useUIState, useActions } from "ai/rsc";


export function Chat({ id, className, session, missingKeys }) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')

  const [messages, _] = useUIState();



  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
    >
      <div
        className={cn('pb-[200px] pt-4 md:pt-10', className)}
    
      >
        {messages.length ? (
          messages.map(message => (
            <div key={message.id}>
              {message.display}
            </div>
          ))
        ) : (
          <EmptyScreen />
        )}
        <div className="h-px w-full"  />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
      />
    </div>
  )
}
