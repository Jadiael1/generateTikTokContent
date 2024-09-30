import config from './config.js';
import textToSpeech from './utils/textToSpeech.mjs'
import getChatGPTResponse from './utils/getChatGPTResponse.mjs';
import newOpenAI from './utils/newOpenAI.mjs';
import getDescription from './utils/getDescription.mjs';
import getTextWithoutDescription from './utils/getTextWithoutDescription.mjs';
import { generateImages, generateImagesP } from './utils/generateImages.mjs';
import createTikTokVideo from './utils/createTikTokVideo.mjs';

(async () => {
    try {
        // configura diretorio
        const dir = `./content_${new Date().getTime()}`

        // criar objeto openai
        const openai = newOpenAI(config.openaikey);

        // const question = `Crie uma historia onde a mesma comece a primeira linha com uma descrição de no maximo 50 caracteres e no começo da linha deve ter Descrição: seguido da descrição, e nessa descrição deve ter um resumo da historia, e apos a descrição a historia nas proximas linhas, e a historia deve ter 3 minutos baseada em um livro exceto a bíblia e qualquer outro livro que envolva religião.
        //     A historia deve ser de interesse de mais de 90% da população brasileira e do mundo.
        //     Vou usar essa historia para postar videos em plataformas de Streaming então a historia deve ser interessante para que eu possa ganhar views.
        //     Me surpreenda, e me responda em pt-BR
        // `;

        const question = `Gere um texto de 3 minutos falando sobre os produtos da Herbalife e seus benefícios. A primeira linha deve seguir o seguinte padrão: Descrição: seguido de uma descrição do texto que tenha no máximo 50 caracteres, resumindo o conteúdo apresentado. me responda em pt-BR.`;

        const responseText = await getChatGPTResponse(question, openai, dir);
        console.log('Historia gerada com sucesso com ChatGPT');

        const description = getDescription(responseText);
        console.log(`description: ${description}`);

        const withoutDescription = getTextWithoutDescription(responseText);
        console.log(`without description: ${withoutDescription.substring(0, 10)}...`);

        await textToSpeech(withoutDescription, config.texttospeakkey, config.texttospeakvoiceid, dir);
        console.log('Áudio gerado com sucesso.');

        await generateImages(`diet`, 5, openai, dir);
        // await generateImagesP(`diet`, 5, config.pexelsapikey, dir);
        console.log('Imagens geradas e salvas com sucesso.');

        createTikTokVideo('./', 'Testando');
    } catch (error) {
        console.error('Ocorreu um erro:', error);
    }
})();

