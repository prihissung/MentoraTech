import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DefaultAzureCredential } from "@azure/identity";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔧 Configuração
const ENDPOINT = process.env.AZURE_AI_ENDPOINT;
const AGENT_ID = process.env.AZURE_AI_AGENT_ID;

// Credenciais Azure - usando AzureCliCredential diretamente
import { AzureCliCredential } from "@azure/identity";
const credential = new AzureCliCredential();

// Cache do token
let cachedToken = null;
let tokenExpiry = null;

// Função para obter token OAuth
async function getAzureToken() {
  // Verificar se o token em cache ainda é válido
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    console.log("🔑 Usando token em cache");
    return cachedToken;
  }

  try {
    console.log("🔐 Obtendo novo token OAuth...");
    // IMPORTANTE: Usar o scope correto para Azure AI
    const tokenResponse = await credential.getToken("https://ai.azure.com/.default");
    cachedToken = tokenResponse.token;
    tokenExpiry = tokenResponse.expiresOnTimestamp;
    console.log("✅ Token obtido com sucesso");
    return cachedToken;
  } catch (error) {
    console.error("❌ Erro ao obter token:", error.message);
    console.error("Detalhes:", error);
    throw new Error("Falha ao autenticar com Azure. Verifique suas credenciais.");
  }
}

// Função auxiliar para fazer chamadas à API
async function callAzureAPI(path, method = "GET", body = null) {
  const token = await getAzureToken();
  
  // Adicionar api-version ao path
  const separator = path.includes('?') ? '&' : '?';
  const apiVersion = "api-version=2025-05-01";
  const url = `${ENDPOINT}${path}${separator}${apiVersion}`;
  
  const options = {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`🔗 Chamando: ${method} ${url}`);
  
  const response = await fetch(url, options);
  
  console.log(`📡 Status da resposta: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Erro HTTP ${response.status}:`, errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("📨 Mensagem recebida:", userMessage);

    // 1. Criar thread
    const thread = await callAzureAPI("/threads", "POST", {});
    console.log("🧵 Thread criada:", thread.id);

    // 2. Adicionar mensagem do usuário
    await callAzureAPI(
      `/threads/${thread.id}/messages`,
      "POST",
      {
        role: "user",
        content: userMessage
      }
    );
    console.log("✅ Mensagem enviada");

    // 3. Executar o agente (run)
    let run = await callAzureAPI(
      `/threads/${thread.id}/runs`,
      "POST",
      {
        assistant_id: AGENT_ID
      }
    );
    console.log("🤖 Agente executando:", run.id);

    // 4. Aguardar processamento
    const maxAttempts = 30;
    let attempts = 0;

    while (["queued", "in_progress", "requires_action"].includes(run.status)) {
      if (attempts >= maxAttempts) {
        throw new Error("Timeout: o agente demorou muito para responder");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      run = await callAzureAPI(
        `/threads/${thread.id}/runs/${run.id}`,
        "GET"
      );
      
      attempts++;
      console.log(`⏳ Status: ${run.status} (tentativa ${attempts}/${maxAttempts})`);
    }

    if (run.status === "failed") {
      console.error("❌ Erro no run:", run.last_error);
      throw new Error(`Agente falhou: ${run.last_error?.message || "Erro desconhecido"}`);
    }

    // 5. Buscar mensagens
    const messagesResponse = await callAzureAPI(
      `/threads/${thread.id}/messages?order=desc&limit=10`,
      "GET"
    );
    
    console.log("📬 Mensagens recebidas:", messagesResponse.data?.length || 0);

    // 6. Extrair resposta do assistente
    if (messagesResponse.data && messagesResponse.data.length > 0) {
      const assistantMessage = messagesResponse.data.find(m => m.role === "assistant");
      
      if (assistantMessage && assistantMessage.content && assistantMessage.content.length > 0) {
        const textContent = assistantMessage.content.find(c => c.type === "text");
        
        if (textContent?.text?.value) {
          console.log("✅ Resposta encontrada");
          return res.json({ reply: textContent.text.value });
        }
      }
    }

    res.json({ reply: "Desculpe, não consegui gerar uma resposta 😅" });

  } catch (error) {
    console.error("❌ Erro no backend:", error);
    
    return res.status(500).json({ 
      error: error.message
    });
  }
});

// Rota de teste
app.get("/api/health", async (req, res) => {
  try {
    const token = await getAzureToken();
    res.json({
      status: "OK",
      config: {
        endpoint: ENDPOINT,
        agentId: AGENT_ID,
        hasToken: !!token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      error: error.message,
      config: {
        endpoint: ENDPOINT,
        agentId: AGENT_ID
      }
    });
  }
});

app.listen(3000, async () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
  console.log("📋 Configuração:");
  console.log("   - Endpoint:", ENDPOINT);
  console.log("   - Agent ID:", AGENT_ID);
  
  try {
    await getAzureToken();
    console.log("   - Azure Auth: ✅ Autenticado");
  } catch (error) {
    console.log("   - Azure Auth: ❌ Erro -", error.message);
    console.log("\n⚠️  Configure as variáveis de ambiente do Azure:");
    console.log("   AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET");
  }
  
  console.log("\n🧪 Teste: http://localhost:3000/api/health");
});