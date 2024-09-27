# Generate TikTok Content

`Generate TikTok Content` é um projeto Node.js que automatiza a criação de vídeos para o TikTok a partir de temas específicos. Ele utiliza APIs como OpenAI, ElevenLabs, e outras para gerar conteúdo, imagens, e áudio, compondo um vídeo final com texto sobreposto.

## Funcionalidades

- **Geração de Texto:** Usa GPT para gerar descrições e textos temáticos.
- **Geração de Áudio:** Converte texto em áudio usando APIs de text-to-speech (como a ElevenLabs).
- **Busca de Imagens:** Faz a busca de imagens relacionadas ao tema (utilizando APIs externas).
- **Criação de Vídeo:** Junta as imagens e áudio gerados em um vídeo final com texto sobreposto, pronto para ser publicado no TikTok.
- **Customização de Conteúdo:** Personaliza o texto sobreposto no vídeo.

## Tecnologias Utilizadas

- **Node.js** com módulos ECMAScript (ESM).
- **FFmpeg**: Para manipulação de mídia (áudio/vídeo).
- **APIs**: 
  - **OpenAI GPT**: Para geração de conteúdo textual.
  - **ElevenLabs**: Para conversão de texto em áudio.
  - **Outras APIs**: Para geração ou busca de imagens gratuitas.

## Requisitos

- **Node.js** (versão 14 ou superior).
- **FFmpeg**: Deve estar instalado no sistema.
- **Chaves de API** para OpenAI, ElevenLabs, e outras APIs de imagens gratuitas.

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/Jadiael1/generateTikTokContent.git
   cd generateTikTokContent
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure suas chaves de API no arquivo `.env.production` (use `.env.production.example` como modelo):

   ```bash
   cp .env.production.example .env.production
   ```

   Adicione suas chaves de API.

4. Execute o projeto:

   ```bash
   npm run start
   ```

## Estrutura do Projeto

- `main.mjs`: Arquivo principal que orquestra o processo de criação de conteúdo.
- `utils/`: Pasta contendo funções auxiliares:
  - `getLastContentFolder.mjs`: Obtém a última pasta de conteúdo.
  - `textToSpeech.mjs`: Converte textos gerados em áudio.
  - `generateImages.mjs`: Busca ou gera imagens relacionadas ao tema.
  - `createTikTokVideo.mjs`: Gera o vídeo final com o conteúdo (imagens e áudio).
- `config.js`: Arquivo de configuração do projeto.
- `.gitignore`: Define arquivos que não devem ser versionados.

## Contribuindo

Se você quiser contribuir com o projeto, faça um fork, crie uma branch para suas alterações e envie um pull request.

## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
