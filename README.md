# 💕 Orações do Casal

Um site especial para casais que desejam orar juntos e acompanhar seu caminho de fé. A aplicação permite que cada pessoa marque quando orou, visualize um calendário de orações e receba versículos bíblicos inspiradores.

## Características

✨ **Autenticação Segura** - Apenas o casal pode acessar
📅 **Calendário de Orações** - Visualize os dias em que cada um orou
📊 **Contador de Dias** - Acompanhe quantos dias cada um orou
💬 **Versículos Inspiradores** - Versículos bíblicos relacionados ao assunto
🎨 **Design Responsivo** - Funciona perfeitamente em celular, tablet e desktop
🔄 **Sincronização em Tempo Real** - Atualizações instantâneas

## Tecnologias Utilizadas

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Banco de Dados**: SQLite3
- **Servidor**: HTTP

## Instalação

### Pré-requisitos
- Node.js (v14 ou superior)
- npm ou yarn

### Passos

1. Clone ou extraia o projeto:
```bash
cd oracoes-casal
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

4. Abra o navegador e acesse:
```
http://localhost:3000
```

## Credenciais Padrão

**Código de Acesso**: `casal2025`
**Senha**: `oracaocasal123`

> **Nota**: Você pode alterar essas credenciais no arquivo `server.js` nas constantes `COUPLE_USERNAME` e `COUPLE_PASSWORD`.

## Como Usar

1. **Login**: Insira o código de acesso e a senha
2. **Marcar Oração**: Clique no botão "Orei Hoje" para registrar a oração do dia
3. **Visualizar Calendário**: Veja quais dias cada um orou
4. **Ler Versículos**: Inspire-se com versículos bíblicos sobre relacionamento

## Estrutura do Projeto

```
oracoes-casal/
├── server.js                 # Servidor Express
├── package.json             # Dependências do projeto
├── database.db              # Banco de dados SQLite (criado automaticamente)
└── public/
    ├── index.html           # Página principal
    ├── css/
    │   └── style.css        # Estilos da aplicação
    └── js/
        └── app.js           # Lógica da aplicação
```

## Funcionalidades em Detalhes

### 🔐 Autenticação
- Sistema de login seguro com credenciais únicas
- Sessão persistente no navegador

### 📅 Calendário
- Visualize o calendário do mês atual
- Navegue entre meses
- Cores diferentes indicam quem orou:
  - 🩷 Rosa: Pessoa 1
  - 💜 Roxo: Pessoa 2
  - 💕 Rosa/Roxo: Ambos oraram

### 📊 Contadores
- Número total de dias que cada pessoa orou
- Verificação diária de oração (pode marcar apenas uma vez por dia)

### 📖 Versículos
- 10 versículos bíblicos relacionados ao relacionamento cristão
- Versículo aleatório na página inicial
- Lista completa de versículos inspiradores

## Personalizações

### Alterar Credenciais
No arquivo `server.js`, procure por:
```javascript
const COUPLE_USERNAME = 'casal2025';
const COUPLE_PASSWORD = 'oracaocasal123';
```

### Adicionar Mais Versículos
No arquivo `public/js/app.js`, adicione novos versículos ao array `VERSES`:
```javascript
const VERSES = [
  {
    text: "Seu versículo aqui",
    reference: "Livro Capítulo:Versículo"
  },
  // ... mais versículos
];
```

### Alterar Cores
No arquivo `public/css/style.css`, modifique as variáveis de cor:
```css
:root {
  --primary-color: #e91e63;
  --secondary-color: #9c27b0;
  /* ... mais cores */
}
```

## Dicas de Uso

1. **Acessibilidade**: Compartilhe o link com seu parceiro(a) e façam login juntos ou separadamente
2. **Rotina**: Estabeleça um horário diário para marcar a oração
3. **Reflexão**: Use os versículos como ponto de partida para reflexão conjunta
4. **Acompanhamento**: Verifique o calendário mensalmente para visualizar seu progresso

## Troubleshooting

### Porta já está em uso
Se a porta 3000 já está em uso, altere a constante `PORT` no `server.js`:
```javascript
const PORT = 3001; // ou outra porta disponível
```

### Erro ao conectar ao banco de dados
Certifique-se de que tem permissão de escrita na pasta do projeto.

### Banco de dados corrompido
Delete o arquivo `database.db` e reinicie o servidor para criar um novo.

## Contribuições e Suporte

Para dúvidas ou sugestões, sinta-se livre para entrar em contato.

---

**"Portanto, o que Deus juntou, que o homem não separe." - Mateus 19:6** 💕
