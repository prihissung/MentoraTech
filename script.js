const chatBox = document.getElementById("chat");
const input = document.getElementById("input");

async function sendMessage() {
    const userMsg = input.value;
    if (!userMsg.trim()) return;

    addMessage("Você", userMsg);
    input.value = "";

    const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
    });

    const data = await response.json();
    addMessage("MentoraTech", data.reply);
}

function addMessage(sender, text) {
    chatBox.innerHTML += `<p><strong>${sender}:</strong> ${text}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}
