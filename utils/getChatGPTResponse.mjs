
import fs from 'fs';

export default async function getChatGPTResponse(question, openai, dir) {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: question }],
    });
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(`${dir}/chatgptresponse.txt`, `${response.choices[0].message.content}\nCrie sua conta agora mesmo, link na descrição.`, { encoding: 'utf8' });
    return `${response.choices[0].message.content}\nCrie sua conta agora mesmo, link na descrição.`;
}