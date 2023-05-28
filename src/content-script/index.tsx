import { render } from 'preact'
import '../base.css'
import { getUserConfig, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTContainer from './ChatGPTContainer'
import { config, SearchEngine } from './search-engine-configs'
import Global from "./Global";

import './styles.scss'
import { getPossibleElementByQuerySelector } from './utils'

const siteRegex = new RegExp(Object.keys(config).join('|'))
const siteName = location.hostname.match(siteRegex)![0]
const siteConfig = config[siteName]

async function mount(question: string, promptSource: string, siteConfig: SearchEngine) {
  console.log("Inside mount")
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

  const siderbarContainer = getPossibleElementByQuerySelector(siteConfig.sidebarContainerQuery)
  console.log("locating", siteConfig.sidebarContainerQuery)
  console.log("siderbarContainer", siderbarContainer)
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
  console.log("Global.conversationId",Global.conversationId)
  console.log("Global.messageId",Global.messageId)

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

let last_query_time = 1
async function render_already_mounted(
  question: string,
  promptSource: string,
  siteConfig: SearchEngine,
) {
  console.log('props at index(render_already_mounted):', question, promptSource)
  const container = document.createElement('div')
  const allps = document.querySelectorAll('.chat-gpt-container') //#gpt-answer")
  allps[allps.length - 1].appendChild(container)

  last_query_time = Date.now()
  console.log("Global.conversationId",Global.conversationId)
  console.log("Global.messageId",Global.messageId)

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

window.onload = function () {
  console.log('Page load completed')
  let textBu;
  const textarea = document.getElementById('mat-input-0');

  window.setTimeout(function () {
    const suggested_prompts = document.querySelectorAll("div.suggestion-container button");
    console.log("suggested_prompts", suggested_prompts)
    for (var i = 0; i < suggested_prompts.length; i++) {
      suggested_prompts[i].addEventListener('click', (event) => {
        console.log(event)
        textBu = event.target.innerText
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
        return false
      })
    }
  }, 2000)

  const text_entered_buttons = document.getElementsByClassName('send-button-container')
  console.log("text_entered_buttons", text_entered_buttons)
  const text_entered_button = text_entered_buttons[0]
  console.log('Tag: ' + text_entered_button.tagName)
  if (text_entered_button.tagName == 'DIV') {
    text_entered_button.addEventListener('click', (event) => {
      console.log('Pressed: ' + text_entered_button.tagName)
      console.log('Now button press to enter(keydown) conversion step', event)
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
      return false
    })
  }

  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      console.log('Enter key pressed! textBu: ' + textBu)
      const text = textBu
      event.preventDefault() // Prevent the default Enter key behavior (e.g., line break)
      const bodyInnerText = text.trim().replace(/\s+/g, ' ').substring(0, 1500)
      console.log('final prompt:', bodyInnerText)
      const gpt_container = document.querySelector('div.chat-gpt-container')
      if (!gpt_container) mount(bodyInnerText, 'default', siteConfig)
      else render_already_mounted(bodyInnerText, 'default', siteConfig)
      if (gpt_container) {
        gpt_container.scroll({ top: gpt_container.scrollHeight, behavior: 'smooth' })
      }
    }
  })
  textarea.addEventListener('keyup', (event) => {
    textBu = event.target.value
  });
}

window.setInterval(function () {
  console.log('times=', Date.now(), last_query_time, Date.now() - last_query_time < 39000)
  if (Date.now() - last_query_time < 39000 && Global.done == true) {
    const gpt_container = document.querySelector('div.chat-gpt-container')
    gpt_container.scroll({ top: gpt_container.scrollHeight, behavior: 'smooth' })
    Global.done = false
  }
}, 5000)
