import { GearIcon } from '@primer/octicons-react'
import { useEffect, useState } from 'preact/hooks'
import { memo, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import Browser from 'webextension-polyfill'
import { captureEvent } from '../analytics'
import { Answer } from '../messaging'
import ChatGPTFeedback from './ChatGPTFeedback'
import { isBraveBrowser, shouldShowRatingTip } from './utils.js'
import Global from "./Global";

export type QueryStatus = 'success' | 'error' | undefined

interface Props {
  question: string
  conversationId: string
  messageId: string
  promptSource: string
  onStatusChange?: (status: QueryStatus) => void
}

interface Requestion {
  requestion: string
  index: number
  answer: Answer | null
}

interface ReQuestionAnswerProps {
  latestAnswerText: string | undefined
}

function ChatGPTQuery(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [done, setDone] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [status, setStatus] = useState<QueryStatus>()
  const [reError, setReError] = useState('')
  const [reQuestionDone, setReQuestionDone] = useState(false)
  const [requestionList, setRequestionList] = useState<Requestion[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [reQuestionLatestAnswerText, setReQuestionLatestAnswerText] = useState<string | undefined>()

  useEffect(() => {
    props.onStatusChange?.(status)
  }, [props, status])

  useEffect(() => {
    const port = Browser.runtime.connect()
    const listener = (msg: any) => {
      if (msg.text) {
        setAnswer(msg)
        setStatus('success')
      } else if (msg.error) {
        setError(msg.error)
        setStatus('error')
      } else if (msg.event === 'DONE') {
        setDone(true)
        setReQuestionDone(true)
      }
    }
    port.onMessage.addListener(listener)
    if (props.conversationId != "0" || props.messageId != "0"){
      port.postMessage({
        question: props.question,
        conversationId: props.conversationId,
        parentMessageId: props.messageId,
      })
    } else {
      port.postMessage({ question: props.question })
    }
    return () => {
      port.onMessage.removeListener(listener)
      port.disconnect()
    }
  }, [props.question, retry])

  // retry error on focus
  useEffect(() => {
    const onFocus = () => {
      if (error && (error == 'UNAUTHORIZED' || error === 'CLOUDFLARE')) {
        setError('')
        setRetry((r) => r + 1)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [error])

  useEffect(() => {
    shouldShowRatingTip().then((show) => setShowTip(show))
  }, [])

  useEffect(() => {
    if (status === 'success') {
      console.log('answer', answer)
      Global.conversationId = answer.conversationId;
      Global.messageId = answer.messageId;
      captureEvent('show_answer', { host: location.host, language: navigator.language })
    }
  }, [props.question, status])

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  if (answer) {
    return (
      <div className="markdown-body gpt-markdown" id="gpt-answer" dir="auto">
        <div className="gpt-header">
          <span className="font-bold">ChatGPT</span>
          <span className="cursor-pointer leading-[0]" onClick={openOptionsPage}>
            <GearIcon size={14} />
          </span>
          <ChatGPTFeedback
            messageId={answer.messageId}
            conversationId={answer.conversationId}
            latestAnswerText={answer.text}
          />
        </div>
        <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
          {answer.text}
        </ReactMarkdown>
      </div>
    )
  }

  if (error === 'UNAUTHORIZED' || error === 'CLOUDFLARE') {
    return (
      <p>
        Please login and pass Cloudflare check at{' '}
        <a href="https://chat.openai.com" target="_blank" rel="noreferrer">
          chat.openai.com
        </a>
        {retry > 0 &&
          (() => {
            if (isBraveBrowser()) {
              return (
                <span className="block mt-2">
                  Still not working? Follow{' '}
                  <a href="https://github.com/ishandutta2007/chatgpt-on-bard-extension#troubleshooting">
                    Brave Troubleshooting
                  </a>
                </span>
              )
            } else {
              return (
                <span className="italic block mt-2 text-xs">
                  OpenAI requires passing a security check every once in a while. If this keeps
                  happening, change AI provider to OpenAI API in the extension options.
                </span>
              )
            }
          })()}
      </p>
    )
  }
  if (error) {
    return (
      <p>
        Failed to load response from ChatGPT:
        <span className="break-all block">{error}</span>
      </p>
    )
  }

  return <p className="text-[#b6b8ba] animate-pulse">Waiting for ChatGPT ...</p>
}

export default memo(ChatGPTQuery)
