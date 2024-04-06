import { useRef } from 'react'

/**
 * Custom hook to submit a form on Enter key press.
 * @returns {{formRef: React.RefObject<HTMLFormElement>, onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void}}
 */
export function useEnterSubmit() {
  /**
   * Reference to the form element.
   * @type {React.RefObject<HTMLFormElement>}
   */
  const formRef = useRef(null)

  /**
   * Handles key down event on text area.
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} event - The keyboard event.
   */
  const handleKeyDown = (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      formRef.current?.requestSubmit()
      event.preventDefault()
    }
  }

  return { formRef, onKeyDown: handleKeyDown }
}
