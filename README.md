# Projeto Micro Fórum

Um aplicativo web simples inspirado em um micro Reddit, permitindo que usuários criem contas, publiquem posts, comentem e editem/excluam seus próprios posts. O projeto é composto por um frontend em Vue.js e um backend em Node.js com Express e SQLite, projetado para ser leve, seguro e fácil de usar.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Vue.js, Vue Router, Axios  
- **Backend:** Node.js, Express, SQLite  
- **Segurança:** JWT para autenticação, express-validator e sanitize-html para validação e sanitização  
- **Outros:** Vite (frontend build), CORS, Helmet

---

## ⚙️ Instalação

### Pré-requisitos:
- Node.js (v16 ou superior)
- npm

### Backend:

```bash
cd backend
npm install
npm start
```

> O servidor roda em [http://localhost:3000](http://localhost:3000)

### Frontend:

```bash
cd frontend
npm install
npm run dev
```

> O frontend roda em [http://localhost:5173](http://localhost:5173)

### Configuração:

- O banco SQLite (`database.sqlite`) é criado automaticamente no diretório `backend`.
- Certifique-se de que as portas `3000` (backend) e `5173` (frontend) estão livres.

---

## 🚀 Uso

1. Acesse [http://localhost:5173](http://localhost:5173) no navegador.
2. Registre-se ou faça login.
3. Crie, edite ou exclua posts.
4. Adicione comentários aos posts.

---

## 🗂️ Estrutura do Projeto

```
backend/
├── src/
│   ├── routes/           # Rotas para autenticação, posts e comentários
│   ├── database.js       # Configuração do SQLite
│   └── server.js         # Servidor Express

frontend/
├── src/
│   ├── components/       # Componentes Vue (Login, PostList, PostForm)
│   └── router.js         # Configuração do Vue Router
```

---

## 🧪 Testes

Use **Postman** para testar as rotas do backend:

- `POST http://localhost:3000/api/auth/register`
- `POST http://localhost:3000/api/auth/login`
- `GET/POST/PUT/DELETE http://localhost:3000/api/posts`

> Verifique erros no console do navegador (F12) e do backend.

---

## 📄 Licença

MIT License  
Copyright (c) 2025 Halfstrom

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.