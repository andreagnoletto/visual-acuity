# TV Visual Check

Aplicativo de triagem básica e treino de acuidade visual otimizado para TV, desenvolvido com Nuxt 4. Projetado para uso com controle remoto (D-Pad), sem dependência de mouse ou teclado.

## ⚠️ Disclaimer Importante

**Este aplicativo NÃO é um dispositivo médico.** É uma ferramenta de triagem básica e treino de acuidade visual. Não substitui um exame oftalmológico profissional. Não use para decisões críticas (ex.: dirigir). Os resultados variam com iluminação e configuração da TV.

## 🎯 Características

- **TV-First Design**: Interface otimizada para TV com navegação 100% por D-Pad
- **Múltiplos Testes de Acuidade Visual**:
  - Teste Snellen (letras)
  - Teste ETDRS (padrão clínico)
  - Teste Pediátrico (símbolos)
  - Teste E Rotacionado
  - Teste Landolt C
- **Calibração Precisa**: Sistema de calibração por distância e tamanho de tela
- **Modo Diurno/Noturno**: Alternância entre temas claro e escuro
- **Alto Contraste**: Modo de alto contraste para melhor visibilidade
- **Modo Assistido**: Interface para acompanhantes controlarem o teste
- **Modo Pro**: Funcionalidades avançadas com PIN (travar calibração, contador de sessões)

## 🛠️ Tecnologias

- **Nuxt 4**: Framework Vue.js para aplicações full-stack
- **TypeScript**: Tipagem estática
- **Pinia**: Gerenciamento de estado
- **Vue 3**: Framework JavaScript reativo
- **Vitest**: Testes unitários
- **Playwright**: Testes end-to-end

## 📋 Requisitos

- Node.js 18+
- npm, pnpm, yarn ou bun

## 🚀 Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/andreagnoletto/visual-acuity.git
   cd visual-acuity/visual-acuity-app
   ```

2. Instale as dependências:

```bash
npm install
   # ou
pnpm install
   # ou
yarn install
   # ou
bun install
```

3. Baixe a fonte OpticianSans:

   - A fonte `OpticianSans.woff2` deve ser colocada em `app/assets/fonts/`
   - Consulte `app/assets/fonts/README.md` para mais informações

## 💻 Desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
pnpm dev
# ou
yarn dev
# ou
bun run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🏗️ Build para Produção

```bash
npm run build
# ou
pnpm build
# ou
yarn build
# ou
bun run build
```

Para preview da build de produção:

```bash
npm run preview
# ou
pnpm preview
# ou
yarn preview
# ou
bun run preview
```

## 📁 Estrutura do Projeto

```text
visual-acuity-app/
├── app/
│   ├── assets/
│   │   ├── css/          # Estilos globais e temas
│   │   └── fonts/        # Fonte OpticianSans
│   ├── components/       # Componentes Vue reutilizáveis
│   ├── composables/      # Composables Vue (lógica reutilizável)
│   ├── domain/
│   │   └── vision/      # Lógica de domínio (cálculos, validações)
│   ├── layouts/         # Layouts da aplicação
│   ├── pages/           # Páginas/rotas
│   │   ├── index.vue    # Home
│   │   ├── setup/       # Calibração
│   │   ├── test/        # Testes de acuidade
│   │   └── settings/    # Configurações
│   └── stores/          # Stores Pinia
├── tests/
│   ├── unit/            # Testes unitários
│   └── e2e/             # Testes end-to-end
└── public/              # Arquivos estáticos
```

## 🎮 Navegação D-Pad

O aplicativo foi projetado para navegação exclusiva por controle remoto:

- **↑↓←→**: Navegação entre elementos
- **Enter/Space**: Confirmar seleção
- **Esc/Backspace**: Voltar/navegar para trás

A navegação usa **roving tabindex** para garantir que apenas um elemento esteja focável por vez, otimizando a experiência em TV.

## ⚙️ Configuração

### Calibração

Antes de usar os testes, é necessário calibrar:

1. **Distância**: Configure a distância entre o paciente e a TV (3-6m ou customizada)
2. **Tela**: Calibre o tamanho da tela usando um cartão de referência de 85,6mm

### Modo Pro

O Modo Pro oferece funcionalidades avançadas:

- Travar calibração (impedir alterações acidentais)
- Contador de sessões
- Alteração de PIN

PIN padrão: `1234`

## 🧪 Testes

Execute os testes unitários:

```bash
npm run test
```

Execute os testes end-to-end:

```bash
npm run test:e2e
```

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Contato

Para questões ou sugestões, abra uma [issue](https://github.com/andreagnoletto/visual-acuity/issues) no GitHub.

---

**Lembre-se**: Este aplicativo é apenas para triagem básica e treino. Sempre consulte um profissional de saúde ocular para exames completos.
