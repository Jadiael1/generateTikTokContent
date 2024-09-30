import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import getLastContentFolder from './getLastContentFolder.mjs';
import cliProgress from 'cli-progress';

// Cria uma nova barra de progresso
const progressBar = new cliProgress.SingleBar({
    format: 'Renderização [{bar}] {percentage}% | Tempo restante: {remainingTime}s',
    barCompleteChar: '#',
    barIncompleteChar: '-',
    hideCursor: true
}, cliProgress.Presets.shades_classic);

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

/**
 * Create a video slideshow using images and an audio track.
 * @param {string[]} imagePaths - Array of image paths to be used in the slideshow.
 * @param {string} audioPath - Path to the .mp3 audio file.
 * @param {string} outputDir - Directory where the final video will be saved.
 * @param {number} audioDuration - Duration of the audio file in seconds.
 */
const createVideoSlideshow = async (imagePaths, audioPath, outputDir, audioDuration, text = '') => {
    const tempDir = path.join(outputDir, 'tempFrames');

    // Garante que o diretório temporário existe
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Duplicar imagens para combinar com a duração do áudio
    const frameRate = 1 / 3; // Uma imagem a cada 3 segundos
    const totalFrames = Math.ceil(audioDuration / 3);
    const frameImages = Array.from({ length: totalFrames }, (_, i) => imagePaths[i % imagePaths.length]);

    // Cria as imagens temporárias com nomes sequenciais
    const createFrames = async () => {
        const framePromises = frameImages.map((image, index) => {
            const framePath = path.join(tempDir, `frame${String(index).padStart(4, '0')}.png`);
            return new Promise((resolve, reject) => {
                fs.copyFile(image, framePath, (err) => (err ? reject(err) : resolve(framePath)));
            });
        });
        return Promise.all(framePromises);
    };

    const processVideo = (frames) => {
        const outputVideoPath = path.join(outputDir, 'slideshow.mp4');

        return new Promise((resolve, reject) => {
            ffmpeg()
                .addInput(path.join(tempDir, 'frame%04d.png')) // Caminho para imagens temporárias
                .inputOptions('-framerate', frameRate)
                .input(audioPath)
                .audioCodec('aac')
                .videoCodec('libx264')
                .outputOptions('-pix_fmt', 'yuv420p')
                .size('1080x1920')
                .videoFilters([
                    // Filtro de texto centralizado com borda preta
                    `drawtext=fontfile=/usr/share/fonts/TTF/DejaVuSans-Bold.ttf:text='${text}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=10:x=(w-text_w)/2:y=(h-text_h)/2`,
                    // Ajusta o brilho e contraste para dar mais "vida" às imagens
                    'eq=brightness=0.06:contrast=1.2',
                    // Filtro de desfoque suave para criar transições suaves entre as imagens
                    'boxblur=2:1',
                    // Filtro de vinheta para adicionar bordas escuras
                    'vignette',
                    // Filtro de saturação para aumentar a intensidade das cores
                    'hue=s=1.3',
                    // Efeito de "zoom" que lentamente aproxima a imagem
                    `zoompan=z='zoom+0.001':d=${Math.floor(audioDuration)}`,
                    // Filtro de borda colorida para destacar o vídeo
                    'drawbox=color=red@0.5:t=20',
                    // Filtro de distorção cromática (aberration), separando cores para um efeito glitch
                    'chromashift=4:2',
                    // Efeito de sobreposição de texto em movimento para dinâmica extra
                    `drawtext=fontfile=/usr/share/fonts/TTF/DejaVuSans-Bold.ttf:text='Follow Me!':fontcolor=yellow:fontsize=40:x='mod(98*t, w)':y=50`,
                    // Filtro de fade out ao final para uma transição suave
                    `fade=out:st=${Math.floor(audioDuration - 2)}:d=2`
                ])
                .on('error', (err) => reject(err))
                .on('start', () => progressBar.start(100, 0))
                .on('progress', progress => {
                    const totalDuration = audioDuration; // Duração total do áudio em segundos
                    const currentTime = progress.timemark.split(':').reduce((acc, time) => (60 * acc) + parseFloat(time), 0); // Converte o timestamp do ffmpeg em segundos
                    const remainingTime = totalDuration - currentTime; // Calcula o tempo restante
                    const currentProgress = Math.round((currentTime / totalDuration) * 100);
                    const timeRemaining = Math.max(0, remainingTime.toFixed(2));
                    if (isNaN(currentProgress) || isNaN(timeRemaining)) {
                        return;
                    }
                    progressBar.update(currentProgress, {
                        remainingTime: timeRemaining
                    });
                    // console.log(`Progresso: ${Math.round((currentTime / totalDuration) * 100)}%`);
                    // console.log(`Tempo restante: ${Math.max(0, remainingTime.toFixed(2))} segundos`);
                })
                .on('end', () => {
                    progressBar.stop();
                    // Limpa os arquivos de frame temporários
                    fs.rmSync(tempDir, { recursive: true, force: true });
                    resolve(outputVideoPath);
                })
                .save(outputVideoPath);
        });
    };

    try {
        const frames = await createFrames();
        await processVideo(frames);
    } catch (error) {
        throw new Error(`Erro ao criar o vídeo: ${error.message}`);
    }
};

export default async function createTikTokVideo(baseDir, text = '') {
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

    createVideoSlideshow(images, audioPath, contentDir, audioDuration, text);
}
