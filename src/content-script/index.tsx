import { render } from 'preact'
import '../base.css'
import { getUserConfig, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTContainer from './ChatGPTContainer'
import Global from './Global'
import { config, SearchEngine } from './search-engine-configs'

import './styles.scss'
import { getPossibleElementByQuerySelector } from './utils'

const siteRegex = new RegExp(Object.keys(config).join('|'))
const siteName = location.hostname.match(siteRegex)![0]
const siteConfig = config[siteName]

async function mount(question: string, promptSource: string, siteConfig: SearchEngine) {
  console.log('Inside mount')
  const container = document.createElement('div')
  container.className = 'chat-gpt-container'

  const userConfig = await getUserConfig()
  let theme: Theme
  if (userConfig.theme === Theme.Auto) {
    theme = detectSystemColorScheme()
  } else {
    theme = userConfig.theme
  }
  if (theme === Theme.Dark) {
    container.classList.add('gpt-dark')
  } else {
    container.classList.add('gpt-light')
  }

  const siderbarContainer = getPossibleElementByQuerySelector(siteConfig.chatWindowSelector)
  console.log('locating', siteConfig.chatWindowSelector)
  console.log('siderbarContainer', siderbarContainer)
  if (siderbarContainer) {
    console.log('if container', container)
    siderbarContainer.append(container)
  } else {
    container.classList.add('sidebar-free')
    const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
    console.log('else appendContainer', appendContainer)
    if (appendContainer) {
      appendContainer.appendChild(container)
    }
  }
  console.debug('question:', question)
  console.log('Global.conversationId', Global.conversationId)
  console.log('Global.messageId', Global.messageId)

  render(
    <ChatGPTContainer
      question={question}
      conversationId={Global.conversationId}
      messageId={Global.messageId}
      promptSource={promptSource}
      triggerMode={userConfig.triggerMode || 'always'}
    />,
    container,
  )
}

async function render_already_mounted(
  question: string,
  promptSource: string,
  siteConfig: SearchEngine,
) {
  console.log('props at index(render_already_mounted):', question, promptSource)
  const container = document.createElement('div')
  const allps = document.querySelectorAll('.chat-gpt-container') //#gpt-answer")
  allps[allps.length - 1].appendChild(container)

  console.log('Global.conversationId', Global.conversationId)
  console.log('Global.messageId', Global.messageId)

  render(
    <ChatGPTContainer
      question={question}
      conversationId={Global.conversationId}
      messageId={Global.messageId}
      promptSource={promptSource}
      triggerMode={'always'}
    />,
    container,
  )
}

function _waitForElements(selector, delay = 50, tries = 100) {
  const element = document.querySelectorAll(selector)

  if (!window[`__${selector}`]) {
    window[`__${selector}`] = 0
    window[`__${selector}__delay`] = delay
    window[`__${selector}__tries`] = tries
  }

  function _search() {
    return new Promise((resolve) => {
      window[`__${selector}`]++
      setTimeout(resolve, window[`__${selector}__delay`])
    })
  }

  if (element === null) {
    if (window[`__${selector}`] >= window[`__${selector}__tries`]) {
      window[`__${selector}`] = 0
      return Promise.resolve(null)
    }

    return _search().then(() => _waitForElement(selector))
  } else {
    return Promise.resolve(element)
  }
}

window.onload = function () {
  console.log('Page load completed')
  let textBu
  for (let i = 0; i < 1000000000; i++) {
    let j = 0
    j = j | j
  }
  console.log('Waited ', 20000)
  // const textarea = document.getElementById('mat-input-0')
  const textarea = document.getElementsByClassName(siteConfig.domTextareaSelector)[0]
  console.log('textarea ', textarea)

  const start = (async () => {
    const suggested_prompts = await _waitForElements(`div.suggestion-container button`)
    console.log('suggested_prompts:', suggested_prompts)
    for (let i = 0; i < suggested_prompts.length; i++) {
      suggested_prompts[i].addEventListener('click', (event) => {
        console.log(event)
        textBu = event.target.innerText
        console.log('now textBu = ', textBu)
        if (textarea) {
          textarea.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles: true,
              cancelable: true,
              isTrusted: true,
              key: 'Enter',
              code: 'Enter',
              location: 0,
              ctrlKey: false,
            }),
          )
        } else {
          console.log('cant find textarea')
        }
        return false
      })
    }
  })()

  const text_entered_buttons = document.getElementsByClassName('send-button-container')
  console.log('text_entered_buttons', text_entered_buttons)
  const text_entered_button = text_entered_buttons[0]

  if (text_entered_button) {
    console.log('Tag: ' + text_entered_button.tagName)
  } else {
    console.log('Tag text_entered_button not found')
    // setTimeout(() => {
    //   window.location.reload()
    // }, 500)
  }

  if (text_entered_button?.tagName == 'DIV') {
    text_entered_button.addEventListener('click', (event) => {
      console.log('Pressed: ' + text_entered_button.tagName)
      console.log('Now button press to enter(keydown) conversion step', event)
      if (textarea) {
        textarea.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            isTrusted: true,
            key: 'Enter',
            code: 'Enter',
            location: 0,
            ctrlKey: false,
          }),
        )
      } else {
        console.log('cant find textarea')
      }
      return false
    })
  }

  if (textarea) {
    textarea.addEventListener('keydown', (event) => {
      console.log('event=', event)
      if (event.key === 'Enter' && event.composed === false) {
        console.log('Enter key pressed! textBu: ' + textBu)
        const text = textBu
        event.preventDefault() // Prevent the default Enter key behavior (e.g., line break)
        if (text) {
          const bodyInnerText = text.trim().replace(/\s+/g, ' ').substring(0, 1500)
          console.log('final prompt:', bodyInnerText)
          const gpt_container = document.querySelector('div.chat-gpt-container')
          console.log('gpt_container:', gpt_container)
          if (!gpt_container) mount(bodyInnerText, 'default', siteConfig)
          else render_already_mounted(bodyInnerText, 'default', siteConfig)
          if (gpt_container) {
            gpt_container.scroll({ top: gpt_container.scrollHeight, behavior: 'smooth' })
          }
        } else {
          console.log('cant find textBu')
        }
      } else {
        //
      }
    })
    textarea.addEventListener('keyup', (event) => {
      textBu = event.target.innerText
      console.log('now textBu after keyup= ', textBu)
    })
  } else {
    console.log('cant find textarea')
  }
}
