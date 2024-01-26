import logo from './assets/Image-removebg-preview.png';
import botAvatar from './assets/aLogobyDesigner.png';
import userAvatar from "./assets/humnaLogobyDesigner.png";
import './App.css';
import React, { useEffect, useState } from "react";
import { TbSend } from "react-icons/tb";

function App() {
  const MENSAGEM_INICIAL = "Olá, eu sou o LINK, o assistente virtual dos estagiatos 2023. Como posso te ajudar?";
  const [inputText, setInputText] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  
  useEffect(() => {

        sendInitialBotMessage();
    },
 []);

const sendInitialBotMessage = () => {
  // Método que cria um objeto de mensagem inicial do bot e atualiza o estado AllMessages. 
  const botMessage = {
      text: MENSAGEM_INICIAL,
      type: "bot-initial",
      image: botAvatar,
  };
  setAllMessages([botMessage]);
};

const handleInputChange = (e) => {
  //atualiza o estado do input com o valor que o usuário digitou no campo de entrada.
  setInputText(e.target.value);
};
const sendUserMessage = () => {
  // Método que cria um objeto de mensagem do usuário, chama a func.'sendUserMessageToBot', atualiza o estado AllMessages.
  if (inputText.trim() === "") return;
  const userMessage = {
      text: inputText,
      type: "user",
      image:userAvatar,
  };
  sendUserMessageToBot(inputText);
  setInputText("");
  setAllMessages((prevMessages) => [...prevMessages, userMessage]);
};
const sendUserMessageToBot = async (userMessage) => {
        try {
            const response = await fetch(
                `http://localhost:8000`,
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: "message",
                        text: userMessage,
                    }),
                }
            );
            const data = await response.json();
      
            sendMessageBot(userMessage, data.message)
        } catch (error) {
            console.error("Erro ao enviar a mensagem do usuário:", error);
        }
    };
    const isMarkdownLink = (text) => {
      // verifica se a string contém markdown 
      const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
      return markdownLinkRegex.test(text);
  };
    const sendMessageBot = (question, response) => {
      // método que processa a resposta do bot, monta o objeto com a resposta e atualiza o estado AllMessages. 
      
      const messages = [];
      let currentText = response;

      while (isMarkdownLink(currentText)) {
          const match = currentText.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (match.index > 0) {
              // Texto antes do link
              var textoAntesDoLink = currentText.slice(0, match.index);
          }

          //Markdown
          const linkText = match[1];
          let linkURL = match[2];

          // Verificar se há um '.' 
          const textoDepoisDoLink = currentText.slice(match.index + match[0].length);
          const dotAfterLink = textoDepoisDoLink.match(/^\s*\./);

          if (dotAfterLink) {
              linkURL += '.';
              currentText = textoDepoisDoLink.slice(dotAfterLink[0].length);
          } else {
              currentText = textoDepoisDoLink;
          }

          messages.push(
              <p key={messages.length}>{textoAntesDoLink}<a href={linkURL} target="_blank" rel="noopener noreferrer">{linkText}</a></p>
          );
      }

      // Adicionar qualquer texto restante
      if (currentText.length > 0) {
          const textLines = currentText.split('\n');
          textLines.forEach((line, index) => {
              messages.push(
                  <span key={messages.length}>
                      {line}
                      {index < textLines.length - 1 && <br />}
                  </span>
              );
          });
      }

      const botMessage = {
          question,
          text: messages,
          type: "bot",
          image: botAvatar,
      };

      setAllMessages((prevMessages) => [...prevMessages, botMessage]);
  };

  React.useEffect(() => {
    // Scroll para o final do chatbot-container
    const wrapper = document.querySelector(".chatbot");
    const lastMessage = document.querySelector(".message-box:last-child");
    const waitMessage = document.querySelector(".chatbot img:last-child");

    if (wrapper && lastMessage) {
        const scrollToBottom = () => {
            const topOffset = lastMessage.offsetTop - wrapper.scrollTop + lastMessage.clientHeight + 10;
            const scrollOffset = window.innerHeight - wrapper.offsetHeight;
            
            wrapper.scrollTo({ top: scrollOffset + topOffset, left: 0, behavior: "smooth" });
            
            if(allMessages.user === "user"){
                const topOffset = waitMessage.offsetTop - wrapper.scrollTop + waitMessage.clientHeight + 10;
                wrapper.scrollTo({ top: scrollOffset + topOffset, left: 0, behavior: "smooth" });
            }
            
        };

        const handleResize = () => {
            scrollToBottom();
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(wrapper);

        window.addEventListener("resize", handleResize);

        return () => {
            resizeObserver.unobserve(wrapper);
            window.removeEventListener("resize", handleResize);
        };

        // Adicione outras dependências necessárias aqui
    }
}, [allMessages]);



  return (
    <div className="App">
      <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
      </header>

      <div className="App-body">
        <div className='chatbot-container'>

          <img src={logo} className='logo' />

          <div className="chatbot">
            {allMessages.map((message, index) => (
              <div
                key={index}
                className={`message-box ${message.type === "user" ? "user" : "bot"}`}
              >
                
                  <div className="avatar-bot">
                    <img src={message.image} alt="Bot" />
                  </div>
          
                <div
                  id="messageId"
                  className={`message-text ${message.type === "user" ? "user" : "bot"}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
            <div className="input-send">
                  <input
                    
                    type="text"
                    placeholder="Digite sua dúvida (até 150 caracteres)"
                    value={inputText}
                    maxLength={150}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendUserMessage();
                      }
                    }}
                  />
              <button
                  type="button"
                  onClick={() => sendUserMessage()}
                >
              <TbSend />
              </button>
            </div>
        </div>
      </div>
    </div>
  );

};
export default App;
