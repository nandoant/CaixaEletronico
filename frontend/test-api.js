// Script de teste para API
console.log("Testando API...");

// Teste da API base
fetch("http://localhost:8080/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ login: "admin", senha: "admin123" }),
})
  .then((response) => {
    console.log("Response status:", response.status);
    return response.json();
  })
  .then((data) => {
    console.log("Response data:", data);
    if (data.token) {
      // Teste de buscar contas
      return fetch("http://localhost:8080/contas/minhas-contas", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
    }
  })
  .then((response) => {
    if (response) {
      console.log("Contas response status:", response.status);
      return response.json();
    }
  })
  .then((data) => {
    if (data) {
      console.log("Contas data:", data);
    }
  })
  .catch((error) => {
    console.error("Erro:", error);
  });
