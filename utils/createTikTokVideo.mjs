import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import getLastContentFolder from './getLastContentFolder.mjs';

// Função para obter a duração do áudio
function getAudioDuration(audioPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(audioPath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                const duration = metadata.format.duration;
                resolve(duration);
            }
        });
    });
}

async function createVideoWithImages(images, audioPath, contentDir) {
    if (!fs.existsSync(path.resolve(audioPath))) throw new Error('Áudio não existe');

    // Obtém a duração do áudio
    const audioDuration = await getAudioDuration(audioPath);

    const timePerImage = (audioDuration / (images.length - 1) - 1)

    // Cria um comando FFmpeg
    const command = ffmpeg();

    // Adiciona o áudio como entrada
    command.input(audioPath).inputOptions([`-t ${audioDuration}`]);

    const text = "Crie sua conta agora mesmo, link na bio.";
    const fontPath = path.resolve(`./${contentDir}/OpenSans-SemiBold.ttf`);
    const fontPath1 = path.resolve(`/usr/share/fonts/TTF/OpenSans-SemiBold.ttf`);

    if (!fs.existsSync(fontPath1)) throw new Error('Fonte não encontrada.');

    // Adiciona cada imagem como entrada de vídeo
    images.forEach((image) => {
        const imagePath = path.resolve(image); // Resolve o caminho completo do arquivo
        if (!fs.existsSync(imagePath)) {
            throw new Error(`Imagem ${image} não encontrada.`);
        }
        command.input(imagePath).inputOptions(['-loop 1', `-t ${timePerImage}`]); // Define o loop e o tempo de exibição de cada imagem
    });

    // Concatena todas as entradas e define o formato de saída com drawtext
    const filterComplex = images.map((_, index) => `[${index + 1}:v]`).join('');
    const concatFilter = `${filterComplex}concat=n=${images.length}:v=1:a=0,scale=1080:1920,drawtext=fontfile='${fontPath1}':text='${text}':fontcolor=black:fontsize=50:x=(w-text_w)/2:y=(h-text_h)/2[vout]`;

    command
        .complexFilter([concatFilter])
        .outputOptions([
            '-map [vout]',       // Mapeia o vídeo final
            '-map 0:a',          // Mapeia o áudio
            '-vcodec libx264',   // Codec de vídeo
            '-acodec aac',       // Codec de áudio
            '-pix_fmt yuv420p',  // Compatibilidade de reprodução
            '-t', `${audioDuration}`, // Define a duração com base no áudio
            '-shortest'          // Garante que o vídeo pare quando o áudio terminar
        ])
        .output(`./${contentDir}/output.mp4`)
        .on('end', () => {
            console.log('Vídeo criado com sucesso!');
        })
        .on('error', (err) => {
            console.error('Erro ao criar o vídeo:', err);
        })
        .run();
}

// Função para criar um vídeo com áudio e imagens em formato de slideshow
export default async function createTikTokVideo(baseDir) {
    const contentDir = getLastContentFolder(baseDir);
    console.log(contentDir);

    const imagesDir = contentDir;
    const audioPath = path.join(contentDir, 'output_audio.mp3');

    // Verifica se o arquivo de áudio existe
    if (!fs.existsSync(audioPath)) {
        throw new Error('Arquivo output_audio.mp3 não encontrado.');
    }

    // Obtém todas as imagens que seguem o padrão 'image_*.png'
    const images = fs.readdirSync(imagesDir)
        .filter(file => file.startsWith('image_') && file.endsWith('.png'))
        .map(file => path.join(imagesDir, file))
        .sort();  // Ordena as imagens por número

    if (images.length === 0) {
        throw new Error('Nenhuma imagem encontrada com o padrão image_*.png.');
    }

    console.log(`images: `, images);
    console.log(`audioPath: `, audioPath);

    // Obtém a duração do áudio
    const audioDuration = await getAudioDuration(audioPath);
    console.log(`Duração do áudio: ${audioDuration} segundos`);

    const imageDuration = 3;  // Exibe cada imagem por 3 segundos

    createVideoWithImages(images, audioPath, contentDir);
}
