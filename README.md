# Micro Fórum

![GIF](/mini-forum-gif.gif)

Um fórum moderno e leve para discussão de ideias.

## 🚀 Funcionalidades

### Sistema de Posts
- ✅ Criação e visualização de posts em tempo real
- ✅ Sistema de comentários
- ✅ Busca avançada de posts e usuários
- ✅ Interface responsiva e moderna

### Autenticação e Perfil
- ✅ Login seguro com autenticação JWT
- ✅ Painel de usuário com métricas e histórico
- ✅ Upload de foto de perfil
- ✅ Sistema de registro e login

## 🛠️ Tecnologias

### Backend
- **Node.js** com Express
- **SQLite** com Knex.js para ORM
- **JWT** para autenticação
- **Multer** para upload de arquivos
- **Sanitize-html** para segurança

### Frontend
- **Vue.js 3** com Composition API
- **Vue Router** para navegação
- **Pinia** para gerenciamento de estado
- **Axios** para requisições HTTP
- **CSS3** com design responsivo

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- **users**: Usuários do sistema
- **posts**: Posts do fórum
- **comments**: Comentários nos posts

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` no backend:

```env
PORT=3000
JWT_SECRET=my_secure_jwt_secret
```

### Migrações
```bash
cd backend
npx knex migrate:latest
```

## 🔒 Segurança

- Autenticação JWT para todas as operações
- Sanitização de HTML para prevenir XSS
- Validação de entrada em todas as rotas
- Proteção contra CSRF
- Upload seguro de arquivos

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🚀 Deploy

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ para a comunidade**