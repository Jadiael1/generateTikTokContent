import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function downloadImage(url, filepath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('finish', resolve)
            .on('error', reject);
    });
}

export async function generateImagesP(theme, numImages, pexelsApiKey, dir = './content_1727471336372') {
    const PEXELS_API_KEY = pexelsApiKey;  // Insira sua chave de API da Pexels aqui
    const url = `https://api.pexels.com/v1/search?query=${theme}&per_page=${numImages}&locale='pt-BR'`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });

        // console.log(response.data)

        const photos = response.data.photos;
        if (!photos || photos.length === 0) {
            console.log('Nenhuma imagem encontrada para o tema:', theme);
            return;
        }

        // Baixar as imagens
        for (let i = 0; i < photos.length; i++) {
            const imageUrl = photos[i].src.portrait;
            await downloadImage(imageUrl, `${dir}/image_${i}.png`);
            console.log(`Imagem ${i + 1} baixada com sucesso!`);
        }

    } catch (error) {
        console.error('Erro ao buscar ou baixar imagens:', error);
    }
}

export async function generateImages(prompt, number = null, openai, dir) {
    const response = await openai.images.generate({
        prompt: prompt,
        n: number ?? 3,
        size: '1024x1024',
    });

    const imageUrls = response.data.map((image) => image.url);

    for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        fs.writeFileSync(`${dir}/image_${i}.png`, imageResponse.data);
    }
}