import env from 'env-var';

const config = {
    openaikey: env.get('OPENAIKEY').required().asString(),
    texttospeakkey: env.get('TEXTTOSPEAKKEY').required().asArray(),
    texttospeakvoiceid: env.get('TEXTTOSPEAKVOICEID').required().asString(),
    pexelsapikey: env.get('PEXELSAPIKEY').required().asString(),
}

export default config;