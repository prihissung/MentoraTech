# 🤖 MentoraTech – Mentora de Carreiras em Tecnologia

Projeto desenvolvido para o **Azure Frontier Girls – Build Your First Copilot Challenge (Foundry Edition)**.

A **MentoraTech** é um agente de IA que ajuda mulheres a ingressar e crescer na área de tecnologia, oferecendo orientação profissional personalizada baseada em habilidades, interesses e nível de experiência.


## 🎯 Objetivo do Projeto

✔ Criar um agente funcional no Azure AI Foundry  
✔ Integração completa com uma interface Web  
✔ Backend seguro utilizando variável de ambiente  
✔ Documentação e entrega via GitHub conforme critérios da avaliação oficial  

> **Missão da MentoraTech**: facilitar o início de carreira em tecnologia para mais mulheres 💜


## 🧠 O que a MentoraTech faz?

- Sugere carreiras em tecnologia
- Recomenda cursos e certificações
- Lista habilidades necessárias
- Ajuda a montar um plano de evolução
- Conversa em linguagem simples e amigável

## 🏗️ Arquitetura da Solução

flowchart LR
    User["Usuária<br>Chat Web"] --> Server["Backend Node.js<br>Express"]
    Server --> Azure["Azure AI Foundry<br>Agente de IA"]
    Azure --> Server
    Server --> User

Como executar localmente

1️⃣ Clonar o repositório

git clone https://github.com/prihissung/MentoraTech
cd MentoraTech


2️⃣ Instalar dependências

npm install


3️⃣ Criar arquivo .env com variáveis

AZURE_AI_ENDPOINT=<seu-endpoint>
AZURE_AI_PROJECT=<nome-do-projeto>
AZURE_AI_AGENT_ID=<id-do-agente>
AZURE_AI_KEY=<api-key>


4️⃣ Iniciar servidor

npm start


5️⃣ Abrir interface
👉 Clique duas vezes no arquivo: index.html

🔐 Segurança

Chaves e endpoints sensíveis são mantidos somente em variáveis de ambiente.
.env está no .gitignore para impedir vazamento.

📸 Evidências de Funcionamento (Requisito da Avaliação)

*Descrição: Interface MentoraTech em uso*

![Aplicacao_Final](img/aplicacao_final.png)

*Descrição: Agente configurado no Azure AI Foundry*

![Agente](img/imagem_agent.png)

*Descrição: Playground respondendo comandos*

![Playground](img/imagem_playground.png)

*Descrição: Tela de testes no playground, realização da pergunta.*

![Pergunta](img/pergunta_enviada.png)

*Descrição: Tela de testes no playground, resposta recebida.*

![Resposta](img/resposta_recebida.png)

Autoria

Desenvolvido por Priscilla Hissung
Participante do programa Azure Frontier Girls – 2025 💜
Repositório: https://github.com/prihissung/MentoraTech