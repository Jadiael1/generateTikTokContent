import { ElevenLabsClient } from 'elevenlabs';
import fs from 'fs';
import { buffer } from 'stream/consumers';

export default async function textToSpeech(text, keys, voice_id, dir) {
    const apiKeys = keys;

    for (const apiKey of apiKeys) {
        try {
            const client = new ElevenLabsClient({ apiKey: apiKey });
            const audioStream = await client.textToSpeech.convert(voice_id, {
                text: text,
                // output_format: ElevenLabs.OutputFormat.Mp34410032,
                model_id: `eleven_multilingual_v2`,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    use_speaker_boost: true
                },
            });

            const writeStream = fs.createWriteStream(`${dir}/output_audio.mp3`);
            audioStream.pipe(writeStream);
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
        } catch (error) {
            const responseBody = await readStream(error.body);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            fs.writeFileSync(`${dir}/textToSpeech_error.txt`, JSON.stringify({ ...error, body: responseBody, apiKey: apiKey }), { encoding: 'utf8' });
            if (isRateLimitError(error, responseBody)) {
                console.warn(`Limite de uso excedido para a chave de API: ${apiKey}. Tentando a próxima chave...`);
                continue;
            } else {
                throw error;
            }
        }
    }
}

async function readStream(stream) {
    return await buffer(stream)
        .then(data => {
            return data.toString();
        })
        .catch(err => null);
}

function isRateLimitError(error, responseBody) {
    if (error && error.statusCode === 401) {
        try {
            const response = JSON.parse(responseBody);
            if (response.detail.status === 'quota_exceeded'){
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }
    return false;
}