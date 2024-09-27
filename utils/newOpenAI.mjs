import OpenAI from 'openai';

const newOpenAI = (openaikey) => {
    return new OpenAI({
        apiKey: openaikey,
    });
}

export default newOpenAI;